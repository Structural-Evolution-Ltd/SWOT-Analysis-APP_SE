import ScoreChart from '../components/ScoreChart'
import SummaryTable from '../components/SummaryTable'
import { useProject } from '../context/ProjectContext'

function downloadMarkdown(content, projectName) {
  const safe = projectName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'report'
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safe}_report.md`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadDocx(base64Content, projectName) {
  const safe = projectName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'report'
  const binary = atob(base64Content)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safe}_report.docx`
  a.click()
  URL.revokeObjectURL(url)
}

export default function RunPage() {
  const { state, dispatch, runAnalysis, generateReport } = useProject()

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>7. Run and Report</h2>
        <p>Set confidence, run ranking, then generate report outputs.</p>
      </div>

      <label>
        Risk confidence ({state.riskConfidence.toFixed(2)})
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={state.riskConfidence}
          onChange={(e) =>
            dispatch({ type: 'set', patch: { riskConfidence: Number(e.target.value) } })
          }
        />
      </label>

      <div className="row-actions">
        <button onClick={runAnalysis}>Run Analysis</button>
        <button className="button-secondary" onClick={generateReport}>
          Generate Report
        </button>
      </div>

      {state.reportInfo && (
        <div className="report-box">
          <strong>Report status: {state.reportInfo.render_status}</strong>
          <div className="row-actions">
            {state.reportInfo.markdown_content && (
              <button
                className="button-secondary"
                onClick={() =>
                  downloadMarkdown(state.reportInfo.markdown_content, state.reportInfo.project_name || 'report')
                }
              >
                Download Markdown
              </button>
            )}
            {state.reportInfo.docx_content && (
              <button
                className="button-secondary"
                onClick={() =>
                  downloadDocx(state.reportInfo.docx_content, state.reportInfo.project_name || 'report')
                }
              >
                Download DOCX
              </button>
            )}
          </div>
          {!state.reportInfo.markdown_content && !state.reportInfo.docx_content && (
            <span className="muted">No report content returned from server.</span>
          )}
        </div>
      )}

      {state.result.ranking.length > 0 && (
        <>
          <SummaryTable
            ranking={state.result.ranking}
            winner={state.result.winner}
            loser={state.result.loser}
          />
          <ScoreChart ranking={state.result.ranking} />
        </>
      )}

      {state.result.ranking.length === 0 && (
        <p className="muted" style={{ marginTop: 16 }}>
          No results yet — configure options on the Scoring page then click Run Analysis.
        </p>
      )}
    </section>
  )
}
