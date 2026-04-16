export function createInitialOption(name, templates) {
  const scores = templates.map((t) => ({
    criterion_id: t.id,
    category: t.default_category || t.category || 'S',
    factor_weight: t.default_weight,
    score_best: 7,
    score_base: 6,
    score_worst: 5,
  }))
  return { option_name: name, scores }
}

export function addCriterionToOptions(currentOptions, criterion) {
  return currentOptions.map((option) => {
    const exists = option.scores.some((score) => score.criterion_id === criterion.id)
    if (exists) return option
    return {
      ...option,
      scores: [
        ...option.scores,
        {
          criterion_id: criterion.id,
          category: criterion.default_category || criterion.category || 'S',
          factor_weight: criterion.default_weight,
          score_best: 7,
          score_base: 6,
          score_worst: 5,
        },
      ],
    }
  })
}

export function mergeSuggestedIntoOptions(currentOptions, suggestedItems) {
  return suggestedItems.reduce((acc, item) => addCriterionToOptions(acc, item), currentOptions)
}

export function downloadMarkdownReport(payload) {
  const lines = [
    `# ${payload.project_name}`,
    '',
    `Client: ${payload.client_name}`,
    '',
    '## Executive Summary',
    payload.executive_summary,
    '',
    '## Assumptions',
    ...payload.assumptions.map((item) => `- ${item}`),
    '',
    '## Ranking',
    ...payload.ranking.map(
      (row, idx) =>
        `${idx + 1}. ${row.option_name} | Risk-adjusted: ${row.risk_adjusted_score.toFixed(2)} | Expected: ${row.expected_score.toFixed(2)} | Gates: ${row.passed_gates ? 'Pass' : 'Fail'}`,
    ),
    '',
    `Winner: ${payload.winner ?? 'None passed gates'}`,
    `Loser: ${payload.loser ?? 'N/A'}`,
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'swot-analysis-report.md'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
