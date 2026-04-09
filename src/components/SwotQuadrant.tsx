import React, { useState, useRef } from 'react'
import type { SwotCategory, SwotItem } from '../types'
import './SwotQuadrant.css'

interface SwotQuadrantProps {
  category: SwotCategory
  label: string
  icon: string
  items: SwotItem[]
  onAddItem: (text: string) => void
  onDeleteItem: (id: string) => void
  onEditItem: (id: string, text: string) => void
}

export function SwotQuadrant({
  category,
  label,
  icon,
  items,
  onAddItem,
  onDeleteItem,
  onEditItem,
}: SwotQuadrantProps) {
  const [newItemText, setNewItemText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const editRef = useRef<HTMLTextAreaElement>(null)

  const handleAdd = () => {
    const text = newItemText.trim()
    if (text) {
      onAddItem(text)
      setNewItemText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const startEdit = (item: SwotItem) => {
    setEditingId(item.id)
    setEditText(item.text)
    setTimeout(() => editRef.current?.focus(), 0)
  }

  const commitEdit = (id: string) => {
    const text = editText.trim()
    if (text) {
      onEditItem(id, text)
    }
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commitEdit(id)
    }
    if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  return (
    <div className={`swot-quadrant swot-quadrant--${category}`} data-testid={`quadrant-${category}`}>
      <div className="swot-quadrant__header">
        <span className="swot-quadrant__icon" aria-hidden="true">{icon}</span>
        <h2 className="swot-quadrant__title">{label}</h2>
        <span className="swot-quadrant__count">{items.length}</span>
      </div>

      <ul className="swot-quadrant__list" aria-label={`${label} items`}>
        {items.map((item) => (
          <li key={item.id} className="swot-item">
            {editingId === item.id ? (
              <div className="swot-item__edit">
                <textarea
                  ref={editRef}
                  className="swot-item__edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                  onBlur={() => commitEdit(item.id)}
                  aria-label={`Edit ${label} item`}
                  rows={2}
                />
                <div className="swot-item__edit-actions">
                  <button
                    className="swot-item__save-btn"
                    onClick={() => commitEdit(item.id)}
                    aria-label="Save edit"
                  >
                    ✓
                  </button>
                  <button
                    className="swot-item__cancel-btn"
                    onClick={cancelEdit}
                    aria-label="Cancel edit"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div className="swot-item__view">
                <span className="swot-item__bullet" aria-hidden="true">•</span>
                <span className="swot-item__text">{item.text}</span>
                <div className="swot-item__actions">
                  <button
                    className="swot-item__edit-btn"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit: ${item.text}`}
                    title="Edit item"
                  >
                    ✎
                  </button>
                  <button
                    className="swot-item__delete-btn"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label={`Delete: ${item.text}`}
                    title="Delete item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="swot-item swot-item--empty">
            <span>No items yet. Add one below!</span>
          </li>
        )}
      </ul>

      <div className="swot-quadrant__add">
        <textarea
          ref={inputRef}
          className="swot-quadrant__add-input"
          placeholder={`Add a ${label.toLowerCase()} item...`}
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          aria-label={`New ${label} item`}
        />
        <button
          className="swot-quadrant__add-btn"
          onClick={handleAdd}
          disabled={!newItemText.trim()}
          aria-label={`Add ${label} item`}
        >
          + Add
        </button>
      </div>
    </div>
  )
}
