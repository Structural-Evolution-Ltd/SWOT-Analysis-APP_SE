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
  try {
    const { data } = await api.post('/criteria/suggest', { brief_text: briefText })
    return data.suggestions
  } catch {
    // Offline fallback: basic keyword matching against common SWOT categories
    const lower = briefText.toLowerCase()
    const fallback = []
    if (/wide|abnormal|permit|escort/.test(lower))
      fallback.push({ id: -1, title: 'Abnormal load permitting and escort complexity', category: 'T', default_weight: 1.2 })
    if (/split|modular|transport|haulage/.test(lower))
      fallback.push({ id: -2, title: 'Modular split strategy transport opportunity', category: 'O', default_weight: 1.0 })
    if (/install|closure|programme|possession/.test(lower))
      fallback.push({ id: -3, title: 'Installation window and possession efficiency', category: 'S', default_weight: 1.1 })
    if (/cost|budget|price/.test(lower))
      fallback.push({ id: -4, title: 'Cost and budget risk', category: 'W', default_weight: 1.0 })
    if (/time|schedule|delay/.test(lower))
      fallback.push({ id: -5, title: 'Programme and schedule risk', category: 'W', default_weight: 1.0 })
    const grouped = { S: [], W: [], O: [], T: [] }
    for (const c of fallback) {
      if (grouped[c.category]) grouped[c.category].push(c)
    }
    return fallback.length ? grouped : {}
  }
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
