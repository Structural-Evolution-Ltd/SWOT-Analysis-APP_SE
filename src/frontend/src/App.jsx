import { useEffect, useMemo, useState } from 'react'

import ScoreChart from './components/ScoreChart'
import SummaryTable from './components/SummaryTable'
import {
  computeAhpWeights,
  fetchCriteriaTemplates,
  fetchTransportDefaults,
  generateReport,
  runAnalysis,
  suggestCriteriaFromBrief,
} from './services/api'

const DEFAULT_THRESHOLDS = {
  S: 6,
  W: 6,
  O: 6,
  T: 6,
}

const INITIAL_CATEGORY_WEIGHTS = {
  S: 0.3,
  W: 0.2,
  O: 0.3,
  T: 0.2,
}

const PROJECT_STORAGE_KEY = 'swot_mcda_project_state_v1'

const STEP_LINKS = [
  { id: 'brief', label: '1 Brief' },
  { id: 'criteria', label: '2 Criteria' },
  { id: 'library', label: '3 Library' },
  { id: 'constraints', label: '4 Constraints' },
  { id: 'weights', label: '5 Weights' },
  { id: 'scoring', label: '6 Scoring' },
  { id: 'run', label: '7 Run' },
]

const ADDITIONAL_CRITERIA = [
  // Structural
  { id: 200001, title: 'Fatigue performance', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200002, title: 'Buckling robustness', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200003, title: 'Local joint efficiency', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200004, title: 'Vibration comfort', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200005, title: 'Redundancy / resilience', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200006, title: 'Torsional stiffness', group: 'Structural', category: 'S', default_weight: 1.0 },
  // Transport
  { id: 200007, title: 'Module length compatibility', group: 'Transport', category: 'O', default_weight: 1.0 },
  { id: 200008, title: 'Abnormal load restrictions', group: 'Transport', category: 'T', default_weight: 1.0 },
  { id: 200009, title: 'Escort requirements', group: 'Transport', category: 'T', default_weight: 1.0 },
  { id: 200010, title: 'Delivery route flexibility', group: 'Transport', category: 'O', default_weight: 1.0 },
  { id: 200011, title: 'Site offloading simplicity', group: 'Transport', category: 'S', default_weight: 1.0 },
  // Installation
  { id: 200012, title: 'Need for temporary works', group: 'Installation', category: 'W', default_weight: 1.0 },
  { id: 200013, title: 'Alignment tolerance sensitivity', group: 'Installation', category: 'W', default_weight: 1.0 },
  { id: 200014, title: 'Joint assembly complexity', group: 'Installation', category: 'W', default_weight: 1.0 },
  { id: 200015, title: 'Site labour intensity', group: 'Installation', category: 'W', default_weight: 1.0 },
  { id: 200016, title: 'Weather sensitivity during installation', group: 'Installation', category: 'T', default_weight: 1.0 },
  { id: 200017, title: 'Requirement for environmental control tents', group: 'Installation', category: 'T', default_weight: 1.0 },
  { id: 200018, title: 'Site plant availability', group: 'Installation', category: 'O', default_weight: 1.0 },
  // Durability / lifecycle
  { id: 200019, title: 'UV durability', group: 'Durability / lifecycle', category: 'S', default_weight: 1.0 },
  { id: 200020, title: 'Water ingress risk', group: 'Durability / lifecycle', category: 'W', default_weight: 1.0 },
  { id: 200021, title: 'Replaceability of modules', group: 'Durability / lifecycle', category: 'O', default_weight: 1.0 },
  { id: 200022, title: 'Ease of inspection of joints', group: 'Durability / lifecycle', category: 'S', default_weight: 1.0 },
  { id: 200023, title: 'Through-life maintenance burden', group: 'Durability / lifecycle', category: 'W', default_weight: 1.0 },
  // Commercial
  { id: 200024, title: 'Supply chain confidence', group: 'Commercial', category: 'O', default_weight: 1.0 },
  { id: 200025, title: 'Fabrication lead time', group: 'Commercial', category: 'W', default_weight: 1.0 },
  { id: 200026, title: 'Installation programme certainty', group: 'Commercial', category: 'O', default_weight: 1.0 },
  { id: 200027, title: 'Whole-life cost', group: 'Commercial', category: 'W', default_weight: 1.0 },
  { id: 200028, title: 'Initial CAPEX certainty', group: 'Commercial', category: 'O', default_weight: 1.0 },
  // Risk
  { id: 200029, title: 'Design maturity', group: 'Risk', category: 'T', default_weight: 1.0 },
  { id: 200030, title: 'Approval / stakeholder risk', group: 'Risk', category: 'T', default_weight: 1.0 },
  { id: 200031, title: 'Construction sequencing risk', group: 'Risk', category: 'T', default_weight: 1.0 },
  { id: 200032, title: 'Tolerance accumulation risk', group: 'Risk', category: 'T', default_weight: 1.0 },
  { id: 200033, title: 'Interface risk with substructure', group: 'Risk', category: 'T', default_weight: 1.0 },

  // Template-derived base criteria (Resources/frp_bridge_weighted_swot_template.xlsx)
  { id: 210001, title: 'Global deflection', group: 'Structural Performance', category: 'S', default_weight: 5.0 },
  { id: 210002, title: 'Dynamic response / vibration', group: 'Structural Performance', category: 'S', default_weight: 3.0 },
  { id: 210003, title: 'Buckling resistance', group: 'Structural Performance', category: 'S', default_weight: 2.0 },
  { id: 210004, title: 'Long-term creep', group: 'Structural Performance', category: 'W', default_weight: 3.0 },
  { id: 210005, title: 'Structural simplicity', group: 'Structural Performance', category: 'O', default_weight: 3.0 },
  { id: 210006, title: 'Future strengthening potential', group: 'Structural Performance', category: 'O', default_weight: 2.0 },
  { id: 210007, title: 'Manufacturing complexity', group: 'Fabrication', category: 'W', default_weight: 4.0 },
  { id: 210008, title: 'Tooling complexity', group: 'Fabrication', category: 'W', default_weight: 3.0 },
  { id: 210009, title: 'Material efficiency', group: 'Fabrication', category: 'O', default_weight: 2.0 },
  { id: 210010, title: 'Quality control risk', group: 'Fabrication', category: 'T', default_weight: 2.0 },
  { id: 210011, title: 'Manufacturing repeatability', group: 'Fabrication', category: 'S', default_weight: 2.0 },
  { id: 210012, title: 'Tolerance control', group: 'Fabrication', category: 'W', default_weight: 2.0 },
  { id: 210013, title: 'Module length vs road transport', group: 'Transport & Logistics', category: 'W', default_weight: 4.0 },
  { id: 210014, title: 'Module width vs abnormal load', group: 'Transport & Logistics', category: 'T', default_weight: 3.0 },
  { id: 210015, title: 'Module weight', group: 'Transport & Logistics', category: 'W', default_weight: 3.0 },
  { id: 210016, title: 'Transport complexity', group: 'Transport & Logistics', category: 'T', default_weight: 3.0 },
  { id: 210017, title: 'Lift complexity', group: 'Transport & Logistics', category: 'W', default_weight: 3.0 },
  { id: 210018, title: 'Handling damage risk', group: 'Transport & Logistics', category: 'T', default_weight: 2.0 },
  { id: 210019, title: 'Installation duration', group: 'Construction', category: 'O', default_weight: 3.0 },
  { id: 210020, title: 'Site assembly complexity', group: 'Construction', category: 'W', default_weight: 3.0 },
  { id: 210021, title: 'Requirement for site bonding', group: 'Construction', category: 'W', default_weight: 2.0 },
  { id: 210022, title: 'Tolerance fit-up risk', group: 'Construction', category: 'T', default_weight: 2.0 },
  { id: 210023, title: 'Crane requirements', group: 'Construction', category: 'W', default_weight: 3.0 },
  { id: 210024, title: 'Temporary supports', group: 'Construction', category: 'W', default_weight: 2.0 },
  { id: 210025, title: 'Foundation loads', group: 'Substructure Interaction', category: 'S', default_weight: 3.0 },
  { id: 210026, title: 'Number of piers', group: 'Substructure Interaction', category: 'W', default_weight: 3.0 },
  { id: 210027, title: 'Substructure complexity', group: 'Substructure Interaction', category: 'W', default_weight: 2.0 },
  { id: 210028, title: 'Hydraulic flow impact', group: 'Substructure Interaction', category: 'T', default_weight: 2.0 },
  { id: 210029, title: 'Corrosion resistance', group: 'Durability', category: 'S', default_weight: 2.0 },
  { id: 210030, title: 'Joint durability', group: 'Durability', category: 'W', default_weight: 3.0 },
  { id: 210031, title: 'Replaceable components', group: 'Durability', category: 'O', default_weight: 1.0 },
  { id: 210032, title: 'Inspection accessibility', group: 'Durability', category: 'O', default_weight: 1.0 },
  { id: 210033, title: 'Maintenance frequency', group: 'Durability', category: 'W', default_weight: 1.0 },
  { id: 210034, title: 'Fabrication cost', group: 'Cost', category: 'W', default_weight: 1.0 },
  { id: 210035, title: 'Transport cost', group: 'Cost', category: 'W', default_weight: 1.0 },
  { id: 210036, title: 'Installation cost', group: 'Cost', category: 'W', default_weight: 1.0 },
  { id: 210037, title: 'Substructure cost', group: 'Cost', category: 'W', default_weight: 1.0 },
  { id: 210038, title: 'Manufacturing lead time', group: 'Programme Risk', category: 'T', default_weight: 1.0 },
  { id: 210039, title: 'Supply chain risk', group: 'Programme Risk', category: 'T', default_weight: 1.0 },
  { id: 210040, title: 'Embodied carbon', group: 'Environmental', category: 'O', default_weight: 1.0 },
  { id: 210041, title: 'Floodplain disturbance', group: 'Environmental', category: 'T', default_weight: 1.0 },
  { id: 210042, title: 'Flood obstruction risk', group: 'Project Specific', category: 'T', default_weight: 3.0 },
  { id: 210043, title: 'Ramp curvature compatibility', group: 'Project Specific', category: 'W', default_weight: 2.0 },
]

