import { actions as demoActions, citizenActionResponses as demoActionResponses, citizenNotifications as demoNotifications, citizenReports, issueClusters } from './mockData'
import { createDynamicIssueId, matchIssueCluster } from '../services/issueMatching'
import { calculatePriority } from '../services/priorityEngine'
import type { Action, ActionStatus, ActionTimelineLabel, ActionWorkflowStage, CitizenActionResponse, CitizenNotification, CitizenReport, IssueCluster, ReportAnalysis } from '../types'

const reportStorageKey = 'civicflow.citizen-reports.v1'
const sequenceStorageKey = 'civicflow.report-sequence.v1'
const actionStorageKey = 'civicflow.actions.v1'
const actionResponseStorageKey = 'civicflow.action-responses.v1'
const notificationStorageKey = 'civicflow.citizen-notifications.v1'
let fallbackSequence = 126
const inMemoryArrays = new Map<string, unknown[]>()

function getSavedReports(): CitizenReport[] {
  return readStoredArray<unknown>(reportStorageKey).filter(isCitizenReport)
}

function isCitizenReport(value: unknown): value is CitizenReport {
  if (typeof value !== 'object' || value === null) return false
  const report = value as Partial<CitizenReport>
  return typeof report.id === 'string' && typeof report.description === 'string' &&
    typeof report.category === 'string' && typeof report.location === 'string' &&
    (report.ward === null || typeof report.ward === 'number') &&
    typeof report.language === 'string' && ['Text', 'Voice', 'Photo'].includes(report.inputType ?? '') &&
    (report.imageUrl === null || typeof report.imageUrl === 'string') &&
    typeof report.status === 'string' && typeof report.createdAt === 'string' &&
    (report.issueClusterId === null || typeof report.issueClusterId === 'string')
}

export function getCitizenReports(): CitizenReport[] {
  return [...getSavedReports().map((report) => ({
    ...report,
    issueClusterId: report.issueClusterId ?? matchIssueCluster(report),
  })), ...citizenReports]
}

export function getIssueClusters(): IssueCluster[] {
  const savedReports = getSavedReports()
  const seededIds = new Set(issueClusters.map((cluster) => cluster.id))
  const seededClusters = issueClusters.map((cluster) => {
    const relatedReports = savedReports.filter((report) => report.issueClusterId === cluster.id)
    const languageCounts: Record<string, number> = { ...cluster.languageCounts }
    const inputTypeCounts = { ...cluster.inputTypeCounts }
    for (const report of relatedReports) {
      languageCounts[report.language] = (languageCounts[report.language] ?? 0) + 1
      inputTypeCounts[report.inputType] = (inputTypeCounts[report.inputType] ?? 0) + 1
    }
    const updatedCluster = {
      ...cluster,
      reportCount: cluster.reportCount + relatedReports.length,
      evidenceCount: cluster.evidenceCount + relatedReports.filter((report) => Boolean(report.imageUrl)).length,
      photoCount: cluster.photoCount + relatedReports.filter((report) => report.inputType === 'Photo' || Boolean(report.imageUrl)).length,
      languageCounts: cluster.languageCounts || relatedReports.length ? languageCounts : undefined,
      inputTypeCounts: cluster.inputTypeCounts || relatedReports.length ? inputTypeCounts : undefined,
    }
    const priority = calculatePriority(updatedCluster)
    return { ...updatedCluster, priorityScore: priority.score, priorityLevel: priority.level }
  })
  const dynamicGroups = new Map<string, CitizenReport[]>()
  for (const report of savedReports) {
    const issueId = report.issueClusterId ?? matchIssueCluster(report)
    if (!issueId || seededIds.has(issueId)) continue
    const group = dynamicGroups.get(issueId) ?? []
    group.push(report)
    dynamicGroups.set(issueId, group)
  }
  const dynamicClusters = [...dynamicGroups.entries()].map(([id, reports]): IssueCluster => {
    const first = reports[0]
    const analysis = first.analysis
    const category = analysis?.category ?? first.category
    const title = (analysis?.normalizedIssueType ?? category).replace(/\b\w/g, (letter) => letter.toUpperCase())
    const evidenceCount = reports.filter((report) => Boolean(report.imageUrl)).length
    const cluster: IssueCluster = {
      id,
      title,
      category,
      location: first.location,
      ward: first.ward ?? 0,
      reportCount: reports.length,
      priorityScore: 0,
      priorityLevel: 'Low',
      trend: reports.length >= 3 ? 'Rising' : 'Stable',
      evidenceCount,
      photoCount: reports.filter((report) => report.inputType === 'Photo' || Boolean(report.imageUrl)).length,
      status: 'Needs review',
      suggestedDepartment: analysis?.suggestedDepartment ?? 'Constituency Office',
      aiSummary: analysis?.summary ?? `${reports.length} reports describe ${title.toLowerCase()} near ${first.location}.`,
      recommendedAction: analysis?.recommendedAction ?? 'Review the reports and verify the issue at the reported location.',
      urgency: analysis?.urgency ?? 'Moderate',
      severity: analysis?.severity ?? 'Moderate',
      essentialService: /water|sanitation|health|electricity/i.test(category),
      affectedPopulationEstimate: Math.max(...reports.map((report) => report.analysis?.affectedPopulationEstimate ?? 40)),
      languageCounts: reports.reduce<Record<string, number>>((counts, report) => ({ ...counts, [report.language]: (counts[report.language] ?? 0) + 1 }), {}),
      inputTypeCounts: reports.reduce((counts, report) => ({ ...counts, [report.inputType]: (counts[report.inputType] ?? 0) + 1 }), {} as Partial<Record<CitizenReport['inputType'], number>>),
    }
    const priority = calculatePriority(cluster)
    return { ...cluster, priorityScore: priority.score, priorityLevel: priority.level }
  })
  return [...seededClusters, ...dynamicClusters]
}

