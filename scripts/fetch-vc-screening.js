const axios = require('axios')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

// Configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY
const RATE_LIMIT_MS = 1500 // 1.5 seconds between requests (Brave allows 1/sec)
const MAX_RESULTS_PER_SEARCH = 10

// Rate limiting helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Brave Search API call with retry logic
async function braveSearch(query, retries = 3) {
  if (!BRAVE_API_KEY) {
    throw new Error('BRAVE_API_KEY environment variable is required')
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': BRAVE_API_KEY
        },
        params: {
          q: query,
          count: MAX_RESULTS_PER_SEARCH
        },
        timeout: 15000
      })

      return response.data.web?.results || []
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries) {
        const waitTime = attempt * 5000 // 5s, 10s, 15s
        console.log(`\n   Rate limited. Waiting ${waitTime/1000}s before retry ${attempt}/${retries}...`)
        await sleep(waitTime)
        continue
      }
      console.error(`\n   Search failed for "${query}": ${error.response?.status || error.message}`)
      return []
    }
  }
  return []
}

// Extract information from search results
function extractFromResults(results, patterns) {
  const extracted = []

  for (const result of results) {
    const text = `${result.title} ${result.description}`.toLowerCase()

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi')
      const matches = text.match(regex)
      if (matches) {
        extracted.push(...matches)
      }
    }
  }

  return [...new Set(extracted)]
}

// Parse funding information from search results
function parseFundingInfo(results) {
  const info = {
    totalRaised: null,
    investors: [],
    lastValuation: null
  }

  for (const result of results) {
    const text = `${result.title} ${result.description}`

    // Extract funding amounts
    const fundingMatch = text.match(/\$[\d.]+\s*[MBK](?:illion)?/gi)
    if (fundingMatch && !info.totalRaised) {
      info.totalRaised = fundingMatch[0]
    }

    // Extract investor names (common VC patterns)
    const vcPatterns = [
      /(?:led by|from|backed by|invested by)\s+([A-Z][a-zA-Z\s&]+?)(?:,|\.|and|with)/gi,
      /(Y Combinator|Andreessen Horowitz|a16z|Sequoia|Greylock|Accel|Benchmark|First Round|Index Ventures)/gi
    ]

    for (const pattern of vcPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const investor = match[1]?.trim() || match[0]?.trim()
        if (investor && investor.length > 2 && investor.length < 50) {
          info.investors.push(investor)
        }
      }
    }

    // Extract valuation
    const valMatch = text.match(/valued?\s+at\s+\$[\d.]+\s*[MBK](?:illion)?/gi)
    if (valMatch && !info.lastValuation) {
      info.lastValuation = valMatch[0].replace(/valued?\s+at\s+/i, '')
    }
  }

  info.investors = [...new Set(info.investors)].slice(0, 10)
  return info
}

// Parse competitor information
function parseCompetitors(results, companyName) {
  const competitors = []
  const competitorPatterns = [
    /competes?\s+with\s+([A-Z][a-zA-Z\s]+)/gi,
    /competitors?\s+(?:include|like|such as)\s+([A-Z][a-zA-Z\s,]+)/gi,
    /(?:vs|versus|compared to)\s+([A-Z][a-zA-Z\s]+)/gi
  ]

  for (const result of results) {
    const text = `${result.title} ${result.description}`

    for (const pattern of competitorPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const names = match[1].split(/,|and/).map(n => n.trim()).filter(n =>
          n.length > 2 &&
          n.length < 30 &&
          n.toLowerCase() !== companyName.toLowerCase()
        )
        competitors.push(...names)
      }
    }
  }

  return [...new Set(competitors)].slice(0, 5).map(name => ({
    name,
    description: '',
    fundingRaised: '',
    marketShare: ''
  }))
}

