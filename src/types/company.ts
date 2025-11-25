export interface Company {
  id: string
  name: string
  tagline: string
  description: string
  category: string
  subCategory?: string
  website?: string
  foundingYear?: number
  founders: Founder[]
  funding?: Funding
  metrics?: Metrics
  market?: Market
  links?: Links
  tags: string[]
  ycBatch: string
  lastUpdated: string
  // VC Screening Report Data
  vcScreening?: VCScreening
  // VC Due Diligence Report
  vcReport?: VCReport
}

// VC Due Diligence Report - Top factors VCs look at (v6 format)
export interface VCReport {
  // Executive Summary
  executiveSummary?: string
  investmentRecommendation?: string // 'STRONG BUY', 'BUY', 'HOLD', 'PASS'

  // Revenue or users - Any traction?
  traction?: {
    rating?: string
    ratingEmoji?: string
    analysis?: string
    metrics?: {
      revenue?: string
      users?: string
      keyMetrics?: string
      notableCustomers?: string
    }
    sources?: string[]
    // Legacy fields
    summary?: string
    revenue?: string
    users?: string
    evidence?: string[]
  }
  // Growth rate - How fast?
  growthRate?: {
    rating?: string
    ratingEmoji?: string
    rate?: string
    customerGrowth?: string
    revenueGrowth?: string
    growthDrivers?: string
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    timeframe?: string
    evidence?: string[]
  }
  // Team background - Can they execute?
  teamBackground?: {
    rating?: string
    ratingEmoji?: string
    founders?: Array<{
      name: string
      role?: string
      background?: string
      education?: string
      achievements?: string
    }>
    teamStrengths?: string | string[]
    teamConcerns?: string | string[]
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    strengths?: string[]
    concerns?: string[]
    evidence?: string[]
  }
  // Market size - Big enough?
  marketSize?: {
    rating?: string
    ratingEmoji?: string
    tam?: string
    sam?: string
    som?: string
    marketGrowthRate?: string
    marketDynamics?: string
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    evidence?: string[]
  }
  // Product live - Shipped or vaporware?
  productStatus?: {
    rating?: string
    ratingEmoji?: string
    status?: string // 'live', 'beta', 'development', 'concept', 'Production-ready'
    productSuite?: string
    keyFeatures?: string[]
    technicalMaturity?: string
    techStack?: string
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    evidence?: string[]
  }
  // Notable backers - Who else believes?
  notableBackers?: {
    rating?: string
    ratingEmoji?: string
    totalRaised?: string
    latestValuation?: string
    leadInvestors?: string | string[]
    otherInvestors?: string | string[]
    fundingHistory?: string
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    investors?: string[]
    angels?: string[]
    evidence?: string[]
  }
  // Defensibility - What makes them unique?
  defensibility?: {
    rating?: string
    ratingEmoji?: string
    uniqueTechnology?: string
    patents?: string
    networkEffects?: string
    dataMoats?: string
    switchingCosts?: string
    competitiveAdvantages?: string[]
    whatMakesThemUnique?: string
    analysis?: string
    sources?: string[]
  }
  // Unique advantage - Why them? (Legacy)
  uniqueAdvantage?: {
    summary?: string
    moats?: string[]
    differentiators?: string[]
    evidence?: string[]
  }
  // Unit economics - Path to profitability?
  unitEconomics?: {
    rating?: string
    ratingEmoji?: string
    revenueModel?: string
    pricingTiers?: string
    estimatedMetrics?: string
    pathToProfitability?: string
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    metrics?: string[]
    evidence?: string[]
  }
  // Competition - Can they win?
  competition?: {
    rating?: string
    ratingEmoji?: string
    directCompetitors?: Array<{ name: string; description?: string }> | string[]
    indirectCompetitors?: Array<{ name: string; description?: string }> | string[]
    competitivePosition?: string
    howTheyDifferentiate?: string
    competitiveRisks?: string
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    competitors?: string[]
    advantages?: string[]
    risks?: string[]
    evidence?: string[]
  }
  // Potential acquirers - Who are the big players?
  potentialAcquirers?: {
    rating?: string
    ratingEmoji?: string
    likelyAcquirers?: Array<{ company: string; rationale: string }>
    strategicFit?: string
    previousAcquisitionsInSpace?: string
    estimatedAcquisitionValue?: string
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    companies?: string[]
    rationale?: string[]
    evidence?: string[]
  }
  // Founder commitment - All-in or side project?
  founderCommitment?: {
    rating?: string
    ratingEmoji?: string
    status?: string // 'full-time', 'part-time', 'unknown', 'Full-time'
    commitmentIndicators?: string[]
    founderMotivation?: string
    longTermVision?: string
    analysis?: string
    sources?: string[]
    // Legacy fields
    summary?: string
    evidence?: string[]
  }
  // Risks and Opportunities
  keyRisks?: Array<{
    risk: string
    impact?: string
    probability?: string
    mitigation?: string
  }>
  keyOpportunities?: Array<{
    opportunity: string
    timeframe?: string
    potentialImpact?: string
  }>
  // Overall assessment
  overallScore?: number // 1-10
  scoreBreakdown?: Record<string, number>
  recommendation?: string
  reportGeneratedAt?: string
  companyName?: string
  ycBatch?: string
  researchSource?: string
  reportVersion?: string
}

