import { useProject } from '../context/ProjectContext'
import { SWOT_HEADINGS } from '../constants'

export default function LibraryPage() {
  const { state, dispatch, selectedAdditionalCount, additionalCriteriaByGroup } = useProject()

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>3. Additional Criteria Library</h2>
        <p>Start with all off. Enable only what matters for this project.</p>
      </div>

      <div className="workflow-strip mini">
        <span>{selectedAdditionalCount} criteria enabled from library</span>
      </div>

      <div className="row-actions">
        <button onClick={() => dispatch({ type: 'toggle_all', isEnabled: true })}>
          Select All On
        </button>
        <button
          className="button-secondary"
          onClick={() => dispatch({ type: 'toggle_all', isEnabled: false })}
        >
          Select All Off
        </button>
      </div>

      <div className="criteria-toggle-groups">
        {Object.entries(additionalCriteriaByGroup).map(([groupName, categories]) => {
          const groupItems = ['S', 'W', 'O', 'T'].flatMap((key) => categories[key] ?? [])
          const enabledCount = groupItems.filter(
            (item) => state.additionalCriteriaToggles[item.id],
          ).length

          return (
            <details
              key={groupName}
              className="criteria-toggle-group"
              open={enabledCount > 0}
            >
              <summary className="group-summary">
                <h3>{groupName}</h3>
                <span>
                  {enabledCount}/{groupItems.length} enabled
                </span>
              </summary>
              <div className="group-header">
                <div className="muted">Quick group action</div>
                <div>
                  <button
                    onClick={() =>
                      dispatch({ type: 'toggle_group', groupName, isEnabled: true })
                    }
                  >
                    On
                  </button>
                  <button
                    className="button-secondary"
                    onClick={() =>
                      dispatch({ type: 'toggle_group', groupName, isEnabled: false })
                    }
                  >
                    Off
                  </button>
                </div>
              </div>
              {['S', 'W', 'O', 'T'].map((swotKey) => (
                <div key={`${groupName}-${swotKey}`} className="swot-subgroup">
                  <h4>{SWOT_HEADINGS[swotKey]}</h4>
                  {(categories[swotKey] ?? []).map((item) => (
                    <label key={item.id} className="criteria-toggle-item">
                      <input
                        type="checkbox"
                        checked={Boolean(state.additionalCriteriaToggles[item.id])}
                        onChange={(e) =>
                          dispatch({
                            type: 'toggle_criterion',
                            criterion: item,
                            isEnabled: e.target.checked,
                          })
                        }
                      />
                      <span>{item.title}</span>
                      <small>{item.category}</small>
                    </label>
                  ))}
                  {(categories[swotKey] ?? []).length === 0 && (
                    <p className="muted">None</p>
                  )}
                </div>
              ))}
            </details>
          )
        })}
      </div>
    </section>
  )
}
