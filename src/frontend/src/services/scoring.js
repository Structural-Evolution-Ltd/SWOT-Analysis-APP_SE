/**
 * Client-side scoring mirror of src/backend/app/services/scoring.py.
 *
 * Used as an offline fallback when the /api/analysis/run endpoint is
 * unavailable. Keep in sync with the Python implementation if the
 * scoring algorithm changes.
 */

const REVERSE_CATEGORIES = new Set(['W', 'T'])
const SWOT_KEYS = ['S', 'W', 'O', 'T']

function normalizeScore(score, reverse) {
  const scaled = (score - 1.0) / 9.0
  return reverse ? 1.0 - scaled : scaled
}

function evaluateOption(option, categoryWeights, thresholds, riskConfidence) {
  const byCategoryExpected = { S: 0, W: 0, O: 0, T: 0 }
  const byCategoryRisk = { S: 0, W: 0, O: 0, T: 0 }
  const byCategoryWeight = { S: 0, W: 0, O: 0, T: 0 }

  for (const score of option.scores) {
    const reverse = REVERSE_CATEGORIES.has(score.category)
    const best = normalizeScore(score.score_best, reverse)
    const base = normalizeScore(score.score_base, reverse)
    const worst = normalizeScore(score.score_worst, reverse)

    const expected = (best + 4.0 * base + worst) / 6.0
    const spreadPenalty = Math.max(0.0, best - worst) * (1.0 - riskConfidence)
    const riskAdjusted = Math.max(0.0, expected - spreadPenalty)

    byCategoryExpected[score.category] += expected * score.factor_weight
    byCategoryRisk[score.category] += riskAdjusted * score.factor_weight
    byCategoryWeight[score.category] += score.factor_weight
  }

  let expectedTotal = 0.0
  let riskTotal = 0.0
  const gateFailures = []

  for (const category of SWOT_KEYS) {
    const denom = byCategoryWeight[category] > 0 ? byCategoryWeight[category] : 1.0
    const categoryMean = byCategoryRisk[category] / denom
    const threshold = thresholds?.[category]

    expectedTotal += (byCategoryExpected[category] / denom) * (categoryWeights?.[category] ?? 0)
    riskTotal += (byCategoryRisk[category] / denom) * (categoryWeights?.[category] ?? 0)

    if (threshold !== undefined && categoryMean * 10.0 < threshold) {
      gateFailures.push(`${category}<${threshold}`)
    }
  }

  return {
    option_name: option.option_name,
    expected_score: Number((expectedTotal * 10.0).toFixed(3)),
    risk_adjusted_score: Number((riskTotal * 10.0).toFixed(3)),
    passed_gates: gateFailures.length === 0,
    gate_failures: gateFailures,
  }
}

export function runAnalysisLocal(payload) {
  const ranking = payload.options
    .map((option) =>
      evaluateOption(
        option,
        payload.category_weights,
        payload.thresholds,
        payload.risk_confidence,
      ),
    )
    .sort((a, b) => {
      if (a.passed_gates !== b.passed_gates) {
        return a.passed_gates ? -1 : 1
      }
      if (a.risk_adjusted_score !== b.risk_adjusted_score) {
        return b.risk_adjusted_score - a.risk_adjusted_score
      }
      return b.expected_score - a.expected_score
    })

  const winner = ranking.find((r) => r.passed_gates)?.option_name ?? null
  const loser = ranking.length ? ranking[ranking.length - 1].option_name : null

  return { ranking, winner, loser }
}
