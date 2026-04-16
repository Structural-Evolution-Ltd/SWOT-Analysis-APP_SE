import { useProject } from '../context/ProjectContext'
import { SCORING_MODE, SWOT_OPTIONS } from '../constants'

export default function ScoringPage() {
  const { state, dispatch, sortedTemplates } = useProject()

  const rows =
    state.scoringMode === SCORING_MODE.SIMPLE
      ? [['Score', 'score_base']]
      : [
          ['Best', 'score_best'],
          ['Base', 'score_base'],
          ['Worst', 'score_worst'],
        ]

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>6. Options and Scores</h2>
        <p>
          {state.scoringMode === SCORING_MODE.SIMPLE
            ? 'Score each criterion with a single base score per option.'
            : 'Score all options in one matrix with Best / Base / Worst scenarios.'}
        </p>
      </div>

      <div className="row-actions">
        <button onClick={() => dispatch({ type: 'add_option' })}>Add Option</button>
        <button
          className="button-secondary"
          onClick={() => dispatch({ type: 'add_combination' })}
        >
          Add Combination (first two)
        </button>
        <button
          className={state.scoringMode === SCORING_MODE.SIMPLE ? '' : 'button-secondary'}
          onClick={() =>
            dispatch({ type: 'set', patch: { scoringMode: SCORING_MODE.SIMPLE } })
          }
        >
          Simple Mode
        </button>
        <button
          className={state.scoringMode === SCORING_MODE.ADVANCED ? '' : 'button-secondary'}
          onClick={() =>
            dispatch({ type: 'set', patch: { scoringMode: SCORING_MODE.ADVANCED } })
          }
        >
          Advanced Mode
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
