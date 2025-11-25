import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    // Load companies data
    const dataPath = path.join(process.cwd(), 'public', 'data', 'companies.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const { companies } = JSON.parse(rawData)

    // Step 1: Create metadata index (lightweight) - just names, categories, and scores
    const companyIndex = companies.map((c: any) => ({
      name: c.name,
      category: c.category,
      score: c.vcReport?.overallScore || 0,
      recommendation: c.vcReport?.investmentRecommendation || 'N/A',
      hasDefensibility: !!c.vcReport?.defensibility,
      hasPotentialAcquirers: !!c.vcReport?.potentialAcquirers,
      totalRaised: c.vcReport?.notableBackers?.totalRaised || 'N/A',
    }))

    // Get categories and stats
    const categories = [...new Set(companies.map((c: any) => c.category))]
    const stats = {
      totalCompanies: companies.length,
      avgScore: (companies.reduce((sum: number, c: any) => sum + (c.vcReport?.overallScore || 0), 0) / companies.length).toFixed(1),
      categories: categories.length,
    }

    // Step 2: Ask GPT to determine what data it needs
    const planningResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a query planner for a YC startup database. Your job is to decide what data to retrieve.

Database info:
- Total companies: ${stats.totalCompanies}
- Average VC score: ${stats.avgScore}/10
- Categories available: ${categories.join(', ')}

Company index (name, category, score):
${JSON.stringify(companyIndex, null, 2)}

Analyze the user's question and respond with a JSON object specifying what data to retrieve:
{
  "strategy": "all" | "filter" | "specific",
  "reasoning": "brief explanation",
  "filters": {
    "categories": ["category1", "category2"] or null,
    "minScore": number or null,
    "maxResults": number or null,
    "companyNames": ["Company1", "Company2"] or null
  }
}

Examples:
- "Which companies have the highest scores?" -> {"strategy": "filter", "filters": {"minScore": 8, "maxResults": 10}}
- "Tell me about Mastra" -> {"strategy": "specific", "filters": {"companyNames": ["Mastra"]}}
- "AI companies" -> {"strategy": "filter", "filters": {"categories": ["AI/ML"], "maxResults": 20}}
- "Compare all startups" -> {"strategy": "all", "filters": null}

Be conservative - if unsure, use "all" strategy.`,
        },
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const plan = JSON.parse(planningResponse.choices[0].message.content || '{"strategy": "all"}')
    console.log('Query plan:', plan)

    // Step 3: Retrieve only the necessary data
    let relevantCompanies = companies

    if (plan.strategy === 'specific' && plan.filters?.companyNames) {
      relevantCompanies = companies.filter((c: any) =>
        plan.filters.companyNames.some((name: string) =>
          c.name.toLowerCase().includes(name.toLowerCase())
        )
      )
    } else if (plan.strategy === 'filter') {
      if (plan.filters?.categories) {
        relevantCompanies = relevantCompanies.filter((c: any) =>
          plan.filters.categories.includes(c.category)
        )
      }
      if (plan.filters?.minScore) {
        relevantCompanies = relevantCompanies.filter(
          (c: any) => (c.vcReport?.overallScore || 0) >= plan.filters.minScore
        )
      }
      if (plan.filters?.maxResults) {
        // Sort by score and take top N
        relevantCompanies = relevantCompanies
          .sort((a: any, b: any) => (b.vcReport?.overallScore || 0) - (a.vcReport?.overallScore || 0))
          .slice(0, plan.filters.maxResults)
      }
    }

    console.log(`Retrieved ${relevantCompanies.length} / ${companies.length} companies`)

    // Create simplified data for only relevant companies
    const relevantData = relevantCompanies.map((c: any) => ({
      name: c.name,
      tagline: c.tagline,
      category: c.category,
      website: c.website,
      founders: c.founders?.map((f: any) => f.name).join(', '),
      vcReport: c.vcReport
        ? {
            overallScore: c.vcReport.overallScore,
            investmentRecommendation: c.vcReport.investmentRecommendation,
            executiveSummary: c.vcReport.executiveSummary,
            traction: {
              rating: c.vcReport.traction?.rating,
              revenue: c.vcReport.traction?.metrics?.revenue,
              users: c.vcReport.traction?.metrics?.users,
              notableCustomers: c.vcReport.traction?.metrics?.notableCustomers,
            },
            growthRate: {
              rating: c.vcReport.growthRate?.rating,
              rate: c.vcReport.growthRate?.rate,
            },
            teamBackground: {
              rating: c.vcReport.teamBackground?.rating,
              founders: c.vcReport.teamBackground?.founders,
            },
            marketSize: {
              rating: c.vcReport.marketSize?.rating,
              tam: c.vcReport.marketSize?.tam,
              sam: c.vcReport.marketSize?.sam,
            },
            productStatus: {
              rating: c.vcReport.productStatus?.rating,
              status: c.vcReport.productStatus?.status,
            },
            notableBackers: {
              rating: c.vcReport.notableBackers?.rating,
              totalRaised: c.vcReport.notableBackers?.totalRaised,
              leadInvestors: c.vcReport.notableBackers?.leadInvestors,
            },
            defensibility: {
              rating: c.vcReport.defensibility?.rating,
              whatMakesThemUnique: c.vcReport.defensibility?.whatMakesThemUnique,
              competitiveAdvantages: c.vcReport.defensibility?.competitiveAdvantages,
            },
            unitEconomics: {
              rating: c.vcReport.unitEconomics?.rating,
              revenueModel: c.vcReport.unitEconomics?.revenueModel,
            },
            competition: {
              rating: c.vcReport.competition?.rating,
              competitivePosition: c.vcReport.competition?.competitivePosition,
            },
            potentialAcquirers: {
              rating: c.vcReport.potentialAcquirers?.rating,
              likelyAcquirers: c.vcReport.potentialAcquirers?.likelyAcquirers,
            },
            founderCommitment: {
              rating: c.vcReport.founderCommitment?.rating,
              status: c.vcReport.founderCommitment?.status,
            },
          }
        : null,
    }))

    // Build conversation history
    const conversationHistory = history
      .slice(-3) // Keep last 3 messages for context
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))

    // Step 4: Generate final response with only relevant data
    const systemPrompt = `You are a helpful research assistant for YC W25 startups. You have access to data about ${relevantCompanies.length} companies.

${plan.reasoning ? `Query context: ${plan.reasoning}` : ''}

Here is the relevant data:
${JSON.stringify(relevantData, null, 2)}

IMPORTANT GUIDELINES:
- Keep responses SHORT and CONCISE (1-3 sentences max)
- This is a small chat window - don't write long paragraphs
- Give direct, brief answers that address the question
- When listing companies, show max 3-5 with just name and score
- Use bullet points for readability but keep them brief
- No lengthy explanations or detailed analysis unless specifically asked
- Be conversational and to-the-point

Good examples:
- "Top companies: **Mastra** (9/10), **Company B** (8.5/10), **Company C** (8/10)"
- "Found 12 AI companies. Highest rated is **Mastra** (9/10) - builds AI agent frameworks"
- "**Mastra** scores 9/10 with strong defensibility in the AI agent space"

Bad examples (too long):
- "Here are the top 5 highest-rated companies from the 127 I analyzed: 1) Mastra (9/10) - STRONG BUY, an open-source JS/TS framework for AI agents with excellent market positioning and strong founder background. They have raised significant funding and show impressive traction metrics..."
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return NextResponse.json({
      response: response.choices[0].message.content,
      debug: {
        strategy: plan.strategy,
        companiesRetrieved: relevantCompanies.length,
        totalCompanies: companies.length,
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