// Parse traction metrics
function parseTractionMetrics(results) {
  const metrics = {
    customerCount: null,
    arr: null,
    mrr: null,
    notableCustomers: []
  }

  for (const result of results) {
    const text = `${result.title} ${result.description}`

    // Customer count
    const customerMatch = text.match(/([\d,]+)\s*(?:customers?|clients?|users?|companies)/gi)
    if (customerMatch && !metrics.customerCount) {
      const num = parseInt(customerMatch[0].replace(/[^\d]/g, ''))
      if (num > 0 && num < 10000000) {
        metrics.customerCount = num
      }
    }

    // ARR/MRR
    const revenueMatch = text.match(/(?:ARR|annual recurring revenue)\s*(?:of)?\s*\$[\d.]+\s*[MBK]/gi)
    if (revenueMatch && !metrics.arr) {
      metrics.arr = revenueMatch[0].replace(/(?:ARR|annual recurring revenue)\s*(?:of)?\s*/gi, '')
    }

    // Notable customers
    const customerPatterns = [
      /(Fortune 500|enterprise|Fortune 100)/gi,
      /customers?\s+(?:include|like)\s+([A-Z][a-zA-Z\s,]+)/gi
    ]

    for (const pattern of customerPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          const names = match[1].split(/,|and/).map(n => n.trim()).filter(n => n.length > 2)
          metrics.notableCustomers.push(...names)
        }
      }
    }
  }

  metrics.notableCustomers = [...new Set(metrics.notableCustomers)].slice(0, 5)
  return metrics
}

// Parse founder backgrounds
function parseFounderInfo(results, founderName) {
  const info = {
    education: [],
    previousCompanies: [],
    achievements: []
  }

  const universities = [
    'Stanford', 'MIT', 'Harvard', 'Berkeley', 'Carnegie Mellon', 'Yale', 'Princeton',
    'Columbia', 'Cornell', 'Penn', 'Wharton', 'Oxford', 'Cambridge', 'Caltech', 'Georgia Tech'
  ]

  const techCompanies = [
    'Google', 'Meta', 'Facebook', 'Apple', 'Amazon', 'Microsoft', 'Netflix', 'Uber',
    'Airbnb', 'Stripe', 'Twitter', 'LinkedIn', 'Salesforce', 'Oracle', 'IBM', 'Tesla'
  ]

  for (const result of results) {
    const text = `${result.title} ${result.description}`

    // Check for universities
    for (const uni of universities) {
      if (text.toLowerCase().includes(uni.toLowerCase())) {
        info.education.push({ institution: uni })
      }
    }

    // Check for previous companies
    for (const company of techCompanies) {
      if (text.toLowerCase().includes(company.toLowerCase())) {
        info.previousCompanies.push({ name: company, role: 'Former Employee' })
      }
    }

    // Check for achievements
    const achievementPatterns = [
      /(?:founded|co-founded|built|created|launched)\s+([A-Z][a-zA-Z\s]+)/gi,
      /(?:acquired by|sold to)\s+([A-Z][a-zA-Z\s]+)/gi,
      /(?:Forbes|TechCrunch|YC|Y Combinator)/gi
    ]

    for (const pattern of achievementPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        info.achievements.push(match[0])
      }
    }
  }

  info.education = [...new Set(info.education.map(e => JSON.stringify(e)))].map(e => JSON.parse(e)).slice(0, 3)
  info.previousCompanies = [...new Set(info.previousCompanies.map(c => JSON.stringify(c)))].map(c => JSON.parse(c)).slice(0, 3)
  info.achievements = [...new Set(info.achievements)].slice(0, 5)

  return info
}

// Parse market information
function parseMarketInfo(results) {
  const info = {
    tam: null,
    marketGrowthRate: null,
    marketTrends: []
  }

  for (const result of results) {
    const text = `${result.title} ${result.description}`

    // TAM/Market size
    const marketSizeMatch = text.match(/(?:market size|TAM|total addressable market)\s*(?:of|is|:)?\s*\$[\d.]+\s*[BTM](?:illion|rillion)?/gi)
    if (marketSizeMatch && !info.tam) {
      info.tam = marketSizeMatch[0]
    }

    // Growth rate
    const growthMatch = text.match(/(?:growing|growth rate|CAGR)\s*(?:of|at|:)?\s*[\d.]+%/gi)
    if (growthMatch && !info.marketGrowthRate) {
      info.marketGrowthRate = growthMatch[0]
    }

    // Trends
    const trendPatterns = [
      /(?:trend|shift|movement|adoption)\s+(?:toward|in|of)\s+([a-zA-Z\s]+)/gi
    ]

    for (const pattern of trendPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && match[1].length > 3) {
          info.marketTrends.push(match[1].trim())
        }
      }
    }
  }

  info.marketTrends = [...new Set(info.marketTrends)].slice(0, 5)
  return info
}

