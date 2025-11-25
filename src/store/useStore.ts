import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Company, FilterState } from '@/types/company'

interface AppState {
  companies: Company[]
  filteredCompanies: Company[]
  isLoading: boolean
  error: string | null

  // Filters
  filters: FilterState

  // Bookmarks
  bookmarks: string[]

  // View mode
  viewMode: 'table' | 'grid'

  // Actions
  setCompanies: (companies: Company[]) => void
  setFilteredCompanies: (companies: Company[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  toggleBookmark: (companyId: string) => void
  setViewMode: (mode: 'table' | 'grid') => void
}

const defaultFilters: FilterState = {
  search: '',
  categories: [],
  fundingRounds: [],
  teamSizeRange: [0, 1000],
  tags: [],
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      companies: [],
      filteredCompanies: [],
      isLoading: true,
      error: null,
      filters: defaultFilters,
      bookmarks: [],
      viewMode: 'table',

      setCompanies: (companies) =>
        set({ companies, filteredCompanies: companies }),

      setFilteredCompanies: (filteredCompanies) =>
        set({ filteredCompanies }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () =>
        set({ filters: defaultFilters }),

      toggleBookmark: (companyId) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(companyId)
            ? state.bookmarks.filter((id) => id !== companyId)
            : [...state.bookmarks, companyId],
        })),

      setViewMode: (viewMode) =>
        set({ viewMode }),
    }),
    {
      name: 'yc-w25-storage',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        viewMode: state.viewMode,
      }),
    }
  )
)
