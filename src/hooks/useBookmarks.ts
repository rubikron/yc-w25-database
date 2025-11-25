'use client'

import { useStore } from '@/store/useStore'
import { Company } from '@/types/company'

export function useBookmarks() {
  const { bookmarks, toggleBookmark, companies } = useStore()

  const isBookmarked = (companyId: string): boolean => {
    return bookmarks.includes(companyId)
  }

  const getBookmarkedCompanies = (): Company[] => {
    return companies.filter((company) => bookmarks.includes(company.id))
  }

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    getBookmarkedCompanies,
    bookmarkCount: bookmarks.length,
  }
}
