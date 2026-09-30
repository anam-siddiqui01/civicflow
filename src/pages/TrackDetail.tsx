import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, EmptyState, PageHeader, StatusBadge } from '../components/ui'
import { getCitizenActionResponse, getCitizenReports, getIssueActions, getIssueClusters, submitCitizenActionResponse } from '../data/repository'
import type { ActionTimelineLabel, ActionWorkflowStage, CitizenActionResponse, SchedulingConflictReason } from '../types'

const citizenTimeline: ActionTimelineLabel[] = ['Report received', 'Issue clustered', 'Officer reviewed', 'Action scheduled', 'Citizen notified', 'Action in progress', 'Action completed']
const timelineStagePosition: Record<ActionWorkflowStage, number> = {
  NEW: 1,
  'UNDER REVIEW': 2,
  'ACTION PLANNED': 3,
  'CITIZEN NOTIFIED': 4,
  'ACTION IN PROGRESS': 5,
  COMPLETED: 6,
}
const citizenStatusByStage: Record<ActionWorkflowStage, string> = {
  NEW: 'Received',
  'UNDER REVIEW': 'Under review',
  'ACTION PLANNED': 'Action planned',
  'CITIZEN NOTIFIED': 'Citizen notified',
  'ACTION IN PROGRESS': 'Action in progress',
  COMPLETED: 'Action completed',
}

