export default function SummaryTable({ ranking, winner, loser }) {
  if (!ranking.length) {
    return <p className="empty">Run the analysis to populate rankings.</p>
  }

  return (
    <div className="panel">
      <h3>Summary Ranking</h3>
      <table>
        <thead>
          <tr>
            <th>Option</th>
            <th>Risk-Adjusted Score</th>
            <th>Expected Score</th>
            <th>Gate Status</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((item) => (
            <tr key={item.option_name}>
              <td>{item.option_name}</td>
              <td>{item.risk_adjusted_score.toFixed(2)}</td>
              <td>{item.expected_score.toFixed(2)}</td>
              <td>{item.passed_gates ? 'Pass' : `Fail (${item.gate_failures.join(', ')})`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="winner-strip">
        <span>Winner: {winner ?? 'None passed gates'}</span>
        <span>Loser: {loser ?? 'N/A'}</span>
      </div>
    </div>
  )
}
