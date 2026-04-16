import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

import {
  computeAhpWeights,
  fetchCriteriaTemplates,
  fetchTransportDefaults,
  generateReport as apiGenerateReport,
  runAnalysis as apiRunAnalysis,
  suggestCriteriaFromBrief,
} from '../services/api'
import {
  ADDITIONAL_CRITERIA,
  INITIAL_CATEGORY_WEIGHTS,
  SCORING_MODE,
  SWOT_OPTIONS,
} from '../constants'
import {
  addCriterionToOptions,
  createInitialOption,
  downloadMarkdownReport,
  mergeSuggestedIntoOptions,
} from '../utils/projectHelpers'

const initialState = {
  briefText: '',
  templates: [],
  suggested: { S: [], W: [], O: [], T: [] },
  constraints: [],
  options: [],
  riskConfidence: 0.65,
  categoryWeights: INITIAL_CATEGORY_WEIGHTS,
  ahpPreferences: { sw: 1, so: 1, st: 1, wo: 1, wt: 1, ot: 1 },
  result: { ranking: [], winner: null, loser: null },
  reportInfo: null,
  newCriterionTitle: '',
  newCriterionCategory: 'S',
  newCriterionWeight: 1,
  projectStatusMessage: '',
  apiError: '',
  scoringMode: SCORING_MODE.ADVANCED,
  additionalCriteriaToggles: Object.fromEntries(
    ADDITIONAL_CRITERIA.map((item) => [item.id, false]),
  ),
}

