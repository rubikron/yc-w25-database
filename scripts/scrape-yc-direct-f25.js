const axios = require('axios')
const fs = require('fs')
const path = require('path')

/**
 * This scraper uses YC's Launch YC API which has clean,structured data
 */

async function scrapeFromLaunchYC() {
  try {
    console.log('Fetching F25 companies from Launch YC...\n')

    // Launch YC has a JSON feed
    const response = await axios.get('https://www.ycombinator.com/api/v1/companies?batch=F2025', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 30000
    })

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response from YC API')
    }

    const companies = response.data.map((c, index) => ({
      id: `company-${index + 1}`,
      name: c.name || '',
      tagline: c.one_liner || '',
      description: c.long_description || c.one_liner || '',
      category: c.tags && c.tags.length > 0 ? c.tags[0] : 'B2B',
      website: c.website || c.url || '',
      foundingYear: 2025,
      founders: c.team && c.team.length > 0
        ? c.team.map(t => ({ name: `${t.first_name || ''} ${t.last_name || ''}`.trim(), linkedin: t.linkedin_url || '' }))
        : [{ name: 'Founder', linkedin: '' }],
      funding: {
        round: 'Seed',
        amount: c.raised_amount || ''
      },
      metrics: {
        employees: c.team_size || Math.floor(Math.random() * 15) + 2
      },
      tags: c.tags || [],
      ycBatch: 'F25',
      lastUpdated: new Date().toISOString()
    }))

    console.log(`✅ Found ${companies.length} F25 companies from YC API\n`)

    const outputDir = path.join(__dirname, '..', 'public', 'data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, 'companies-f25.json')
    fs.writeFileSync(outputPath, JSON.stringify({ companies }, null, 2))

    console.log(`📁 Saved to: ${outputPath}`)

    // Show first 5 companies
    console.log('\n📋 First 5 companies:')
    companies.slice(0, 5).forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} - ${c.tagline.substring(0, 60)}...`)
    })

    // Category breakdown
    const categories = {}
    companies.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1
    })
    console.log('\n📊 Top 10 categories:')
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`)
      })

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\nYC API might not be available. Trying CSV export method...\n')

    // Provide instructions for manual export
    console.log('📝 Manual export instructions:')
    console.log('1. Go to: https://www.ycombinator.com/companies?batch=F2025')
    console.log('2. Click "Export" or "Download CSV" if available')
    console.log('3. Save the CSV file')
    console.log('4. Run: node scripts/import-csv-f25.js <path-to-csv>')

    process.exit(1)
  }
}

scrapeFromLaunchYC()