function createInitialOption(name, templates) {
  const scores = templates.map((t) => ({
    criterion_id: t.id,
    category: t.category,
    factor_weight: t.default_weight,
    score_best: 7,
    score_base: 6,
    score_worst: 5,
  }))

  return {
    option_name: name,
    scores,
  }
}

function addCriterionToOptions(currentOptions, criterion) {
  return currentOptions.map((option) => {
    const exists = option.scores.some((score) => score.criterion_id === criterion.id)
    if (exists) {
      return option
    }

    return {
      ...option,
      scores: [
        ...option.scores,
        {
          criterion_id: criterion.id,
          category: criterion.category,
          factor_weight: criterion.default_weight,
          score_best: 7,
          score_base: 6,
          score_worst: 5,
        },
      ],
    }
  })
}

function mergeSuggestedIntoOptions(currentOptions, suggestedItems) {
  return suggestedItems.reduce((acc, item) => addCriterionToOptions(acc, item), currentOptions)
}

export default function App() {
  const [briefText, setBriefText] = useState('')
  const [templates, setTemplates] = useState([])
  const [suggested, setSuggested] = useState({ S: [], W: [], O: [], T: [] })
  const [constraints, setConstraints] = useState([])
  const [options, setOptions] = useState([])
  const [riskConfidence, setRiskConfidence] = useState(0.65)
  const [categoryWeights, setCategoryWeights] = useState(INITIAL_CATEGORY_WEIGHTS)
  const [ahpPreferences, setAhpPreferences] = useState({ sw: 1, so: 1, st: 1, wo: 1, wt: 1, ot: 1 })
  const [result, setResult] = useState({ ranking: [], winner: null, loser: null })
  const [reportInfo, setReportInfo] = useState(null)
  const [newCriterionTitle, setNewCriterionTitle] = useState('')
  const [newCriterionCategory, setNewCriterionCategory] = useState('S')
  const [newCriterionWeight, setNewCriterionWeight] = useState(1)
  const [projectStatusMessage, setProjectStatusMessage] = useState('')
  const [additionalCriteriaToggles, setAdditionalCriteriaToggles] = useState(
    () => Object.fromEntries(ADDITIONAL_CRITERIA.map((item) => [item.id, false])),
  )

  const sortedTemplates = useMemo(() => {
    const rank = { S: 0, W: 1, O: 2, T: 3 }
    return [...templates].sort((a, b) => {
      const categoryDiff = rank[a.category] - rank[b.category]
      if (categoryDiff !== 0) {
        return categoryDiff
      }
      return a.title.localeCompare(b.title)
    })
  }, [templates])

  const swotHeadings = {
    S: 'Strengths',
    W: 'Weaknesses',
    O: 'Opportunities',
    T: 'Threats',
  }

  const additionalCriteriaByGroup = useMemo(() => {
    return ADDITIONAL_CRITERIA.reduce((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = { S: [], W: [], O: [], T: [] }
      }
      acc[item.group][item.category].push(item)
      return acc
    }, {})
  }, [])

  useEffect(() => {
    async function bootstrap() {
      const [templateRows, transportRows] = await Promise.all([
        fetchCriteriaTemplates(),
        fetchTransportDefaults(),
      ])

      setTemplates(templateRows)
      setConstraints(transportRows)
      setOptions([
        createInitialOption('FRP Walkway - Continuous', templateRows),
        createInitialOption('FRP Walkway - Split', templateRows),
      ])
    }

    bootstrap()
  }, [])

  const summaryByCategory = useMemo(() => {
    return ['S', 'W', 'O', 'T'].map((cat) => ({
      category: cat,
      count: suggested[cat]?.length ?? 0,
    }))
  }, [suggested])

  const selectedAdditionalCount = useMemo(
    () => Object.values(additionalCriteriaToggles).filter(Boolean).length,
    [additionalCriteriaToggles],
  )

  const templateCountsByCategory = useMemo(() => {
    const base = { S: 0, W: 0, O: 0, T: 0 }
    templates.forEach((item) => {
      if (base[item.category] !== undefined) {
        base[item.category] += 1
      }
    })
    return base
  }, [templates])

  async function onSuggestCriteria() {
    const data = await suggestCriteriaFromBrief(briefText)
    setSuggested({ S: data.S ?? [], W: data.W ?? [], O: data.O ?? [], T: data.T ?? [] })
  }

  function onApplySuggestedCriteria() {
    const flatSuggested = ['S', 'W', 'O', 'T'].flatMap((category) => suggested[category] ?? [])
    if (!flatSuggested.length) {
      return
    }

    setTemplates((current) => {
      const existingIds = new Set(current.map((item) => item.id))
      const additions = flatSuggested.filter((item) => !existingIds.has(item.id))
      return [...current, ...additions]
    })

    setOptions((current) => mergeSuggestedIntoOptions(current, flatSuggested))
  }

  function onOptionNameChange(index, value) {
    setOptions((current) =>
      current.map((item, idx) => (idx === index ? { ...item, option_name: value } : item)),
    )
  }

  function onScoreChange(optionIndex, criterionId, field, value) {
    const safeValue = Number(value)
    setOptions((current) =>
      current.map((option, idx) => {
        if (idx !== optionIndex) {
          return option
        }

        return {
          ...option,
          scores: option.scores.map((score) => {
            if (score.criterion_id !== criterionId) {
              return score
            }
            return { ...score, [field]: safeValue }
          }),
        }
      }),
    )
  }

  function onTemplateWeightChange(templateId, value) {
    const safeValue = Number(value)
    if (!Number.isFinite(safeValue)) {
      return
    }

    setTemplates((current) =>
      current.map((item) =>
        item.id === templateId
          ? { ...item, default_weight: safeValue }
          : item,
      ),
    )

    setOptions((current) =>
      current.map((option) => ({
        ...option,
        scores: option.scores.map((score) =>
          score.criterion_id === templateId
            ? { ...score, factor_weight: safeValue }
            : score,
        ),
      })),
    )
  }

  function onAhpPreferenceChange(field, value) {
    setAhpPreferences((current) => ({ ...current, [field]: Number(value) }))
  }

  function onConstraintChange(index, value) {
    const safeValue = Number(value)
    setConstraints((current) =>
      current.map((row, idx) => (idx === index ? { ...row, value: safeValue } : row)),
    )
  }

  function onAddOption() {
    setOptions((current) => [...current, createInitialOption(`Option ${current.length + 1}`, templates)])
  }

  function onAddCombination() {
    if (options.length < 2) {
      return
    }
    const selected = options.slice(0, 2)
    const name = `${selected[0].option_name} + ${selected[1].option_name}`
    const scores = selected[0].scores.map((score, idx) => {
      const b = selected[1].scores[idx]
      return {
        ...score,
        score_best: Number(((score.score_best + b.score_best) / 2).toFixed(2)),
        score_base: Number(((score.score_base + b.score_base) / 2).toFixed(2)),
        score_worst: Number(((score.score_worst + b.score_worst) / 2).toFixed(2)),
      }
    })
    setOptions((current) => [...current, { option_name: name, scores }])
  }

  function onAddCustomCriterion() {
    const trimmedTitle = newCriterionTitle.trim()
    if (!trimmedTitle) {
      return
    }

    const maxId = templates.reduce((max, item) => Math.max(max, item.id), 0)
    const criterion = {
      id: maxId + 1,
      title: trimmedTitle,
      category: newCriterionCategory,
      default_weight: Number(newCriterionWeight) || 1,
      prompt_keywords: '',
    }

    setTemplates((current) => [...current, criterion])
    setOptions((current) => addCriterionToOptions(current, criterion))

    setNewCriterionTitle('')
    setNewCriterionCategory('S')
    setNewCriterionWeight(1)
  }

  function onToggleAdditionalCriterion(criterionId, isEnabled) {
    const criterion = ADDITIONAL_CRITERIA.find((item) => item.id === criterionId)
    if (!criterion) {
      return
    }

    setAdditionalCriteriaToggles((current) => ({
      ...current,
      [criterionId]: isEnabled,
    }))

    if (isEnabled) {
      setTemplates((current) => {
        if (current.some((item) => item.id === criterion.id)) {
          return current
        }
        return [...current, criterion]
      })
      setOptions((current) => addCriterionToOptions(current, criterion))
      return
    }

    setTemplates((current) => current.filter((item) => item.id !== criterion.id))
    setOptions((current) =>
      current.map((option) => ({
        ...option,
        scores: option.scores.filter((score) => score.criterion_id !== criterion.id),
      })),
    )
  }

  function onToggleAllAdditional(isEnabled) {
    const nextState = Object.fromEntries(ADDITIONAL_CRITERIA.map((item) => [item.id, isEnabled]))
    setAdditionalCriteriaToggles(nextState)

    if (isEnabled) {
      setTemplates((current) => {
        const existing = new Set(current.map((item) => item.id))
        return [...current, ...ADDITIONAL_CRITERIA.filter((item) => !existing.has(item.id))]
      })
      setOptions((current) => mergeSuggestedIntoOptions(current, ADDITIONAL_CRITERIA))
      return
    }

    const removeIds = new Set(ADDITIONAL_CRITERIA.map((item) => item.id))
    setTemplates((current) => current.filter((item) => !removeIds.has(item.id)))
    setOptions((current) =>
      current.map((option) => ({
        ...option,
        scores: option.scores.filter((score) => !removeIds.has(score.criterion_id)),
      })),
    )
  }

  function onToggleGroup(groupName, isEnabled) {
    const groupItems = ADDITIONAL_CRITERIA.filter((item) => item.group === groupName)

    setAdditionalCriteriaToggles((current) => ({
      ...current,
      ...Object.fromEntries(groupItems.map((item) => [item.id, isEnabled])),
    }))

    if (isEnabled) {
      setTemplates((current) => {
        const existing = new Set(current.map((item) => item.id))
        return [...current, ...groupItems.filter((item) => !existing.has(item.id))]
      })
      setOptions((current) => mergeSuggestedIntoOptions(current, groupItems))
      return
    }

    const removeIds = new Set(groupItems.map((item) => item.id))
    setTemplates((current) => current.filter((item) => !removeIds.has(item.id)))
    setOptions((current) =>
      current.map((option) => ({
        ...option,
        scores: option.scores.filter((score) => !removeIds.has(score.criterion_id)),
      })),
    )
  }

  async function onComputeAhp() {
    const weights = await computeAhpWeights(ahpPreferences)
    setCategoryWeights(weights)
  }

  async function onRunAnalysis() {
    const payload = {
      category_weights: categoryWeights,
      thresholds: DEFAULT_THRESHOLDS,
      options,
      risk_confidence: riskConfidence,
    }
    const analysis = await runAnalysis(payload)
    setResult(analysis)
  }

  async function onGenerateReport() {
    if (!result.ranking.length) {
      return
    }

    const report = await generateReport({
      project_name: 'Project SWOT Study',
      client_name: 'Client',
      executive_summary: 'Risk-adjusted weighted SWOT and MCDA ranking for current shortlisted options.',
      assumptions: [
        'Scores are based on current concept-stage data.',
        'UK transport constraints are editable and project-specific.',
      ],
      ranking: result.ranking,
      winner: result.winner,
      loser: result.loser,
    })

    setReportInfo(report)
  }

  function onSaveProject() {
    try {
      const projectState = {
        briefText,
        templates,
        suggested,
        constraints,
        options,
        riskConfidence,
        categoryWeights,
        ahpPreferences,
        result,
        reportInfo,
        additionalCriteriaToggles,
      }

      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectState))
      setProjectStatusMessage('Project saved locally.')
    } catch (error) {
      setProjectStatusMessage('Save failed. Browser storage may be unavailable.')
    }
  }

  function onLoadProject() {
    try {
      const raw = localStorage.getItem(PROJECT_STORAGE_KEY)
      if (!raw) {
        setProjectStatusMessage('No saved project found.')
        return
      }

      const loaded = JSON.parse(raw)
      const loadedTemplates = Array.isArray(loaded.templates) ? loaded.templates : []
      const loadedOptions = Array.isArray(loaded.options) ? loaded.options : []
      const loadedConstraints = Array.isArray(loaded.constraints) ? loaded.constraints : []

      const mergedToggles = Object.fromEntries(
        ADDITIONAL_CRITERIA.map((item) => {
          const isInTemplates = loadedTemplates.some((template) => template.id === item.id)
          const isEnabled = Boolean(loaded.additionalCriteriaToggles?.[item.id] ?? isInTemplates)
          return [item.id, isEnabled]
        }),
      )

      setBriefText(loaded.briefText ?? '')
      setTemplates(loadedTemplates)
      setSuggested(loaded.suggested ?? { S: [], W: [], O: [], T: [] })
      setConstraints(loadedConstraints)
      setOptions(loadedOptions)
      setRiskConfidence(Number(loaded.riskConfidence ?? 0.65))
      setCategoryWeights(loaded.categoryWeights ?? INITIAL_CATEGORY_WEIGHTS)
      setAhpPreferences(loaded.ahpPreferences ?? { sw: 1, so: 1, st: 1, wo: 1, wt: 1, ot: 1 })
      setResult(loaded.result ?? { ranking: [], winner: null, loser: null })
      setReportInfo(loaded.reportInfo ?? null)
      setAdditionalCriteriaToggles(mergedToggles)

      setProjectStatusMessage('Project loaded.')
    } catch (error) {
      setProjectStatusMessage('Load failed. Saved file may be invalid.')
    }
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>Weighted SWOT + MCDA Decision Studio</h1>
        <p>FRP bridge and product suitability with risk-adjusted scoring.</p>
        <nav className="progress-nav" aria-label="Workflow step navigator">
          {STEP_LINKS.map((step) => (
            <a key={step.id} href={`#${step.id}`}>
              {step.label}
            </a>
          ))}
        </nav>
        <div className="workflow-strip">
          <span>Criteria: {templates.length}</span>
          <span>Extra enabled: {selectedAdditionalCount}</span>
          <span>Options: {options.length}</span>
          <span>Status: {result.ranking.length ? 'Analysed' : 'Not run'}</span>
        </div>
        <div className="row-actions">
          <button onClick={onSaveProject}>Save Project</button>
          <button className="button-secondary" onClick={onLoadProject}>Load Project</button>
          {projectStatusMessage && <span className="status-text">{projectStatusMessage}</span>}
        </div>
      </header>

      <section className="panel" id="brief">
        <div className="panel-head">
          <h2>1. Project Brief</h2>
          <p>Paste context, generate criteria suggestions, then apply what is relevant.</p>
        </div>
        <textarea
          value={briefText}
          onChange={(e) => setBriefText(e.target.value)}
          placeholder="Paste project brief text. Include logistics, transport, client goals, and site conditions."
        />
        <div className="row-actions">
          <button onClick={onSuggestCriteria}>Suggest Criteria from Brief</button>
          <button onClick={onApplySuggestedCriteria}>Apply Suggested Criteria ({summaryByCategory.reduce((sum, item) => sum + item.count, 0)})</button>
        </div>
        <div className="suggestion-grid">
          {summaryByCategory.map((item) => (
            <div key={item.category} className="badge-card">
              <strong>{item.category}</strong>
              <span>{item.count} matched criteria</span>
            </div>
          ))}
        </div>

        <details className="detail-block">
          <summary>Review suggested criteria details</summary>
          <div className="suggestion-list-grid">
            {['S', 'W', 'O', 'T'].map((category) => (
              <div key={category} className="suggestion-list-card">
                <h4>{category} Suggested Criteria</h4>
                {(suggested[category] ?? []).length === 0 && <p className="muted">No suggestions yet.</p>}
                {(suggested[category] ?? []).map((item) => (
                  <div key={`${category}-${item.id}`} className="suggestion-item">
                    <span>{item.title}</span>
                    <small>Weight {item.default_weight}</small>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </details>
      </section>

      <section className="panel" id="criteria">
        <div className="panel-head">
          <h2>2. Criteria List</h2>
          <p>Edit criterion weights in one place. Changes apply to all options.</p>
        </div>
        <div className="workflow-strip mini">
          <span>S: {templateCountsByCategory.S}</span>
          <span>W: {templateCountsByCategory.W}</span>
          <span>O: {templateCountsByCategory.O}</span>
          <span>T: {templateCountsByCategory.T}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Criterion</th>
                <th>Factor Weight</th>
              </tr>
            </thead>
            <tbody>
              {sortedTemplates.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.category}</td>
                  <td>{item.title}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.default_weight}
                      onChange={(e) => onTemplateWeightChange(item.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="inline-form">
          <input
            value={newCriterionTitle}
            onChange={(e) => setNewCriterionTitle(e.target.value)}
            placeholder="Add custom criterion"
          />
          <select value={newCriterionCategory} onChange={(e) => setNewCriterionCategory(e.target.value)}>
            <option value="S">S</option>
            <option value="W">W</option>
            <option value="O">O</option>
            <option value="T">T</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.1"
            value={newCriterionWeight}
            onChange={(e) => setNewCriterionWeight(Number(e.target.value))}
          />
          <button onClick={onAddCustomCriterion}>Add Criterion</button>
        </div>
      </section>

      <section className="panel" id="library">
        <div className="panel-head">
          <h2>3. Additional Criteria Library</h2>
          <p>Start with all off. Enable only what matters for this project.</p>
        </div>
        <div className="row-actions">
          <button onClick={() => onToggleAllAdditional(true)}>Select All On</button>
          <button className="button-secondary" onClick={() => onToggleAllAdditional(false)}>Select All Off</button>
        </div>
        <div className="criteria-toggle-groups">
          {Object.entries(additionalCriteriaByGroup).map(([groupName, categories]) => {
            const groupItems = ['S', 'W', 'O', 'T'].flatMap((key) => categories[key] ?? [])
            const enabledCount = groupItems.filter((item) => additionalCriteriaToggles[item.id]).length

            return (
              <details key={groupName} className="criteria-toggle-group" open={enabledCount > 0}>
                <summary className="group-summary">
                  <h3>{groupName}</h3>
                  <span>{enabledCount}/{groupItems.length} enabled</span>
                </summary>
                <div className="group-header">
                  <div className="muted">Quick group action</div>
                  <div>
                    <button onClick={() => onToggleGroup(groupName, true)}>On</button>
                    <button className="button-secondary" onClick={() => onToggleGroup(groupName, false)}>Off</button>
                  </div>
                </div>
                {['S', 'W', 'O', 'T'].map((swotKey) => (
                  <div key={`${groupName}-${swotKey}`} className="swot-subgroup">
                    <h4>{swotHeadings[swotKey]}</h4>
                    {(categories[swotKey] ?? []).map((item) => (
                      <label key={item.id} className="criteria-toggle-item">
                        <input
                          type="checkbox"
                          checked={Boolean(additionalCriteriaToggles[item.id])}
                          onChange={(e) => onToggleAdditionalCriterion(item.id, e.target.checked)}
                        />
                        <span>{item.title}</span>
                        <small>{item.category}</small>
                      </label>
                    ))}
                    {(categories[swotKey] ?? []).length === 0 && <p className="muted">None</p>}
                  </div>
                ))}
              </details>
            )
          })}
        </div>
      </section>

      <section className="panel" id="constraints">
        <div className="panel-head">
          <h2>4. UK Transport Constraints</h2>
          <p>Adjust defaults only when your route and permitting conditions differ.</p>
        </div>
        <div className="constraints-grid">
          {constraints.map((row, idx) => (
            <label key={row.name}>
              <span>{row.name} ({row.unit})</span>
              <input type="number" step="0.01" value={row.value} onChange={(e) => onConstraintChange(idx, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="panel" id="weights">
        <div className="panel-head">
          <h2>5. Category Weights (AHP)</h2>
          <p>Use pairwise preferences to tune strategic weighting across SWOT categories.</p>
        </div>
        <p>Set pairwise importance using Saaty scale (1-9). Higher values favor first category.</p>
        <div className="score-grid">
          <label>
            S vs W
            <input type="number" min="1" max="9" step="0.1" value={ahpPreferences.sw} onChange={(e) => onAhpPreferenceChange('sw', e.target.value)} />
          </label>
          <label>
            S vs O
            <input type="number" min="1" max="9" step="0.1" value={ahpPreferences.so} onChange={(e) => onAhpPreferenceChange('so', e.target.value)} />
          </label>
          <label>
            S vs T
            <input type="number" min="1" max="9" step="0.1" value={ahpPreferences.st} onChange={(e) => onAhpPreferenceChange('st', e.target.value)} />
          </label>
          <label>
            W vs O
            <input type="number" min="1" max="9" step="0.1" value={ahpPreferences.wo} onChange={(e) => onAhpPreferenceChange('wo', e.target.value)} />
          </label>
          <label>
            W vs T
            <input type="number" min="1" max="9" step="0.1" value={ahpPreferences.wt} onChange={(e) => onAhpPreferenceChange('wt', e.target.value)} />
          </label>
          <label>
            O vs T
            <input type="number" min="1" max="9" step="0.1" value={ahpPreferences.ot} onChange={(e) => onAhpPreferenceChange('ot', e.target.value)} />
          </label>
        </div>
        <div className="row-actions">
          <button onClick={onComputeAhp}>Compute AHP Weights</button>
        </div>
        <div className="winner-strip">
          <span>S: {categoryWeights.S.toFixed(3)}</span>
          <span>W: {categoryWeights.W.toFixed(3)}</span>
          <span>O: {categoryWeights.O.toFixed(3)}</span>
          <span>T: {categoryWeights.T.toFixed(3)}</span>
        </div>
      </section>

      <section className="panel" id="scoring">
        <div className="panel-head">
          <h2>6. Options and Scores</h2>
          <p>Score all options in one matrix with Best/Base/Worst scenarios.</p>
        </div>
        <div className="row-actions">
          <button onClick={onAddOption}>Add Option</button>
          <button className="button-secondary" onClick={onAddCombination}>Add Combination (first two)</button>
        </div>

        {options.map((option, optionIdx) => (
          <div key={optionIdx} className="option-card">
            <input
              className="option-name"
              value={option.option_name}
              onChange={(e) => onOptionNameChange(optionIdx, e.target.value)}
            />
            <div className="table-wrap">
              <table className="compact-score-matrix">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    {sortedTemplates.map((criterion) => (
                      <th key={`${option.option_name}-h-${criterion.id}`}>
                        <div>{criterion.title}</div>
                        <small>{criterion.category}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[['Best', 'score_best'], ['Base', 'score_base'], ['Worst', 'score_worst']].map(
                    ([label, field]) => (
                      <tr key={`${option.option_name}-${label}`}>
                        <td>{label}</td>
                        {sortedTemplates.map((criterion) => {
                          const score = option.scores.find((item) => item.criterion_id === criterion.id)
                          if (!score) {
                            return <td key={`${option.option_name}-${label}-${criterion.id}`}>-</td>
                          }

                          return (
                            <td key={`${option.option_name}-${label}-${criterion.id}`}>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={score[field]}
                                onChange={(e) => onScoreChange(optionIdx, criterion.id, field, e.target.value)}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section className="panel" id="run">
        <div className="panel-head">
          <h2>7. Run and Report</h2>
          <p>Set confidence, run ranking, then generate report outputs.</p>
        </div>
        <label>
          Risk confidence ({riskConfidence.toFixed(2)})
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={riskConfidence}
            onChange={(e) => setRiskConfidence(Number(e.target.value))}
          />
        </label>
        <div className="row-actions">
          <button onClick={onRunAnalysis}>Run Analysis</button>
          <button className="button-secondary" onClick={onGenerateReport}>Generate Report</button>
        </div>
        {reportInfo && (
          <div className="report-box">
            <strong>Report status: {reportInfo.render_status}</strong>
            <span>Markdown: {reportInfo.markdown_path}</span>
            <span>LaTeX: {reportInfo.latex_path}</span>
            <span>PDF: {reportInfo.pdf_path ?? 'Not rendered'}</span>
            <span>DOCX: {reportInfo.docx_path ?? 'Not rendered'}</span>
          </div>
        )}
      </section>

      <SummaryTable ranking={result.ranking} winner={result.winner} loser={result.loser} />
      <ScoreChart ranking={result.ranking} />
    </div>
  )
}