export interface Founder {
  name: string
  role?: string
  linkedin?: string
  // Extended founder profile
  background?: FounderBackground
}

export interface FounderBackground {
  education?: Education[]
  previousCompanies?: PreviousCompany[]
  yearsExperience?: number
  domainExpertise?: string[]
  linkedinConnections?: number
  notableAchievements?: string[]
}

export interface Education {
  institution: string
  degree?: string
  field?: string
  year?: number
}

export interface PreviousCompany {
  name: string
  role: string
  outcome?: string // 'exit', 'acquired', 'ipo', 'operating', 'failed'
  exitValue?: string
}

export interface Funding {
  round?: string
  amount?: string
  investors?: string[]
  date?: string
}

export interface Metrics {
  employees?: number
  revenue?: string
  websiteTraffic?: string
}

export interface Market {
  targetMarket?: string
  geography?: string
  marketSize?: string
}

export interface Links {
  linkedin?: string
  twitter?: string
  crunchbase?: string
  github?: string
}

// VC Screening Report Types
export interface VCScreening {
  team?: TeamAssessment
  marketAnalysis?: MarketAnalysis
  product?: ProductAssessment
  traction?: TractionMetrics
  financials?: FinancialMetrics
  signals?: InvestmentSignals
  reportGeneratedAt?: string
}

export interface TeamAssessment {
  founderMarketFit?: string
  teamCompleteness?: string // 'complete', 'missing_technical', 'missing_business', 'missing_domain'
  previousExits?: number
  combinedExperience?: number
  advisors?: Advisor[]
  teamStrengths?: string[]
  teamGaps?: string[]
}

export interface Advisor {
  name: string
  expertise: string
  linkedin?: string
}

export interface MarketAnalysis {
  tam?: string // Total Addressable Market
  sam?: string // Serviceable Addressable Market
  som?: string // Serviceable Obtainable Market
  marketGrowthRate?: string
  competitors?: Competitor[]
  competitiveAdvantages?: string[]
  marketTrends?: string[]
  regulatoryConsiderations?: string[]
  timingAssessment?: string
}

export interface Competitor {
  name: string
  description?: string
  fundingRaised?: string
  marketShare?: string
  strengths?: string[]
  weaknesses?: string[]
}

export interface ProductAssessment {
  stage?: string // 'idea', 'prototype', 'mvp', 'beta', 'launched', 'scaling'
  techStack?: string[]
  moats?: string[] // 'network_effects', 'data', 'patents', 'brand', 'switching_costs', 'economies_of_scale'
  patents?: Patent[]
  integrations?: string[]
  platformDependency?: string[]
  technicalDebt?: string
  scalabilityAssessment?: string
}

export interface Patent {
  title: string
  number?: string
  status?: string // 'granted', 'pending', 'filed'
  date?: string
}

export interface TractionMetrics {
  arr?: string // Annual Recurring Revenue
  mrr?: string // Monthly Recurring Revenue
  revenueGrowthRate?: string
  customerCount?: number
  customerGrowthRate?: string
  nrr?: string // Net Revenue Retention
  churnRate?: string
  ltv?: string // Lifetime Value
  cac?: string // Customer Acquisition Cost
  ltvCacRatio?: number
  notableCustomers?: string[]
  caseStudies?: CaseStudy[]
  waitlistSize?: number
  pilotPrograms?: number
}

export interface CaseStudy {
  customer: string
  problem: string
  solution: string
  results: string
}

export interface FinancialMetrics {
  totalRaised?: string
  lastValuation?: string
  runway?: string
  burnRate?: string
  grossMargin?: string
  unitEconomics?: UnitEconomics
  investorQuality?: InvestorQuality[]
  capTable?: string // 'clean', 'moderate', 'complex'
}

export interface UnitEconomics {
  revenuePerUser?: string
  costPerUser?: string
  paybackPeriod?: string
  contributionMargin?: string
}

export interface InvestorQuality {
  name: string
  tier?: string // 'tier1', 'tier2', 'angel'
  leadInvestor?: boolean
  boardSeat?: boolean
}

export interface InvestmentSignals {
  riskFlags?: RiskFlag[]
  greenFlags?: string[]
  socialProof?: SocialProof
  pressFeatures?: PressFeature[]
  productHuntLaunch?: ProductHuntLaunch
  awards?: string[]
  partnerships?: string[]
}

export interface RiskFlag {
  category: string // 'team', 'market', 'product', 'legal', 'financial'
  description: string
  severity: string // 'low', 'medium', 'high'
}

export interface SocialProof {
  twitterFollowers?: number
  linkedinFollowers?: number
  githubStars?: number
  discordMembers?: number
  newsletterSubscribers?: number
}

export interface PressFeature {
  publication: string
  title: string
  date?: string
  url?: string
}

export interface ProductHuntLaunch {
  date?: string
  upvotes?: number
  rank?: number
  url?: string
}

export type SortDirection = 'asc' | 'desc'

export interface FilterState {
  search: string
  categories: string[]
  fundingRounds: string[]
  teamSizeRange: [number, number]
  tags: string[]
}
