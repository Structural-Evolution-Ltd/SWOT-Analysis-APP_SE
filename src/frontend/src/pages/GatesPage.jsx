import { useProject } from '../context/ProjectContext'

const GATE_META = {
  S: {
    label: 'Strengths',
    description: 'Minimum mean strength score (0–10) an option must reach to pass the Strengths gate.',
  },
  W: {
    label: 'Weaknesses',
    description:
      'Minimum mean weakness score (0–10). Note: weakness scores are reversed — higher raw score means lower normalised risk.',
  },
  O: {
    label: 'Opportunities',
    description: 'Minimum mean opportunity score (0–10) required to pass the Opportunities gate.',
  },
  T: {
    label: 'Threats',
    description:
      'Minimum mean threat score (0–10). Threat scores are reversed — higher raw score means lower threat impact.',
  },
}

export default function GatesPage() {
  const { state, dispatch } = useProject()

  function setThreshold(category, value) {
    const clamped = Math.min(10, Math.max(0, Number(value)))
    dispatch({
      type: 'set',
      patch: { thresholds: { ...state.thresholds, [category]: clamped } },
    })
  }

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>7. Gate Thresholds</h2>
        <p>
          An option must reach or exceed every category threshold to pass all gates. Failing any
          gate drops the option below passing options in the ranking regardless of its overall
          score.
        </p>
      </div>

      <div className="constraints-grid">
        {Object.entries(GATE_META).map(([cat, meta]) => (
          <label key={cat}>
            <span>
              {cat} — {meta.label} (threshold: {state.thresholds[cat].toFixed(1)} / 10)
            </span>
            <small className="muted">{meta.description}</small>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={state.thresholds[cat]}
                style={{ flex: 1 }}
                onChange={(e) => setThreshold(cat, e.target.value)}
              />
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={state.thresholds[cat]}
                style={{ width: 64 }}
                onChange={(e) => setThreshold(cat, e.target.value)}
              />
            </div>
          </label>
        ))}
      </div>

      <div className="winner-strip" style={{ marginTop: 20 }}>
        {Object.entries(state.thresholds).map(([cat, val]) => (
          <span key={cat}>
            {cat}: ≥{val.toFixed(1)}
          </span>
        ))}
      </div>
    </section>
  )
}
