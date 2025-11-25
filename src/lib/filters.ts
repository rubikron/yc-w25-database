import { Company, FilterState } from '@/types/company'

export function filterCompanies(
  companies: Company[],
  filters: FilterState
): Company[] {
  return companies.filter(company => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(company.category)) {
      return false
    }

    // Funding round filter
    if (filters.fundingRounds.length > 0) {
      const companyRound = company.funding?.round || ''
      if (!filters.fundingRounds.includes(companyRound)) {
        return false
      }
    }

    // Team size filter
    const employees = company.metrics?.employees || 0
    if (employees < filters.teamSizeRange[0] || employees > filters.teamSizeRange[1]) {
      return false
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        company.tags.includes(tag)
      )
      if (!hasMatchingTag) {
        return false
      }
    }

    return true
  })
}

export function getUniqueCategories(companies: Company[]): string[] {
  const categories = new Set(companies.map(c => c.category))
  return Array.from(categories).sort()
}

export function getUniqueFundingRounds(companies: Company[]): string[] {
  const rounds = new Set(
    companies
      .map(c => c.funding?.round)
      .filter((round): round is string => !!round)
  )
  return Array.from(rounds).sort()
}

export function getUniqueTags(companies: Company[]): string[] {
  const tags = new Set(companies.flatMap(c => c.tags))
  return Array.from(tags).sort()
}

export function getTeamSizeRange(companies: Company[]): [number, number] {
  const sizes = companies
    .map(c => c.metrics?.employees || 0)
    .filter(size => size > 0)

  if (sizes.length === 0) return [0, 100]

  return [Math.min(...sizes), Math.max(...sizes)]
}
