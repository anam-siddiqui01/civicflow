import { ArrowLeft, CalendarDays, Check, CircleHelp, Clock3, MapPin, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Card, EmptyState, PageHeader, StatusBadge } from '../components/ui'
import { actions } from '../data/mockData'
import { getCitizenReports, getIssueClusters } from '../data/repository'

export function TrackDetail() {
  const { id } = useParams()
  const report = getCitizenReports().find((item) => item.id === id)
  if (!report) return <><PageHeader eyebrow="Citizen services" title="Report not found" description="Check the reference ID and try again." /><Card><EmptyState title="We couldn't find that report" message="This reference may be from another browser or demo session." action={<Link className="button button-secondary button-small" to="/track"><ArrowLeft size={13} /> Back to reports</Link>} /></Card></>
  const issue = getIssueClusters().find((item) => item.id === report.issueClusterId)
  const action = actions.find((item) => item.issueId === report.issueClusterId)
  const actionDate = action ? new Date(`${action.expectedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'To be determined'
  const confirmed = action?.status === 'Confirmed'
  const submittedDate = new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeline = ['Report submitted', 'Under review', 'Action planned', 'Action completed']
  return <>
    <PageHeader eyebrow={<><MapPin size={13} /> Citizen services{report.ward ? ` · Ward ${report.ward}` : ''}</>} title="Report status" description={`${report.location}${report.ward ? ` · Ward ${report.ward}` : ''}`} action={<Link className="button button-secondary" to="/track"><ArrowLeft size={14} /> All reports</Link>} />
    <div className="detail-columns"><div className="detail-main">
      <Card className="card-pad"><div className="detail-title-row"><div><div className="track-ref">REFERENCE · {report.id}</div><h2 className="section-title" style={{ marginTop: 8 }}>{issue?.title ?? report.category}</h2><p className="section-caption">Submitted {submittedDate}</p></div><StatusBadge status={report.status} /></div><p className="body-copy" style={{ marginTop: 14 }}>{report.description}</p><div className="detail-location"><MapPin size={13} /> {report.location}{report.ward ? ` · Ward ${report.ward}` : ''}</div>{report.imageUrl && <img className="report-evidence-thumb" style={{ marginTop: 12 }} src={report.imageUrl} alt="Evidence attached to this report" />}</Card>
      <Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Tracking timeline</h2><p className="section-caption">Only submission is complete at this stage</p></div><Clock3 size={15} color="#87938a" /></div><div className="timeline">{timeline.map((step, index) => <div className="timeline-item" key={step}><div className="timeline-rail"><span className={`timeline-dot ${index === 0 ? 'done' : ''}`} />{index < timeline.length - 1 && <span className="timeline-line" />}</div><div className="timeline-copy"><strong>{step}</strong><p>{index === 0 ? `${submittedDate} · Reference created` : 'Pending officer review and update'}</p></div></div>)}</div></Card>
    </div><aside className="detail-aside"><Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Expected action</h2><p className="section-caption">Not a guaranteed government decision</p></div><CalendarDays size={16} color="#748179" /></div><div className="placeholder-panel"><strong>{action ? (confirmed ? 'Officer-confirmed visit' : 'Proposed visit') : 'Timing not available yet'}</strong><p>{action ? `${actionDate} · ${action.expectedTimeWindow}` : 'An expected date will appear when a next step is proposed.'}</p></div><div className="notice-box" style={{ marginTop: 12 }}><CircleHelp size={14} /> {confirmed ? 'This date was confirmed by the demo office, but may still change.' : 'Any timing shown is expected only until an officer confirms it.'}</div></Card>
      <Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Preparation</h2><p className="section-caption">How you can help</p></div><ShieldCheck size={16} color="#748179" /></div><div className="placeholder-panel"><strong>Before the next step</strong><p>{action?.preparationInstructions ?? 'No preparation is needed right now. Check back for updates from the constituency office.'}</p></div></Card>
      <Card className="card-pad"><div className="eyebrow"><Check size={13} /> Your reference</div><p className="body-copy" style={{ margin: '9px 0 0' }}>Keep <strong>{report.id}</strong> handy when checking on this issue. Updates shown here are part of the CivicFlow demo.</p></Card></aside></div>
  </>
}