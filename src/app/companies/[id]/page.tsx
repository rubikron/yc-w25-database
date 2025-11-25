'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Company } from '@/types/company'
import { loadCompanies, getCompanyById } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookmarkButton } from '@/components/BookmarkButton'
import { VCReport } from '@/components/VCReport'
import {
  ArrowLeft,
  ExternalLink,
  Linkedin,
  Twitter,
  Github,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Building,
  GraduationCap,
  Newspaper,
  BarChart3,
  Zap,
} from 'lucide-react'

export default function CompanyDetailPage() {
  const params = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompany() {
      try {
        const companies = await loadCompanies()
        const found = getCompanyById(companies, params.id as string)
        setCompany(found || null)
      } catch (error) {
        console.error('Error loading company:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company not found</h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const vc = company.vcScreening

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all companies
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">
              {company.tagline}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{company.category}</Badge>
              {company.subCategory && (
                <Badge variant="outline">{company.subCategory}</Badge>
              )}
              <Badge>YC {company.ycBatch}</Badge>
              {vc?.product?.stage && (
                <Badge variant="outline" className="capitalize">
                  {vc.product.stage}
                </Badge>
              )}
            </div>
          </div>
          <BookmarkButton companyId={company.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{company.description}</p>
              </CardContent>
            </Card>

            {/* VC Due Diligence Report */}
            {company.vcReport && (
              <VCReport report={company.vcReport} />
            )}

            {/* Founders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Founders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {company.founders.map((founder, i) => (
                    <div
                      key={i}
                      className="py-3 border-b last:border-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{founder.name}</div>
                          {founder.role && (
                            <div className="text-sm text-muted-foreground">
                              {founder.role}
                            </div>
                          )}
                        </div>
                        {founder.linkedin && (
                          <a
                            href={founder.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <Linkedin className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>

                      {/* Founder Background */}
                      {founder.background && (
                        <div className="mt-2 space-y-2 text-sm">
                          {founder.background.education && founder.background.education.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <GraduationCap className="h-3 w-3" />
                              {founder.background.education.map(e => e.institution).join(', ')}
                            </div>
                          )}
                          {founder.background.previousCompanies && founder.background.previousCompanies.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building className="h-3 w-3" />
                              Ex-{founder.background.previousCompanies.map(c => c.name).join(', ')}
                            </div>
                          )}
                          {founder.background.notableAchievements && founder.background.notableAchievements.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {founder.background.notableAchievements.slice(0, 3).map((achievement, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {achievement}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Assessment */}
            {vc?.team && (vc.team.teamStrengths?.length || vc.team.teamGaps?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Team Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vc.team.teamStrengths && vc.team.teamStrengths.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-green-600">Strengths</div>
                      <ul className="space-y-1">
                        {vc.team.teamStrengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {vc.team.teamGaps && vc.team.teamGaps.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-yellow-600">Gaps</div>
                      <ul className="space-y-1">
                        {vc.team.teamGaps.map((gap, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Market Analysis */}
            {vc?.marketAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(vc.marketAnalysis.tam || vc.marketAnalysis.marketGrowthRate) && (
                    <div className="grid grid-cols-2 gap-4">
                      {vc.marketAnalysis.tam && (
                        <div>
                          <div className="text-sm text-muted-foreground">TAM</div>
                          <div className="font-medium">{vc.marketAnalysis.tam}</div>
                        </div>
                      )}
                      {vc.marketAnalysis.marketGrowthRate && (
                        <div>
                          <div className="text-sm text-muted-foreground">Growth Rate</div>
                          <div className="font-medium">{vc.marketAnalysis.marketGrowthRate}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {vc.marketAnalysis.competitors && vc.marketAnalysis.competitors.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Competitors</div>
                      <div className="flex flex-wrap gap-2">
                        {vc.marketAnalysis.competitors.map((comp, i) => (
                          <Badge key={i} variant="outline">
                            {comp.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {vc.marketAnalysis.marketTrends && vc.marketAnalysis.marketTrends.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Market Trends</div>
                      <div className="flex flex-wrap gap-2">
                        {vc.marketAnalysis.marketTrends.map((trend, i) => (
                          <Badge key={i} variant="secondary">
                            {trend}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Traction Metrics */}
            {vc?.traction && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Traction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {vc.traction.arr && (
                      <div>
                        <div className="text-sm text-muted-foreground">ARR</div>
                        <div className="font-medium">{vc.traction.arr}</div>
                      </div>
                    )}
                    {vc.traction.mrr && (
                      <div>
                        <div className="text-sm text-muted-foreground">MRR</div>
                        <div className="font-medium">{vc.traction.mrr}</div>
                      </div>
                    )}
                    {vc.traction.customerCount && (
                      <div>
                        <div className="text-sm text-muted-foreground">Customers</div>
                        <div className="font-medium">{vc.traction.customerCount.toLocaleString()}</div>
                      </div>
                    )}
                    {vc.traction.revenueGrowthRate && (
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue Growth</div>
                        <div className="font-medium">{vc.traction.revenueGrowthRate}</div>
                      </div>
                    )}
                    {vc.traction.nrr && (
                      <div>
                        <div className="text-sm text-muted-foreground">NRR</div>
                        <div className="font-medium">{vc.traction.nrr}</div>
                      </div>
                    )}
                    {vc.traction.ltvCacRatio && (
                      <div>
                        <div className="text-sm text-muted-foreground">LTV/CAC</div>
                        <div className="font-medium">{vc.traction.ltvCacRatio}x</div>
                      </div>
                    )}
                  </div>

                  {vc.traction.notableCustomers && vc.traction.notableCustomers.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Notable Customers</div>
                      <div className="flex flex-wrap gap-2">
                        {vc.traction.notableCustomers.map((customer, i) => (
                          <Badge key={i} variant="outline">
                            {customer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Investment Signals */}
            {vc?.signals && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Investment Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vc.signals.greenFlags && vc.signals.greenFlags.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-green-600">Green Flags</div>
                      <ul className="space-y-1">
                        {vc.signals.greenFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {vc.signals.riskFlags && vc.signals.riskFlags.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-red-600">Risk Flags</div>
                      <ul className="space-y-1">
                        {vc.signals.riskFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                              flag.severity === 'high' ? 'text-red-500' :
                              flag.severity === 'medium' ? 'text-yellow-500' : 'text-gray-400'
                            }`} />
                            <span>
                              <Badge variant="outline" className="mr-2 text-xs capitalize">
                                {flag.category}
                              </Badge>
                              {flag.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {vc.signals.pressFeatures && vc.signals.pressFeatures.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        Press Coverage
                      </div>
                      <ul className="space-y-2">
                        {vc.signals.pressFeatures.map((press, i) => (
                          <li key={i} className="text-sm">
                            {press.url ? (
                              <a
                                href={press.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {press.publication}: {press.title}
                              </a>
                            ) : (
                              <span>{press.publication}: {press.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {vc.signals.socialProof && Object.keys(vc.signals.socialProof).length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Social Proof</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {vc.signals.socialProof.twitterFollowers && (
                          <div className="flex items-center gap-2">
                            <Twitter className="h-4 w-4 text-muted-foreground" />
                            {vc.signals.socialProof.twitterFollowers.toLocaleString()} followers
                          </div>
                        )}
                        {vc.signals.socialProof.linkedinFollowers && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4 text-muted-foreground" />
                            {vc.signals.socialProof.linkedinFollowers.toLocaleString()} followers
                          </div>
                        )}
                        {vc.signals.socialProof.githubStars && (
                          <div className="flex items-center gap-2">
                            <Github className="h-4 w-4 text-muted-foreground" />
                            {vc.signals.socialProof.githubStars.toLocaleString()} stars
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {company.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.foundingYear && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Founded
                      </div>
                      <div className="font-medium">{company.foundingYear}</div>
                    </div>
                  </div>
                )}
                {company.metrics?.employees && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Team Size
                      </div>
                      <div className="font-medium">
                        {company.metrics.employees} employees
                      </div>
                    </div>
                  </div>
                )}
                {(company.funding?.amount || vc?.financials?.totalRaised) && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Funding
                      </div>
                      <div className="font-medium">
                        {vc?.financials?.totalRaised || company.funding?.amount}
                      </div>
                      {company.funding?.round && (
                        <div className="text-sm text-muted-foreground">
                          {company.funding.round}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {vc?.financials?.lastValuation && (
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Valuation
                      </div>
                      <div className="font-medium">{vc.financials.lastValuation}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investors */}
            {vc?.financials?.investorQuality && vc.financials.investorQuality.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Investors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {vc.financials.investorQuality.map((investor, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{investor.name}</span>
                        {investor.tier === 'tier1' && (
                          <Badge variant="secondary" className="text-xs">Tier 1</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  </a>
                )}
                {company.links?.linkedin && (
                  <a
                    href={company.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                  </a>
                )}
                {company.links?.twitter && (
                  <a
                    href={company.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </a>
                )}
                {company.links?.github && (
                  <a
                    href={company.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Report Generated */}
            {vc?.reportGeneratedAt && (
              <div className="text-xs text-muted-foreground text-center">
                VC Report generated: {new Date(vc.reportGeneratedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