function reducer(state, action) {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.patch }
    case 'option_name':
      return {
        ...state,
        options: state.options.map((o, i) =>
          i === action.index ? { ...o, option_name: action.value } : o,
        ),
      }
    case 'score_change':
      return {
        ...state,
        options: state.options.map((option, idx) => {
          if (idx !== action.optionIndex) return option
          return {
            ...option,
            scores: option.scores.map((score) =>
              score.criterion_id !== action.criterionId
                ? score
                : { ...score, [action.field]: action.value },
            ),
          }
        }),
      }
    case 'score_category_change':
      return {
        ...state,
        options: state.options.map((option, idx) => {
          if (idx !== action.optionIndex) return option
          return {
            ...option,
            scores: option.scores.map((score) =>
              score.criterion_id !== action.criterionId
                ? score
                : { ...score, category: action.category },
            ),
          }
        }),
      }
    case 'template_weight_change': {
      const safeValue = Number(action.value)
      if (!Number.isFinite(safeValue)) return state
      return {
        ...state,
        templates: state.templates.map((item) =>
          item.id === action.templateId ? { ...item, default_weight: safeValue } : item,
        ),
        options: state.options.map((option) => ({
          ...option,
          scores: option.scores.map((score) =>
            score.criterion_id === action.templateId
              ? { ...score, factor_weight: safeValue }
              : score,
          ),
        })),
      }
    }
    case 'add_option':
      return {
        ...state,
        options: [
          ...state.options,
          createInitialOption(`Option ${state.options.length + 1}`, state.templates),
        ],
      }
    case 'add_combination': {
      if (state.options.length < 2) return state
      const [a, b] = state.options
      const name = `${a.option_name} + ${b.option_name}`
      const scores = a.scores.map((score, idx) => {
        const bScore = b.scores[idx]
        return {
          ...score,
          score_best: Number(((score.score_best + bScore.score_best) / 2).toFixed(2)),
          score_base: Number(((score.score_base + bScore.score_base) / 2).toFixed(2)),
          score_worst: Number(((score.score_worst + bScore.score_worst) / 2).toFixed(2)),
        }
      })
      return { ...state, options: [...state.options, { option_name: name, scores }] }
    }
    case 'add_custom_criterion': {
      const maxId = state.templates.reduce((max, item) => Math.max(max, item.id), 0)
      const criterion = {
        id: maxId + 1,
        title: action.title,
        default_category: action.category,
        default_weight: action.weight,
        prompt_keywords: '',
      }
      return {
        ...state,
        templates: [...state.templates, criterion],
        options: addCriterionToOptions(state.options, criterion),
        newCriterionTitle: '',
        newCriterionCategory: 'S',
        newCriterionWeight: 1,
      }
    }
    case 'apply_suggested': {
      const flatSuggested = SWOT_OPTIONS.flatMap((cat) => state.suggested[cat] ?? [])
      if (!flatSuggested.length) return state
      const existingIds = new Set(state.templates.map((item) => item.id))
      const additions = flatSuggested.filter((item) => !existingIds.has(item.id))
      return {
        ...state,
        templates: [...state.templates, ...additions],
        options: mergeSuggestedIntoOptions(state.options, flatSuggested),
      }
    }
    case 'toggle_criterion': {
      const { criterion, isEnabled } = action
      const newToggles = { ...state.additionalCriteriaToggles, [criterion.id]: isEnabled }
      if (isEnabled) {
        const templates = state.templates.some((item) => item.id === criterion.id)
          ? state.templates
          : [...state.templates, criterion]
        return {
          ...state,
          additionalCriteriaToggles: newToggles,
          templates,
          options: addCriterionToOptions(state.options, criterion),
        }
      }
      return {
        ...state,
        additionalCriteriaToggles: newToggles,
        templates: state.templates.filter((item) => item.id !== criterion.id),
        options: state.options.map((option) => ({
          ...option,
          scores: option.scores.filter((score) => score.criterion_id !== criterion.id),
        })),
      }
    }
    case 'toggle_all': {
      const newToggles = Object.fromEntries(
        ADDITIONAL_CRITERIA.map((item) => [item.id, action.isEnabled]),
      )
      if (action.isEnabled) {
        const existing = new Set(state.templates.map((item) => item.id))
        return {
          ...state,
          additionalCriteriaToggles: newToggles,
          templates: [
            ...state.templates,
            ...ADDITIONAL_CRITERIA.filter((item) => !existing.has(item.id)),
          ],
          options: mergeSuggestedIntoOptions(state.options, ADDITIONAL_CRITERIA),
        }
      }
      const removeIds = new Set(ADDITIONAL_CRITERIA.map((item) => item.id))
      return {
        ...state,
        additionalCriteriaToggles: newToggles,
        templates: state.templates.filter((item) => !removeIds.has(item.id)),
        options: state.options.map((option) => ({
          ...option,
          scores: option.scores.filter((score) => !removeIds.has(score.criterion_id)),
        })),
      }
    }
    case 'toggle_group': {
      const groupItems = ADDITIONAL_CRITERIA.filter((item) => item.group === action.groupName)
      const newToggles = {
        ...state.additionalCriteriaToggles,
        ...Object.fromEntries(groupItems.map((item) => [item.id, action.isEnabled])),
      }
      if (action.isEnabled) {
        const existing = new Set(state.templates.map((item) => item.id))
        return {
          ...state,
          additionalCriteriaToggles: newToggles,
          templates: [
            ...state.templates,
            ...groupItems.filter((item) => !existing.has(item.id)),
          ],
          options: mergeSuggestedIntoOptions(state.options, groupItems),
        }
      }
      const removeIds = new Set(groupItems.map((item) => item.id))
      return {
        ...state,
        additionalCriteriaToggles: newToggles,
        templates: state.templates.filter((item) => !removeIds.has(item.id)),
        options: state.options.map((option) => ({
          ...option,
          scores: option.scores.filter((score) => !removeIds.has(score.criterion_id)),
        })),
      }
    }
    default:
      return state
  }
}

