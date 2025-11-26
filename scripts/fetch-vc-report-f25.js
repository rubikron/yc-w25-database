const axios = require('axios')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

// Configuration
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const RATE_LIMIT_MS = 2000 // 2 seconds between requests
const INPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'companies-f25.json')
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'companies-f25.json')

// Rate limiting helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Perplexity API call
async function askPerplexity(prompt, retries = 3) {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is required')
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a VC analyst conducting due diligence on startups from YC Fall 2025 (F25) batch. Provide factual, research-based analysis. Always respond with valid JSON only, no markdown or explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      const content = response.data.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty response from Perplexity')
      }

      // Parse JSON from response
      try {
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return JSON.parse(jsonStr)
      } catch (parseError) {
        console.error(`\n   JSON parse error: ${parseError.message}`)
        console.error(`   Raw response: ${content.substring(0, 200)}...`)
        return null
      }
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries) {
        const waitTime = attempt * 10000
        console.log(`\n   Rate limited. Waiting ${waitTime/1000}s before retry ${attempt}/${retries}...`)
        await sleep(waitTime)
        continue
      }
      console.error(`\n   API error: ${error.response?.status || error.message}`)
      return null
    }
  }
  return null
}

// Generate VC report for a company
async function generateVCReport(company) {
  // Clean up the data
  const cleanTagline = company.tagline ? company.tagline.replace(/sources:\s*\d+/gi, '').trim() : ''
  const cleanDescription = company.description ? company.description.replace(/sources:\s*\d+/gi, '').replace(/\d+\s*people/gi, '').trim() : ''

  const prompt = `Research this YC Fall 2025 (F25) startup and provide a VC due diligence report:

Company Name: ${company.name}
Website: ${company.website || 'N/A'}
YC Batch: Fall 2025 (F25)

Please research this company online and provide factual information.

Analyze these 11 key VC factors and respond with this exact JSON structure:

{
  "traction": {
    "summary": "1-2 sentence assessment of traction",
    "revenue": "Known revenue figures or 'Unknown'",
    "users": "Known user/customer numbers or 'Unknown'",
    "evidence": ["Source 1", "Source 2"]
  },
  "growthRate": {
    "summary": "1-2 sentence assessment of growth",
    "rate": "Growth rate if known or 'Unknown'",
    "evidence": ["Source 1", "Source 2"]
  },
  "teamBackground": {
    "summary": "2-3 sentence assessment of founder backgrounds",
    "notableExperience": ["Experience 1", "Experience 2"],
    "evidence": ["Source 1", "Source 2"]
  },
  "marketSize": {
    "summary": "2-3 sentence market analysis",
    "tam": "Total addressable market if known",
    "sam": "Serviceable addressable market if known",
    "evidence": ["Source 1", "Source 2"]
  },
  "productStatus": {
    "summary": "2-3 sentence product assessment",
    "stage": "MVP / Beta / Live / Pre-launch",
    "evidence": ["Source 1", "Source 2"]
  },
  "notableBackers": {
    "summary": "1-2 sentence assessment of funding",
    "investors": ["Investor 1", "Investor 2"],
    "totalRaised": "Amount if known or 'Unknown'",
    "evidence": ["Source 1", "Source 2"]
  },
  "defensibility": {
    "summary": "2-3 sentence assessment",
    "moat": "What makes them defensible",
    "competitiveAdvantages": ["Advantage 1", "Advantage 2"],
    "evidence": ["Source 1", "Source 2"]
  },
  "unitEconomics": {
    "summary": "1-2 sentence assessment",
    "revenueModel": "Business model description",
    "evidence": ["Source 1", "Source 2"]
  },
  "competition": {
    "summary": "2-3 sentence competitive analysis",
    "mainCompetitors": ["Competitor 1", "Competitor 2"],
    "differentiation": "How they differentiate",
    "evidence": ["Source 1", "Source 2"]
  },
  "potentialAcquirers": {
    "summary": "1-2 sentence assessment",
    "likelyAcquirers": ["Company 1", "Company 2", "Company 3"],
    "rationale": "Why these acquirers make sense",
    "evidence": ["Source 1", "Source 2"]
  },
  "founderCommitment": {
    "summary": "1-2 sentence assessment",
    "fullTime": "yes / no / unknown",
    "evidence": ["Source 1", "Source 2"]
  },
  "overallScore": 7.5,
  "investmentRecommendation": "STRONG BUY / BUY / HOLD / PASS",
  "executiveSummary": "3-4 sentence overall assessment covering key strengths and concerns"
}

Important: Focus on Fall 2025 batch. Search for recent news and information. If information is limited (common for early-stage startups), indicate 'Unknown' or 'Limited information available' and base assessment on available data.`

  const report = await askPerplexity(prompt)
  return report
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting YC F25 VC Report Generation\n')

    // Read companies data
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8')
    const data = JSON.parse(rawData)
    const companies = data.companies

    console.log(`📊 Found ${companies.length} F25 companies\n`)

    // Get command line arguments
    const args = process.argv.slice(2)
    const startIndex = args.includes('--start') ? parseInt(args[args.indexOf('--start') + 1]) || 0 : 0
    const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : companies.length
    const processAll = args.includes('--all')

    // Determine which companies to process
    let companiesToProcess = companies.slice(startIndex, Math.min(startIndex + limit, companies.length))

    if (!processAll) {
      // Only process companies without reports
      companiesToProcess = companiesToProcess.filter(c => !c.vcReport)
    }

    console.log(`📝 Processing ${companiesToProcess.length} companies (from index ${startIndex})\n`)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < companiesToProcess.length; i++) {
      const company = companiesToProcess[i]
      const globalIndex = companies.findIndex(c => c.id === company.id)

      console.log(`[${i + 1}/${companiesToProcess.length}] ${company.name}`)

      try {
        const report = await generateVCReport(company)

        if (report && report.overallScore) {
          // Add ratings for each category (1-10 scale)
          report.traction.rating = report.traction.rating || Math.round(report.overallScore)
          report.growthRate.rating = report.growthRate.rating || Math.round(report.overallScore)
          report.teamBackground.rating = report.teamBackground.rating || Math.round(report.overallScore)
          report.marketSize.rating = report.marketSize.rating || Math.round(report.overallScore)
          report.productStatus.rating = report.productStatus.rating || Math.round(report.overallScore)
          report.notableBackers.rating = report.notableBackers.rating || Math.round(report.overallScore * 0.8)
          report.defensibility.rating = report.defensibility.rating || Math.round(report.overallScore)
          report.unitEconomics.rating = report.unitEconomics.rating || Math.round(report.overallScore)
          report.competition.rating = report.competition.rating || Math.round(report.overallScore)
          report.potentialAcquirers.rating = report.potentialAcquirers.rating || Math.round(report.overallScore * 0.9)
          report.founderCommitment.rating = report.founderCommitment.rating || Math.round(report.overallScore)

          companies[globalIndex].vcReport = report
          successCount++
          console.log(`   ✅ Score: ${report.overallScore}/10 | ${report.investmentRecommendation}`)
        } else {
          failCount++
          console.log(`   ❌ Failed to generate report`)
        }

        // Save progress after each company
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ companies }, null, 2))

        // Rate limiting
        if (i < companiesToProcess.length - 1) {
          await sleep(RATE_LIMIT_MS)
        }
      } catch (error) {
        failCount++
        console.error(`   ❌ Error: ${error.message}`)
      }
    }

    console.log(`\n✨ Completed!`)
    console.log(`   Success: ${successCount}`)
    console.log(`   Failed: ${failCount}`)
    console.log(`   Output: ${OUTPUT_FILE}`)

  } catch (error) {
    console.error('Fatal error:', error.message)
    process.exit(1)
  }
}

main()
