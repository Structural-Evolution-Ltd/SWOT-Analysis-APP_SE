import ScoreChart from '../components/ScoreChart'
import SummaryTable from '../components/SummaryTable'
import { useProject } from '../context/ProjectContext'

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
          <span>Markdown: {state.reportInfo.markdown_path}</span>
          <span>LaTeX: {state.reportInfo.latex_path}</span>
          <span>PDF: {state.reportInfo.pdf_path ?? 'Not rendered'}</span>
          <span>DOCX: {state.reportInfo.docx_path ?? 'Not rendered'}</span>
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
