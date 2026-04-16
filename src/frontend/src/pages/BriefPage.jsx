import { useProject } from '../context/ProjectContext'
import { SWOT_OPTIONS } from '../constants'

export default function BriefPage() {
  const { state, dispatch, suggestCriteria, summaryByCategory } = useProject()

  function onApplySuggestedCriteria() {
    dispatch({ type: 'apply_suggested' })
  }

  const totalSuggested = summaryByCategory.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>1. Project Brief</h2>
        <p>Paste context, generate criteria suggestions, then apply what is relevant.</p>
      </div>

      <textarea
        value={state.briefText}
        onChange={(e) => dispatch({ type: 'set', patch: { briefText: e.target.value } })}
        placeholder="Paste project brief text. Include logistics, transport, client goals, and site conditions."
        rows={8}
      />

      <div className="row-actions">
        <button onClick={suggestCriteria}>Suggest Criteria from Brief</button>
        <button onClick={onApplySuggestedCriteria}>
          Apply Suggested Criteria ({totalSuggested})
        </button>
      </div>

      <div className="suggestion-grid">
        {summaryByCategory.map((item) => (
          <div key={item.category} className="badge-card">
            <strong>{item.category}</strong>
            <span>{item.count} matched criteria</span>
          </div>
        ))}
      </div>

      <details className="detail-block">
        <summary>Review suggested criteria details</summary>
        <div className="suggestion-list-grid">
          {SWOT_OPTIONS.map((category) => (
            <div key={category} className="suggestion-list-card">
              <h4>{category} Suggested Criteria</h4>
              {(state.suggested[category] ?? []).length === 0 && (
                <p className="muted">No suggestions yet.</p>
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
    </section>
  )
}
