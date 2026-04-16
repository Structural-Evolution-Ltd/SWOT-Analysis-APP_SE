import { useProject } from '../context/ProjectContext'

export default function ConstraintsPage() {
  const { state, dispatch } = useProject()

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>4. UK Transport Constraints</h2>
        <p>Adjust defaults only when your route and permitting conditions differ.</p>
      </div>

      <div className="constraints-grid">
        {state.constraints.map((row, idx) => (
          <label key={row.name}>
            <span>
              {row.name} ({row.unit})
            </span>
            {row.description && <small className="muted">{row.description}</small>}
            <input
              type="number"
              step="0.01"
              value={row.value}
              onChange={(e) =>
                dispatch({
                  type: 'set',
                  patch: {
                    constraints: state.constraints.map((r, i) =>
                      i === idx ? { ...r, value: Number(e.target.value) } : r,
                    ),
                  },
                })
              }
            />
          </label>
        ))}
      </div>
    </section>
  )
}
