'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCompanies } from '@/hooks/useCompanies'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Building2, Users, DollarSign, Star } from 'lucide-react'

export function StatsCards() {
  const { allCompanies, companies } = useCompanies()
  const { bookmarkCount } = useBookmarks()

  const stats = [
    {
      title: 'Total Companies',
      value: allCompanies.length,
      icon: Building2,
      description: 'YC W25 batch',
    },
    {
      title: 'Filtered Results',
      value: companies.length,
      icon: Users,
      description: 'Matching criteria',
    },
    {
      title: 'With Funding',
      value: allCompanies.filter((c) => c.funding?.amount).length,
      icon: DollarSign,
      description: 'Raised capital',
    },
    {
      title: 'Bookmarked',
      value: bookmarkCount,
      icon: Star,
      description: 'Your shortlist',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
