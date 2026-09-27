import { citizenReports, issueClusters } from './mockData'
import { matchIssueCluster } from '../services/issueMatching'
import { calculatePriority } from '../services/priorityEngine'
import type { CitizenReport, IssueCluster, ReportAnalysis } from '../types'

const reportStorageKey = 'civicflow.citizen-reports.v1'
const sequenceStorageKey = 'civicflow.report-sequence.v1'
let fallbackSequence = 126

function getSavedReports(): CitizenReport[] {
  try {
    const saved = window.localStorage.getItem(reportStorageKey)
    const reports: unknown = saved ? JSON.parse(saved) : []
    return Array.isArray(reports) ? reports as CitizenReport[] : []
  } catch {
    return []
  }
}

export function getCitizenReports(): CitizenReport[] {
  return [...getSavedReports(), ...citizenReports]
}

export function getIssueClusters(): IssueCluster[] {
  const savedReports = getSavedReports()
  return issueClusters.map((cluster) => {
    const relatedReports = savedReports.filter((report) => report.issueClusterId === cluster.id)
    const updatedCluster = {
      ...cluster,
      reportCount: cluster.reportCount + relatedReports.length,
      evidenceCount: cluster.evidenceCount + relatedReports.filter((report) => Boolean(report.imageUrl)).length,
      photoCount: cluster.photoCount + relatedReports.filter((report) => report.inputType === 'Photo' || Boolean(report.imageUrl)).length,
    }
    const priority = calculatePriority(updatedCluster)
    return { ...updatedCluster, priorityScore: priority.score, priorityLevel: priority.level }
  })
}

function nextReferenceId(existingReports: CitizenReport[]): string {
  const year = new Date().getFullYear()
  const usedIds = new Set([...existingReports, ...citizenReports].map((report) => report.id))
  let sequence = fallbackSequence
  try {
    sequence = Number(window.localStorage.getItem(sequenceStorageKey)) || sequence
  } catch {
    // Keep the in-memory sequence when storage is blocked.
  }

  let referenceId = `CF-${year}-${String(sequence).padStart(5, '0')}`
  while (usedIds.has(referenceId)) {
    sequence += 1
    referenceId = `CF-${year}-${String(sequence).padStart(5, '0')}`
  }
  fallbackSequence = sequence + 1
  try {
    window.localStorage.setItem(sequenceStorageKey, String(fallbackSequence))
  } catch {
    // The reference remains unique for this app session.
  }
  return referenceId
}

export function createCitizenReport(input: Pick<CitizenReport, 'description' | 'category' | 'location' | 'ward' | 'imageUrl'> & { inputType?: CitizenReport['inputType']; analysis?: ReportAnalysis }): CitizenReport {
  const existingReports = getSavedReports()
  const report: CitizenReport = {
    ...input,
    id: nextReferenceId(existingReports),
    language: input.analysis?.detectedLanguage ?? 'English',
    inputType: input.inputType ?? (input.imageUrl ? 'Photo' : 'Text'),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    issueClusterId: input.analysis?.relatedIssueId ?? matchIssueCluster(input),
  }
  try {
    window.localStorage.setItem(reportStorageKey, JSON.stringify([report, ...existingReports]))
  } catch {
    // The confirmation remains available for this session if local storage is unavailable.
  }
  return report
}