function readStoredArray<T>(key: string): T[] {
  try {
    const stored = window.localStorage.getItem(key)
    if (stored === null) return (inMemoryArrays.get(key) ?? []) as T[]
    const value: unknown = JSON.parse(stored)
    if (Array.isArray(value)) {
      inMemoryArrays.set(key, value)
      return value as T[]
    }
  } catch {
    return (inMemoryArrays.get(key) ?? []) as T[]
  }
  return (inMemoryArrays.get(key) ?? []) as T[]
}

function writeStoredArray<T>(key: string, values: T[]): void {
  inMemoryArrays.set(key, values)
  try {
    window.localStorage.setItem(key, JSON.stringify(values))
  } catch {
    // The in-memory view remains usable if local storage is unavailable.
  }
}

export function getCitizenActionResponses(actionId?: string): CitizenActionResponse[] {
  const responses = [...demoActionResponses]
  for (const storedResponse of readStoredArray<CitizenActionResponse>(actionResponseStorageKey)) {
    const existingIndex = responses.findIndex((response) => response.actionId === storedResponse.actionId && response.citizenReportId === storedResponse.citizenReportId)
    if (existingIndex >= 0) responses[existingIndex] = storedResponse
    else responses.push(storedResponse)
  }
  return actionId ? responses.filter((response) => response.actionId === actionId) : responses
}

export function getCitizenActionResponse(actionId: string, citizenReportId: string): CitizenActionResponse | undefined {
  return getCitizenActionResponses(actionId).find((response) => response.citizenReportId === citizenReportId)
}

export function submitCitizenActionResponse(input: Omit<CitizenActionResponse, 'createdAt' | 'resolvedAt'>): CitizenActionResponse {
  const response: CitizenActionResponse = { ...input, createdAt: new Date().toISOString() }
  const responses = getCitizenActionResponses()
  const existingIndex = responses.findIndex((item) => item.actionId === input.actionId && item.citizenReportId === input.citizenReportId)
  if (existingIndex >= 0) responses[existingIndex] = response
  else responses.push(response)
  writeStoredArray(actionResponseStorageKey, responses)
  return response
}

