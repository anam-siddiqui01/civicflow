import type { IssueCluster, PriorityLevel, PriorityRecommendation } from '../types'

const severityScore = { Low: 35, Moderate: 65, High: 82, Critical: 100 }
const urgencyScore = { Low: 30, Moderate: 65, High: 85, Critical: 100 }
const trendScore = { Rising: 100, Stable: 55, Falling: 10 }

function priorityLevel(score: number): PriorityLevel {
  if (score >= 85) return 'Critical'
  if (score >= 55) return 'High'
  if (score >= 35) return 'Medium'
  return 'Low'
}

function boundedScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function impactRating(score: number): string {
  if (score >= 85) return 'Very high'
  if (score >= 70) return 'High'
  if (score >= 40) return 'Moderate'
  return 'Low'
}

function essentialServiceImpact(issue: IssueCluster, severity: number, urgency: number): { score: number; explanation: string } {
  if (typeof issue.essentialServiceImpact === 'number') {
    const score = boundedScore(issue.essentialServiceImpact)
    return {
      score,
      explanation: `${impactRating(score)} essential-service impact (${score}/100). ${issue.essentialServiceImpactReason ?? 'Issue-level service consequence assessment.'}`,
    }
  }

  const context = `${issue.title} ${issue.category} ${issue.location} ${issue.suggestedDepartment} ${issue.aiSummary}`.toLowerCase()
  const serviceProfiles = [
    { pattern: /hospital|healthcare|medical center|emergency department|clinic/, score: 82, label: 'healthcare facility' },
    { pattern: /water supply|water utility|water infrastructure|water & sanitation/, score: 78, label: 'water service' },
    { pattern: /electricity|power outage|power grid|substation/, score: 74, label: 'electricity infrastructure' },
    { pattern: /fire station|ambulance|shelter|sewer|wastewater|bridge|public transit/, score: 68, label: 'critical public infrastructure' },
  ]
  const matchedProfile = serviceProfiles.find((profile) => profile.pattern.test(context))
  if (!issue.essentialService && !matchedProfile) {
    return { score: 0, explanation: 'Low essential-service impact (0/100). No essential-service dependency is identified for this issue.' }
  }

  const baseline = matchedProfile?.score ?? 55
  const score = boundedScore(baseline * 0.65 + severity * 0.2 + urgency * 0.15)
  const serviceLabel = matchedProfile?.label ?? 'essential public service'
  return { score, explanation: `${impactRating(score)} essential-service impact (${score}/100). ${serviceLabel} exposure is adjusted for ${issue.severity.toLowerCase()} consequence and ${issue.urgency.toLowerCase()} urgency.` }
}

function priorityReason(issue: IssueCluster, severity: number, essentialImpact: number, impact: number, urgency: number, volumeTrend: number): string {
  if (severity >= 80 && essentialImpact >= 85 && urgency >= 85 && issue.reportCount <= 5) {
    return 'Critical essential-service disruption despite low report volume.'
  }
  if (issue.reportCount >= 20 && severity <= 65 && essentialImpact <= 30) {
    return 'High community report volume, but lower consequence than a critical-service disruption.'
  }
  if (severity >= 80 && essentialImpact >= 80) {
    return 'Severe consequences to an essential service outweigh the report-volume signal.'
  }
  if (urgency >= 85) {
    return `${issue.urgency} time sensitivity increases priority even when report volume is limited.`
  }
  if (impact >= 80) {
    return `Estimated population and vulnerability impact is high for this ${issue.severity.toLowerCase()}-severity issue.`
  }
  if (volumeTrend >= 75) {
    return `Increasing report volume supports priority, alongside ${issue.severity.toLowerCase()} consequence.`
  }
  return `${issue.severity} severity and ${issue.urgency.toLowerCase()} urgency set the consequence level; volume and trend contribute at most 10 points.`
}

export function calculatePriority(issue: IssueCluster): PriorityRecommendation {
  const consequence = severityScore[issue.severity]
  const urgency = urgencyScore[issue.urgency]
  const essential = essentialServiceImpact(issue, consequence, urgency)
  const population = Math.min(100, Math.round(Math.sqrt(Math.max(0, issue.affectedPopulationEstimate) / 1000) * 100))
  const vulnerability = boundedScore(issue.vulnerabilityImpact ?? population)
  const impact = boundedScore(population * 0.6 + vulnerability * 0.4)
  const volume = Math.min(100, Math.round(Math.log1p(Math.max(0, issue.reportCount)) / Math.log1p(100) * 100))
  const volumeTrend = boundedScore(volume * 0.7 + trendScore[issue.trend] * 0.3)
  const weightedFactors = [
    { label: 'Severity / consequence', signal: consequence, weight: 30, explanation: `${issue.severity} severity maps to ${consequence}/100; weighted at 30%.` },
    { label: 'Essential-service impact', signal: essential.score, weight: 25, explanation: `${essential.explanation} Weighted at 25%.` },
    { label: 'Affected population / vulnerability', signal: impact, weight: 20, explanation: `Estimated ${issue.affectedPopulationEstimate.toLocaleString()} people; ${issue.vulnerabilityImpactReason ?? `${vulnerability}/100 vulnerability rating`}. Weighted at 20%.` },
    { label: 'Urgency / time sensitivity', signal: urgency, weight: 15, explanation: `${issue.urgency} urgency maps to ${urgency}/100; weighted at 15%.` },
    { label: 'Report volume / trend', signal: volumeTrend, weight: 10, explanation: `${issue.reportCount} reports and a ${issue.trend.toLowerCase()} trend produce ${volumeTrend}/100; weighted at 10%.` },
  ]
  const rawPoints = weightedFactors.map((factor) => factor.signal * factor.weight / 100)
  const points = rawPoints.map(Math.floor)
  const targetScore = Math.round(rawPoints.reduce((total, value) => total + value, 0))
  const remainderOrder = rawPoints.map((value, index) => ({ index, remainder: value - points[index] })).sort((left, right) => right.remainder - left.remainder)
  for (let index = 0; index < targetScore - points.reduce((total, value) => total + value, 0); index += 1) {
    points[remainderOrder[index].index] += 1
  }
  const factors = weightedFactors.map((factor, index) => ({ label: factor.label, points: points[index], explanation: factor.explanation }))
  const score = factors.reduce((total, factor) => total + factor.points, 0)
  return { score, level: priorityLevel(score), reason: priorityReason(issue, consequence, essential.score, impact, urgency, volumeTrend), factors }
}