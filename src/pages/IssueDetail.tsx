import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bot, CalendarDays, Camera, CheckCircle2, ClipboardCheck, FileText, Languages, MapPin, MessageSquareText, Minus, Printer, UserPlus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, Modal, PageHeader, PriorityBadge, StatusBadge } from '../components/ui'
import { getCitizenReports, getIssueActions, getIssueClusters, saveOfficerDecision } from '../data/repository'
import { calculatePriority } from '../services/priorityEngine'

type IssueAction = 'brief'

const priorityLabelOrder = ['Severity / consequence', 'Essential-service impact', 'Affected population / vulnerability', 'Urgency / time sensitivity', 'Report volume / trend']

export function IssueDetail() {
  const { id } = useParams()
  const [modalAction, setModalAction] = useState<IssueAction | null>(null)
  const [officerDecision, setOfficerDecision] = useState('')
  const [decisionSaved, setDecisionSaved] = useState(true)
  const reportsRef = useRef<HTMLDivElement>(null)
  const closeModal = useCallback(() => setModalAction(null), [])
  const issue = getIssueClusters().find((cluster) => cluster.id === id)
  const action = issue ? getIssueActions(issue.id)[0] : undefined
  const canPlanAction = issue?.status !== 'Resolved'

  useEffect(() => {
    setOfficerDecision(action?.officerDecision ?? '')
    setDecisionSaved(true)
  }, [action?.id, action?.updatedAt, action?.officerDecision])

  if (!issue) return <Card className="card-pad"><Link to="/issues" className="inline-link"><ArrowLeft size={13} /> Back to clusters</Link><div style={{ paddingTop: 28 }}><h1 className="page-title">Issue not found</h1><p className="page-description">This issue may have been removed from the demo dataset.</p></div></Card>

  const linkedReports = getCitizenReports().filter((report) => report.issueClusterId === issue.id)
  const priority = calculatePriority(issue)
  const languageCounts = issue.languageCounts ?? linkedReports.reduce<Record<string, number>>((counts, report) => ({ ...counts, [report.language]: (counts[report.language] ?? 0) + 1 }), {})
  const inputTypeCounts = issue.inputTypeCounts ?? linkedReports.reduce<Record<string, number>>((counts, report) => ({ ...counts, [report.inputType]: (counts[report.inputType] ?? 0) + 1 }), {})
  const languageStats = Object.entries(languageCounts).filter((entry): entry is [string, number] => typeof entry[1] === 'number').sort((left, right) => right[1] - left[1])
  const inputTypeStats = ['Voice', 'Text', 'Photo'].flatMap((type) => typeof inputTypeCounts[type] === 'number' ? [[type, inputTypeCounts[type] as number] as [string, number]] : [])
  const priorityFactors = [...priority.factors].sort((left, right) => priorityLabelOrder.indexOf(left.label) - priorityLabelOrder.indexOf(right.label))
  const sampleReports = linkedReports.slice(0, 4)
  const photoReports = linkedReports.filter((report) => Boolean(report.imageUrl)).slice(0, 3)
  const hasAggregateCounts = Boolean(issue.languageCounts && issue.inputTypeCounts)
  const trendLabel = issue.trend === 'Rising' ? 'Increasing' : issue.trend === 'Falling' ? 'Decreasing' : 'Stable'
  const trendBrief = typeof issue.trendChangePercent === 'number' ? `${issue.trendChangePercent > 0 ? '+' : ''}${issue.trendChangePercent}% over ${issue.trendWindowHours ?? 24} hours` : trendLabel
  const photoReportCount = typeof inputTypeCounts.Photo === 'number' ? inputTypeCounts.Photo : issue.photoCount
  const voiceReportCount = typeof inputTypeCounts.Voice === 'number' ? inputTypeCounts.Voice : 0
  const textReportCount = typeof inputTypeCounts.Text === 'number' ? inputTypeCounts.Text : 0
  const actionDate = action?.expectedDate ? new Date(`${action.expectedDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not scheduled'
  const actionStatus = action?.workflowStage ?? action?.status ?? 'No action planned'
  const modalDetails: Record<IssueAction, { title: string; description: string }> = {
    brief: { title: 'Issue action brief', description: 'A review-ready summary for human consideration. This is not an official instruction.' },
  }

  return <>
    <PageHeader eyebrow={<><MapPin size={13} /> Ward {issue.ward} · {issue.category}</>} title={issue.title} description={issue.location} action={<div className="issue-header-actions"><div className="issue-header-signals"><div><span>Priority</span><PriorityBadge level={priority.level} /></div><div><span>Status</span><StatusBadge status={issue.status} /><small>Demo record · officer confirmation required</small></div></div>{canPlanAction && <><Link className="button button-secondary" to={`/action-center?issue=${encodeURIComponent(issue.id)}`}><UserPlus size={14} /> Assign</Link><Link className="button button-secondary" to={`/action-center?issue=${encodeURIComponent(issue.id)}`}><CalendarDays size={14} /> Schedule Action</Link></>}<Button icon={<FileText size={14} />} onClick={() => setModalAction('brief')}>Generate Action Brief</Button><Link className="button button-secondary" to="/issues"><ArrowLeft size={14} /> All issues</Link></div>} />
    <div className="detail-columns">
      <div className="detail-main">
        <Card className="card-pad">
          <div className="section-heading"><div><span className="section-index">01</span><h2 className="section-title">Issue summary</h2><p className="section-caption">Plain-language summary from related citizen reports</p></div><span className="recommendation-icon"><Bot size={16} /></span></div>
          <p className="body-copy issue-summary-copy">{issue.aiSummary}</p>
          <div className="issue-analysis-grid analysis-grid"><div className="analysis-field"><span>Category</span><strong>{issue.id === 'issue-parking-8' ? 'Parking / Traffic' : issue.category}</strong></div><div className="analysis-field"><span>Urgency · severity</span><strong>{issue.urgency} · {issue.severity}</strong></div><div className="analysis-field"><span>Suggested department</span><strong>{issue.suggestedDepartment}</strong></div><div className="analysis-field"><span>Estimated population affected</span><strong>About {issue.affectedPopulationEstimate.toLocaleString()}</strong></div></div>
        </Card>

        <Card className="card-pad" ref={reportsRef}>
          <div className="section-heading"><div><span className="section-index">02</span><h2 className="section-title">Citizen reports</h2><p className="section-caption">Aggregated reports connected to this underlying issue</p></div><span className="badge status-needs-review"><MessageSquareText size={11} /> {issue.reportCount.toLocaleString()} related reports</span></div>
          <div className="report-distribution-grid">
            <div className="report-distribution"><div className="distribution-heading"><Languages size={14} /><h3>Languages</h3><span>{hasAggregateCounts ? 'All reports' : 'Available samples'}</span></div>{languageStats.map(([language, count]) => <div className="distribution-row" key={language}><div><span>{language}</span><strong>{count}</strong></div><div className="distribution-track"><span style={{ width: `${Math.min(100, count / issue.reportCount * 100)}%` }} /></div></div>)}</div>
            <div className="report-distribution"><div className="distribution-heading"><FileText size={14} /><h3>Input types</h3><span>{hasAggregateCounts ? 'All reports' : 'Available samples'}</span></div>{inputTypeStats.map(([type, count]) => <div className="distribution-row" key={type}><div><span>{type}</span><strong>{count}</strong></div><div className="distribution-track distribution-track-alt"><span style={{ width: `${Math.min(100, count / issue.reportCount * 100)}%` }} /></div></div>)}</div>
          </div>
        </Card>

        <Card className="card-pad">
          <div className="section-heading"><div><span className="section-index">03</span><h2 className="section-title">Evidence</h2><p className="section-caption">Sample attachments and excerpts from related reports</p></div><span className="badge status-under-review"><Camera size={11} /> {issue.photoCount} photos · {issue.evidenceCount} evidence items</span></div>
          {photoReports.length > 0 ? <div className="issue-evidence-photos">{photoReports.map((report) => <figure key={report.id}><img src={report.imageUrl ?? ''} alt={`Citizen photo evidence from ${report.location}`} /><figcaption>{report.id} · {report.language}</figcaption></figure>)}</div> : <div className="notice-box"><Camera size={14} /> No photo attachments are available in the representative report samples.</div>}
          <div className="evidence-excerpts">{sampleReports.map((report) => <blockquote key={report.id}><p>“{report.description}”</p><footer>{report.id} · {report.language} · {report.location}</footer></blockquote>)}</div>
        </Card>

        <Card className="card-pad">
          <div className="section-heading"><div><span className="section-index">04</span><h2 className="section-title">Trend</h2><p className="section-caption">Direction of related complaint volume</p></div></div>
          <div className={`issue-trend-panel issue-trend-panel-${issue.trend.toLowerCase()}`}><span className="issue-trend-symbol">{issue.trend === 'Rising' ? <ArrowUp size={20} /> : issue.trend === 'Falling' ? <ArrowDown size={20} /> : <Minus size={20} />}</span><div><strong>{trendLabel}</strong><span>{issue.reportCount.toLocaleString()} reports currently grouped in this issue</span></div><Badge className={`trend-badge-${issue.trend.toLowerCase()}`}>{issue.trend}</Badge></div>
          <p className="footer-note">Trend is a directional signal from demo issue data, not a forecast.</p>
        </Card>

        <Card className="card-pad">
          <div className="section-heading"><div><span className="section-index">05</span><h2 className="section-title">Priority explanation</h2><p className="section-caption">Transparent decision-support score · not an official government decision</p></div><PriorityBadge level={priority.level} /></div>
          <div className="priority-score-display"><strong>{priority.score}<span>/100</span></strong><span className="priority-score-label">Recommended priority</span></div>
          <div className="priority-meter" role="img" aria-label={`Priority score ${priority.score} out of 100`}><span style={{ width: `${priority.score}%` }} /></div>
          <p className="priority-reason"><strong>Reason:</strong> {priority.reason}</p>
          <div className="priority-breakdown">{priorityFactors.map((factor) => <div className="priority-factor" key={factor.label}><div><strong>{factor.label}</strong><span>{factor.explanation}</span></div><b>+{factor.points}</b></div>)}</div>
          <p className="footer-note">The responsible officer reviews the evidence and makes the final decision.</p>
        </Card>

        <Card className="card-pad">
          <div className="section-heading"><div><span className="section-index">06</span><h2 className="section-title">Recommended action</h2><p className="section-caption">AI recommendation</p></div><span className="recommendation-icon"><Bot size={16} /></span></div>
          <div className="recommendation"><span className="recommendation-icon"><CheckCircle2 size={16} /></span><div><p className="recommendation-title">AI RECOMMENDATION</p><p className="recommendation-copy">{issue.recommendedAction}</p></div></div>
          <div className="human-approval-note"><ClipboardCheck size={14} /><span>Human officer approval required. No action is automatically assigned or scheduled.</span></div>
        </Card>

        <Card className="card-pad">
          <div className="section-heading"><div><span className="section-index">07</span><h2 className="section-title">Officer actions</h2><p className="section-caption">Review this recommendation and decide what happens next</p></div></div>
          <div className="detail-actions issue-action-buttons">
            <Button variant="secondary" icon={<ClipboardCheck size={14} />} onClick={() => reportsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Review</Button>
            {canPlanAction && <Link className="button button-secondary" to={`/action-center?issue=${encodeURIComponent(issue.id)}`}><UserPlus size={14} /> Assign</Link>}
            {canPlanAction && <Link className="button button-secondary" to={`/action-center?issue=${encodeURIComponent(issue.id)}`}><CalendarDays size={14} /> Schedule Action</Link>}
          </div>
        </Card>
      </div>
      <aside className="detail-aside">
        <Card className="card-pad"><h2 className="section-title">Issue details</h2><div className="activity-list" style={{ marginTop: 15 }}><div className="activity-copy">Location<strong style={{ display: 'block', marginTop: 4 }}>{issue.location}</strong></div><div className="activity-copy">Suggested department<strong style={{ display: 'block', marginTop: 4 }}>{issue.suggestedDepartment}</strong></div><div className="activity-copy">Evidence items<strong style={{ display: 'block', marginTop: 4 }}>{issue.evidenceCount}</strong></div><div className="activity-copy">Demo status<strong style={{ display: 'block', marginTop: 4 }}>{issue.status}</strong><span className="activity-time">Status has not been independently verified.</span></div></div></Card>
        <Link to="/issues" className="button button-secondary" style={{ justifyContent: 'space-between' }}>All issue clusters <ArrowRight size={14} /></Link>
      </aside>
    </div>
    {modalAction && <Modal title={modalDetails[modalAction].title} description={modalDetails[modalAction].description} onClose={closeModal}>
      {modalAction === 'brief' && <div className="action-brief-modal">
        <article className="action-brief-print">
          <header className="action-brief-masthead"><span>CIVICFLOW ACTION BRIEF</span><small>Decision-support document · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</small></header>
          <div className="action-brief-overview"><div><span>ISSUE</span><strong>{issue.title}</strong></div><div><span>AREA</span><strong>{issue.location} · Ward {issue.ward}</strong></div><div><span>REPORTS</span><strong>{issue.reportCount.toLocaleString()}</strong></div><div><span>TREND</span><strong>{trendBrief}</strong></div><div><span>POTENTIAL IMPACT</span><strong>{issue.affectedHouseholdsEstimate ? `About ${issue.affectedHouseholdsEstimate.toLocaleString()} households` : 'Household estimate unavailable'}</strong></div><div><span>PRIORITY</span><strong>{priority.level} · {priority.score}/100</strong></div></div>
          <div className="action-brief-evidence"><span>EVIDENCE</span><strong>{photoReportCount} photos</strong><strong>{voiceReportCount} voice reports</strong><strong>{textReportCount} text reports</strong></div>
          <section className="brief-section"><h3>ISSUE SUMMARY · AI GENERATED</h3><p>{issue.aiSummary}</p></section>
          <section className="brief-section"><h3>WHY THIS PRIORITY</h3><p>{priority.reason}</p><div className="brief-priority-factors">{priorityFactors.map((factor) => <div key={factor.label}><span>{factor.label}</span><strong>+{factor.points}</strong><small>{factor.explanation}</small></div>)}</div></section>
          <section className="brief-section brief-ai-recommendation"><h3>AI RECOMMENDATION · NOT OFFICER APPROVED</h3><p>{issue.recommendedAction}</p></section>
          <section className="brief-section brief-approved-information"><h3>OFFICER-APPROVED INFORMATION</h3>{action?.actionPlanApproved && action.approvedActionPlan ? <><p>{action.approvedActionPlan}</p><small>{action.department}{action.fieldOfficer ? ` · ${action.fieldOfficer}` : ''}</small></> : <p>No action plan has been approved by an officer yet.</p>}</section>
          <div className="action-brief-bottom-grid"><section className="brief-section"><h3>OFFICER DECISION</h3><textarea aria-label="Officer decision for action brief" className="action-brief-decision" value={officerDecision} onChange={(event) => { setOfficerDecision(event.target.value); setDecisionSaved(false) }} placeholder="Record the officer’s decision or next step." maxLength={400} /></section><div className="brief-data-list"><div><span>EXPECTED ACTION DATE</span><strong>{actionDate}{action?.expectedTimeWindow ? ` · ${action.expectedTimeWindow}` : ''}</strong></div><div><span>CITIZEN PREPARATION</span><strong>{action?.preparationInstructions ?? 'Instructions pending officer action plan.'}</strong></div><div><span>STATUS</span><strong>{actionStatus}</strong></div></div></div>
          <footer className="action-brief-footer">CivicFlow recommendations are decision support. Expected dates are not guarantees. Completing an action does not automatically resolve an issue.</footer>
        </article>
        <div className="action-brief-controls"><Button variant="secondary" disabled={!action || decisionSaved} onClick={() => { if (action && saveOfficerDecision(action.id, officerDecision)) setDecisionSaved(true) }}>Save officer decision</Button>{decisionSaved && officerDecision && <span>Decision saved</span>}<Button icon={<Printer size={14} />} onClick={() => window.print()}>Print / Save as PDF</Button></div>
      </div>}
      <Button variant="secondary" style={{ width: '100%', marginTop: 16 }} onClick={closeModal}>Close</Button>
    </Modal>}
  </>
}