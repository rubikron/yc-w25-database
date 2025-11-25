const axios = require('axios')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

// Configuration
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const RATE_LIMIT_MS = 2000 // 2 seconds between requests

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
              content: 'You are a VC analyst conducting due diligence on startups. Provide factual, research-based analysis. Always respond with valid JSON only, no markdown or explanations.'
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
        // Remove markdown code blocks if present
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
  const founderNames = company.founders.map(f => f.name).join(', ')

  const prompt = `Research this YC W25 startup and provide a VC due diligence report:

Company: ${company.name}
Tagline: ${company.tagline}
Description: ${company.description}
Category: ${company.category}
Website: ${company.website || 'N/A'}
Founders: ${founderNames}

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
    "timeframe": "Time period for growth rate",
    "evidence": ["Source 1"]
  },
  "teamBackground": {
    "summary": "1-2 sentence assessment of team",
    "strengths": ["Strength 1", "Strength 2"],
    "concerns": ["Concern 1"] or [],
    "evidence": ["LinkedIn", "Previous companies"]
  },
  "marketSize": {
    "summary": "1-2 sentence market assessment",
    "tam": "Total addressable market",
    "sam": "Serviceable addressable market",
    "som": "Serviceable obtainable market",
    "evidence": ["Market report source"]
  },
  "productStatus": {
    "summary": "1-2 sentence product status",
    "status": "live" or "beta" or "development" or "concept",
    "evidence": ["Product Hunt", "App Store", etc.]
  },
  "notableBackers": {
    "summary": "1-2 sentence on investors",
    "investors": ["Y Combinator", "Other VCs"],
    "angels": ["Notable angels"],
    "evidence": ["Crunchbase", "News"]
  },
  "uniqueAdvantage": {
    "summary": "1-2 sentence on competitive advantage",
    "moats": ["Network effects", "Data", "Tech"],
    "differentiators": ["Key differentiator 1"],
    "evidence": ["Source"]
  },
  "unitEconomics": {
    "summary": "1-2 sentence on unit economics",
    "metrics": ["LTV", "CAC", "Margins if known"],
    "evidence": ["Source"]
  },
  "competition": {
    "summary": "1-2 sentence competitive analysis",
    "competitors": ["Competitor 1", "Competitor 2"],
    "advantages": ["Advantage over competitors"],
    "risks": ["Competitive risks"],
    "evidence": ["Source"]
  },
  "potentialAcquirers": {
    "summary": "1-2 sentence on M&A potential",
    "companies": ["Google", "Microsoft", "Relevant acquirers"],
    "rationale": ["Why they would acquire"],
    "evidence": ["Similar acquisitions"]
  },
  "founderCommitment": {
    "summary": "1-2 sentence on founder commitment",
    "status": "full-time" or "part-time" or "unknown",
    "evidence": ["LinkedIn", "News"]
  },
  "overallScore": 7,
  "recommendation": "1-2 sentence investment recommendation"
}

Be specific and factual. If information is not available, say "Unknown" or "Not publicly available". Include real sources in evidence arrays.`

  return await askPerplexity(prompt)
}

// Main execution
async function main() {
  if (!PERPLEXITY_API_KEY) {
    console.error('Error: PERPLEXITY_API_KEY environment variable is required')
    console.log('\nTo use this script:')
    console.log('1. Get a Perplexity API key from https://www.perplexity.ai/settings/api')
    console.log('2. Add to .env: PERPLEXITY_API_KEY=your_key')
    console.log('3. Run: npm run fetch-vc-report')
    process.exit(1)
  }

  const dataPath = path.join(__dirname, '..', 'public', 'data', 'companies.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const companies = data.companies

  console.log(`Generating VC reports for ${companies.length} companies using Perplexity...\n`)
  console.log('This makes 1 API call per company.')
  console.log(`Estimated time: ~${Math.ceil(companies.length * RATE_LIMIT_MS / 60000)} minutes\n`)

  let processed = 0
  let failed = 0

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i]
    process.stdout.write(`[${i + 1}/${companies.length}] ${company.name}... `)

    try {
      const vcReport = await generateVCReport(company)

      if (vcReport) {
        vcReport.reportGeneratedAt = new Date().toISOString()
        company.vcReport = vcReport
        processed++

        const score = vcReport.overallScore || '?'
        console.log(`Done (Score: ${score}/10)`)
      } else {
        console.log('Failed to parse response')
        failed++
      }
    } catch (error) {
      console.log(`Failed: ${error.message}`)
      failed++
    }

    // Save progress every 5 companies
    if ((i + 1) % 5 === 0) {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
      console.log(`   Progress saved...`)
    }

    // Rate limiting
    if (i < companies.length - 1) {
      await sleep(RATE_LIMIT_MS)
    }
  }

  // Final save
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

  console.log(`\n✅ VC Reports Complete!`)
  console.log(`   Processed: ${processed} companies`)
  console.log(`   Failed: ${failed} companies`)
  console.log(`   Data saved to: ${dataPath}`)
}

main()
