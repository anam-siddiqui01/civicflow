import { Activity, Bell, ClipboardList, LayoutDashboard, MapPinned, MessageSquareText, Waves } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

const officerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/issues', label: 'Issue clusters', icon: MapPinned },
  { to: '/action-center', label: 'Action center', icon: ClipboardList },
]
const citizenLinks = [
  { to: '/report', label: 'Report an issue', icon: MessageSquareText },
  { to: '/track', label: 'Track a report', icon: Activity },
]

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const citizenMode = location.pathname.startsWith('/report') || location.pathname.startsWith('/track')

  return <div className="app-root">
    <header className="topbar">
      <NavLink to="/dashboard" className="brand" aria-label="CivicFlow dashboard"><span className="brand-mark"><Waves size={20} strokeWidth={2.4} /></span><span><span className="brand-name">CivicFlow</span><span className="brand-tagline">Making civic action flow.</span></span></NavLink>
      <div className="topbar-right"><span className="demo-label"><i className="demo-dot" /> Demo workspace</span><div className="role-switch" aria-label="Switch demo experience"><button className={`role-link ${citizenMode ? 'active' : ''}`} onClick={() => navigate('/report')}><MessageSquareText size={14} /> Citizen</button><button className={`role-link ${!citizenMode ? 'active' : ''}`} onClick={() => navigate('/dashboard')}><LayoutDashboard size={14} /> Officer</button></div>{!citizenMode && <Link className="icon-button" to="/action-center" aria-label="Open action alerts" title="Action alerts"><Bell size={16} /></Link>}<span className="avatar" aria-label="Demo officer">CF</span></div>
    </header>
    <div className={`workspace ${citizenMode ? 'citizen' : 'officer'}`}>
      {!citizenMode && <aside className="officer-sidebar"><div className="sidebar-kicker">Constituency office</div><nav className="side-nav" aria-label="Officer navigation">{officerLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={16} /><span>{label}</span></NavLink>)}</nav><div className="sidebar-bottom"><span className="sidebar-bubble"><Activity size={13} /> CivicFlow pilot</span><strong>North District</strong><p>Demo data for constituency issue coordination.</p></div></aside>}
      {citizenMode && <nav className="citizen-nav" aria-label="Citizen navigation">{citizenLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/track'} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={15} /><span>{label}</span></NavLink>)}</nav>}
      <main className="page-content">{children}</main>
    </div>
  </div>
}