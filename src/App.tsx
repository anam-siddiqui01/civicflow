import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ActionCenter } from './pages/ActionCenter'
import { CitizenReportPage } from './pages/CitizenReport'
import { Dashboard } from './pages/Dashboard'
import { IssueDetail } from './pages/IssueDetail'
import { Issues } from './pages/Issues'
import { TrackDetail } from './pages/TrackDetail'
import { TrackList } from './pages/TrackList'

function App() {
  return <BrowserRouter><AppShell><Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/report" element={<CitizenReportPage />} />
    <Route path="/track" element={<TrackList />} />
    <Route path="/track/:id" element={<TrackDetail />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/issues" element={<Issues />} />
    <Route path="/issues/:id" element={<IssueDetail />} />
    <Route path="/action-center" element={<ActionCenter />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></AppShell></BrowserRouter>
}

export default App