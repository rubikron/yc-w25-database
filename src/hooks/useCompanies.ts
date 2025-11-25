'use client'

import { useEffect, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { loadCompanies } from '@/lib/data'
import { filterCompanies } from '@/lib/filters'
import { createSearchIndex, searchCompanies } from '@/lib/search'

export function useCompanies() {
  const {
    companies,
    filteredCompanies,
    isLoading,
    error,
    filters,
    setCompanies,
    setFilteredCompanies,
    setLoading,
    setError,
  } = useStore()

  // Load companies on mount
  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true)
        const data = await loadCompanies()
        setCompanies(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load companies')
      } finally {
        setLoading(false)
      }
    }

    if (companies.length === 0) {
      fetchCompanies()
    }
  }, [companies.length, setCompanies, setError, setLoading])

  // Create search index
  const searchIndex = useMemo(() => {
    return createSearchIndex(companies)
  }, [companies])

  // Apply filters and search
  useEffect(() => {
    let result = companies

    // Apply search
    if (filters.search.trim()) {
      result = searchCompanies(searchIndex, filters.search)
    }

    // Apply filters
    result = filterCompanies(result, filters)

    setFilteredCompanies(result)
  }, [companies, filters, searchIndex, setFilteredCompanies])

  return {
    companies: filteredCompanies,
    allCompanies: companies,
    isLoading,
    error,
  }
}
