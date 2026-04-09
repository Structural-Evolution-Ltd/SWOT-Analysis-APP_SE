import Plot from 'react-plotly.js'

export default function ScoreChart({ ranking }) {
  if (!ranking.length) {
    return null
  }

  const options = ranking.map((r) => r.option_name)
  const riskScores = ranking.map((r) => r.risk_adjusted_score)
  const expectedScores = ranking.map((r) => r.expected_score)

  return (
    <div className="panel">
      <h3>Score Comparison</h3>
      <Plot
        data={[
          {
            type: 'bar',
            x: options,
            y: riskScores,
            name: 'Risk-Adjusted',
            marker: { color: '#0b7285' },
          },
          {
            type: 'bar',
            x: options,
            y: expectedScores,
            name: 'Expected',
            marker: { color: '#f08c00' },
          },
        ]}
        layout={{
          barmode: 'group',
          margin: { t: 10, r: 10, b: 40, l: 40 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
        }}
        style={{ width: '100%', height: 360 }}
        useResizeHandler
      />
    </div>
  )
}
