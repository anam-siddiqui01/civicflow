import { ArrowRight, ClipboardList, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, EmptyState, PageHeader, StatusBadge } from '../components/ui'
import { getCitizenReports, getIssueActions, getIssueClusters } from '../data/repository'

export function TrackList() {
  const reports = getCitizenReports().sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const clusters = getIssueClusters()
  const actionsByIssue = new Map(getIssueActions().map((action) => [action.issueId, action]))
  return <>
    <PageHeader eyebrow={<><ClipboardList size={13} /> Citizen services</>} title="Your reports" description="Check the latest status for reports in this demo workspace." action={<Link to="/report" className="button button-primary">Report an issue <ArrowRight size={14} /></Link>} />
    <div className="track-list">{reports.length ? reports.map((report) => {
      const issue = clusters.find((cluster) => cluster.id === report.issueClusterId)
      const action = report.issueClusterId ? actionsByIssue.get(report.issueClusterId) : undefined
      const status = action?.workflowStage === 'COMPLETED' ? 'Action completed' : report.status
      const submittedDate = new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return <Link to={`/track/${report.id}`} className="card track-item" key={report.id}><div><div className="track-ref">REFERENCE · {report.id}</div><div className="track-title">{issue?.title ?? report.category}</div><div className="track-sub"><MapPin size={11} style={{ verticalAlign: 'middle' }} /> {report.location}{report.ward ? ` · Ward ${report.ward}` : ''}</div><div className="track-sub" style={{ marginTop: 5 }}>Submitted {submittedDate}</div></div><div className="track-right"><StatusBadge status={status} /><ArrowRight size={14} color="#89958c" /></div></Link>
    }) : <Card><EmptyState title="No reports yet" message="Submit your first report to see its reference and status here." action={<Link className="button button-primary button-small" to="/report">Submit a report</Link>} /></Card>}</div>
    <p className="footer-note">Demo reports are local to this browser. Status updates are illustrative and not official government commitments.</p>
  </>
}