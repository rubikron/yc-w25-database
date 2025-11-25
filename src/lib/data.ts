import { Company } from '@/types/company'

export async function loadCompanies(): Promise<Company[]> {
  try {
    const response = await fetch('/data/companies.json')
    if (!response.ok) {
      throw new Error('Failed to load companies data')
    }
    const data = await response.json()
    return data.companies || []
  } catch (error) {
    console.error('Error loading companies:', error)
    return []
  }
}

export function getCompanyById(companies: Company[], id: string): Company | undefined {
  return companies.find(company => company.id === id)
}

export function getCategoryStats(companies: Company[]): Record<string, number> {
  return companies.reduce((acc, company) => {
    acc[company.category] = (acc[company.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function getFundingStats(companies: Company[]): {
  totalWithFunding: number
  byRound: Record<string, number>
} {
  const withFunding = companies.filter(c => c.funding?.amount)
  const byRound = withFunding.reduce((acc, company) => {
    const round = company.funding?.round || 'Unknown'
    acc[round] = (acc[round] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalWithFunding: withFunding.length,
    byRound,
  }
}