export function getIssueActions(issueId?: string): Action[] {
  const savedActions = new Map(readStoredArray<Action>(actionStorageKey).map((action) => [action.id, action]))
  const responses = getCitizenActionResponses()
  const seededIssueIds = new Set(demoActions.map((action) => action.issueId))
  const generatedActions = getIssueClusters().filter((issue) => issue.status !== 'Resolved' && !seededIssueIds.has(issue.id)).map((issue): Action => {
    const firstReport = getCitizenReports().filter((report) => report.issueClusterId === issue.id).sort((left, right) => left.createdAt.localeCompare(right.createdAt))[0]
    const reportReceivedAt = firstReport?.createdAt ?? new Date().toISOString()
    const clusteredAt = new Date(new Date(reportReceivedAt).getTime() + 5 * 60 * 1000).toISOString()
    return {
      id: `action-${issue.id}`,
      issueId: issue.id,
      status: 'Expected',
      expectedDate: '',
      expectedTimeWindow: '',
      preparationInstructions: 'Officer preparation instructions have not been set yet.',
      officerNote: 'New clustered issue; officer review is required.',
      citizenConflict: false,
      createdAt: clusteredAt,
      expectedSteps: ['Field inspection', 'Evidence verification', 'Assessment of the reported issue', 'Determine an appropriate next step'],
      workflowStage: 'NEW',
      department: issue.suggestedDepartment,
      aiDraftActionPlan: issue.recommendedAction,
      actionPlanApproved: false,
      timeline: [{ label: 'Report received', createdAt: reportReceivedAt }, { label: 'Issue clustered', createdAt: clusteredAt }],
    }
  })
  return [...demoActions, ...generatedActions].map((demoAction) => {
    const action = { ...demoAction, ...(savedActions.get(demoAction.id) ?? {}) }
    const hasUnresolvedConflict = responses.some((response) => response.actionId === action.id && response.response === 'Conflict' && !response.resolvedAt)
    return { ...action, citizenConflict: hasUnresolvedConflict }
  }).filter((action) => !issueId || action.issueId === issueId)
}

export type OfficerScheduleDecision = 'Keep current time' | 'Propose another time' | 'Confirm new time'

