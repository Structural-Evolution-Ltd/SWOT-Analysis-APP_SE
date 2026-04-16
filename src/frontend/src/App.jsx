import { Navigate, Route, Routes } from 'react-router-dom'

import StepNav from './components/StepNav'
import { ProjectProvider, useProject } from './context/ProjectContext'
import BriefPage from './pages/BriefPage'
import ConstraintsPage from './pages/ConstraintsPage'
import CriteriaPage from './pages/CriteriaPage'
import LibraryPage from './pages/LibraryPage'
import RunPage from './pages/RunPage'
import ScoringPage from './pages/ScoringPage'
import WeightsPage from './pages/WeightsPage'
import './styles/app.css'

function AppHeader() {
  const { state, selectedAdditionalCount, saveProject, loadProject } = useProject()

  return (
    <header className="page-header">
      <h1>Weighted SWOT + MCDA Decision Studio</h1>
      <p>FRP bridge and product suitability with risk-adjusted scoring.</p>
      <StepNav />
      <div className="workflow-strip">
        <span>Criteria: {state.templates.length}</span>
        <span>Extra enabled: {selectedAdditionalCount}</span>
        <span>Options: {state.options.length}</span>
        <span>Status: {state.result.ranking.length ? 'Analysed' : 'Not run'}</span>
      </div>
      <div className="row-actions">
        <button onClick={saveProject}>Save Project</button>
        <button className="button-secondary" onClick={loadProject}>
          Open Project
        </button>
        {state.projectStatusMessage && (
          <span className="status-text">{state.projectStatusMessage}</span>
        )}
      </div>
    </header>
  )
}

function ApiErrorBanner() {
  const { state, dispatch } = useProject()
  if (!state.apiError) return null
  return (
    <div
      style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: 6,
        padding: '10px 16px',
        margin: '12px 0',
        color: '#856404',
      }}
    >
      ?? {state.apiError}
      <button
        onClick={() => dispatch({ type: 'set', patch: { apiError: '' } })}
        style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
      >
        ?
      </button>
    </div>
  )
}

export default function App() {
  return (
    <ProjectProvider>
      <div className="app-shell">
        <AppHeader />
        <ApiErrorBanner />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/brief" replace />} />
            <Route path="/brief" element={<BriefPage />} />
            <Route path="/criteria" element={<CriteriaPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/constraints" element={<ConstraintsPage />} />
            <Route path="/weights" element={<WeightsPage />} />
            <Route path="/scoring" element={<ScoringPage />} />
            <Route path="/run" element={<RunPage />} />
          </Routes>
        </main>
      </div>
    </ProjectProvider>
  )
}
