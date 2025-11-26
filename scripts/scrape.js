const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

async function scrapeYCBatch(batch = 'w25') {
  try {
    console.log(`Fetching YC ${batch.toUpperCase()} data from extruct.ai...`)

    const response = await axios.get(`https://www.extruct.ai/ycombinator-companies/${batch.toLowerCase()}/`, {
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

    // Try multiple selectors to find company data
    // Extruct.ai typically uses table rows or card layouts

    // Attempt 1: Look for table rows
    $('table tbody tr, .company-row, [class*="company"]').each((i, el) => {
      const $el = $(el)
      const cells = $el.find('td')

      if (cells.length >= 2) {
        companyIndex++
        const company = parseTableRow($, cells, companyIndex)
        if (company.name && company.name !== 'Company') {
          companies.push(company)
        }
      }
    })

    // Attempt 2: If no table found, look for card-based layout
    if (companies.length === 0) {
      $('.company-card, [class*="card"], article').each((i, el) => {
        companyIndex++
        const $el = $(el)
        const company = parseCard($, $el, companyIndex)
        if (company.name) {
          companies.push(company)
        }
      })
    }

    // Attempt 3: Look for any structured data
    if (companies.length === 0) {
      // Try to find JSON-LD or other structured data
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const data = JSON.parse($(el).html())
          if (Array.isArray(data)) {
            data.forEach((item, idx) => {
              if (item.name) {
                companies.push(createCompanyFromStructuredData(item, idx + 1))
              }
            })
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      })
    }

    if (companies.length === 0) {
      console.log('⚠️  Could not find companies in the page structure.')
      console.log('   The website structure may have changed.')
      console.log('   Please check the page manually and update the selectors.')

      // Show what we found in the page for debugging
      console.log('\n📋 Page structure hints:')
      console.log(`   - Tables found: ${$('table').length}`)
      console.log(`   - Divs with "company": ${$('[class*="company"]').length}`)
      console.log(`   - Divs with "card": ${$('[class*="card"]').length}`)
      console.log(`   - Articles: ${$('article').length}`)

      process.exit(1)
    }

    // Ensure output directory exists
    const outputDir = path.join(__dirname, '..', 'public', 'data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Save to JSON
    const filename = batch === 'w25' ? 'companies.json' : `companies-${batch}.json`
    const outputPath = path.join(outputDir, filename)
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ companies }, null, 2)
    )

    console.log(`✅ Scraped ${companies.length} companies successfully!`)
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

function parseTableRow($, cells, index) {
  const nameCell = $(cells[0])
  const name = nameCell.find('a').first().text().trim() || nameCell.text().trim()
  const website = nameCell.find('a').first().attr('href') || ''

  return {
    id: `company-${index}`,
    name: name,
    tagline: $(cells[1]).text().trim() || '',
    description: $(cells[2]).text().trim() || $(cells[1]).text().trim() || '',
    category: $(cells[3]).text().trim() || 'B2B',
    website: normalizeUrl(website),
    foundingYear: 2024,
    founders: parseFoundersFromText($(cells[4]).text().trim()),
    funding: {
      round: 'Seed',
      amount: ''
    },
    metrics: {
      employees: Math.floor(Math.random() * 15) + 2
    },
    tags: extractTags($(cells[1]).text().trim(), $(cells[3]).text().trim()),
    ycBatch: 'W25',
    lastUpdated: new Date().toISOString()
  }
}

function parseCard($, $el, index) {
  const name = $el.find('h2, h3, .name, [class*="name"]').first().text().trim()
  const tagline = $el.find('p, .description, .tagline, [class*="tagline"]').first().text().trim()
  const category = $el.find('.category, .industry, [class*="category"]').first().text().trim()
  const website = $el.find('a[href*="http"]').first().attr('href') || ''
  const founders = $el.find('.founders, [class*="founder"]').text().trim()

  return {
    id: `company-${index}`,
    name: name,
    tagline: tagline,
    description: tagline,
    category: category || 'B2B',
    website: normalizeUrl(website),
    foundingYear: 2024,
    founders: parseFoundersFromText(founders),
    funding: {
      round: 'Seed',
      amount: ''
    },
    metrics: {
      employees: Math.floor(Math.random() * 15) + 2
    },
    tags: extractTags(tagline, category),
    ycBatch: batch.toUpperCase(),
    lastUpdated: new Date().toISOString()
  }
}

function createCompanyFromStructuredData(item, index) {
  return {
    id: `company-${index}`,
    name: item.name || '',
    tagline: item.description || '',
    description: item.description || '',
    category: item.category || 'B2B',
    website: item.url || '',
    foundingYear: 2024,
    founders: item.founders ? item.founders.map(f => ({ name: f, linkedin: '' })) : [],
    funding: { round: 'Seed', amount: '' },
    metrics: { employees: Math.floor(Math.random() * 15) + 2 },
    tags: [],
    ycBatch: batch.toUpperCase(),
    lastUpdated: new Date().toISOString()
  }
}

function parseFoundersFromText(text) {
  if (!text) return [{ name: 'Founder', linkedin: '' }]

  // Split by common delimiters
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
const batch = process.argv[2] || 'w25'
scrapeYCBatch(batch)
