'use client'

import { VCReport as VCReportType } from '@/types/company'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Users,
  Target,
  Package,
  DollarSign,
  Shield,
  Calculator,
  Swords,
  Building2,
  Heart,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  ExternalLink,
} from 'lucide-react'

interface VCReportProps {
  report: VCReportType
}

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return null

  let color = 'bg-gray-100 text-gray-800'
  if (score >= 8) color = 'bg-green-100 text-green-800'
  else if (score >= 6) color = 'bg-yellow-100 text-yellow-800'
  else if (score >= 4) color = 'bg-orange-100 text-orange-800'
  else color = 'bg-red-100 text-red-800'

  return (
    <span className={`px-3 py-1 rounded-full text-lg font-bold ${color}`}>
      {score}/10
    </span>
  )
}

function RecommendationBadge({ recommendation }: { recommendation?: string }) {
  if (!recommendation) return null

  let color = 'bg-gray-100 text-gray-800'
  if (recommendation === 'STRONG BUY') color = 'bg-green-600 text-white'
  else if (recommendation === 'BUY') color = 'bg-green-100 text-green-800'
  else if (recommendation === 'HOLD') color = 'bg-yellow-100 text-yellow-800'
  else if (recommendation === 'PASS') color = 'bg-red-100 text-red-800'

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${color}`}>
      {recommendation}
    </span>
  )
}

function RatingBadge({ rating, emoji }: { rating?: string; emoji?: string }) {
  if (!rating) return null

  let color = 'bg-gray-100 text-gray-800'
  if (rating === 'Excellent') color = 'bg-green-100 text-green-800'
  else if (rating === 'Strong') color = 'bg-blue-100 text-blue-800'
  else if (rating === 'Moderate') color = 'bg-yellow-100 text-yellow-800'
  else if (rating === 'Early') color = 'bg-orange-100 text-orange-800'
  else if (rating === 'Weak') color = 'bg-red-100 text-red-800'

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {emoji && <span className="mr-1">{emoji}</span>}
      {rating}
    </span>
  )
}

function FactorCard({
  title,
  icon: Icon,
  rating,
  ratingEmoji,
  analysis,
  children,
  sources,
}: {
  title: string
  icon: React.ElementType
  rating?: string
  ratingEmoji?: string
  analysis?: string
  children?: React.ReactNode
  sources?: string[]
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">{title}</h4>
        </div>
        <RatingBadge rating={rating} emoji={ratingEmoji} />
      </div>
      {children}
      {analysis && (
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis}</p>
      )}
      {sources && sources.length > 0 && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <ExternalLink className="h-3 w-3" />
            Sources
          </div>
          <div className="flex flex-wrap gap-1">
            {sources.map((source, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {source.startsWith('http') ? (
                  <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {new URL(source).hostname.replace('www.', '')}
                  </a>
                ) : (
                  source
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function VCReport({ report }: VCReportProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            VC Due Diligence Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <RecommendationBadge recommendation={report.investmentRecommendation} />
            <ScoreBadge score={report.overallScore} />
          </div>
        </div>
        {report.executiveSummary && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {report.executiveSummary}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Traction */}
        {report.traction && (
          <FactorCard
            title="Traction"
            icon={TrendingUp}
            rating={report.traction.rating}
            ratingEmoji={report.traction.ratingEmoji}
            analysis={report.traction.analysis || report.traction.summary}
            sources={report.traction.sources || report.traction.evidence}
          >
            {report.traction.metrics && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {report.traction.metrics.revenue && (
                  <div>
                    <span className="text-muted-foreground">Revenue: </span>
                    <span className="font-medium">{report.traction.metrics.revenue}</span>
                  </div>
                )}
                {report.traction.metrics.users && (
                  <div>
                    <span className="text-muted-foreground">Users: </span>
                    <span className="font-medium">{report.traction.metrics.users}</span>
                  </div>
                )}
                {report.traction.metrics.keyMetrics && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Key Metrics: </span>
                    <span className="font-medium">{report.traction.metrics.keyMetrics}</span>
                  </div>
                )}
                {report.traction.metrics.notableCustomers && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Notable Customers: </span>
                    <span className="font-medium">{report.traction.metrics.notableCustomers}</span>
                  </div>
                )}
              </div>
            )}
          </FactorCard>
        )}

        {/* Growth Rate */}
        {report.growthRate && (
          <FactorCard
            title="Growth Rate"
            icon={TrendingUp}
            rating={report.growthRate.rating}
            ratingEmoji={report.growthRate.ratingEmoji}
            analysis={report.growthRate.analysis || report.growthRate.summary}
            sources={report.growthRate.sources || report.growthRate.evidence}
          >
            <div className="text-sm space-y-1">
              {report.growthRate.rate && (
                <div>
                  <span className="text-muted-foreground">Rate: </span>
                  <span className="font-medium">{report.growthRate.rate}</span>
                </div>
              )}
              {report.growthRate.customerGrowth && (
                <div>
                  <span className="text-muted-foreground">Customer Growth: </span>
                  <span className="font-medium">{report.growthRate.customerGrowth}</span>
                </div>
              )}
              {report.growthRate.revenueGrowth && (
                <div>
                  <span className="text-muted-foreground">Revenue Growth: </span>
                  <span className="font-medium">{report.growthRate.revenueGrowth}</span>
                </div>
              )}
              {report.growthRate.growthDrivers && (
                <div>
                  <span className="text-muted-foreground">Growth Drivers: </span>
                  <span className="font-medium">{report.growthRate.growthDrivers}</span>
                </div>
              )}
            </div>
          </FactorCard>
        )}

        {/* Team Background */}
        {report.teamBackground && (
          <FactorCard
            title="Team Background"
            icon={Users}
            rating={report.teamBackground.rating}
            ratingEmoji={report.teamBackground.ratingEmoji}
            analysis={report.teamBackground.analysis || report.teamBackground.summary}
            sources={report.teamBackground.sources || report.teamBackground.evidence}
          >
            {report.teamBackground.founders && Array.isArray(report.teamBackground.founders) && report.teamBackground.founders.length > 0 && (
              <div className="space-y-2">
                {report.teamBackground.founders.map((founder, i) => (
                  <div key={i} className="text-sm border-l-2 border-gray-200 pl-3">
                    <div className="font-medium">{typeof founder === 'string' ? founder : founder.name}</div>
                    {typeof founder !== 'string' && founder.role && <div className="text-muted-foreground text-xs">{founder.role}</div>}
                    {typeof founder !== 'string' && founder.background && <div className="text-muted-foreground">{founder.background}</div>}
                    {typeof founder !== 'string' && founder.achievements && <div className="text-muted-foreground">{founder.achievements}</div>}
                  </div>
                ))}
              </div>
            )}
            {report.teamBackground.teamStrengths && (
              <div className="text-sm">
                <span className="text-green-600 font-medium">Strengths: </span>
                <span>{Array.isArray(report.teamBackground.teamStrengths)
                  ? report.teamBackground.teamStrengths.join(', ')
                  : report.teamBackground.teamStrengths}</span>
              </div>
            )}
          </FactorCard>
        )}

        {/* Market Size */}
        {report.marketSize && (
          <FactorCard
            title="Market Size"
            icon={Target}
            rating={report.marketSize.rating}
            ratingEmoji={report.marketSize.ratingEmoji}
            analysis={report.marketSize.analysis || report.marketSize.summary}
            sources={report.marketSize.sources || report.marketSize.evidence}
          >
            <div className="grid grid-cols-3 gap-2 text-sm">
              {report.marketSize.tam && (
                <div>
                  <div className="text-xs text-muted-foreground">TAM</div>
                  <div className="font-medium">{report.marketSize.tam}</div>
                </div>
              )}
              {report.marketSize.sam && (
                <div>
                  <div className="text-xs text-muted-foreground">SAM</div>
                  <div className="font-medium">{report.marketSize.sam}</div>
                </div>
              )}
              {report.marketSize.som && (
                <div>
                  <div className="text-xs text-muted-foreground">SOM</div>
                  <div className="font-medium">{report.marketSize.som}</div>
                </div>
              )}
            </div>
            {report.marketSize.marketDynamics && (
              <div className="text-sm">
                <span className="text-muted-foreground">Market Dynamics: </span>
                <span>{report.marketSize.marketDynamics}</span>
              </div>
            )}
          </FactorCard>
        )}

        {/* Product Status */}
        {report.productStatus && (
          <FactorCard
            title="Product Status"
            icon={Package}
            rating={report.productStatus.rating}
            ratingEmoji={report.productStatus.ratingEmoji}
            analysis={report.productStatus.analysis || report.productStatus.summary}
            sources={report.productStatus.sources || report.productStatus.evidence}
          >
            <div className="space-y-2 text-sm">
              {report.productStatus.status && (
                <Badge variant="secondary" className="capitalize">
                  {report.productStatus.status}
                </Badge>
              )}
              {report.productStatus.keyFeatures && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Key Features</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(report.productStatus.keyFeatures) ? (
                      report.productStatus.keyFeatures.map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm">{report.productStatus.keyFeatures}</span>
                    )}
                  </div>
                </div>
              )}
              {report.productStatus.techStack && (
                <div>
                  <span className="text-muted-foreground">Tech Stack: </span>
                  <span>{report.productStatus.techStack}</span>
                </div>
              )}
            </div>
          </FactorCard>
        )}

        {/* Notable Backers */}
        {report.notableBackers && (
          <FactorCard
            title="Notable Backers"
            icon={DollarSign}
            rating={report.notableBackers.rating}
            ratingEmoji={report.notableBackers.ratingEmoji}
            analysis={report.notableBackers.analysis || report.notableBackers.summary}
            sources={report.notableBackers.sources || report.notableBackers.evidence}
          >
            <div className="space-y-2 text-sm">
              {report.notableBackers.totalRaised && (
                <div>
                  <span className="text-muted-foreground">Total Raised: </span>
                  <span className="font-medium">{report.notableBackers.totalRaised}</span>
                </div>
              )}
              {report.notableBackers.leadInvestors && (
                <div>
                  <span className="text-muted-foreground">Lead Investors: </span>
                  <span className="font-medium">
                    {Array.isArray(report.notableBackers.leadInvestors)
                      ? report.notableBackers.leadInvestors.join(', ')
                      : report.notableBackers.leadInvestors}
                  </span>
                </div>
              )}
              {report.notableBackers.otherInvestors && (
                <div>
                  <span className="text-muted-foreground">Other Investors: </span>
                  <span>
                    {Array.isArray(report.notableBackers.otherInvestors)
                      ? report.notableBackers.otherInvestors.join(', ')
                      : report.notableBackers.otherInvestors}
                  </span>
                </div>
              )}
              {report.notableBackers.fundingHistory && (
                <div>
                  <span className="text-muted-foreground">Funding History: </span>
                  <span>{report.notableBackers.fundingHistory}</span>
                </div>
              )}
            </div>
          </FactorCard>
        )}

        {/* Defensibility */}
        {report.defensibility && (
          <FactorCard
            title="Defensibility"
            icon={Shield}
            rating={report.defensibility.rating}
            ratingEmoji={report.defensibility.ratingEmoji}
            analysis={report.defensibility.analysis}
            sources={report.defensibility.sources}
          >
            <div className="space-y-2 text-sm">
              {report.defensibility.whatMakesThemUnique && (
                <div className="font-medium text-blue-600">
                  {report.defensibility.whatMakesThemUnique}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {report.defensibility.uniqueTechnology && (
                  <div>
                    <span className="text-muted-foreground">Unique Tech: </span>
                    <span>{report.defensibility.uniqueTechnology}</span>
                  </div>
                )}
                {report.defensibility.networkEffects && (
                  <div>
                    <span className="text-muted-foreground">Network Effects: </span>
                    <span>{report.defensibility.networkEffects}</span>
                  </div>
                )}
                {report.defensibility.switchingCosts && (
                  <div>
                    <span className="text-muted-foreground">Switching Costs: </span>
                    <span>{report.defensibility.switchingCosts}</span>
                  </div>
                )}
                {report.defensibility.dataMoats && (
                  <div>
                    <span className="text-muted-foreground">Data Moats: </span>
                    <span>{report.defensibility.dataMoats}</span>
                  </div>
                )}
              </div>
              {report.defensibility.competitiveAdvantages && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Competitive Advantages</div>
                  {Array.isArray(report.defensibility.competitiveAdvantages) ? (
                    <ul className="space-y-1">
                      {report.defensibility.competitiveAdvantages.map((adv, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 shrink-0 mt-1" />
                          {adv}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">{report.defensibility.competitiveAdvantages}</p>
                  )}
                </div>
              )}
            </div>
          </FactorCard>
        )}

        {/* Unit Economics */}
        {report.unitEconomics && (
          <FactorCard
            title="Unit Economics"
            icon={Calculator}
            rating={report.unitEconomics.rating}
            ratingEmoji={report.unitEconomics.ratingEmoji}
            analysis={report.unitEconomics.analysis || report.unitEconomics.summary}
            sources={report.unitEconomics.sources || report.unitEconomics.evidence}
          >
            <div className="space-y-1 text-sm">
              {report.unitEconomics.revenueModel && (
                <div>
                  <span className="text-muted-foreground">Revenue Model: </span>
                  <span className="font-medium">{report.unitEconomics.revenueModel}</span>
                </div>
              )}
              {report.unitEconomics.pathToProfitability && (
                <div>
                  <span className="text-muted-foreground">Path to Profitability: </span>
                  <span>{report.unitEconomics.pathToProfitability}</span>
                </div>
              )}
            </div>
          </FactorCard>
        )}

        {/* Competition */}
        {report.competition && (
          <FactorCard
            title="Competition"
            icon={Swords}
            rating={report.competition.rating}
            ratingEmoji={report.competition.ratingEmoji}
            analysis={report.competition.analysis || report.competition.summary}
            sources={report.competition.sources || report.competition.evidence}
          >
            <div className="space-y-2 text-sm">
              {report.competition.competitivePosition && (
                <div className="font-medium">{report.competition.competitivePosition}</div>
              )}
              {report.competition.directCompetitors && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Direct Competitors</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(report.competition.directCompetitors) ? (
                      report.competition.directCompetitors.map((comp, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {typeof comp === 'string' ? comp : (comp && comp.name ? comp.name : JSON.stringify(comp))}
                        </Badge>
                      ))
                    ) : typeof report.competition.directCompetitors === 'object' ? (
                      <Badge variant="outline" className="text-xs">
                        {(report.competition.directCompetitors as any).name || JSON.stringify(report.competition.directCompetitors)}
                      </Badge>
                    ) : (
                      <span className="text-sm">{String(report.competition.directCompetitors)}</span>
                    )}
                  </div>
                </div>
              )}
              {report.competition.howTheyDifferentiate && (
                <div>
                  <span className="text-muted-foreground">Differentiation: </span>
                  <span>{report.competition.howTheyDifferentiate}</span>
                </div>
              )}
              {report.competition.competitiveRisks && (
                <div className="flex items-start gap-2 text-yellow-600">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-1" />
                  <span>{report.competition.competitiveRisks}</span>
                </div>
              )}
            </div>
          </FactorCard>
        )}

        {/* Potential Acquirers */}
        {report.potentialAcquirers && (
          <FactorCard
            title="Potential Acquirers"
            icon={Building2}
            rating={report.potentialAcquirers.rating}
            ratingEmoji={report.potentialAcquirers.ratingEmoji}
            analysis={report.potentialAcquirers.analysis || report.potentialAcquirers.summary}
            sources={report.potentialAcquirers.sources || report.potentialAcquirers.evidence}
          >
            <div className="space-y-2 text-sm">
              {report.potentialAcquirers.likelyAcquirers && (
                <div className="space-y-2">
                  {Array.isArray(report.potentialAcquirers.likelyAcquirers) ? (
                    report.potentialAcquirers.likelyAcquirers.map((acquirer, i) => (
                      <div key={i} className="border-l-2 border-blue-200 pl-3">
                        <div className="font-medium">{typeof acquirer === 'string' ? acquirer : acquirer.company}</div>
                        {typeof acquirer !== 'string' && acquirer.rationale && (
                          <div className="text-muted-foreground text-xs">{acquirer.rationale}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm">{report.potentialAcquirers.likelyAcquirers}</p>
                  )}
                </div>
              )}
              {report.potentialAcquirers.strategicFit && (
                <div>
                  <span className="text-muted-foreground">Strategic Fit: </span>
                  <span>{report.potentialAcquirers.strategicFit}</span>
                </div>
              )}
              {report.potentialAcquirers.estimatedAcquisitionValue && (
                <div>
                  <span className="text-muted-foreground">Est. Value: </span>
                  <span className="font-medium">{report.potentialAcquirers.estimatedAcquisitionValue}</span>
                </div>
              )}
            </div>
          </FactorCard>
        )}

        {/* Founder Commitment */}
        {report.founderCommitment && (
          <FactorCard
            title="Founder Commitment"
            icon={Heart}
            rating={report.founderCommitment.rating}
            ratingEmoji={report.founderCommitment.ratingEmoji}
            analysis={report.founderCommitment.analysis || report.founderCommitment.summary}
            sources={report.founderCommitment.sources || report.founderCommitment.evidence}
          >
            <div className="space-y-2 text-sm">
              {report.founderCommitment.status && (
                <Badge
                  variant={report.founderCommitment.status.toLowerCase().includes('full') ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {report.founderCommitment.status}
                </Badge>
              )}
              {report.founderCommitment.commitmentIndicators && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Commitment Indicators</div>
                  {Array.isArray(report.founderCommitment.commitmentIndicators) ? (
                    <ul className="space-y-1">
                      {report.founderCommitment.commitmentIndicators.map((indicator, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 shrink-0 mt-1" />
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">{report.founderCommitment.commitmentIndicators}</p>
                  )}
                </div>
              )}
              {report.founderCommitment.longTermVision && (
                <div>
                  <span className="text-muted-foreground">Vision: </span>
                  <span>{report.founderCommitment.longTermVision}</span>
                </div>
              )}
            </div>
          </FactorCard>
        )}

        {/* Key Risks */}
        {report.keyRisks && Array.isArray(report.keyRisks) && report.keyRisks.length > 0 && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h4 className="font-medium text-sm">Key Risks</h4>
            </div>
            <div className="space-y-2">
              {report.keyRisks.map((risk, i) => (
                <div key={i} className="text-sm border-l-2 border-red-200 pl-3">
                  <div className="font-medium">{typeof risk === 'string' ? risk : risk.risk}</div>
                  {typeof risk !== 'string' && risk.impact && (
                    <div className="text-xs text-muted-foreground">
                      Impact: {risk.impact} | Probability: {risk.probability}
                    </div>
                  )}
                  {typeof risk !== 'string' && risk.mitigation && (
                    <div className="text-muted-foreground">Mitigation: {risk.mitigation}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Opportunities */}
        {report.keyOpportunities && Array.isArray(report.keyOpportunities) && report.keyOpportunities.length > 0 && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-500" />
              <h4 className="font-medium text-sm">Key Opportunities</h4>
            </div>
            <div className="space-y-2">
              {report.keyOpportunities.map((opp, i) => (
                <div key={i} className="text-sm border-l-2 border-green-200 pl-3">
                  <div className="font-medium">{typeof opp === 'string' ? opp : opp.opportunity}</div>
                  {typeof opp !== 'string' && opp.timeframe && (
                    <div className="text-xs text-muted-foreground">
                      Timeframe: {opp.timeframe}
                    </div>
                  )}
                  {typeof opp !== 'string' && opp.potentialImpact && (
                    <div className="text-muted-foreground">Impact: {opp.potentialImpact}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report metadata */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t space-y-1">
          {report.reportGeneratedAt && (
            <div>Generated: {new Date(report.reportGeneratedAt).toLocaleDateString()}</div>
          )}
          {report.reportVersion && (
            <div>Report Version: {report.reportVersion}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
