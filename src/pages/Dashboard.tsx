import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Camera, CheckCircle2, Clock3, FileText, MapPin, Minus, RotateCcw, ShieldAlert, TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageHeader, PriorityBadge, StatusBadge } from '../components/ui'
import { getCitizenNotifications, getIssueActions, getIssueClusters } from '../data/repository'
import { calculatePriority } from '../services/priorityEngine'

const chartHeights = [38, 51, 45, 69, 57, 82, 67]

export function Dashboard() {
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [wardFilter, setWardFilter] = useState('All wards')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const clusters = getIssueClusters()
  const notifications = getCitizenNotifications()
  const conflictCount = getIssueActions().filter((action) => action.citizenConflict).length
  const assessedClusters = clusters.map((issue) => ({ issue, recommendation: calculatePriority(issue) }))
  const totalReports = clusters.reduce((total, issue) => total + issue.reportCount, 0)
  const activeIssues = clusters.filter((issue) => issue.status !== 'Resolved').length
  const highPriorityCount = assessedClusters.filter(({ recommendation }) => recommendation.level === 'Critical' || recommendation.level === 'High').length
  const resolvedIssues = clusters.filter((issue) => issue.status === 'Resolved').length
  const categories = [...new Set(clusters.map((issue) => issue.category))].sort()
  const wards = [...new Set(clusters.map((issue) => issue.ward))].sort((left, right) => left - right)
  const filteredIssues = assessedClusters
    .filter(({ issue, recommendation }) =>
      (priorityFilter === 'All priorities' || recommendation.level === priorityFilter) &&
      (categoryFilter === 'All categories' || issue.category === categoryFilter) &&
      (wardFilter === 'All wards' || String(issue.ward) === wardFilter) &&
      (statusFilter === 'All statuses' || issue.status === statusFilter),
    )
    .sort((left, right) => right.recommendation.score - left.recommendation.score)
  const clearFilters = () => {
    setPriorityFilter('All priorities')
    setCategoryFilter('All categories')
    setWardFilter('All wards')
    setStatusFilter('All statuses')
  }
  const hasFilters = priorityFilter !== 'All priorities' || categoryFilter !== 'All categories' || wardFilter !== 'All wards' || statusFilter !== 'All statuses'
    const stats: Array<{
    label: string
    value: string
    note: string
    icon: typeof FileText
    positive?: boolean
    alert?: boolean
  }> = [
    { label: 'Total reports', value: totalReports.toLocaleString(), note: 'Across issue clusters', icon: FileText },
    { label: 'Active issue clusters', value: String(activeIssues), note: 'Underlying issues, not individual reports', icon: Activity },
    { label: 'Critical / High priority', value: String(highPriorityCount), note: 'CivicFlow recommendations', icon: ShieldAlert, alert: true },
    { label: 'Resolved issues', value: String(resolvedIssues), note: 'Marked resolved in demo data', icon: CheckCircle2 },
  ]
  return <>
    <PageHeader eyebrow={<><MapPin size={13} /> North District · Constituency overview</>} title="Officer intelligence" description="See what is happening, where it is concentrated, and what may need attention next." action={<button className="button button-secondary" onClick={() => window.print()}><FileText size={15} /> Export overview</button>} />
    <section className="stat-grid" aria-label="Constituency metrics">{stats.map(({ label, value, note, icon: Icon, positive, alert }) => <Card key={label} className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon" style={alert ? { background: '#fff0e8', color: '#bd6340' } : undefined}><Icon size={16} /></span></div><div className="stat-value">{value}</div><div className={`stat-foot ${positive ? 'positive' : ''}`}>{positive && <ArrowUpRight size={12} />}{note}</div></Card>)}</section>
    <div className="cluster-insight"><span className="cluster-insight-icon"><Activity size={17} /></span><div><strong>{totalReports.toLocaleString()} citizen reports</strong><span>organized into</span><strong>{clusters.length} underlying issues</strong></div><p>Related reports are grouped by issue and locality to help teams focus on shared problems.</p></div>
    {conflictCount > 0 && <Link className="officer-conflict-banner" to="/action-center"><TriangleAlert size={17} /><span><strong>Citizen scheduling conflict reported.</strong><small>{conflictCount} expected visit{conflictCount === 1 ? '' : 's'} need officer review.</small></span><ArrowRight size={15} /></Link>}
    <div className="dashboard-grid">
      <section className="cluster-section" aria-labelledby="priority-issues-title">
        <div className="section-heading"><div><h2 id="priority-issues-title" className="section-title">Priority Issues</h2><p className="section-caption">Underlying issues ranked by transparent priority recommendation</p></div><Link className="inline-link" to="/issues">All clusters <ArrowRight size={12} style={{ verticalAlign: 'middle' }} /></Link></div>
        <div className="filter-bar dashboard-filters" aria-label="Filter issue clusters">
          <select className="filter-select" aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option>{['Critical', 'High', 'Medium', 'Low'].map((level) => <option key={level}>{level}</option>)}</select>
          <select className="filter-select" aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <select className="filter-select" aria-label="Filter by ward" value={wardFilter} onChange={(event) => setWardFilter(event.target.value)}><option>All wards</option>{wards.map((ward) => <option key={ward} value={ward}>Ward {ward}</option>)}</select>
          <select className="filter-select" aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option>{['Needs review', 'Action planned', 'In progress', 'Resolved'].map((status) => <option key={status}>{status}</option>)}</select>
          {hasFilters && <button className="button button-quiet button-small" onClick={clearFilters}><RotateCcw size={13} /> Clear</button>}
        </div>
        <div className="cluster-results-count">Showing {filteredIssues.length} of {clusters.length} issue clusters</div>
        <div className="cluster-list">{filteredIssues.length ? filteredIssues.map(({ issue, recommendation }) => <Card className="issue-card" key={issue.id}>
          <div className="issue-card-heading"><div><span className="issue-category">{issue.category}</span><h3 className="issue-card-title">{issue.title} <span>· Ward {issue.ward}</span></h3><p className="issue-card-location"><MapPin size={12} /> {issue.location}</p></div><div className="issue-priority"><PriorityBadge level={recommendation.level} /><strong>{recommendation.score}<span>/100</span></strong></div></div>
          <div className="issue-card-metrics"><div><strong>{issue.reportCount.toLocaleString()}</strong><span>related reports</span></div><div className={`issue-trend issue-trend-${issue.trend.toLowerCase()}`}>{issue.trend === 'Rising' ? <TrendingUp size={14} /> : issue.trend === 'Falling' ? <TrendingDown size={14} /> : <Minus size={14} />}<strong>{issue.trend}</strong><span>report trend</span></div><div><strong><Camera size={13} /> {issue.photoCount}</strong><span>photos · {issue.evidenceCount} evidence</span></div><div><StatusBadge status={issue.status} /></div></div>
          <p className="issue-priority-reason"><strong>Why:</strong> {recommendation.reason}</p>
          <div className="issue-card-response"><div><span>Suggested department</span><strong>{issue.suggestedDepartment}</strong></div><div className="issue-next-action"><span>Recommended next step</span><p>{issue.recommendedAction}</p></div><Link className="button button-secondary button-small" to={`/issues/${issue.id}`}>Review issue <ArrowRight size={13} /></Link></div>
        </Card>) : <div className="empty-state"><div className="empty-state-icon"><ShieldAlert size={18} /></div><h3>No matching issue clusters</h3><p>Try clearing one or more filters to see other issues.</p><button className="button button-secondary button-small" onClick={clearFilters}>Clear filters</button></div>}</div>
        <p className="footer-note">Priority levels are decision-support recommendations, not official government decisions.</p>
      </section>
      <aside className="dashboard-side">
        <Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Report activity</h2><p className="section-caption">New reports · last 7 days</p></div><span className="badge status-in-progress"><TrendingUp size={11} /> +12.8%</span></div><div className="chart-total"><strong>{totalReports.toLocaleString()}</strong><span>reports in total</span></div><div className="bar-chart" role="img" aria-label="Illustrative report activity trend over the last seven days">{chartHeights.map((height, index) => <div className="bar-column" key={index}><div className={`bar ${index === chartHeights.length - 1 ? 'active' : ''}`} style={{ height: `${height}%` }} /></div>)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></Card>
        <Card className="card-pad"><div className="section-heading"><div><h2 className="section-title">Recent activity</h2><p className="section-caption">Latest constituency updates</p></div><Clock3 size={15} color="#8b978e" /></div><div className="activity-list">{notifications.slice(0, 4).map((notice) => <div className="activity-item" key={notice.id}><span className="activity-icon"><CheckCircle2 size={14} /></span><div className="activity-copy"><strong>{notice.title}</strong><br />{notice.message}<span className="activity-time">{notice.createdAt.slice(0, 10)} · {notice.citizenReportId}</span></div></div>)}</div></Card>
        <Card className="card-pad decision-note"><div className="eyebrow"><ShieldAlert size={13} /> Decision support</div><h2 className="section-title">People first, with context.</h2><p>Priority indicators help teams focus attention. Officers make final decisions.</p><Link to="/issues" className="inline-link">Review all issue clusters <ArrowDownRight size={13} style={{ verticalAlign: 'middle' }} /></Link></Card>
      </aside>
    </div>
  </>
}