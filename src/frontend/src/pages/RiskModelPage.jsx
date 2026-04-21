import { useMemo, useState } from 'react'

const CATEGORY_LABELS = { S: 'Strength', W: 'Weakness', O: 'Opportunity', T: 'Threat' }
const REVERSE = new Set(['W', 'T'])

function normalize(score, reverse) {
  const scaled = (score - 1) / 9
  return reverse ? 1 - scaled : scaled
}

function calcSteps(best, worst, confidence, category) {
  const reverse = REVERSE.has(category)
  const nBest = normalize(best, reverse)
  const nWorst = normalize(worst, reverse)
  const nBase = (nBest + nWorst) / 2
  const expected = (nBest + 4 * nBase + nWorst) / 6  // simplifies to midpoint
  const spread = Math.max(0, nBest - nWorst)
  const penalty = spread * (1 - confidence)
  const riskAdj = Math.max(0, expected - penalty)

  return {
    reverse,
    nBest: round(nBest),
    nWorst: round(nWorst),
    nBase: round(nBase),
    expected: round(expected),
    spread: round(spread),
    penalty: round(penalty),
    riskAdj: round(riskAdj),
    expectedScore: round(expected * 10),
    riskAdjScore: round(riskAdj * 10),
    reductionPct: expected > 0 ? round(((expected - riskAdj) / expected) * 100) : 0,
  }
}

function round(v) {
  return Math.round(v * 1000) / 1000
}

