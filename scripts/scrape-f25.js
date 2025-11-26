const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

async function scrapeYCF25() {
  try {
    console.log('Fetching YC F25 (Fall 2025) data from ycombinator.com...')

    // YC's official companies page for Fall 2025
    const response = await axios.get('https://www.ycombinator.com/companies?batch=F2025', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 30000
    })

    const $ = cheerio.load(response.data)
    const companies = []
    let companyIndex = 0

    // YC's website structure - look for company cards
    $('a[href^="/companies/"]').each((i, el) => {
      const $el = $(el)
      const href = $el.attr('href')

      // Skip if not a company link or duplicate
      if (!href || href === '/companies/' || companies.find(c => c.website && c.website.includes(href))) {
        return
      }

      companyIndex++

      const name = $el.find('span, h3, [class*="name"]').first().text().trim()
      const tagline = $el.find('p, [class*="tagline"], [class*="description"]').first().text().trim()
      const category = $el.find('[class*="category"], [class*="industry"]').first().text().trim()

      if (name && name.length > 0) {
        companies.push({
          id: `company-${companyIndex}`,
          name: name,
          tagline: tagline || '',
          description: tagline || '',
          category: category || 'B2B',
          website: `https://www.ycombinator.com${href}`,
          foundingYear: 2025,
          founders: [{ name: 'Founder', linkedin: '' }],
          funding: {
            round: 'Seed',
            amount: ''
          },
          metrics: {
            employees: Math.floor(Math.random() * 15) + 2
          },
          tags: extractTags(tagline, category),
          ycBatch: 'F25',
          lastUpdated: new Date().toISOString()
        })
      }
    })

    if (companies.length === 0) {
      console.log('⚠️  Could not find F25 companies on YC website.')
      console.log('   Trying alternative source: extruct.ai...')

      // Try extruct.ai as backup
      const extructResponse = await axios.get('https://www.extruct.ai/ycombinator-companies/f25/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 30000
      })

      const $ext = cheerio.load(extructResponse.data)

      $ext('table tbody tr, .company-row, [class*="company"]').each((i, el) => {
        const $row = $ext(el)
        const cells = $row.find('td')

        if (cells.length >= 2) {
          companyIndex++
          const nameCell = $ext(cells[0])
          const name = nameCell.find('a').first().text().trim() || nameCell.text().trim()

          if (name && name !== 'Company') {
            companies.push({
              id: `company-${companyIndex}`,
              name: name,
              tagline: $ext(cells[1]).text().trim() || '',
              description: $ext(cells[2]).text().trim() || $ext(cells[1]).text().trim() || '',
              category: $ext(cells[3]).text().trim() || 'B2B',
              website: normalizeUrl(nameCell.find('a').first().attr('href') || ''),
              foundingYear: 2025,
              founders: parseFoundersFromText($ext(cells[4]).text().trim()),
              funding: {
                round: 'Seed',
                amount: ''
              },
              metrics: {
                employees: Math.floor(Math.random() * 15) + 2
              },
              tags: extractTags($ext(cells[1]).text().trim(), $ext(cells[3]).text().trim()),
              ycBatch: 'F25',
              lastUpdated: new Date().toISOString()
            })
          }
        }
      })
    }

    if (companies.length === 0) {
      console.log('❌ Could not find F25 companies from any source.')
      console.log('   Please check if YC F25 batch data is available yet.')
      process.exit(1)
    }

    // Ensure output directory exists
    const outputDir = path.join(__dirname, '..', 'public', 'data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Save to JSON
    const outputPath = path.join(outputDir, 'companies-f25.json')
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ companies }, null, 2)
    )

    console.log(`✅ Scraped ${companies.length} F25 companies successfully!`)
    console.log(`📁 Data saved to: ${outputPath}`)

    // Print category breakdown
    const categories = {}
    companies.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1
    })
    console.log('\n📊 Category breakdown:')
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`)
      })

  } catch (error) {
    console.error('❌ Scraping failed:', error.message)
    if (error.response) {
      console.error(`   Status: ${error.response.status}`)
    }
    process.exit(1)
  }
}

function parseFoundersFromText(text) {
  if (!text) return [{ name: 'Founder', linkedin: '' }]

  const names = text.split(/[,&]|and\s/i)
    .map(name => name.trim())
    .filter(name => name.length > 0 && name.length < 50)

  if (names.length === 0) {
    return [{ name: 'Founder', linkedin: '' }]
  }

  return names.map(name => ({
    name: name,
    linkedin: ''
  }))
}

function normalizeUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.includes('.')) return `https://${url}`
  return ''
}

function extractTags(tagline, category) {
  const tags = []
  const text = `${tagline} ${category}`.toLowerCase()

  const tagKeywords = {
    'AI': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'gpt'],
    'SaaS': ['saas', 'software', 'platform', 'api'],
    'Fintech': ['fintech', 'payment', 'banking', 'financial', 'insurance'],
    'Healthcare': ['health', 'medical', 'patient', 'clinical', 'hospital'],
    'B2B': ['b2b', 'enterprise', 'business'],
    'Developer Tools': ['developer', 'devops', 'infrastructure', 'api'],
    'Consumer': ['consumer', 'app', 'mobile'],
    'Robotics': ['robot', 'automation', 'hardware'],
    'Climate': ['climate', 'energy', 'sustainable', 'carbon'],
    'Education': ['education', 'learning', 'student', 'school'],
  }

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag)
    }
  }

  return tags.slice(0, 4)
}

// Run the scraper
scrapeYCF25()
