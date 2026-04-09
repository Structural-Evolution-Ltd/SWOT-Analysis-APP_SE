import { useState, useCallback, useEffect, useRef } from 'react'
import type { SwotData, SwotCategory, SwotItem } from './types'
import { createSwotItem, createEmptySwotData } from './types'
import { loadFromStorage, saveToStorage, exportToJson, importFromJson } from './storage'
import { SwotQuadrant } from './components/SwotQuadrant'
import './App.css'

const QUADRANT_CONFIG: {
  category: SwotCategory
  label: string
  icon: string
}[] = [
  { category: 'strengths', label: 'Strengths', icon: '💪' },
  { category: 'weaknesses', label: 'Weaknesses', icon: '⚠️' },
  { category: 'opportunities', label: 'Opportunities', icon: '🚀' },
  { category: 'threats', label: 'Threats', icon: '🛡️' },
]

function App() {
  const [swotData, setSwotData] = useState<SwotData>(() => loadFromStorage())
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(swotData.title)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Persist changes to localStorage whenever swotData changes
  useEffect(() => {
    saveToStorage(swotData)
  }, [swotData])

  const addItem = useCallback((category: SwotCategory, text: string) => {
    const item = createSwotItem(text, category)
    setSwotData((prev) => ({
      ...prev,
      [category]: [...prev[category], item],
    }))
  }, [])

  const deleteItem = useCallback((category: SwotCategory, id: string) => {
    setSwotData((prev) => ({
      ...prev,
      [category]: prev[category].filter((item: SwotItem) => item.id !== id),
    }))
  }, [])

  const editItem = useCallback((category: SwotCategory, id: string, text: string) => {
    setSwotData((prev) => ({
      ...prev,
      [category]: prev[category].map((item: SwotItem) =>
        item.id === id ? { ...item, text } : item
      ),
    }))
  }, [])

  const handleTitleSave = () => {
    const trimmed = titleDraft.trim()
    if (trimmed) {
      setSwotData((prev) => ({ ...prev, title: trimmed }))
    } else {
      setTitleDraft(swotData.title)
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTitleSave()
    if (e.key === 'Escape') {
      setTitleDraft(swotData.title)
      setIsEditingTitle(false)
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all SWOT data? This cannot be undone.')) {
      const fresh = createEmptySwotData(swotData.title)
      setSwotData(fresh)
    }
  }

  const handleExport = () => {
    exportToJson(swotData)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    try {
      const data = await importFromJson(file)
      setSwotData(data)
      setTitleDraft(data.title)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import file')
    } finally {
      // Reset input so same file can be re-imported
      e.target.value = ''
    }
  }

  const totalItems =
    swotData.strengths.length +
    swotData.weaknesses.length +
    swotData.opportunities.length +
    swotData.threats.length

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <div className="app__title-wrapper">
            {isEditingTitle ? (
              <input
                className="app__title-input"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                aria-label="Edit analysis title"
              />
            ) : (
              <h1
                className="app__title"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(true)}
                aria-label={`Analysis title: ${swotData.title}. Click to edit.`}
              >
                {swotData.title}
                <span className="app__title-edit-hint" aria-hidden="true">✎</span>
              </h1>
            )}
            <p className="app__subtitle">
              Strategic planning framework — {totalItems} item{totalItems !== 1 ? 's' : ''} total
            </p>
          </div>

          <div className="app__actions">
            <button className="app__action-btn app__action-btn--secondary" onClick={handleImportClick} title="Import JSON">
              ⬆ Import
            </button>
            <button className="app__action-btn app__action-btn--secondary" onClick={handleExport} title="Export JSON">
              ⬇ Export
            </button>
            <button className="app__action-btn app__action-btn--danger" onClick={handleClearAll} title="Clear all items">
              🗑 Clear All
            </button>
          </div>
        </div>

        {importError && (
          <div className="app__error" role="alert">
            {importError}
            <button onClick={() => setImportError(null)} aria-label="Dismiss error">✕</button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
          aria-label="Import SWOT data from JSON file"
        />
      </header>

      <main className="app__matrix">
        {QUADRANT_CONFIG.map(({ category, label, icon }) => (
          <SwotQuadrant
            key={category}
            category={category}
            label={label}
            icon={icon}
            items={swotData[category]}
            onAddItem={(text) => addItem(category, text)}
            onDeleteItem={(id) => deleteItem(category, id)}
            onEditItem={(id, text) => editItem(category, id, text)}
          />
        ))}
      </main>

      <footer className="app__footer">
        <p>SWOT Analysis App — Identify <strong>S</strong>trengths, <strong>W</strong>eaknesses, <strong>O</strong>pportunities &amp; <strong>T</strong>hreats</p>
      </footer>
    </div>
  )
}

export default App