export function TrackDetail() {
  const { id } = useParams()
  const [citizenResponse, setCitizenResponse] = useState<CitizenActionResponse | null>(null)
  const [showConflictForm, setShowConflictForm] = useState(false)
  const [conflictReason, setConflictReason] = useState<SchedulingConflictReason>('Local event')
  const [alternativeDate, setAlternativeDate] = useState('')
  const [alternativeTimeWindow, setAlternativeTimeWindow] = useState('')
  const [conflictNote, setConflictNote] = useState('')
  const report = getCitizenReports().find((item) => item.id === id)
  const issue = report?.issueClusterId ? getIssueClusters().find((item) => item.id === report.issueClusterId) : undefined
  const action = report?.issueClusterId ? getIssueActions(report.issueClusterId)[0] : undefined
  const reportId = report?.id
  const actionId = action?.id

  useEffect(() => {
    setCitizenResponse(reportId && actionId ? getCitizenActionResponse(actionId, reportId) ?? null : null)
  }, [reportId, actionId])

  if (!report) return <><PageHeader eyebrow="Citizen services" title="Report not found" description="Check the reference ID and try again." /><Card><EmptyState title="We couldn't find that report" message="This reference may be from another browser or demo session." action={<Link className="button button-secondary button-small" to="/track"><ArrowLeft size={13} /> Back to reports</Link>} /></Card></>

  const actionDate = action?.expectedDate ? new Date(`${action.expectedDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'To be proposed'
  const submittedDate = new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const displayedReportStatus = action?.workflowStage ? citizenStatusByStage[action.workflowStage] : report.status

  function markReady() {
    if (!action) return
    const response = submitCitizenActionResponse({ actionId: action.id, citizenReportId: report.id, response: 'Ready' })
    setCitizenResponse(response)
    setShowConflictForm(false)
  }

  function submitConflict(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!action) return
    const response = submitCitizenActionResponse({
      actionId: action.id,
      citizenReportId: report.id,
      response: 'Conflict',
      reason: conflictReason,
      alternativeDate,
      alternativeTimeWindow,
      note: conflictNote.trim() || undefined,
    })
    setCitizenResponse(response)
    setShowConflictForm(false)
  }

  const actionMessage = action?.status === 'Confirmed'
    ? `Your field visit has been confirmed for ${actionDate}, ${action.expectedTimeWindow}. Schedules may still change.`
    : action?.status === 'Proposed'
      ? `An officer has proposed an inspection for ${actionDate}, ${action.expectedTimeWindow}. This time is not confirmed yet.`
      : action?.status === 'Completed'
        ? 'The field visit is marked completed in this demo. This does not automatically resolve the reported issue.'
        : action
          ? action.expectedDate && action.expectedTimeWindow
            ? `An officer is expected to inspect this location on ${actionDate}, ${action.expectedTimeWindow}. This is an expected window, not a guarantee.`
            : 'An officer is reviewing this issue. A visit time will appear after an action plan is approved.'
          : 'An expected date will appear when a next step is proposed.'

  return <>
    <PageHeader eyebrow={<><MapPin size={13} /> Citizen services{report.ward ? ` · Ward ${report.ward}` : ''}</>} title="Report status" description={`${report.location}${report.ward ? ` · Ward ${report.ward}` : ''}`} action={<Link className="button button-secondary" to="/track"><ArrowLeft size={14} /> All reports</Link>} />
    <div className="detail-columns"><div className="detail-main">
      <Card className="card-pad"><div className="detail-title-row"><div><div className="track-ref">REFERENCE · {report.id}</div><h2 className="section-title" style={{ marginTop: 8 }}>{issue?.title ?? report.category}</h2><p className="section-caption">Submitted {submittedDate}</p></div><StatusBadge status={displayedReportStatus} /></div><p className="body-copy" style={{ marginTop: 14 }}>{report.description}</p><div className="detail-location"><MapPin size={13} /> {report.location}{report.ward ? ` · Ward ${report.ward}` : ''}</div>{action?.workflowStage === 'COMPLETED' && <p className="action-closure-note">Field action marked completed in the demo. Issue resolution is a separate decision.</p>}{report.imageUrl && <img className="report-evidence-thumb" style={{ marginTop: 12 }} src={report.imageUrl} alt="Evidence attached to this report" />}</Card>
      <Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Report and action timeline</h2><p className="section-caption">Progress is illustrative and does not certify issue resolution</p></div><Clock3 size={15} color="#87938a" /></div><div className="timeline">{citizenTimeline.map((step, index) => {
        const event = [...(action?.timeline ?? [])].reverse().find((item) => item.label === step)
        const stagePosition = action?.workflowStage ? timelineStagePosition[action.workflowStage] : -1
        const current = Boolean(action?.workflowStage && stagePosition === index)
        const completed = Boolean(event) || (stagePosition > index) || (!action && index <= 1)
        const timestamp = event ? new Date(event.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : index === 0 ? `${submittedDate} · Reference created` : current ? 'Current stage' : completed ? 'Recorded in demo' : 'Pending office update'
        return <div className="timeline-item" key={step}><div className="timeline-rail"><span className={`timeline-dot ${completed ? 'done' : ''} ${current ? 'current' : ''}`}>{completed ? <Check size={9} /> : undefined}</span>{index < citizenTimeline.length - 1 && <span className="timeline-line" />}</div><div className="timeline-copy"><strong>{step}</strong><p>{timestamp}</p>{event?.note && <small>{event.note}</small>}</div></div>
      })}</div></Card>
    </div><aside className="detail-aside">
      <Card className="card-pad citizen-readiness-card"><div className="section-heading"><div><div className="eyebrow"><ShieldCheck size={13} /> Citizen readiness</div><h2 className="section-title" style={{ marginTop: 7 }}>Prepare for a possible field visit</h2><p className="section-caption">Scheduling is not a guaranteed government action.</p></div>{action && <StatusBadge status={action.status} />}</div>
        <div className="readiness-message" aria-live="polite"><strong>{actionMessage}</strong></div>
        {action?.citizenNotifiedAt && action.approvedActionPlan && <div className="citizen-notification-received"><span>CITIZEN NOTIFIED</span><p>{action.approvedActionPlan}</p><small>Sent {new Date(action.citizenNotifiedAt).toLocaleString('en-GB')} · Please treat timing as expected and subject to change.</small></div>}
        {action && <><div className="readiness-facts"><div><span>Expected date</span><strong>{actionDate}</strong></div><div><span>Expected window</span><strong>{action.expectedTimeWindow}</strong></div></div>
          <div className="readiness-subsection"><h3>What may happen</h3><ol>{(action.expectedSteps ?? ['Field inspection', 'Evidence verification', 'Assessment of the reported issue', 'Appropriate next steps under applicable procedures']).map((step) => <li key={step}>{step}</li>)}</ol></div>
          <div className="readiness-subsection"><h3>How you can help</h3><p>{action.preparationInstructions}</p></div>
          {citizenResponse?.response === 'Ready' && <div className="readiness-feedback"><Check size={14} /><span>You’re marked ready. This helps the field team prepare; it does not guarantee a visit.</span></div>}
          {citizenResponse?.response === 'Conflict' && <div className={`readiness-feedback ${citizenResponse.resolvedAt ? 'readiness-reviewed' : 'readiness-conflict'}`}><TriangleAlert size={14} /><span><strong>{citizenResponse.resolvedAt ? 'Scheduling conflict reviewed' : 'Scheduling conflict reported'}</strong><br />{citizenResponse.reason}{citizenResponse.alternativeDate ? ` · Alternative: ${new Date(`${citizenResponse.alternativeDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}{citizenResponse.alternativeTimeWindow ? `, ${citizenResponse.alternativeTimeWindow}` : ''}{citizenResponse.note ? ` · ${citizenResponse.note}` : ''}</span></div>}
          {action.status !== 'Completed' && action.expectedDate && action.expectedTimeWindow && <div className="readiness-actions"><Button variant="secondary" icon={<Check size={14} />} onClick={markReady}>I’m ready</Button><Button variant="quiet" icon={<CalendarDays size={14} />} onClick={() => setShowConflictForm((visible) => !visible)}>{citizenResponse?.response === 'Conflict' ? 'Update scheduling conflict' : 'Report a scheduling conflict'}</Button></div>}
          {action.status !== 'Completed' && (!action.expectedDate || !action.expectedTimeWindow) && <div className="notice-box readiness-unscheduled"><CalendarDays size={14} /> No visit window is set yet. Readiness and conflict responses will be available once an officer proposes a date and time.</div>}
          {showConflictForm && action.status !== 'Completed' && action.expectedDate && action.expectedTimeWindow && <form className="conflict-form" onSubmit={submitConflict}><label className="form-label" htmlFor="conflict-reason">Reason</label><select className="field-select" id="conflict-reason" value={conflictReason} onChange={(event) => setConflictReason(event.target.value as SchedulingConflictReason)}><option>Local event</option><option>Access constraint</option><option>Personal availability</option><option>Other</option></select><label className="form-label" htmlFor="alternative-date">Suggested alternative date</label><input className="field-input" id="alternative-date" type="date" min={new Date().toISOString().slice(0, 10)} value={alternativeDate} onChange={(event) => setAlternativeDate(event.target.value)} required /><label className="form-label" htmlFor="alternative-window">Suggested alternative time</label><input className="field-input" id="alternative-window" value={alternativeTimeWindow} onChange={(event) => setAlternativeTimeWindow(event.target.value)} placeholder="1:00 PM – 3:00 PM" required /><label className="form-label" htmlFor="conflict-note">Optional note</label><textarea className="field-textarea conflict-note" id="conflict-note" value={conflictNote} onChange={(event) => setConflictNote(event.target.value)} maxLength={240} placeholder="There is a local event from 10–11 AM." /><Button type="submit" icon={<CalendarDays size={14} />}>Send conflict to officer</Button></form>}
        </>}
      </Card>
      <Card className="card-pad"><div className="eyebrow"><Check size={13} /> Your reference</div><p className="body-copy" style={{ margin: '9px 0 0' }}>Keep <strong>{report.id}</strong> handy when checking on this issue. Updates shown here are part of the CivicFlow demo.</p></Card></aside></div>
  </>
}