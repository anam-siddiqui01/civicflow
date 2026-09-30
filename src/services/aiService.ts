import { issueClusters } from '../data/mockData'
import { matchIssueCluster, normalizeIssueType } from './issueMatching'
import type { CitizenReport, CivicSeverity, CivicUrgency, DetectedLanguage, ReportAnalysis } from '../types'

type AnalysisInput = Pick<CitizenReport, 'description' | 'category' | 'location' | 'ward' | 'inputType' | 'imageUrl'>
const languages: DetectedLanguage[] = ['English', 'Hindi', 'Marathi', 'Other']
const urgencyLevels: CivicUrgency[] = ['Low', 'Moderate', 'High', 'Critical']
const severityLevels: CivicSeverity[] = ['Low', 'Moderate', 'High', 'Critical']

function detectLanguage(text: string): DetectedLanguage {
  if (/(जवळ|गाड्या|उभ्या|केल्यामुळे|अडतो|पाणी|पुरवठा|आमच्या|भागात|दिवस)/u.test(text)) return 'Marathi'
  if (/(गाड़ियां|गाड़ियाँ|गाड़ी|खड़ी|रास्ता|बंद|कम्युनिटी|सड़क|कूड़ा|पानी|हमारे|इलाके|आपूर्ति|दिन)/u.test(text)) return 'Hindi'
  return /[A-Za-z]/.test(text) ? 'English' : 'Other'
}

function normalizedCategory(issueId: string | null, submittedCategory: string): string {
  if (issueId === 'issue-parking-8') return 'Parking / Traffic'
  if (issueId === 'issue-water-12') return 'Water & Sanitation'
  if (issueId === 'issue-garbage-7') return 'Garbage'
  if (issueId === 'issue-road-4') return 'Roads'
  if (issueId === 'issue-lights-3') return 'Streetlights'
  return submittedCategory
}

function summarizeIssue(issueId: string | null, description: string): string {
  const summaries: Record<string, string> = {
    'issue-parking-8': 'Repeated vehicle obstruction is restricting access through a narrow residential lane.',
    'issue-water-12': 'Residents report interrupted water supply and low pressure in the affected area.',
    'issue-garbage-7': 'Accumulated waste is affecting access and sanitation near the reported collection point.',
    'issue-road-4': 'Road damage is affecting movement and may create a safety risk for residents.',
    'issue-lights-3': 'Streetlight outages are reducing visibility around the reported public area.',
  }
  return issueId ? summaries[issueId] : description.trim().replace(/\s+/g, ' ').slice(0, 180)
}

function analyzeWithDemoRules(report: AnalysisInput): ReportAnalysis {
  const relatedIssueId = matchIssueCluster(report)
  const issue = issueClusters.find((cluster) => cluster.id === relatedIssueId)
  const detectedLanguage = detectLanguage(`${report.description} ${report.location}`)
  const urgentSignal = /no water|without water|three days|\b[2-9] days\b|immediate danger|unsafe|life-threatening|नहीं आ रहा|तीन दिन|तीन दिवस|पाणी येत नाही/u.test(report.description)
  const urgency: CivicUrgency = issue?.urgency ?? (urgentSignal ? 'High' : relatedIssueId ? 'High' : 'Moderate')
  const severity: CivicSeverity = /immediate danger|unsafe|life-threatening|बिल्कुल नहीं|पूर्णपणे बंद/u.test(report.description) ? 'Critical' : urgentSignal ? 'High' : relatedIssueId ? 'High' : 'Moderate'
  const locationWard = `${report.location} ${report.description}`.match(/\bward\s*(\d+)\b/i)?.[1]
  const location = report.ward ? `Ward ${report.ward}` : locationWard ? `Ward ${locationWard}` : report.location
  const departmentByCategory: Record<string, string> = {
    'Parking / Traffic': 'Traffic / Municipal Enforcement',
    Roads: 'Roads & Public Works',
    Garbage: 'Sanitation Services',
    'Water & Sanitation': 'Water & Public Works',
    Electricity: 'Electrical Services',
    Streetlights: 'Electrical Services',
    Healthcare: 'Public Health Services',
    'Public Safety': 'Public Safety Office',
  }
  const category = normalizedCategory(relatedIssueId, report.category)
  const recommendedAction = issue?.recommendedAction ?? 'Review the report details and determine an appropriate next step.'
  const evidence = [
    ...(report.imageUrl ? ['Photo attached for visual review'] : []),
    ...(urgentSignal ? ['Report describes an extended or urgent service disruption'] : []),
    ...(report.ward || locationWard ? ['Ward or locality supplied by the reporter'] : []),
    ...(detectedLanguage !== 'English' ? [`Report analyzed in ${detectedLanguage}`] : []),
  ]
  return {
    category,
    summary: summarizeIssue(relatedIssueId, report.description),
    detectedLanguage,
    location,
    urgency,
    severity,
    affectedPopulationEstimate: issue?.affectedPopulationEstimate ?? 40,
    evidenceStrength: Math.min(100, (report.imageUrl ? 42 : 0) + (report.inputType === 'Voice' ? 15 : 10) + (report.ward || locationWard ? 25 : 0) + (urgentSignal ? 13 : 0)),
    evidence,
    suggestedDepartment: issue?.suggestedDepartment ?? departmentByCategory[category] ?? 'Constituency Office',
    recommendedAction,
    relatedIssueId,
    normalizedIssueType: normalizeIssueType(report.description, category, report.location),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readRemoteAnalysis(value: unknown, fallback: ReportAnalysis): ReportAnalysis | null {
  if (!isRecord(value)) return null
  const strings = ['category', 'summary', 'location', 'suggestedDepartment', 'recommendedAction', 'normalizedIssueType']
  if (strings.some((key) => typeof value[key] !== 'string')) return null
  if (!languages.includes(value.detectedLanguage as DetectedLanguage) || !urgencyLevels.includes(value.urgency as CivicUrgency) || !severityLevels.includes(value.severity as CivicSeverity)) return null
  if (typeof value.affectedPopulationEstimate !== 'number' || typeof value.evidenceStrength !== 'number') return null
  return {
    category: value.category as string,
    summary: value.summary as string,
    detectedLanguage: value.detectedLanguage as DetectedLanguage,
    location: value.location as string,
    urgency: value.urgency as CivicUrgency,
    severity: value.severity as CivicSeverity,
    affectedPopulationEstimate: value.affectedPopulationEstimate as number,
    evidenceStrength: value.evidenceStrength as number,
    evidence: Array.isArray(value.evidence) && value.evidence.every((item) => typeof item === 'string') ? value.evidence as string[] : fallback.evidence,
    suggestedDepartment: value.suggestedDepartment as string,
    recommendedAction: value.recommendedAction as string,
    relatedIssueId: typeof value.relatedIssueId === 'string' ? value.relatedIssueId : fallback.relatedIssueId,
    normalizedIssueType: value.normalizedIssueType as string,
  }
}

export async function analyzeCitizenReport(report: AnalysisInput): Promise<ReportAnalysis> {
  const fallback = analyzeWithDemoRules(report)
  const endpoint = import.meta.env.VITE_CIVICFLOW_AI_ENDPOINT?.trim()
  if (!endpoint) return fallback

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report }),
      signal: controller.signal,
    })
    if (!response.ok) return fallback
    return readRemoteAnalysis(await response.json(), fallback) ?? fallback
  } catch {
    return fallback
  } finally {
    window.clearTimeout(timeoutId)
  }
}