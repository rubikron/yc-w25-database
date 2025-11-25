'use client'

import { Company } from '@/types/company'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ExternalLink, Users, Star } from 'lucide-react'
import Link from 'next/link'

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return null

  let color = 'bg-gray-100 text-gray-800'
  if (score >= 8) color = 'bg-green-100 text-green-800'
  else if (score >= 6) color = 'bg-yellow-100 text-yellow-800'
  else if (score >= 4) color = 'bg-orange-100 text-orange-800'
  else color = 'bg-red-100 text-red-800'

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color} flex items-center gap-1`}>
      <Star className="h-3 w-3" />
      {score}/10
    </span>
  )
}

interface CompanyCardProps {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/companies/${company.id}`}>
              <CardTitle className="text-lg hover:underline cursor-pointer">
                {company.name}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                {company.category}
              </Badge>
              {company.vcReport?.overallScore && (
                <ScoreBadge score={company.vcReport.overallScore} />
              )}
            </div>
          </div>
          <BookmarkButton companyId={company.id} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {company.tagline}
        </p>

        <div className="mt-auto space-y-3">
          {/* Founders */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {company.founders.map((f) => f.name).join(', ')}
            </span>
          </div>

          {/* Funding */}
          {company.funding?.amount && (
            <div className="text-sm">
              <span className="text-muted-foreground">Funding:</span>{' '}
              {company.funding.amount}
            </div>
          )}

          {/* Links */}
          <div className="flex gap-2 pt-2">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Website
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
