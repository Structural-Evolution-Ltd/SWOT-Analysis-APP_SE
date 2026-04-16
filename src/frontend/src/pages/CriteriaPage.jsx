import { useProject } from '../context/ProjectContext'

export default function CriteriaPage() {
  const { state, dispatch, sortedTemplates, templateCountsByCategory } = useProject()

  function onAddCustomCriterion() {
    const trimmedTitle = state.newCriterionTitle.trim()
    if (!trimmedTitle) return
    dispatch({
      type: 'add_custom_criterion',
      title: trimmedTitle,
      category: state.newCriterionCategory,
      weight: Number(state.newCriterionWeight) || 1,
    })
  }

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>2. Criteria List</h2>
        <p>Edit criterion weights in one place. Changes apply to all options.</p>
      </div>

      <div className="workflow-strip mini">
        <span>S: {templateCountsByCategory.S}</span>
        <span>W: {templateCountsByCategory.W}</span>
        <span>O: {templateCountsByCategory.O}</span>
        <span>T: {templateCountsByCategory.T}</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Criterion</th>
              <th>Default SWOT</th>
              <th>Factor Weight</th>
            </tr>
          </thead>
          <tbody>
            {sortedTemplates.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.default_category || item.category || 'S'}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.default_weight}
                    onChange={(e) =>
                      dispatch({
                        type: 'template_weight_change',
                        templateId: item.id,
                        value: e.target.value,
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="inline-form">
        <input
          value={state.newCriterionTitle}
          onChange={(e) =>
            dispatch({ type: 'set', patch: { newCriterionTitle: e.target.value } })
          }
          placeholder="Add custom criterion"
        />
        <select
          value={state.newCriterionCategory}
          onChange={(e) =>
            dispatch({ type: 'set', patch: { newCriterionCategory: e.target.value } })
          }
        >
          <option value="S">S</option>
          <option value="W">W</option>
          <option value="O">O</option>
          <option value="T">T</option>
        </select>
        <input
          type="number"
          min="0"
          step="0.1"
          value={state.newCriterionWeight}
          onChange={(e) =>
            dispatch({ type: 'set', patch: { newCriterionWeight: Number(e.target.value) } })
          }
        />
        <button onClick={onAddCustomCriterion}>Add Criterion</button>
      </div>
    </section>
  )
}
