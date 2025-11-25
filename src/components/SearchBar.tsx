'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/useStore'

export function SearchBar() {
  const { filters, setFilters } = useStore()

  return (
    <div className="relative max-w-xl mx-auto">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search companies, founders, or categories..."
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="pl-10 h-12 text-base"
      />
    </div>
  )
}
