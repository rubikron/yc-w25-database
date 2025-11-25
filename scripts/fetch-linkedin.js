const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

// Rate limiting helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchLinkedInUrls() {
  const dataPath = path.join(__dirname, '..', 'public', 'data', 'companies.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const companies = data.companies

  console.log(`Fetching LinkedIn URLs for ${companies.length} companies...\n`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i]
    const slug = slugify(company.name)
    const ycUrl = `https://www.ycombinator.com/companies/${slug}`

    process.stdout.write(`[${i + 1}/${companies.length}] ${company.name}... `)

    try {
      const response = await axios.get(ycUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000
      })

      const $ = cheerio.load(response.data)
      const linkedinUrls = []

      // Find all LinkedIn links on the page
      $('a[href*="linkedin.com/in/"]').each((_, el) => {
        const href = $(el).attr('href')
        if (href && !linkedinUrls.includes(href)) {
          linkedinUrls.push(href.trim())
        }
      })

      // Match LinkedIn URLs to founders
      if (linkedinUrls.length > 0) {
        // Try to match by finding founder names near LinkedIn links
        const founderLinkedins = []

        // Look for founder sections
        $('a[href*="linkedin.com/in/"]').each((_, el) => {
          const href = $(el).attr('href')
          if (href) {
            // Try to find the founder name associated with this link
            const parent = $(el).parent().parent().parent()
            const nameEl = parent.find('h3, h4, .font-bold').first()
            const name = nameEl.text().trim()

            if (name) {
              founderLinkedins.push({ name, linkedin: href.trim() })
            } else {
              founderLinkedins.push({ linkedin: href.trim() })
            }
          }
        })

        // Update founders with LinkedIn URLs
        let matchCount = 0
        company.founders.forEach((founder, idx) => {
          // Try to match by name
          const match = founderLinkedins.find(fl => {
            if (fl.name) {
              const founderFirst = founder.name.split(' ')[0].toLowerCase()
              const matchFirst = fl.name.split(' ')[0].toLowerCase()
              return founderFirst === matchFirst || fl.name.toLowerCase().includes(founderFirst)
            }
            return false
          })

          if (match) {
            founder.linkedin = match.linkedin
            matchCount++
          } else if (idx < linkedinUrls.length && !founder.linkedin) {
            // Fallback: assign by position if we have enough URLs
            founder.linkedin = linkedinUrls[idx]
            matchCount++
          }
        })

        if (matchCount > 0) {
          console.log(`✓ ${matchCount} LinkedIn(s)`)
          updated++
        } else {
          console.log(`- no matches`)
        }
      } else {
        console.log(`- no LinkedIn found`)
      }

    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`✗ page not found`)
      } else {
        console.log(`✗ ${error.message}`)
      }
      failed++
    }

    // Rate limiting: wait between requests
    await sleep(500)
  }

  // Save updated data
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

  console.log(`\n✅ Complete!`)
  console.log(`   Updated: ${updated} companies`)
  console.log(`   Failed: ${failed} companies`)
  console.log(`   Data saved to: ${dataPath}`)
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Run the scraper
fetchLinkedInUrls()
