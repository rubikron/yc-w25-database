'use client'

import { SearchBar } from '@/components/SearchBar'
import { StatsCards } from '@/components/StatsCards'
import { CompanyTable } from '@/components/CompanyTable'
import { TableFilters } from '@/components/TableFilters'
import { CategoryChart } from '@/components/CategoryChart'
import { ExportButton } from '@/components/ExportButton'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'
import { CompanyCard } from '@/components/CompanyCard'
import { useCompanies } from '@/hooks/useCompanies'

export default function HomePage() {
  const { viewMode, setViewMode } = useStore()
  const { companies } = useCompanies()

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Y Combinator Winter 2025
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Explore 160+ startups from YC&apos;s W25 batch
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <StatsCards />
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <TableFilters />
            <div className="mt-6">
              <CategoryChart />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <ExportButton />
            </div>

            {/* Company Display */}
            {viewMode === 'table' ? (
              <CompanyTable />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
