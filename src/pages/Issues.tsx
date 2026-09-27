import { ArrowDown, ArrowRight, ArrowUp, MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageHeader, PriorityBadge, StatusBadge } from '../components/ui'
import { getIssueClusters } from '../data/repository'

export function Issues() {
  const [priority, setPriority] = useState('All priorities')
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All statuses')
  const [ward, setWard] = useState('All wards')
  const [query, setQuery] = useState('')
  const issueClusters = getIssueClusters()
  const categories = [...new Set(issueClusters.map((issue) => issue.category))]
  const wards = [...new Set(issueClusters.map((issue) => issue.ward))].sort((a, b) => a - b)
  const filteredIssues = issueClusters.filter((issue) =>
    (priority === 'All priorities' || issue.priorityLevel === priority) &&
    (category === 'All categories' || issue.category === category) &&
    (status === 'All statuses' || issue.status === status) &&
    (ward === 'All wards' || String(issue.ward) === ward) &&
    `${issue.title} ${issue.location} ${issue.suggestedDepartment}`.toLowerCase().includes(query.toLowerCase()),
  )

  return <>
    <PageHeader eyebrow={<><MapPin size={13} /> Constituency intelligence</>} title="Issue clusters" description="Related reports grouped into issues for clearer follow-up." action={<span className="badge status-needs-review">{issueClusters.length} issue clusters</span>} />
    <Card className="filter-bar">
      <label className="filter-select" style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid #dfe6de', borderRadius: 8, background: '#fff' }}><Search size={13} color="#87938a" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search issues" aria-label="Search issues" style={{ width: 120, border: 0, outline: 0, fontSize: 11 }} /></label>
      <select className="filter-select" aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option>All priorities</option>{['Critical', 'High', 'Medium', 'Low'].map((value) => <option key={value}>{value}</option>)}</select>
      <select className="filter-select" aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select>
      <select className="filter-select" aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{['Needs review', 'Action planned', 'In progress', 'Resolved'].map((value) => <option key={value}>{value}</option>)}</select>
      <select className="filter-select" aria-label="Filter by ward" value={ward} onChange={(event) => setWard(event.target.value)}><option>All wards</option>{wards.map((value) => <option key={value} value={value}>Ward {value}</option>)}</select>
    </Card>
    <Card className="card-pad" style={{ padding: 10 }}>{filteredIssues.length ? <div className="table-wrap"><table className="issue-table"><thead><tr><th>Issue cluster</th><th>Reports</th><th>Priority</th><th>Status</th><th>Trend</th><th>Suggested department</th><th></th></tr></thead><tbody>{filteredIssues.map((issue) => <tr key={issue.id}><td><Link to={`/issues/${issue.id}`}><div className="issue-name">{issue.title}</div><div className="issue-meta"><MapPin size={11} /> Ward {issue.ward} · {issue.location}</div></Link></td><td><strong style={{ color: '#17241f' }}>{issue.reportCount}</strong></td><td><PriorityBadge level={issue.priorityLevel} /></td><td><StatusBadge status={issue.status} /></td><td>{issue.trend === 'Rising' ? <span className="trend-up"><ArrowUp size={12} /> Rising</span> : issue.trend === 'Falling' ? <span className="trend-down"><ArrowDown size={12} /> Falling</span> : <span className="trend-stable">Stable</span>}</td><td>{issue.suggestedDepartment}</td><td><Link to={`/issues/${issue.id}`} aria-label={`Open ${issue.title}`}><ArrowRight size={15} color="#758278" /></Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-state-icon"><Search size={18} /></div><h3>No matching issue clusters</h3><p>Try changing or clearing one of the filters.</p><button className="button button-secondary button-small" onClick={() => { setPriority('All priorities'); setCategory('All categories'); setStatus('All statuses'); setWard('All wards'); setQuery('') }}>Clear filters</button></div>}</Card>
    <p className="footer-note">Counts and groupings are illustrative demo data. Priority levels are not official decisions.</p>
  </>
}