function Bar({ label, value, max = 10, colour }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 13 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{value.toFixed(2)} / {max}</span>
      </div>
      <div style={{ background: '#e9ecef', borderRadius: 4, height: 16, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: colour,
            borderRadius: 4,
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  )
}

function Step({ n, label, value, note, highlight }) {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 6,
        background: highlight ? '#fff8e1' : '#f8f9fa',
        border: `1px solid ${highlight ? '#ffe082' : '#dee2e6'}`,
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          <span style={{ color: '#6c757d', marginRight: 6 }}>{n}.</span>{label}
        </span>
        <code style={{ fontSize: 14, color: '#1a1a2e' }}>{value}</code>
      </div>
      {note && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6c757d' }}>{note}</p>}
    </div>
  )
}

export default function RiskModelPage() {
  const [best, setBest] = useState(8)
  const [worst, setWorst] = useState(4)
  const [confidence, setConfidence] = useState(0.65)
  const [category, setCategory] = useState('S')

  const s = useMemo(() => calcSteps(best, worst, confidence, category), [best, worst, confidence, category])
  const isReverse = REVERSE.has(category)

  return (
    <section className="panel page-panel">
      <div className="panel-head">
        <h2>Risk Adjustment Model</h2>
        <p>
          Interactive explainer — adjust the sliders to see how scores are normalised, spread is
          penalised, and risk-adjusted scores are derived.
        </p>
      </div>

      {/* ── Inputs ── */}
      <div className="constraints-grid" style={{ marginBottom: 24 }}>
        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ marginTop: 6 }}
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {k} — {v}
              </option>
            ))}
          </select>
          {isReverse && (
            <small className="muted">
              W and T are reversed — higher raw score → lower risk impact (more bad = penalised more).
            </small>
          )}
        </label>

        <label>
          <span>Best score (1–10): {best}</span>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={best}
            onChange={(e) => setBest(Number(e.target.value))}
          />
        </label>

        <label>
          <span>Worst score (1–10): {worst}</span>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={worst}
            onChange={(e) => setWorst(Number(e.target.value))}
          />
        </label>

        <label>
          <span>Risk confidence: {confidence.toFixed(2)}</span>
          <small className="muted">
            1.0 = full confidence, no penalty. 0.0 = no confidence, maximum penalty.
          </small>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
        </label>
      </div>

      {/* ── Step-by-step breakdown ── */}
      <h3 style={{ marginBottom: 12 }}>Step-by-step calculation</h3>

      <Step
        n="1"
        label="Normalise raw scores → 0–1"
        value={`Best → ${s.nBest}   |   Worst → ${s.nWorst}`}
        note={
          isReverse
            ? `Reversed: norm = 1 − (raw − 1) / 9. A high raw score for ${category} is penalised (means more weakness/threat).`
            : `norm = (raw − 1) / 9. Score 1 → 0.0, Score 10 → 1.0.`
        }
      />

      <Step
        n="2"
        label="Derive base (midpoint)"
        value={`base = (${s.nBest} + ${s.nWorst}) / 2 = ${s.nBase}`}
        note="With Best/Worst only, base is the arithmetic midpoint."
      />

      <Step
        n="3"
        label="Expected value (PERT)"
        value={`E = (best + 4×base + worst) / 6 = ${s.expected}`}
        note={`Simplifies to the midpoint (${s.nBase}) when base = (best + worst) / 2.`}
      />

      <Step
        n="4"
        label="Spread (uncertainty)"
        value={`spread = max(0, best − worst) = max(0, ${s.nBest} − ${s.nWorst}) = ${s.spread}`}
        note="Positive spread means there is uncertainty between optimistic and pessimistic estimates."
      />

      <Step
        n="5"
        label="Spread penalty"
        value={`penalty = spread × (1 − confidence) = ${s.spread} × ${round(1 - confidence)} = ${s.penalty}`}
        note="High confidence → small penalty. Low confidence → the full spread is subtracted."
        highlight={s.penalty > 0}
      />

      <Step
        n="6"
        label="Risk-adjusted value"
        value={`RA = max(0, E − penalty) = max(0, ${s.expected} − ${s.penalty}) = ${s.riskAdj}`}
        highlight
        note={
          s.penalty > 0
            ? `Score reduced by ${s.reductionPct}% due to uncertainty at confidence ${confidence.toFixed(2)}.`
            : 'No penalty — best and worst are equal or confidence is 1.0.'
        }
      />

      <Step
        n="7"
        label="Final score (rescaled to 0–10)"
        value={`Score = RA × 10 = ${s.riskAdjScore}`}
        note="This per-criterion score is aggregated into the category mean, then blended using category weights."
      />

      {/* ── Visual bars ── */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#f8f9fa',
          borderRadius: 8,
          border: '1px solid #dee2e6',
        }}
      >
        <h4 style={{ margin: '0 0 14px' }}>Score comparison</h4>
        <Bar label="Expected score (no penalty)" value={s.expectedScore} colour="#4a90d9" />
        <Bar label="Risk-adjusted score" value={s.riskAdjScore} colour={s.penalty > 0 ? '#e67e22' : '#27ae60'} />
        {s.penalty > 0 && (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#856404' }}>
            ↓ Penalty reduces the score by{' '}
            <strong>{(s.expectedScore - s.riskAdjScore).toFixed(2)} points</strong> ({s.reductionPct}%).
            Increase confidence or narrow the Best/Worst gap to reduce this.
          </p>
        )}
        {s.penalty === 0 && (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#155724' }}>
            ✓ No penalty applied — scores are equal or confidence = 1.0.
          </p>
        )}
      </div>

      {/* ── Formula reference ── */}
      <details className="detail-block" style={{ marginTop: 20 }}>
        <summary>Full formula reference</summary>
        <div style={{ padding: '12px 0', fontSize: 13, lineHeight: 1.7 }}>
          <p><strong>Normalisation</strong> (S / O categories): <code>n = (raw − 1) / 9</code></p>
          <p><strong>Normalisation</strong> (W / T categories, reversed): <code>n = 1 − (raw − 1) / 9</code></p>
          <p><strong>Base</strong> (derived from Best and Worst): <code>base = (nBest + nWorst) / 2</code></p>
          <p><strong>Expected value</strong> (PERT): <code>E = (nBest + 4 × base + nWorst) / 6</code></p>
          <p><strong>Spread</strong>: <code>spread = max(0, nBest − nWorst)</code></p>
          <p><strong>Penalty</strong>: <code>penalty = spread × (1 − risk_confidence)</code></p>
          <p><strong>Risk-adjusted</strong>: <code>RA = max(0, E − penalty)</code></p>
          <p><strong>Category mean</strong>: weighted average of RA values within the category, scaled ×10</p>
          <p><strong>Overall score</strong>: category means blended using AHP-derived category weights, scaled ×10</p>
          <p><strong>Gate check</strong>: each category mean (0–10) must exceed its threshold. Failure drops the option below all passing options in the ranking.</p>
        </div>
      </details>
    </section>
  )
}
