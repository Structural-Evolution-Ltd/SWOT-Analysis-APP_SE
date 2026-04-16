import { useProject } from '../context/ProjectContext'

export default function WeightsPage() {
  const { state, dispatch, computeAhp } = useProject()

  const pairs = [
    { field: 'sw', label: 'S vs W' },
    { field: 'so', label: 'S vs O' },
    { field: 'st', label: 'S vs T' },
    { field: 'wo', label: 'W vs O' },
    { field: 'wt', label: 'W vs T' },
    { field: 'ot', label: 'O vs T' },
  ]

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>5. Category Weights (AHP)</h2>
        <p>Use pairwise preferences to tune strategic weighting across SWOT categories.</p>
      </div>

      <p className="muted" style={{ marginBottom: 12 }}>
        Set pairwise importance using Saaty scale (1–9). Higher values favour the first category.
      </p>

      <div className="score-grid">
        {pairs.map(({ field, label }) => (
          <label key={field}>
            {label}
            <input
              type="number"
              min="1"
              max="9"
              step="0.1"
              value={state.ahpPreferences[field]}
              onChange={(e) =>
                dispatch({
                  type: 'set',
                  patch: {
                    ahpPreferences: {
                      ...state.ahpPreferences,
                      [field]: Number(e.target.value),
                    },
                  },
                })
              }
            />
          </label>
        ))}
      </div>

      <div className="row-actions">
        <button onClick={computeAhp}>Compute AHP Weights</button>
      </div>

      <div className="winner-strip">
        <span>S: {state.categoryWeights.S.toFixed(3)}</span>
        <span>W: {state.categoryWeights.W.toFixed(3)}</span>
        <span>O: {state.categoryWeights.O.toFixed(3)}</span>
        <span>T: {state.categoryWeights.T.toFixed(3)}</span>
      </div>
    </section>
  )
}