const ProjectContext = createContext(null)

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Bootstrap: fetch templates + transport defaults on mount
  useEffect(() => {
    async function bootstrap() {
      const [templateResult, transportResult] = await Promise.allSettled([
        fetchCriteriaTemplates(),
        fetchTransportDefaults(),
      ])

      const templateRows =
        templateResult.status === 'fulfilled' ? templateResult.value : []
      const transportRows =
        transportResult.status === 'fulfilled' ? transportResult.value : []

      const normalizedTemplates = templateRows.map((row) => ({
        ...row,
        default_category: row.default_category || row.category || 'S',
      }))

      const patch = {}
      if (normalizedTemplates.length) {
        patch.templates = normalizedTemplates
        patch.options = [
          createInitialOption('FRP Walkway - Continuous', normalizedTemplates),
          createInitialOption('FRP Walkway - Split', normalizedTemplates),
        ]
      }
      if (transportRows.length) {
        patch.constraints = transportRows
      }
      if (Object.keys(patch).length) {
        dispatch({ type: 'set', patch })
      }
    }
    bootstrap()

    // PWA File Handling API — handle files opened via Windows Explorer
    if ('launchQueue' in window) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files?.length) return
        try {
          const file = await launchParams.files[0].getFile()
          const raw = await file.text()
          applyLoadedProject(JSON.parse(raw))
          dispatch({ type: 'set', patch: { projectStatusMessage: `Opened: ${file.name}` } })
        } catch {
          dispatch({ type: 'set', patch: { projectStatusMessage: 'Failed to open file.' } })
        }
      })
    }
  }, [])

  function applyLoadedProject(loaded) {
    const loadedTemplates = Array.isArray(loaded.templates) ? loaded.templates : []
    const loadedOptions = Array.isArray(loaded.options) ? loaded.options : []
    const loadedConstraints = Array.isArray(loaded.constraints) ? loaded.constraints : []
    const mergedToggles = Object.fromEntries(
      ADDITIONAL_CRITERIA.map((item) => {
        const isInTemplates = loadedTemplates.some((t) => t.id === item.id)
        const isEnabled = Boolean(loaded.additionalCriteriaToggles?.[item.id] ?? isInTemplates)
        return [item.id, isEnabled]
      }),
    )
    dispatch({
      type: 'set',
      patch: {
        briefText: loaded.briefText ?? '',
        templates: loadedTemplates,
        suggested: loaded.suggested ?? { S: [], W: [], O: [], T: [] },
        constraints: loadedConstraints,
        options: loadedOptions,
        riskConfidence: Number(loaded.riskConfidence ?? 0.65),
        categoryWeights: loaded.categoryWeights ?? INITIAL_CATEGORY_WEIGHTS,
        ahpPreferences: loaded.ahpPreferences ?? { sw: 1, so: 1, st: 1, wo: 1, wt: 1, ot: 1 },
        scoringMode: loaded.scoringMode ?? SCORING_MODE.ADVANCED,
        result: loaded.result ?? { ranking: [], winner: null, loser: null },
        reportInfo: loaded.reportInfo ?? null,
        additionalCriteriaToggles: mergedToggles,
      },
    })
  }

  // ── Async actions ──────────────────────────────────────────────────────────

  async function suggestCriteria() {
    dispatch({ type: 'set', patch: { apiError: '' } })
    try {
      const data = await suggestCriteriaFromBrief(state.briefText)
      const normalized = {}
      for (const key of SWOT_OPTIONS) {
        normalized[key] = (data[key] ?? []).map((item) => ({
          ...item,
          default_category: item.default_category || item.category || key,
        }))
      }
      dispatch({ type: 'set', patch: { suggested: normalized } })
    } catch {
      dispatch({
        type: 'set',
        patch: {
          apiError:
            'Criteria suggestion unavailable — backend not connected. Add criteria manually below.',
        },
      })
    }
  }

  async function computeAhp() {
    dispatch({ type: 'set', patch: { apiError: '' } })
    try {
      const weights = await computeAhpWeights(state.ahpPreferences)
      dispatch({ type: 'set', patch: { categoryWeights: weights } })
    } catch {
      dispatch({
        type: 'set',
        patch: {
          apiError: 'AHP weights unavailable — backend not connected. Adjust weights manually.',
        },
      })
    }
  }

  async function runAnalysis() {
    dispatch({ type: 'set', patch: { apiError: '' } })
    const optionsForAnalysis =
      state.scoringMode === SCORING_MODE.SIMPLE
        ? state.options.map((option) => ({
            ...option,
            scores: option.scores.map((score) => ({
              ...score,
              score_best: score.score_base,
              score_worst: score.score_base,
            })),
          }))
        : state.options

    const payload = {
      category_weights: state.categoryWeights,
      thresholds: { S: 6, W: 6, O: 6, T: 6 },
      options: optionsForAnalysis,
      risk_confidence: state.riskConfidence,
    }
    const analysis = await apiRunAnalysis(payload)
    dispatch({ type: 'set', patch: { result: analysis } })
  }

  async function generateReport() {
    if (!state.result.ranking.length) {
      dispatch({ type: 'set', patch: { apiError: 'Run Analysis first before generating a report.' } })
      return
    }
    const payload = {
      project_name: 'Project SWOT Study',
      client_name: 'Client',
      executive_summary:
        'Risk-adjusted weighted SWOT and MCDA ranking for current shortlisted options.',
      assumptions: [
        'Scores are based on current concept-stage data.',
        'UK transport constraints are editable and project-specific.',
      ],
      ranking: state.result.ranking,
      winner: state.result.winner,
      loser: state.result.loser,
    }
    try {
      const reportData = await apiGenerateReport(payload)
      dispatch({ type: 'set', patch: { reportInfo: reportData } })
    } catch {
      downloadMarkdownReport(payload)
      dispatch({
        type: 'set',
        patch: {
          reportInfo: {
            render_status: 'Downloaded local markdown fallback (backend report service unavailable).',
            markdown_path: 'downloaded in browser',
            latex_path: 'not generated',
            pdf_path: null,
            docx_path: null,
          },
        },
      })
    }
  }

  async function saveProject() {
    try {
      const projectState = {
        briefText: state.briefText,
        templates: state.templates,
        suggested: state.suggested,
        constraints: state.constraints,
        options: state.options,
        riskConfidence: state.riskConfidence,
        categoryWeights: state.categoryWeights,
        ahpPreferences: state.ahpPreferences,
        scoringMode: state.scoringMode,
        result: state.result,
        reportInfo: state.reportInfo,
        additionalCriteriaToggles: state.additionalCriteriaToggles,
      }
      const json = JSON.stringify(projectState, null, 2)

      if (typeof window.showSaveFilePicker === 'function') {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'swot-project.swot',
          types: [
            {
              description: 'SWOT Project',
              accept: { 'application/x-swot-project': ['.swot'] },
            },
          ],
        })
        const writable = await handle.createWritable()
        await writable.write(json)
        await writable.close()
        dispatch({ type: 'set', patch: { projectStatusMessage: 'Project saved.' } })
      } else {
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'swot-project.swot'
        a.click()
        URL.revokeObjectURL(url)
        dispatch({ type: 'set', patch: { projectStatusMessage: 'Project downloaded.' } })
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        dispatch({ type: 'set', patch: { projectStatusMessage: 'Save failed: ' + error.message } })
      }
    }
  }

  async function loadProject() {
    try {
      let raw
      if (typeof window.showOpenFilePicker === 'function') {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'SWOT Project',
              accept: {
                'application/x-swot-project': ['.swot'],
                'application/json': ['.json'],
              },
            },
          ],
          multiple: false,
        })
        const file = await handle.getFile()
        raw = await file.text()
      } else {
        raw = await new Promise((resolve, reject) => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.json,application/json,.swot'
          input.onchange = async () => {
            if (!input.files?.length) return reject(new Error('No file selected'))
            resolve(await input.files[0].text())
          }
          input.click()
        })
      }

      applyLoadedProject(JSON.parse(raw))
      dispatch({ type: 'set', patch: { projectStatusMessage: 'Project loaded.' } })
    } catch (error) {
      if (error.name !== 'AbortError') {
        dispatch({ type: 'set', patch: { projectStatusMessage: 'Load failed: ' + error.message } })
      }
    }
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const sortedTemplates = useMemo(
    () => [...state.templates].sort((a, b) => a.title.localeCompare(b.title)),
    [state.templates],
  )

  const selectedAdditionalCount = useMemo(
    () => Object.values(state.additionalCriteriaToggles).filter(Boolean).length,
    [state.additionalCriteriaToggles],
  )

  const templateCountsByCategory = useMemo(() => {
    const base = { S: 0, W: 0, O: 0, T: 0 }
    state.templates.forEach((item) => {
      const cat = item.default_category || item.category
      if (base[cat] !== undefined) base[cat] += 1
    })
    return base
  }, [state.templates])

  const summaryByCategory = useMemo(
    () =>
      ['S', 'W', 'O', 'T'].map((cat) => ({
        category: cat,
        count: state.suggested[cat]?.length ?? 0,
      })),
    [state.suggested],
  )

  const additionalCriteriaByGroup = useMemo(
    () =>
      ADDITIONAL_CRITERIA.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = { S: [], W: [], O: [], T: [] }
        acc[item.group][item.category].push(item)
        return acc
      }, {}),
    [],
  )

  const value = {
    state,
    dispatch,
    // derived
    sortedTemplates,
    selectedAdditionalCount,
    templateCountsByCategory,
    summaryByCategory,
    additionalCriteriaByGroup,
    // async actions
    suggestCriteria,
    computeAhp,
    runAnalysis,
    generateReport,
    saveProject,
    loadProject,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}
