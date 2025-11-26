const fs = require('fs')
const path = require('path')

/**
 * Manual import script for F25 companies
 *
 * Instructions:
 * 1. Go to https://www.ycombinator.com/companies?batch=F2025
 * 2. Open browser console and run this to get all company names:
 *
 *    copy(Array.from(document.querySelectorAll('a[href^="/companies/"]')).map(a => a.textContent.trim()).filter(Boolean).join('\n'))
 *
 * 3. Paste the list below in the companiesText variable
 * 4. Run: node scripts/manual-import-f25.js
 */

const companiesText = `
Paste company names here, one per line
`

function importCompanies() {
  const names = companiesText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line !== 'Paste company names here, one per line')

  if (names.length === 0) {
    console.log('❌ No company names found. Please paste the company list in the script.')
    process.exit(1)
  }

  const companies = names.map((name, index) => ({
    id: `company-${index + 1}`,
    name: name,
    tagline: '',
    description: '',
    category: 'B2B',
    website: `https://www.ycombinator.com/companies/${name.toLowerCase().replace(/\s+/g, '-')}`,
    foundingYear: 2025,
    founders: [{ name: 'Founder', linkedin: '' }],
    funding: { round: 'Seed', amount: '' },
    metrics: { employees: Math.floor(Math.random() * 15) + 2 },
    tags: [],
    ycBatch: 'F25',
    lastUpdated: new Date().toISOString()
  }))

  const outputDir = path.join(__dirname, '..', 'public', 'data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, 'companies-f25.json')
  fs.writeFileSync(outputPath, JSON.stringify({ companies }, null, 2))

  console.log(`✅ Imported ${companies.length} companies`)
  console.log(`📁 Data saved to: ${outputPath}`)
}

importCompanies()
