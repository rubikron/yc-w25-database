'use client'

import { useStore } from '@/store/useStore'
import { useCompanies } from '@/hooks/useCompanies'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUniqueCategories, getUniqueFundingRounds, getUniqueTags } from '@/lib/filters'
import { X } from 'lucide-react'

export function TableFilters() {
  const { filters, setFilters, resetFilters } = useStore()
  const { allCompanies } = useCompanies()

  const categories = getUniqueCategories(allCompanies)
  const fundingRounds = getUniqueFundingRounds(allCompanies)
  const tags = getUniqueTags(allCompanies).slice(0, 20)

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    setFilters({ categories: newCategories })
  }

  const toggleFundingRound = (round: string) => {
    const newRounds = filters.fundingRounds.includes(round)
      ? filters.fundingRounds.filter((r) => r !== round)
      : [...filters.fundingRounds, round]
    setFilters({ fundingRounds: newRounds })
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    setFilters({ tags: newTags })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.fundingRounds.length > 0 ||
    filters.tags.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="text-sm font-medium mb-3">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="rounded"
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        {/* Funding Rounds */}
        {fundingRounds.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Funding Round</h4>
            <div className="space-y-2">
              {fundingRounds.map((round) => (
                <label
                  key={round}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.fundingRounds.includes(round)}
                    onChange={() => toggleFundingRound(round)}
                    className="rounded"
                  />
                  {round}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