export function updateActionSchedule(actionId: string, decision: OfficerScheduleDecision, expectedDate?: string, expectedTimeWindow?: string): Action | null {
  const action = getIssueActions().find((item) => item.id === actionId)
  if (!action || (decision === 'Propose another time' && (!expectedDate || !expectedTimeWindow))) return null

  const unresolvedConflicts = getCitizenActionResponses(actionId).filter((response) => response.response === 'Conflict' && !response.resolvedAt)
  const status: ActionStatus = decision === 'Propose another time' ? 'Proposed' : 'Confirmed'
  const updatedAt = new Date().toISOString()
  const timeline = [...(action.timeline ?? []), { label: 'Action scheduled' as const, createdAt: updatedAt, note: decision }]
  const sendsScheduleUpdate = decision !== 'Propose another time' && Boolean(action.citizenNotifiedAt && action.actionPlanApproved && unresolvedConflicts.length > 0)
  if (sendsScheduleUpdate) timeline.push({ label: 'Citizen notified', createdAt: updatedAt, note: 'Updated visit window sent' })
  const updatedAction: Action = {
    ...action,
    status,
    expectedDate: decision === 'Propose another time' ? expectedDate as string : action.expectedDate,
    expectedTimeWindow: decision === 'Propose another time' ? expectedTimeWindow as string : action.expectedTimeWindow,
    citizenConflict: decision === 'Propose another time' && action.citizenConflict,
    officerNote: decision === 'Keep current time'
      ? 'Officer kept the current visit window after reviewing the citizen conflict.'
      : decision === 'Propose another time'
        ? 'An alternative visit window was proposed; officer confirmation is pending.'
        : 'The new visit window was confirmed by an officer in this demo.',
    updatedAt,
    citizenNotifiedAt: action.citizenNotifiedAt && decision !== 'Propose another time' ? updatedAt : action.citizenNotifiedAt,
    timeline,
  }
  const savedActions = readStoredArray<Action>(actionStorageKey)
  const existingIndex = savedActions.findIndex((item) => item.id === actionId)
  if (existingIndex >= 0) savedActions[existingIndex] = updatedAction
  else savedActions.push(updatedAction)
  writeStoredArray(actionStorageKey, savedActions)

  if (decision !== 'Propose another time') {
    const responses = getCitizenActionResponses().map((response) => response.actionId === actionId && response.response === 'Conflict' && !response.resolvedAt
      ? { ...response, resolvedAt: updatedAt }
      : response)
    writeStoredArray(actionResponseStorageKey, responses)
  }
  if (sendsScheduleUpdate) {
    const issue = getIssueClusters().find((item) => item.id === action.issueId)
    const date = new Date(`${updatedAction.expectedDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const notifications = getCitizenNotifications()
    for (const conflict of unresolvedConflicts) {
      const notification: CitizenNotification = {
        id: `action-confirmation-${action.id}-${conflict.citizenReportId}-${updatedAt}`,
        citizenReportId: conflict.citizenReportId,
        actionId: action.id,
        type: 'Schedule',
        title: 'Visit window reviewed by an officer',
        message: decision === 'Keep current time'
          ? `The officer reviewed your scheduling conflict and kept the visit window for ${issue?.title ?? 'this issue'} on ${date}, ${updatedAction.expectedTimeWindow}. The schedule may still change.`
          : `Your updated field visit for ${issue?.title ?? 'this issue'} is confirmed for ${date}, ${updatedAction.expectedTimeWindow}. The schedule may still change.`,
        createdAt: updatedAt,
        read: false,
      }
      notifications.push(notification)
    }
    writeStoredArray(notificationStorageKey, notifications)
  }
  return updatedAction
}

function storeAction(action: Action): void {
  const savedActions = readStoredArray<Action>(actionStorageKey)
  const existingIndex = savedActions.findIndex((item) => item.id === action.id)
  if (existingIndex >= 0) savedActions[existingIndex] = action
  else savedActions.push(action)
  writeStoredArray(actionStorageKey, savedActions)
}

function addActionTimelineEvent(action: Action, label: ActionTimelineLabel, createdAt: string, note?: string): Action['timeline'] {
  return [...(action.timeline ?? []), { label, createdAt, note }]
}

export interface OfficerActionPlanInput {
  department: string
  fieldOfficer: string
  expectedDate: string
  expectedTimeWindow: string
  aiDraftActionPlan: string
  preparationInstructions: string
}

export function saveOfficerActionPlan(actionId: string, input: OfficerActionPlanInput): Action | null {
  const action = getIssueActions().find((item) => item.id === actionId)
  const editableStages: ActionWorkflowStage[] = ['NEW', 'UNDER REVIEW', 'ACTION PLANNED']
  if (!action || (action.workflowStage && !editableStages.includes(action.workflowStage)) || !input.aiDraftActionPlan.trim()) return null
  const updatedAt = new Date().toISOString()
  const reviewedTimeline = addActionTimelineEvent(action, 'Officer reviewed', updatedAt, input.fieldOfficer ? `Reviewed by ${input.fieldOfficer}` : 'Reviewed by officer')
  const updatedAction: Action = {
    ...action,
    ...input,
    workflowStage: 'UNDER REVIEW',
    actionPlanApproved: false,
    approvedActionPlan: undefined,
    officerNote: 'Officer review in progress; action plan has not been approved.',
    updatedAt,
    timeline: reviewedTimeline,
  }
  storeAction(updatedAction)
  return updatedAction
}

export function approveOfficerActionPlan(actionId: string): Action | null {
  const action = getIssueActions().find((item) => item.id === actionId)
  const approvableStages: ActionWorkflowStage[] = ['UNDER REVIEW', 'ACTION PLANNED']
  if (!action || !action.aiDraftActionPlan?.trim() || !action.expectedDate || !action.expectedTimeWindow || !action.department || !action.fieldOfficer || (action.workflowStage && !approvableStages.includes(action.workflowStage))) return null
  const updatedAt = new Date().toISOString()
  const updatedAction: Action = {
    ...action,
    workflowStage: 'ACTION PLANNED',
    actionPlanApproved: true,
    approvedActionPlan: action.aiDraftActionPlan.trim(),
    officerNote: 'Action plan approved by an officer; citizen notification is pending.',
    updatedAt,
    timeline: addActionTimelineEvent(action, 'Action scheduled', updatedAt, `Plan approved by ${action.fieldOfficer || 'officer'}`),
  }
  storeAction(updatedAction)
  return updatedAction
}

export function saveOfficerDecision(actionId: string, officerDecision: string): Action | null {
  const action = getIssueActions().find((item) => item.id === actionId)
  if (!action) return null
  const updatedAction: Action = { ...action, officerDecision: officerDecision.trim(), updatedAt: new Date().toISOString() }
  storeAction(updatedAction)
  return updatedAction
}

export function getCitizenNotifications(): CitizenNotification[] {
  const notifications = [...demoNotifications]
  for (const storedNotification of readStoredArray<CitizenNotification>(notificationStorageKey)) {
    const existingIndex = notifications.findIndex((notification) => notification.id === storedNotification.id)
    if (existingIndex >= 0) notifications[existingIndex] = storedNotification
    else notifications.push(storedNotification)
  }
  return notifications.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export function sendActionNotification(actionId: string): Action | null {
  const action = getIssueActions().find((item) => item.id === actionId)
  if (!action || !action.actionPlanApproved || !action.approvedActionPlan || action.workflowStage !== 'ACTION PLANNED') return null
  const issue = getIssueClusters().find((item) => item.id === action.issueId)
  if (!issue) return null
  const updatedAt = new Date().toISOString()
  const noticeDate = new Date(`${action.expectedDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const notifications = getCitizenNotifications()
  const issueReports = getCitizenReports().filter((report) => report.issueClusterId === action.issueId)
  for (const report of issueReports) {
    const notification: CitizenNotification = {
      id: `action-notice-${action.id}-${report.id}`,
      citizenReportId: report.id,
      actionId: action.id,
      type: 'Schedule',
      title: 'Officer-approved action plan',
      message: `An officer-approved plan is expected for ${issue.title} on ${noticeDate}, ${action.expectedTimeWindow}. This is not a guaranteed government action. Preparation: ${action.preparationInstructions}`,
      createdAt: updatedAt,
      read: false,
    }
    const existingIndex = notifications.findIndex((item) => item.id === notification.id)
    if (existingIndex >= 0) notifications[existingIndex] = notification
    else notifications.push(notification)
  }
  writeStoredArray(notificationStorageKey, notifications)
  const updatedAction: Action = {
    ...action,
    workflowStage: 'CITIZEN NOTIFIED',
    citizenNotifiedAt: updatedAt,
    officerNote: `Citizens notified on ${updatedAt}. The visit window remains expected, not guaranteed.`,
    updatedAt,
    timeline: addActionTimelineEvent(action, 'Citizen notified', updatedAt),
  }
  storeAction(updatedAction)
  return updatedAction
}

export function updateActionWorkflow(actionId: string, nextStage: Extract<ActionWorkflowStage, 'ACTION IN PROGRESS' | 'COMPLETED'>): Action | null {
  const action = getIssueActions().find((item) => item.id === actionId)
  const allowed = (nextStage === 'ACTION IN PROGRESS' && action?.workflowStage === 'CITIZEN NOTIFIED') || (nextStage === 'COMPLETED' && action?.workflowStage === 'ACTION IN PROGRESS')
  if (!action || !allowed) return null
  const updatedAt = new Date().toISOString()
  const timelineLabel: ActionTimelineLabel = nextStage === 'ACTION IN PROGRESS' ? 'Action in progress' : 'Action completed'
  const updatedAction: Action = {
    ...action,
    workflowStage: nextStage,
    status: nextStage === 'COMPLETED' ? 'Completed' : action.status,
    officerNote: nextStage === 'COMPLETED' ? 'Field action marked completed in the demo; issue resolution is a separate decision.' : 'Field action started in the demo.',
    updatedAt,
    timeline: addActionTimelineEvent(action, timelineLabel, updatedAt),
  }
  storeAction(updatedAction)
  return updatedAction
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
  const issueClusterId = input.analysis?.relatedIssueId ?? matchIssueCluster(input)
  const report: CitizenReport = {
    ...input,
    id: nextReferenceId(existingReports),
    language: input.analysis?.detectedLanguage ?? 'English',
    inputType: input.inputType ?? (input.imageUrl ? 'Photo' : 'Text'),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    issueClusterId: issueClusterId ?? (input.location.trim() ? createDynamicIssueId(input.category, input.location, input.ward) : null),
  }
  writeStoredArray(reportStorageKey, [report, ...existingReports])
  return report
}