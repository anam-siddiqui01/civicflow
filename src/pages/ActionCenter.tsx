import { ArrowRight, CalendarDays, ClipboardCheck, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, PageHeader, StatusBadge } from '../components/ui'
import { actions, issueClusters } from '../data/mockData'

export function ActionCenter() {
  return <>
    <PageHeader eyebrow={<><ClipboardCheck size={13} /> Officer workspace</>} title="Action center" description="A placeholder view of proposed and confirmed follow-up actions." action={<span className="badge status-needs-review">{actions.length} demo actions</span>} />
    <div className="action-list">{actions.map((action) => {
      const issue = issueClusters.find((item) => item.id === action.issueId)
      if (!issue) return null
      return <Card className="action-row" key={action.id}><div><div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 9 }}><h2 className="section-title">{issue.title}</h2><StatusBadge status={action.status} /></div><p className="section-caption"><MapPin size={11} style={{ verticalAlign: 'middle' }} /> Ward {issue.ward} · {issue.location} · {issue.reportCount} related reports</p><div className="body-copy" style={{ marginTop: 10 }}><CalendarDays size={13} style={{ verticalAlign: 'middle' }} /> {new Date(`${action.expectedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {action.expectedTimeWindow}</div><p className="section-caption" style={{ marginTop: 7 }}>{action.officerNote}</p></div><Link className="button button-secondary button-small" to={`/issues/${issue.id}`}>Review issue <ArrowRight size={13} /></Link></Card>
    })}</div>
    <Card className="card-pad" style={{ marginTop: 18 }}><h2 className="section-title">Action workflow</h2><p className="body-copy" style={{ marginTop: 8 }}>Scheduling, assignment, and citizen notifications are not active yet. Dates are labeled proposed or confirmed in the demo data so expectations stay clear.</p></Card>
  </>
}