// Parse press and social proof
function parsePressInfo(results) {
  const info = {
    pressFeatures: [],
    socialProof: {}
  }

  const publications = [
    'TechCrunch', 'Forbes', 'Bloomberg', 'Wall Street Journal', 'WSJ', 'Reuters',
    'Business Insider', 'VentureBeat', 'The Verge', 'Wired', 'Fast Company',
    'Inc', 'Entrepreneur', 'CNBC', 'New York Times', 'Financial Times'
  ]

  for (const result of results) {
    const text = `${result.title} ${result.description}`
    const url = result.url || ''

    // Check for publication mentions
    for (const pub of publications) {
      if (text.includes(pub) || url.toLowerCase().includes(pub.toLowerCase().replace(/\s/g, ''))) {
        info.pressFeatures.push({
          publication: pub,
          title: result.title,
          url: url
        })
      }
    }

    // Social metrics
    const twitterMatch = text.match(/([\d,]+)\s*(?:Twitter|X)?\s*followers?/gi)
    if (twitterMatch) {
      const num = parseInt(twitterMatch[0].replace(/[^\d]/g, ''))
      if (num > 100) {
        info.socialProof.twitterFollowers = num
      }
    }

    const linkedinMatch = text.match(/([\d,]+)\s*LinkedIn\s*(?:followers?|connections?)/gi)
    if (linkedinMatch) {
      const num = parseInt(linkedinMatch[0].replace(/[^\d]/g, ''))
      if (num > 100) {
        info.socialProof.linkedinFollowers = num
      }
    }
  }

  info.pressFeatures = info.pressFeatures.slice(0, 5)
  return info
}

// Determine product stage
function determineProductStage(results) {
  const stageIndicators = {
    'scaling': ['scaling', 'series b', 'series c', 'hypergrowth', 'expanding'],
    'launched': ['launched', 'live', 'generally available', 'ga', 'production'],
    'beta': ['beta', 'early access', 'private preview', 'beta users'],
    'mvp': ['mvp', 'minimum viable', 'early customers', 'pilot'],
    'prototype': ['prototype', 'demo', 'proof of concept', 'poc']
  }

  const allText = results.map(r => `${r.title} ${r.description}`).join(' ').toLowerCase()

  for (const [stage, indicators] of Object.entries(stageIndicators)) {
    if (indicators.some(ind => allText.includes(ind))) {
      return stage
    }
  }

  return 'launched' // Default for YC companies
}

