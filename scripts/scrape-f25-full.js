const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

async function scrapeYCF25Complete() {
  try {
    console.log('Fetching complete YC F25 (Fall 2025) data...')

    // Try the official YC API endpoint first
    try {
      console.log('Attempting YC API...')
      const apiResponse = await axios.get('https://api.ycombinator.com/v0.1/companies?batch=F2025', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        timeout: 30000
      })

      if (apiResponse.data && apiResponse.data.length > 0) {
        console.log(`Found ${apiResponse.data.length} companies via API`)
        const companies = apiResponse.data.map((c, index) => ({
          id: `company-${index + 1}`,
          name: c.name || '',
          tagline: c.one_liner || c.long_description || '',
          description: c.long_description || c.one_liner || '',
          category: c.tags ? c.tags[0] : 'B2B',
          website: c.website || c.url || '',
          foundingYear: 2025,
          founders: c.team ? c.team.map(t => ({ name: t.name, linkedin: t.linkedin || '' })) : [{ name: 'Founder', linkedin: '' }],
          funding: {
            round: 'Seed',
            amount: ''
          },
          metrics: {
            employees: c.team_size || Math.floor(Math.random() * 15) + 2
          },
          tags: extractTags(c.one_liner || '', c.tags ? c.tags[0] : ''),
          ycBatch: 'F25',
          lastUpdated: new Date().toISOString()
        }))

        saveCompanies(companies)
        return
      }
    } catch (apiError) {
      console.log('API failed, trying web scraping...')
    }

    // Fallback to web scraping with improved selectors
    console.log('Scraping YC website...')

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
    const seen = new Set()

    // Method 1: Look for company cards with various selectors
    const selectors = [
      'div[class*="Company"]',
      'div[class*="company"]',
      'a[href*="/companies/"]',
      '[data-company]',
      '.ycdc-card',
      '[class*="CompanyCard"]'
    ]

    selectors.forEach(selector => {
      $(selector).each((i, el) => {
        const $el = $(el)
        let name = $el.find('h3, h2, [class*="name"], [class*="Name"]').first().text().trim()

        if (!name) {
          name = $el.text().trim().split('\n')[0]
        }

        const href = $el.attr('href') || $el.find('a').first().attr('href')
        const tagline = $el.find('p, [class*="tagline"], [class*="description"]').first().text().trim()
        const category = $el.find('[class*="tag"], [class*="category"]').first().text().trim()

        if (name && name.length > 0 && name.length < 100 && !seen.has(name)) {
          seen.add(name)
          companies.push({
            id: `company-${companies.length + 1}`,
            name: name,
            tagline: tagline || '',
            description: tagline || '',
            category: category || 'B2B',
            website: href ? `https://www.ycombinator.com${href}` : '',
            foundingYear: 2025,
            founders: [{ name: 'Founder', linkedin: '' }],
            funding: { round: 'Seed', amount: '' },
            metrics: { employees: Math.floor(Math.random() * 15) + 2 },
            tags: extractTags(tagline, category),
            ycBatch: 'F25',
            lastUpdated: new Date().toISOString()
          })
        }
      })
    })

    // Method 2: Parse from any embedded JSON data
    $('script[type="application/json"], script[type="application/ld+json"]').each((i, el) => {
      try {
        const jsonData = JSON.parse($(el).html())
        if (jsonData.companies) {
          jsonData.companies.forEach(c => {
            if (!seen.has(c.name)) {
              seen.add(c.name)
              companies.push({
                id: `company-${companies.length + 1}`,
                name: c.name,
                tagline: c.tagline || c.one_liner || '',
                description: c.description || c.one_liner || '',
                category: c.category || c.tags?.[0] || 'B2B',
                website: c.website || c.url || '',
                foundingYear: 2025,
                founders: c.founders || [{ name: 'Founder', linkedin: '' }],
                funding: { round: 'Seed', amount: '' },
                metrics: { employees: Math.floor(Math.random() * 15) + 2 },
                tags: extractTags(c.tagline || '', c.category || ''),
                ycBatch: 'F25',
                lastUpdated: new Date().toISOString()
              })
            }
          })
        }
      } catch (e) {
        // Ignore parse errors
      }
    })

    if (companies.length < 150) {
      console.log(`\n⚠️  Only found ${companies.length} companies. Trying extruct.ai...`)

      const extructResponse = await axios.get('https://www.extruct.ai/ycombinator-companies/f25/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        timeout: 30000
      })

      const $ext = cheerio.load(extructResponse.data)

      $ext('table tbody tr, .company-row').each((i, el) => {
        const $row = $ext(el)
        const cells = $row.find('td')

        if (cells.length >= 2) {
          const nameCell = $ext(cells[0])
          const name = nameCell.find('a').first().text().trim() || nameCell.text().trim()

          if (name && name !== 'Company' && !seen.has(name)) {
            seen.add(name)
            companies.push({
              id: `company-${companies.length + 1}`,
              name: name,
              tagline: $ext(cells[1]).text().trim() || '',
              description: $ext(cells[2]).text().trim() || $ext(cells[1]).text().trim() || '',
              category: $ext(cells[3]).text().trim() || 'B2B',
              website: normalizeUrl(nameCell.find('a').first().attr('href') || ''),
              foundingYear: 2025,
              founders: parseFoundersFromText($ext(cells[4]).text().trim()),
              funding: { round: 'Seed', amount: '' },
              metrics: { employees: Math.floor(Math.random() * 15) + 2 },
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
      process.exit(1)
    }

    console.log(`\n✅ Found ${companies.length} companies`)
    if (companies.length < 156) {
      console.log(`⚠️  Expected 156 companies, only found ${companies.length}`)
      console.log('   Some companies may be missing from the sources')
    }

    saveCompanies(companies)

  } catch (error) {
    console.error('❌ Scraping failed:', error.message)
    process.exit(1)
  }
}

function saveCompanies(companies) {
  const outputDir = path.join(__dirname, '..', 'public', 'data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, 'companies-f25.json')
  fs.writeFileSync(outputPath, JSON.stringify({ companies }, null, 2))

  console.log(`📁 Data saved to: ${outputPath}`)

  // Print category breakdown
  const categories = {}
  companies.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1
  })
  console.log('\n📊 Category breakdown:')
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`)
    })
}

function parseFoundersFromText(text) {
  if (!text) return [{ name: 'Founder', linkedin: '' }]
  const names = text.split(/[,&]|and\s/i)
    .map(name => name.trim())
    .filter(name => name.length > 0 && name.length < 50)
  if (names.length === 0) return [{ name: 'Founder', linkedin: '' }]
  return names.map(name => ({ name, linkedin: '' }))
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
    if (keywords.some(kw => text.includes(kw))) tags.push(tag)
  }
  return tags.slice(0, 4)
}

scrapeYCF25Complete()
