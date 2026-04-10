import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: apiBaseUrl,
})

export async function fetchTransportDefaults() {
  const { data } = await api.get('/transport/defaults')
  return data
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
  const { data } = await api.post('/analysis/run', payload)
  return data
}

export async function generateReport(payload) {
  const { data } = await api.post('/report/generate', payload)
  return data
}
