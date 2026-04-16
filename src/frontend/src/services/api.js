import axios from 'axios'

import { runAnalysisLocal } from './scoring'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

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

export async function fetchTransportDefaults() {
  try {
    const { data } = await api.get('/transport/defaults')
    return data
  } catch {
    return UK_DEFAULT_CONSTRAINTS
  }
}

export async function fetchCriteriaTemplates() {
  try {
    const { data } = await api.get('/criteria/templates')
    return data
  } catch {
    return []
  }
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
