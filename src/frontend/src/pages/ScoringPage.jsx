import { useProject } from '../context/ProjectContext'
import { SWOT_OPTIONS } from '../constants'

export default function ScoringPage() {
  const { state, dispatch, sortedTemplates } = useProject()

  const rows = [
    ['Best', 'score_best'],
    ['Worst', 'score_worst'],
  ]

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>6. Options and Scores</h2>
        <p>Score each criterion with a Best and Worst scenario per option.</p>
      </div>

      <div className="row-actions">
        <button onClick={() => dispatch({ type: 'add_option' })}>Add Option</button>
        <button
          className="button-secondary"
          onClick={() => dispatch({ type: 'add_combination' })}
        >
          Add Combination (first two)
        </button>
      </div>

      {state.options.map((option, optionIdx) => (
        <div key={optionIdx} className="option-card">
          <input
            className="option-name"
            value={option.option_name}
            onChange={(e) =>
              dispatch({ type: 'option_name', index: optionIdx, value: e.target.value })
            }
          />
          <div className="table-wrap">
            <table className="compact-score-matrix">
              <thead>
                <tr>
                  <th>Scenario</th>
                  {sortedTemplates.map((criterion) => (
                    <th key={`${option.option_name}-h-${criterion.id}`}>
                      <div>{criterion.title}</div>
                      <small>
                        Default {criterion.default_category || criterion.category || 'S'}
                      </small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, field]) => (
                  <tr key={`${option.option_name}-${label}`}>
                    <td>{label}</td>
                    {sortedTemplates.map((criterion) => {
                      const score = option.scores.find(
                        (s) => s.criterion_id === criterion.id,
                      )
                      if (!score)
                        return (
                          <td key={`${option.option_name}-${label}-${criterion.id}`}>-</td>
                        )
                      return (
                        <td key={`${option.option_name}-${label}-${criterion.id}`}>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={score[field]}
                            onChange={(e) =>
                              dispatch({
                                type: 'score_change',
                                optionIndex: optionIdx,
                                criterionId: criterion.id,
                                field,
                                value: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr>
                  <td>SWOT</td>
                  {sortedTemplates.map((criterion) => {
                    const score = option.scores.find(
                      (s) => s.criterion_id === criterion.id,
                    )
                    if (!score)
                      return (
                        <td key={`${option.option_name}-swot-empty-${criterion.id}`}>-</td>
                      )
                    return (
                      <td key={`${option.option_name}-swot-${criterion.id}`}>
                        <select
                          value={score.category}
                          onChange={(e) =>
                            dispatch({
                              type: 'score_category_change',
                              optionIndex: optionIdx,
                              criterionId: criterion.id,
                              category: e.target.value,
                            })
                          }
                        >
                          {SWOT_OPTIONS.map((swot) => (
                            <option key={swot} value={swot}>
                              {swot}
                            </option>
                          ))}
                        </select>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  )
}
