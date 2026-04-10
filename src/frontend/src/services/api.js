import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const REVERSE_CATEGORIES = new Set(['W', 'T'])
const SWOT_KEYS = ['S', 'W', 'O', 'T']

const UK_DEFAULT_CONSTRAINTS = [
  {
    name: 'max_standard_vehicle_width',
    value: 2.9,
    unit: 'm',
    description: 'Practical baseline above which wide/abnormal checks are triggered.',
  },
  {
    name: 'max_standard_vehicle_length',
    value: 18.75,
    unit: 'm',
    description: 'Typical articulated vehicle length baseline.',
  },
  {
    name: 'escort_trigger_width',
    value: 3.5,
    unit: 'm',
    description: 'Operational trigger where escort planning is commonly required.',
  },
  {
    name: 'notice_trigger_width',
    value: 3.0,
    unit: 'm',
    description: 'Width threshold for additional route and authority notifications.',
  },
]

const api = axios.create({
  baseURL: apiBaseUrl,
})

function normalizeScore(score, reverse) {
  const scaled = (score - 1.0) / 9.0
  return reverse ? 1.0 - scaled : scaled
}

function evaluateOptionLocal(option, categoryWeights, thresholds, riskConfidence) {
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

function runAnalysisLocal(payload) {
  const ranking = payload.options
    .map((option) =>
      evaluateOptionLocal(
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

export async function fetchTransportDefaults() {
  try {
    const { data } = await api.get('/transport/defaults')
    return data
  } catch {
    return UK_DEFAULT_CONSTRAINTS
  }
}

export async function fetchCriteriaTemplates() {
  const { data } = await api.get('/criteria/templates')
  return data
}

export async function suggestCriteriaFromBrief(briefText) {
  const { data } = await api.post('/criteria/suggest', { brief_text: briefText })
  return data.suggestions
}

export async function computeAhpWeights(preferences) {
  const { data } = await api.post('/mcda/ahp-weights', preferences)
  return data.weights
}

export async function runAnalysis(payload) {
  try {
    const { data } = await api.post('/analysis/run', payload)
    return data
  } catch {
    return runAnalysisLocal(payload)
  }
}

export async function generateReport(payload) {
  const { data } = await api.post('/report/generate', payload)
  return data
}