// Main function to generate VC screening report for a company
async function generateVCScreening(company) {
  const report = {
    team: {
      teamStrengths: [],
      teamGaps: []
    },
    marketAnalysis: {
      competitors: [],
      competitiveAdvantages: [],
      marketTrends: []
    },
    product: {
      stage: 'launched',
      techStack: [],
      moats: []
    },
    traction: {
      notableCustomers: []
    },
    financials: {
      investorQuality: []
    },
    signals: {
      greenFlags: ['Y Combinator backed'],
      riskFlags: [],
      pressFeatures: [],
      socialProof: {}
    },
    reportGeneratedAt: new Date().toISOString()
  }

  try {
    // Search 1: Company funding and investors
    const fundingResults = await braveSearch(`${company.name} funding investors raised`)
    const fundingInfo = parseFundingInfo(fundingResults)
    report.financials.totalRaised = fundingInfo.totalRaised
    report.financials.lastValuation = fundingInfo.lastValuation
    report.financials.investorQuality = fundingInfo.investors.map(name => ({
      name,
      tier: name.match(/Sequoia|a16z|Andreessen|Benchmark|Accel|Index/i) ? 'tier1' : 'tier2'
    }))

    await sleep(RATE_LIMIT_MS)

    // Search 2: Competitors and market
    const marketResults = await braveSearch(`${company.name} competitors market ${company.category}`)
    report.marketAnalysis.competitors = parseCompetitors(marketResults, company.name)
    const marketInfo = parseMarketInfo(marketResults)
    report.marketAnalysis.tam = marketInfo.tam
    report.marketAnalysis.marketGrowthRate = marketInfo.marketGrowthRate
    report.marketAnalysis.marketTrends = marketInfo.marketTrends

    await sleep(RATE_LIMIT_MS)

    // Search 3: Traction and customers
    const tractionResults = await braveSearch(`${company.name} customers users traction revenue`)
    const tractionMetrics = parseTractionMetrics(tractionResults)
    report.traction = { ...report.traction, ...tractionMetrics }
    report.product.stage = determineProductStage(tractionResults)

    await sleep(RATE_LIMIT_MS)

    // Search 4: Press and news
    const pressResults = await braveSearch(`${company.name} TechCrunch Forbes news announcement`)
    const pressInfo = parsePressInfo(pressResults)
    report.signals.pressFeatures = pressInfo.pressFeatures
    report.signals.socialProof = pressInfo.socialProof

    await sleep(RATE_LIMIT_MS)

    // Search 5: Founder backgrounds (for first founder)
    if (company.founders && company.founders.length > 0) {
      const founderName = company.founders[0].name
      const founderResults = await braveSearch(`${founderName} ${company.name} founder background education`)
      const founderInfo = parseFounderInfo(founderResults, founderName)

      // Update founder with background info
      if (founderInfo.education.length > 0 || founderInfo.previousCompanies.length > 0) {
        company.founders[0].background = {
          education: founderInfo.education,
          previousCompanies: founderInfo.previousCompanies,
          notableAchievements: founderInfo.achievements
        }
      }

      // Add to team assessment
      if (founderInfo.previousCompanies.length > 0) {
        report.team.teamStrengths.push(`Founder with experience at ${founderInfo.previousCompanies.map(c => c.name).join(', ')}`)
      }
      if (founderInfo.education.length > 0) {
        report.team.teamStrengths.push(`Education: ${founderInfo.education.map(e => e.institution).join(', ')}`)
      }
    }

    // Generate green flags based on collected data
    if (report.financials.totalRaised) {
      report.signals.greenFlags.push(`Raised ${report.financials.totalRaised}`)
    }
    if (report.traction.customerCount && report.traction.customerCount > 10) {
      report.signals.greenFlags.push(`${report.traction.customerCount}+ customers`)
    }
    if (report.signals.pressFeatures.length > 0) {
      report.signals.greenFlags.push(`Featured in ${report.signals.pressFeatures[0].publication}`)
    }

    // Identify potential risk flags
    if (!report.financials.totalRaised) {
      report.signals.riskFlags.push({
        category: 'financial',
        description: 'Funding information not publicly available',
        severity: 'low'
      })
    }
    if (report.marketAnalysis.competitors.length === 0) {
      report.signals.riskFlags.push({
        category: 'market',
        description: 'Competitor landscape unclear',
        severity: 'low'
      })
    }

  } catch (error) {
    console.error(`Error generating report for ${company.name}: ${error.message}`)
  }

  return report
}

// Main execution
async function main() {
  if (!BRAVE_API_KEY) {
    console.error('Error: BRAVE_API_KEY environment variable is required')
    console.log('\nTo use this script:')
    console.log('1. Get a Brave Search API key from https://brave.com/search/api/')
    console.log('2. Run: BRAVE_API_KEY=your_key npm run fetch-vc-screening')
    process.exit(1)
  }

  const dataPath = path.join(__dirname, '..', 'public', 'data', 'companies.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const companies = data.companies

  console.log(`Generating VC screening reports for ${companies.length} companies...\n`)
  console.log('This will make ~5 API calls per company.')
  console.log('Estimated time: ~' + Math.ceil(companies.length * 5 * RATE_LIMIT_MS / 60000) + ' minutes\n')

  let processed = 0
  let failed = 0

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i]
    process.stdout.write(`[${i + 1}/${companies.length}] ${company.name}... `)

    try {
      const vcScreening = await generateVCScreening(company)
      company.vcScreening = vcScreening
      processed++

      // Show summary
      const flags = vcScreening.signals.greenFlags.length
      const risks = vcScreening.signals.riskFlags.length
      console.log(`Done (${flags} green flags, ${risks} risks)`)

    } catch (error) {
      console.log(`Failed: ${error.message}`)
      failed++
    }

    // Save progress every 10 companies
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
      console.log(`   Progress saved...`)
    }
  }

  // Final save
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

  console.log(`\nVC Screening Complete!`)
  console.log(`   Processed: ${processed} companies`)
  console.log(`   Failed: ${failed} companies`)
  console.log(`   Data saved to: ${dataPath}`)
}

main()
