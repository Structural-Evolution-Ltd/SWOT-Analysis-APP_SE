import { useProject } from '../context/ProjectContext'
import { SWOT_OPTIONS } from '../constants'

export default function BriefPage() {
  const { state, dispatch, suggestCriteria, summaryByCategory } = useProject()

  const totalSuggested = summaryByCategory.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>1. Project Brief / Scope</h2>
        <p>Paste project scope. Click the button to match and apply relevant criteria automatically.</p>
      </div>

      <textarea
        value={state.briefText}
        onChange={(e) => dispatch({ type: 'set', patch: { briefText: e.target.value } })}
        placeholder="Paste project scope or brief. Include logistics, transport, client goals, and site conditions."
        rows={8}
      />

      <div className="row-actions">
        <button onClick={suggestCriteria}>Suggest &amp; Apply Criteria from Scope</button>
      </div>

      {totalSuggested > 0 && (
        <div className="suggestion-grid">
          {summaryByCategory.map((item) => (
            <div key={item.category} className="badge-card">
              <strong>{item.category}</strong>
              <span>{item.count} matched criteria</span>
            </div>
          ))}
        </div>
      )}

      {totalSuggested > 0 && (
        <details className="detail-block">
          <summary>Review matched criteria details</summary>
          <div className="suggestion-list-grid">
            {SWOT_OPTIONS.map((category) => (
              <div key={category} className="suggestion-list-card">
                <h4>{category} Criteria</h4>
                {(state.suggested[category] ?? []).length === 0 && (
                  <p className="muted">No matches.</p>
                )}
                {(state.suggested[category] ?? []).map((item) => (
                  <div key={`${category}-${item.id}`} className="suggestion-item">
                    <span>{item.title}</span>
                    <small>Weight {item.default_weight}</small>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  )
}
