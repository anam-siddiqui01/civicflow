import { ArrowLeft, ArrowRight, Bot, CalendarDays, Camera, CheckCircle2, ClipboardCheck, FileText, Languages, MapPin, MessageSquareText, TrendingUp } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, Modal, PageHeader, PriorityBadge, StatusBadge } from '../components/ui'
import { getCitizenReports, getIssueClusters } from '../data/repository'
import { calculatePriority } from '../services/priorityEngine'

export function IssueDetail() {
  const { id } = useParams()
  const [showModal, setShowModal] = useState(false)
  const closeModal = useCallback(() => setShowModal(false), [])
  const intelligenceRef = useRef<HTMLDivElement>(null)
  const issue = getIssueClusters().find((cluster) => cluster.id === id)

  if (!issue) return <Card className="card-pad"><Link to="/issues" className="inline-link"><ArrowLeft size={13} /> Back to clusters</Link><div style={{ paddingTop: 28 }}><h1 className="page-title">Issue not found</h1><p className="page-description">This issue may have been removed from the demo dataset.</p></div></Card>

  const linkedReports = getCitizenReports().filter((report) => report.issueClusterId === issue.id)
  const priority = calculatePriority(issue)
  const languages = [...new Set(linkedReports.map((report) => report.language))].sort()
  const inputTypes = ['Text', 'Voice', 'Photo'].filter((type) => linkedReports.some((report) => report.inputType === type))

  return <>
    <PageHeader eyebrow={<><MapPin size={13} /> Ward {issue.ward} · {issue.category}</>} title={issue.title} description={issue.location} action={<Link className="button button-secondary" to="/issues"><ArrowLeft size={14} /> All issues</Link>} />
    <div className="detail-columns">
      <div className="detail-main">
        <Card className="card-pad">
          <div className="section-heading"><div><h2 className="section-title">Issue overview</h2><p className="section-caption">A shared issue formed from related citizen reports</p></div><StatusBadge status={issue.status} /></div>
          <div className="detail-stat-grid"><div className="detail-stat"><span>Related reports</span><strong>{issue.reportCount}</strong></div><div className="detail-stat"><span>Ward</span><strong>Ward {issue.ward}</strong></div><div className="detail-stat"><span>Report trend</span><strong><TrendingUp size={13} style={{ verticalAlign: 'middle' }} /> {issue.trend}</strong></div></div>
        </Card>

        <Card className="card-pad">
          <div className="section-heading"><div><div className="eyebrow">CivicFlow Priority Recommendation</div><p className="section-caption">Transparent decision support · not an official government priority</p></div><PriorityBadge level={priority.level} /></div>
          <div className="priority-score-display"><strong>{priority.score}<span>/100</span></strong><span className="priority-score-label">Priority recommendation</span></div>
          <h3 className="section-title" style={{ marginTop: 17 }}>Why this priority?</h3>
          <div className="priority-breakdown">{priority.factors.map((factor) => <div className="priority-factor" key={factor.label}><div><strong>{factor.label}</strong><span>{factor.explanation}</span></div><b>+{factor.points}</b></div>)}</div>
          <p className="footer-note">Priority is a CivicFlow recommendation. The responsible officer makes the final decision.</p>
        </Card>

        <Card className="card-pad">
          <div className="section-heading"><div><h2 className="section-title">Issue summary</h2><p className="section-caption">AI-assisted classification · deterministic demo analysis</p></div><span className="recommendation-icon"><Bot size={16} /></span></div>
          <p className="body-copy">{issue.aiSummary}</p>
          <div className="analysis-grid issue-analysis-grid"><div className="analysis-field"><span>Category</span><strong>{issue.id === 'issue-parking-8' ? 'Parking / Traffic' : issue.category}</strong></div><div className="analysis-field"><span>Urgency · severity</span><strong>{issue.urgency} · {issue.severity}</strong></div><div className="analysis-field"><span>Suggested department</span><strong>{issue.suggestedDepartment}</strong></div><div className="analysis-field"><span>Estimated population affected</span><strong>About {issue.affectedPopulationEstimate.toLocaleString()}</strong></div></div>
        </Card>

        <Card className="card-pad" ref={intelligenceRef}>
          <div className="section-heading"><div><h2 className="section-title">Report intelligence</h2><p className="section-caption">Many reports, one underlying issue</p></div><span className="badge status-needs-review"><MessageSquareText size={11} /> {issue.reportCount} related reports</span></div>
          <div className="intelligence-group"><span className="intelligence-label"><Languages size={13} /> Languages</span><div className="intelligence-chips">{languages.map((language) => <Badge key={language} className="status-needs-review">{language}</Badge>)}</div></div>
          <div className="intelligence-group"><span className="intelligence-label"><FileText size={13} /> Input types</span><div className="intelligence-chips">{inputTypes.map((type) => <Badge key={type} className="status-under-review">{type}</Badge>)}</div></div>
          <div className="intelligence-group"><span className="intelligence-label"><Camera size={13} /> Photo count</span><strong>{issue.photoCount} photos on record</strong></div>
          <div className="section-heading" style={{ marginTop: 19, marginBottom: 12 }}><div><h3 className="section-title" style={{ fontSize: 12 }}>Recent related reports</h3><p className="section-caption">Representative reports from this cluster</p></div></div>
          <div className="activity-list">{linkedReports.slice(0, 5).map((report) => <div className="activity-item" key={report.id}>{report.imageUrl ? <img className="report-evidence-thumb" src={report.imageUrl} alt="Photo attached to citizen report" /> : <span className="activity-icon"><FileText size={13} /></span>}<div className="activity-copy">{report.description}<span className="activity-time">{report.id} · {report.language} · {report.inputType} · {report.location}</span></div></div>)}</div>
        </Card>

        <Card className="card-pad">
          <div className="section-heading"><div><h2 className="section-title">Recommended action</h2><p className="section-caption">AI recommended action · officer confirmation required</p></div><span className="recommendation-icon"><Bot size={16} /></span></div>
          <div className="recommendation"><span className="recommendation-icon"><CheckCircle2 size={16} /></span><div><p className="recommendation-title">Suggested next step</p><p className="recommendation-copy">{issue.recommendedAction}</p></div></div>
          <p className="footer-note">CivicFlow recommends. The responsible officer decides whether and how to proceed.</p>
          <div className="detail-actions"><Button variant="secondary" icon={<ClipboardCheck size={14} />} onClick={() => intelligenceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Review issue</Button><Button icon={<CalendarDays size={14} />} onClick={() => setShowModal(true)}>Plan action</Button></div>
        </Card>
      </div>
      <aside className="detail-aside">
        <Card className="card-pad"><h2 className="section-title">Issue details</h2><div className="activity-list" style={{ marginTop: 15 }}><div className="activity-copy">Location<strong style={{ display: 'block', marginTop: 4 }}>{issue.location}</strong></div><div className="activity-copy">Suggested department<strong style={{ display: 'block', marginTop: 4 }}>{issue.suggestedDepartment}</strong></div><div className="activity-copy">Evidence items<strong style={{ display: 'block', marginTop: 4 }}>{issue.evidenceCount}</strong></div></div></Card>
        <Link to="/issues" className="button button-secondary" style={{ justifyContent: 'space-between' }}>All issue clusters <ArrowRight size={14} /></Link>
      </aside>
    </div>
    {showModal && <Modal title="Officer confirmation required" description="Action planning is a later workflow. No action is scheduled or sent from this demo." onClose={closeModal}><div className="notice-box" style={{ marginTop: 18 }}><CalendarDays size={15} /> Review the recommendation and confirm any next step through the responsible office.</div><Button variant="secondary" style={{ width: '100%', marginTop: 17 }} onClick={closeModal}>Close</Button></Modal>}
  </>
}