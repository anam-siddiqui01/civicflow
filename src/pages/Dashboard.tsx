import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, Clock3, FileText, MapPin, ShieldAlert, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, PageHeader, PriorityBadge } from '../components/ui'
import { citizenNotifications } from '../data/mockData'
import { getIssueClusters } from '../data/repository'
import { calculatePriority } from '../services/priorityEngine'

const chartHeights = [38, 51, 45, 69, 57, 82, 67]

export function Dashboard() {
  const clusters = getIssueClusters()
  const assessedClusters = clusters.map((issue) => ({ issue, recommendation: calculatePriority(issue) }))
  const totalReports = clusters.reduce((total, issue) => total + issue.reportCount, 0)
  const activeIssues = clusters.filter((issue) => issue.status !== 'Resolved').length
  const highPriorityCount = assessedClusters.filter(({ recommendation }) => recommendation.level === 'Critical' || recommendation.level === 'High').length
  const resolvedIssues = clusters.filter((issue) => issue.status === 'Resolved').length
  const stats = [
    { label: 'Total reports', value: totalReports.toLocaleString(), note: 'Across issue clusters', icon: FileText },
    { label: 'Active issues', value: String(activeIssues), note: 'Awaiting or coordinating follow-up', icon: Activity },
    { label: 'High/Critical issues', value: String(highPriorityCount), note: 'CivicFlow recommendations', icon: ShieldAlert, alert: true },
    { label: 'Resolved issues', value: String(resolvedIssues), note: 'Marked resolved in demo data', icon: CheckCircle2 },
  ]
  const dashboardOrder = ['issue-water-12', 'issue-parking-8', 'issue-garbage-7', 'issue-road-4']
  const priorityIssues = dashboardOrder.flatMap((id) => assessedClusters.filter(({ issue, recommendation }) => issue.id === id && (recommendation.level === 'Critical' || recommendation.level === 'High')))
  return <>
    <PageHeader eyebrow={<><MapPin size={13} /> North District · Constituency overview</>} title="Good morning, Officer" description="Here’s what residents are raising across your constituency." action={<button className="button button-secondary" onClick={() => window.print()}><FileText size={15} /> Export overview</button>} />
    <section className="stat-grid" aria-label="Constituency metrics">{stats.map(({ label, value, note, icon: Icon, positive, alert }) => <Card key={label} className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon" style={alert ? { background: '#fff0e8', color: '#bd6340' } : undefined}><Icon size={16} /></span></div><div className="stat-value">{value}</div><div className={`stat-foot ${positive ? 'positive' : ''}`}>{positive && <ArrowUpRight size={12} />}{note}</div></Card>)}</section>
    <div className="dashboard-grid">
      <Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Priority Issues</h2><p className="section-caption">Clusters needing officer attention</p></div><Link className="inline-link" to="/issues">View all <ArrowRight size={12} style={{ verticalAlign: 'middle' }} /></Link></div><div className="priority-list">{priorityIssues.map(({ issue, recommendation }) => <Link className="priority-row" key={issue.id} to={`/issues/${issue.id}`}><div><div className="issue-name">{issue.title}</div><div className="issue-meta"><MapPin size={11} /> Ward {issue.ward} <span>·</span> {issue.trend} trend · {issue.evidenceCount} evidence items</div><div className="issue-meta">{issue.suggestedDepartment}</div></div><div className="report-count">{issue.reportCount}<span>reports</span></div><div className="row-arrow"><PriorityBadge level={recommendation.level} /><span className="priority-score-mini">{recommendation.score}</span><ArrowRight size={14} style={{ marginLeft: 5, verticalAlign: 'middle' }} /></div></Link>)}</div></Card>
      <Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Report activity</h2><p className="section-caption">New reports · last 7 days</p></div><span className="badge status-in-progress"><TrendingUp size={11} /> +12.8%</span></div><div className="chart-total"><strong>{totalReports.toLocaleString()}</strong><span>reports in total</span></div><div className="bar-chart" role="img" aria-label="Report activity increased this week">{chartHeights.map((height, index) => <div className="bar-column" key={index}><div className={`bar ${index === chartHeights.length - 1 ? 'active' : ''}`} style={{ height: `${height}%` }} /></div>)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></Card>
      <Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Recent activity</h2><p className="section-caption">Latest constituency updates</p></div><Clock3 size={15} color="#8b978e" /></div><div className="activity-list">{citizenNotifications.map((notice) => <div className="activity-item" key={notice.id}><span className="activity-icon"><CheckCircle2 size={14} /></span><div className="activity-copy"><strong>{notice.title}</strong><br />{notice.message}<span className="activity-time">{notice.createdAt.slice(0, 10)} · {notice.citizenReportId}</span></div></div>)}</div></Card>
      <Card className="card-pad" style={{ background: '#e8f1e5', borderColor: '#d8e6d5' }}><div className="eyebrow"><ShieldAlert size={13} /> Prioritization note</div><h2 className="section-title" style={{ marginTop: 10 }}>People first, with context.</h2><p className="body-copy" style={{ margin: '9px 0 15px' }}>Priority indicators help your team focus attention. They are decision support, not a substitute for officer review.</p><Link to="/issues" className="inline-link">Review issue clusters <ArrowDownRight size={13} style={{ verticalAlign: 'middle' }} /></Link></Card>
    </div>
  </>
}