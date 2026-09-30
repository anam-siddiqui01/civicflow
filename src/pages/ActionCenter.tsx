import { AlertTriangle, ArrowRight, CalendarDays, Check, ClipboardCheck, Clock3, FileText, MapPin, Send, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, EmptyState, Modal, PageHeader, StatusBadge } from '../components/ui'
import { approveOfficerActionPlan, getCitizenActionResponses, getIssueActions, getIssueClusters, saveOfficerActionPlan, sendActionNotification, updateActionSchedule, updateActionWorkflow } from '../data/repository'
import type { OfficerActionPlanInput, OfficerScheduleDecision } from '../data/repository'
import type { Action, ActionTimelineLabel, ActionWorkflowStage, IssueCluster } from '../types'

const timelineLabels: ActionTimelineLabel[] = ['Report received', 'Issue clustered', 'Officer reviewed', 'Action scheduled', 'Citizen notified', 'Action in progress', 'Action completed']
const stageProgress: Record<ActionWorkflowStage, number> = {
  NEW: 1,
  'UNDER REVIEW': 2,
  'ACTION PLANNED': 3,
  'CITIZEN NOTIFIED': 4,
  'ACTION IN PROGRESS': 5,
  COMPLETED: 6,
}

function ActionPlanEditor({ action, issue, onSave, onApprove, onPreview, onAdvance }: {
  action: Action
  issue: IssueCluster
  onSave: (input: OfficerActionPlanInput) => void
  onApprove: () => void
  onPreview: () => void
  onAdvance: (stage: 'ACTION IN PROGRESS' | 'COMPLETED') => void
}) {
  const [department, setDepartment] = useState(action.department ?? issue.suggestedDepartment)
  const [fieldOfficer, setFieldOfficer] = useState(action.fieldOfficer ?? '')
  const [expectedDate, setExpectedDate] = useState(action.expectedDate)
  const [expectedTimeWindow, setExpectedTimeWindow] = useState(action.expectedTimeWindow)
  const [aiDraftActionPlan, setAiDraftActionPlan] = useState(action.aiDraftActionPlan ?? issue.recommendedAction)
  const [preparationInstructions, setPreparationInstructions] = useState(action.preparationInstructions)
  const editable = !['CITIZEN NOTIFIED', 'ACTION IN PROGRESS', 'COMPLETED'].includes(action.workflowStage ?? 'NEW')
  const unsavedChanges = department !== (action.department ?? issue.suggestedDepartment) ||
    fieldOfficer !== (action.fieldOfficer ?? '') || expectedDate !== action.expectedDate ||
    expectedTimeWindow !== action.expectedTimeWindow || aiDraftActionPlan !== (action.aiDraftActionPlan ?? issue.recommendedAction) ||
    preparationInstructions !== action.preparationInstructions
  const readyForApproval = Boolean(department.trim() && fieldOfficer.trim() && expectedDate && expectedTimeWindow.trim() && aiDraftActionPlan.trim())
  const departments = [...new Set([issue.suggestedDepartment, 'Water & Public Works', 'Sanitation Services', 'Roads & Public Works', 'Traffic / Municipal Enforcement', 'Electrical Services'])]
  const officers = [...new Set([...(action.fieldOfficer ? [action.fieldOfficer] : []), 'Asha Menon', 'Rohan Kulkarni', 'Priya Desai'])]

  useEffect(() => {
    setDepartment(action.department ?? issue.suggestedDepartment)
    setFieldOfficer(action.fieldOfficer ?? '')
    setExpectedDate(action.expectedDate)
    setExpectedTimeWindow(action.expectedTimeWindow)
    setAiDraftActionPlan(action.aiDraftActionPlan ?? issue.recommendedAction)
    setPreparationInstructions(action.preparationInstructions)
  }, [action.id, action.updatedAt, action.department, action.fieldOfficer, action.expectedDate, action.expectedTimeWindow, action.aiDraftActionPlan, action.preparationInstructions, issue.suggestedDepartment, issue.recommendedAction])

  function saveDraft() {
    onSave({ department, fieldOfficer, expectedDate, expectedTimeWindow, aiDraftActionPlan, preparationInstructions })
  }

  return <section className="action-planner" aria-label={`Action plan for ${issue.title}`}>
    <div className="action-planner-heading"><div><h3>Action plan & assignment</h3><p>Review every field before approval or notification.</p></div><Badge className="workflow-stage-badge">{action.workflowStage ?? 'NEW'}</Badge></div>
    <div className="action-assignment-grid">
      <label className="planner-field"><span>Assign department</span><select className="field-select" value={department} onChange={(event) => setDepartment(event.target.value)} disabled={!editable}>{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="planner-field"><span>Assign field officer</span><select className="field-select" value={fieldOfficer} onChange={(event) => setFieldOfficer(event.target.value)} disabled={!editable}><option value="">Select field officer</option>{officers.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="planner-field"><span>Expected date</span><input className="field-input" type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} disabled={!editable} /></label>
      <label className="planner-field"><span>Expected time window</span><input className="field-input" value={expectedTimeWindow} onChange={(event) => setExpectedTimeWindow(event.target.value)} placeholder="10:00 AM – 12:00 PM" disabled={!editable} /></label>
    </div>
    <div className="action-draft-panel"><div className="draft-title"><span className="draft-icon"><Sparkles size={13} /></span><strong>AI GENERATED DRAFT</strong></div><label className="sr-only" htmlFor={`plan-${action.id}`}>Edit AI-generated action plan</label><textarea id={`plan-${action.id}`} className="field-textarea action-plan-textarea" value={aiDraftActionPlan} onChange={(event) => setAiDraftActionPlan(event.target.value)} maxLength={600} disabled={!editable} /></div>
    {action.actionPlanApproved && action.approvedActionPlan && <div className="approved-plan-panel"><span><Check size={12} /> OFFICER APPROVED</span><p>{action.approvedActionPlan}</p></div>}
    <label className="planner-field planner-preparation"><span>Citizen preparation instructions</span><textarea className="field-textarea preparation-textarea" value={preparationInstructions} onChange={(event) => setPreparationInstructions(event.target.value)} maxLength={300} disabled={!editable} /></label>
    <div className="action-plan-buttons">
      {editable && <Button variant="secondary" disabled={!unsavedChanges || !readyForApproval} onClick={saveDraft}>Save assignment & draft</Button>}
      {editable && <Button disabled={!readyForApproval || unsavedChanges || Boolean(action.actionPlanApproved)} onClick={onApprove}>{action.actionPlanApproved && !unsavedChanges ? 'Plan approved' : 'Approve action plan'}</Button>}
      {action.actionPlanApproved && action.workflowStage === 'ACTION PLANNED' && <Button variant="secondary" icon={<FileText size={14} />} onClick={onPreview}>Preview citizen notification</Button>}
      {action.workflowStage === 'CITIZEN NOTIFIED' && !action.citizenConflict && <Button icon={<Clock3 size={14} />} onClick={() => onAdvance('ACTION IN PROGRESS')}>Start action</Button>}
      {action.workflowStage === 'ACTION IN PROGRESS' && <Button icon={<Check size={14} />} onClick={() => onAdvance('COMPLETED')}>Mark action completed</Button>}
      {action.workflowStage === 'COMPLETED' && <Badge className="status-completed">Action completed · issue status unchanged</Badge>}
      {!editable && action.workflowStage === 'CITIZEN NOTIFIED' && <span className="action-notified-note">Citizen notification sent {action.citizenNotifiedAt ? new Date(action.citizenNotifiedAt).toLocaleString('en-GB') : ''}</span>}
    </div>
    <div className="action-timeline-wrap"><h3>Workflow timeline</h3><ol className="action-timeline">{timelineLabels.map((label, index) => {
      const event = [...(action.timeline ?? [])].reverse().find((item) => item.label === label)
      const current = stageProgress[action.workflowStage ?? 'NEW'] === index
      const past = !current && (Boolean(event) || stageProgress[action.workflowStage ?? 'NEW'] > index)
      return <li className={`${past ? 'timeline-past' : ''} ${current ? 'timeline-current' : ''}`} key={label}><span className="action-timeline-dot">{past ? <Check size={10} /> : index + 1}</span><div><strong>{label}</strong><time>{event ? new Date(event.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : current ? 'Current stage' : 'Pending'}</time>{event?.note && <small>{event.note}</small>}</div></li>
    })}</ol></div>
  </section>
}

export function ActionCenter() {
  const [searchParams] = useSearchParams()
  const [actions, setActions] = useState(() => getIssueActions())
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [proposalDate, setProposalDate] = useState('')
  const [proposalWindow, setProposalWindow] = useState('')
  const [previewAction, setPreviewAction] = useState<Action | null>(null)
  const conflictCount = actions.filter((action) => action.citizenConflict).length
  const issues = getIssueClusters()
  const focusIssueId = searchParams.get('issue')

  useEffect(() => {
    if (!focusIssueId) return
    document.getElementById(`issue-action-${focusIssueId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusIssueId, actions.length])

  function refreshActions() {
    setActions(getIssueActions())
  }

  function decideSchedule(actionId: string, decision: OfficerScheduleDecision) {
    updateActionSchedule(actionId, decision)
    refreshActions()
  }

  function beginProposal(action: Action) {
    const conflict = getCitizenActionResponses(action.id).find((response) => response.response === 'Conflict' && !response.resolvedAt)
    setProposalDate(conflict?.alternativeDate ?? action.expectedDate)
    setProposalWindow(conflict?.alternativeTimeWindow ?? '')
    setSelectedAction(action)
  }

  function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedAction) return
    updateActionSchedule(selectedAction.id, 'Propose another time', proposalDate, proposalWindow)
    setSelectedAction(null)
    refreshActions()
  }

  function saveActionPlan(actionId: string, input: OfficerActionPlanInput) {
    if (saveOfficerActionPlan(actionId, input)) refreshActions()
  }

  function approveActionPlan(actionId: string) {
    if (approveOfficerActionPlan(actionId)) refreshActions()
  }

  function sendNotification(actionId: string) {
    if (sendActionNotification(actionId)) {
      setPreviewAction(null)
      refreshActions()
    }
  }

  function advanceWorkflow(actionId: string, stage: 'ACTION IN PROGRESS' | 'COMPLETED') {
    if (updateActionWorkflow(actionId, stage)) refreshActions()
  }

  return <>
    <PageHeader eyebrow={<><ClipboardCheck size={13} /> Officer workspace</>} title="Action coordination" description="Review expected field visits and citizen readiness before confirming a schedule." action={<span className="badge status-needs-review">{actions.length} tracked actions</span>} />
    {conflictCount > 0 && <div className="officer-conflict-banner"><AlertTriangle size={17} /><div><strong>Citizen scheduling conflict reported.</strong><span>{conflictCount} action{conflictCount === 1 ? '' : 's'} need officer review before the visit window is confirmed.</span></div></div>}
    {actions.length ? <div className="action-list">{actions.map((action) => {
      const conflicts = getCitizenActionResponses(action.id).filter((response) => response.response === 'Conflict' && !response.resolvedAt)
      const issue = issues.find((item) => item.id === action.issueId)
      if (!issue) return null
      const issueTitle = action.issueId === 'issue-parking-8' ? 'Obstructed lane / parking problem' : issue.title
      const issueUrl = `/issues/${action.issueId}`
      const actionDate = action.expectedDate ? new Date(`${action.expectedDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date to be selected'
      return <Card className="action-row" id={`issue-action-${action.id}`} key={action.id}><div className="action-row-main">
        <div className="action-row-heading"><div><div className="action-row-title"><h2 className="section-title">{issueTitle}</h2><StatusBadge status={action.status} /></div><p className="section-caption"><MapPin size={11} style={{ verticalAlign: 'middle' }} /> {issue?.location ?? 'Location pending'} · Ward {issue?.ward ?? '—'}</p></div><Link className="button button-secondary button-small" to={issueUrl}>Review issue <ArrowRight size={13} /></Link></div>
        <div className="action-schedule-line"><CalendarDays size={14} /><strong>{actionDate}</strong><span>{action.expectedTimeWindow || 'Time window to be selected'}</span><span className="action-window-caveat">{action.status === 'Confirmed' ? 'Confirmed in demo · may change' : 'Expected window · not guaranteed'}</span></div>
        <p className="action-preparation"><strong>Citizen preparation:</strong> {action.preparationInstructions}</p>
        {conflicts.length > 0 && <div className="conflict-detail-panel"><div className="conflict-detail-heading"><AlertTriangle size={15} /><strong>Citizen scheduling conflict reported.</strong></div>{conflicts.map((conflict) => <div className="conflict-detail" key={conflict.citizenReportId}><span><UserRound size={12} /> Report {conflict.citizenReportId} · {conflict.reason ?? 'Scheduling conflict'}</span><p>{conflict.note || 'The citizen reported a conflict with the expected visit window.'}</p>{conflict.alternativeDate && <small>Suggested: {new Date(`${conflict.alternativeDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}{conflict.alternativeTimeWindow ? ` · ${conflict.alternativeTimeWindow}` : ''}</small>}</div>)}
          <div className="officer-conflict-actions"><Button variant="secondary" icon={<Check size={14} />} onClick={() => decideSchedule(action.id, 'Keep current time')}>Keep current time</Button><Button variant="secondary" icon={<CalendarDays size={14} />} onClick={() => beginProposal(action)}>Propose another time</Button>{action.status === 'Proposed' && <Button icon={<Check size={14} />} onClick={() => decideSchedule(action.id, 'Confirm new time')}>Confirm new time</Button>}</div>
        </div>}
        <ActionPlanEditor action={action} issue={issue} onSave={(input) => saveActionPlan(action.id, input)} onApprove={() => approveActionPlan(action.id)} onPreview={() => setPreviewAction(action)} onAdvance={(stage) => advanceWorkflow(action.id, stage)} />
        {action.officerNote && <p className="section-caption action-officer-note">{action.officerNote}</p>}
      </div></Card>
    })}</div> : <Card><EmptyState title="No active actions" message="Active issue clusters will appear here when they need officer review." action={<Link className="button button-secondary button-small" to="/issues">Review issue clusters <ArrowRight size={13} /></Link>} /></Card>}
    <p className="footer-note">Expected and proposed windows are not guarantees. A confirmed visit does not automatically mean the underlying issue is resolved.</p>
    {selectedAction && <Modal title="Propose another visit window" description="This sends a proposed time to the citizen view; it remains unconfirmed until an officer confirms it." onClose={() => setSelectedAction(null)}><form className="officer-proposal-form" onSubmit={submitProposal}><label className="form-label" htmlFor="proposal-date">Proposed date</label><input className="field-input" id="proposal-date" type="date" min={new Date().toISOString().slice(0, 10)} value={proposalDate} onChange={(event) => setProposalDate(event.target.value)} required /><label className="form-label" htmlFor="proposal-window">Proposed time window</label><input className="field-input" id="proposal-window" value={proposalWindow} onChange={(event) => setProposalWindow(event.target.value)} placeholder="1:00 PM – 3:00 PM" required /><div className="notice-box"><CalendarDays size={14} /> The citizen will see this as proposed, not confirmed.</div><Button type="submit" icon={<CalendarDays size={14} />}>Send proposed time</Button></form></Modal>}
    {previewAction && <Modal title="Citizen notification preview" description="Review the officer-approved content before sending. The expected visit is not guaranteed." onClose={() => setPreviewAction(null)}><div className="notification-preview"><Badge className="status-expected">Expected · subject to change</Badge><p>An officer-approved action plan is expected for <strong>{issues.find((issue) => issue.id === previewAction.issueId)?.title ?? 'this issue'}</strong>.</p><p><strong>Expected date:</strong> {new Date(`${previewAction.expectedDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p><p><strong>Expected window:</strong> {previewAction.expectedTimeWindow}</p><p><strong>What may happen:</strong> {previewAction.approvedActionPlan}</p><p><strong>Preparation:</strong> {previewAction.preparationInstructions}</p><div className="notice-box">This notice is informational and does not guarantee government action.</div><Button icon={<Send size={14} />} onClick={() => sendNotification(previewAction.id)}>Send notification</Button></div></Modal>}
  </>
}