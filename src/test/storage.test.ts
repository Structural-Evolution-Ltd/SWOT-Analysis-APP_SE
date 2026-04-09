import { describe, it, expect, beforeEach } from 'vitest'
import { loadFromStorage, saveToStorage, clearStorage } from '../storage'
import { createEmptySwotData, createSwotItem } from '../types'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('storage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('returns empty data when nothing is stored', () => {
    const data = loadFromStorage()
    expect(data.strengths).toEqual([])
    expect(data.weaknesses).toEqual([])
    expect(data.opportunities).toEqual([])
    expect(data.threats).toEqual([])
  })

  it('saves and loads data correctly', () => {
    const data = createEmptySwotData('Test Plan')
    data.strengths.push(createSwotItem('Test strength', 'strengths'))
    saveToStorage(data)

    const loaded = loadFromStorage()
    expect(loaded.title).toBe('Test Plan')
    expect(loaded.strengths).toHaveLength(1)
    expect(loaded.strengths[0].text).toBe('Test strength')
  })

  it('clears stored data', () => {
    const data = createEmptySwotData('To Clear')
    saveToStorage(data)
    clearStorage()
    const loaded = loadFromStorage()
    expect(loaded.title).toBe('My SWOT Analysis')
    expect(loaded.strengths).toEqual([])
  })
})
