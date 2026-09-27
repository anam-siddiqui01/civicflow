import { issueClusters } from '../data/mockData'
import { matchIssueCluster, normalizeIssueType } from './issueMatching'
import type { CitizenReport, CivicSeverity, CivicUrgency, DetectedLanguage, ReportAnalysis } from '../types'

type AnalysisInput = Pick<CitizenReport, 'description' | 'category' | 'location' | 'ward' | 'inputType' | 'imageUrl'>
const languages: DetectedLanguage[] = ['English', 'Hindi', 'Marathi', 'Other']
const urgencyLevels: CivicUrgency[] = ['Low', 'Moderate', 'High', 'Critical']
const severityLevels: CivicSeverity[] = ['Low', 'Moderate', 'High', 'Critical']

function detectLanguage(text: string): DetectedLanguage {
  if (/(जवळ|गाड्या|उभ्या|केल्यामुळे|अडतो|पाणी|पुरवठा)/u.test(text)) return 'Marathi'
  if (/(गाड़ियां|गाड़ियाँ|गाड़ी|खड़ी|रास्ता|बंद|कम्युनिटी|सड़क|कूड़ा|पानी)/u.test(text)) return 'Hindi'
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
  const urgency: CivicUrgency = relatedIssueId === 'issue-water-12' ? 'Critical' : relatedIssueId ? 'High' : 'Moderate'
  const severity: CivicSeverity = /no water|immediate danger|unsafe|life-threatening/i.test(report.description) ? 'Critical' : relatedIssueId ? 'High' : 'Moderate'
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
  return {
    category,
    summary: summarizeIssue(relatedIssueId, report.description),
    detectedLanguage,
    location,
    urgency,
    severity,
    affectedPopulationEstimate: issue?.affectedPopulationEstimate ?? 40,
    evidenceStrength: report.imageUrl ? 88 : report.inputType === 'Voice' ? 62 : 54,
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

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report }),
    })
    if (!response.ok) return fallback
    return readRemoteAnalysis(await response.json(), fallback) ?? fallback
  } catch {
    return fallback
  }
}