import type { IssueCluster, PriorityLevel, PriorityRecommendation } from '../types'

function priorityLevel(score: number): PriorityLevel {
  if (score >= 80) return 'Critical'
  if (score >= 65) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

export function calculatePriority(issue: IssueCluster): PriorityRecommendation {
  const volumePoints = issue.reportCount >= 100 ? 20 : issue.reportCount >= 50 ? 18 : issue.reportCount >= 25 ? 16 : issue.reportCount >= 10 ? 12 : 6
  const urgencyPoints = { Low: 4, Moderate: 10, High: 18, Critical: 18 }[issue.urgency]
  const essentialPoints = issue.essentialService ? (issue.category === 'Water & sanitation' ? 8 : 4) : 0
  const evidencePoints = Math.min(15, Math.round(issue.evidenceCount * 1.7))
  const trendPoints = { Rising: 10, Stable: 7, Falling: 3 }[issue.trend]
  const impactPoints = Math.min(15, Math.round(Math.sqrt(issue.affectedPopulationEstimate / 8)))
  const factors = [
    { label: 'Complaint volume', points: volumePoints, explanation: `${issue.reportCount} related reports in this cluster` },
    { label: 'Urgency', points: urgencyPoints, explanation: `${issue.urgency} urgency based on the issue type` },
    { label: 'Essential service', points: essentialPoints, explanation: issue.essentialService ? 'A core public service may be affected' : 'No essential service flag for this issue' },
    { label: 'Supporting evidence', points: evidencePoints, explanation: `${issue.evidenceCount} evidence items on record` },
    { label: 'Recent trend', points: trendPoints, explanation: `Report trend is ${issue.trend.toLowerCase()}` },
    { label: 'Estimated impact', points: impactPoints, explanation: `About ${issue.affectedPopulationEstimate.toLocaleString()} people may be affected` },
  ]
  const score = Math.min(100, factors.reduce((total, factor) => total + factor.points, 0))
  return { score, level: priorityLevel(score), factors }
}