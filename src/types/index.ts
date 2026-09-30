export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low'
export type IssueTrend = 'Rising' | 'Stable' | 'Falling'
export type ReportStatus = 'Submitted' | 'Received' | 'Under review' | 'Action planned' | 'In progress' | 'Resolved'
export type IssueStatus = 'Needs review' | 'Action planned' | 'In progress' | 'Resolved'
export type ActionStatus = 'Expected' | 'Proposed' | 'Confirmed' | 'Completed'
export type ActionWorkflowStage = 'NEW' | 'UNDER REVIEW' | 'ACTION PLANNED' | 'CITIZEN NOTIFIED' | 'ACTION IN PROGRESS' | 'COMPLETED'
export type ActionTimelineLabel = 'Report received' | 'Issue clustered' | 'Officer reviewed' | 'Action scheduled' | 'Citizen notified' | 'Action in progress' | 'Action completed'
export type CitizenActionResponseType = 'Ready' | 'Conflict'
export type SchedulingConflictReason = 'Local event' | 'Access constraint' | 'Personal availability' | 'Other'
export type CivicUrgency = 'Low' | 'Moderate' | 'High' | 'Critical'
export type CivicSeverity = 'Low' | 'Moderate' | 'High' | 'Critical'
export type DetectedLanguage = 'English' | 'Hindi' | 'Marathi' | 'Other'

export interface ReportAnalysis {
  category: string
  summary: string
  detectedLanguage: DetectedLanguage
  location: string
  urgency: CivicUrgency
  severity: CivicSeverity
  affectedPopulationEstimate: number
  evidenceStrength: number
  evidence: string[]
  suggestedDepartment: string
  recommendedAction: string
  relatedIssueId: string | null
  normalizedIssueType: string
}

export interface PriorityFactor {
  label: string
  points: number
  explanation: string
}

export interface PriorityRecommendation {
  score: number
  level: PriorityLevel
  reason: string
  factors: PriorityFactor[]
}

export interface CitizenReport {
  id: string
  description: string
  category: string
  location: string
  ward: number | null
  language: string
  inputType: 'Text' | 'Voice' | 'Photo'
  imageUrl: string | null
  status: ReportStatus
  createdAt: string
  issueClusterId: string | null
  analysis?: ReportAnalysis
}

export interface IssueCluster {
  id: string
  title: string
  category: string
  location: string
  ward: number
  reportCount: number
  priorityScore: number
  priorityLevel: PriorityLevel
  trend: IssueTrend
  evidenceCount: number
  photoCount: number
  status: IssueStatus
  suggestedDepartment: string
  aiSummary: string
  recommendedAction: string
  urgency: CivicUrgency
  severity: CivicSeverity
  essentialService: boolean
  affectedPopulationEstimate: number
  essentialServiceImpact?: number
  essentialServiceImpactReason?: string
  vulnerabilityImpact?: number
  vulnerabilityImpactReason?: string
  affectedHouseholdsEstimate?: number
  trendChangePercent?: number
  trendWindowHours?: number
  languageCounts?: Partial<Record<DetectedLanguage, number>>
  inputTypeCounts?: Partial<Record<CitizenReport['inputType'], number>>
}

export interface Action {
  id: string
  issueId: string
  status: ActionStatus
  expectedDate: string
  expectedTimeWindow: string
  preparationInstructions: string
  officerNote: string
  citizenConflict: boolean
  createdAt: string
  expectedSteps?: string[]
  updatedAt?: string
  workflowStage?: ActionWorkflowStage
  department?: string
  fieldOfficer?: string
  aiDraftActionPlan?: string
  approvedActionPlan?: string
  actionPlanApproved?: boolean
  citizenNotifiedAt?: string
  officerDecision?: string
  timeline?: ActionTimelineEvent[]
}

export interface ActionTimelineEvent {
  label: ActionTimelineLabel
  createdAt: string
  note?: string
}

export interface CitizenActionResponse {
  actionId: string
  citizenReportId: string
  response: CitizenActionResponseType
  reason?: SchedulingConflictReason
  alternativeDate?: string
  alternativeTimeWindow?: string
  note?: string
  createdAt: string
  resolvedAt?: string
}

export interface CitizenNotification {
  id: string
  citizenReportId: string
  actionId?: string
  type: 'Status update' | 'Preparation' | 'Schedule'
  title: string
  message: string
  createdAt: string
  read: boolean
}