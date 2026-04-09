import { describe, it, expect } from 'vitest'
import { createSwotItem, createEmptySwotData, generateId } from '../types'

describe('types', () => {
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()))
      expect(ids.size).toBe(100)
    })
  })

  describe('createSwotItem', () => {
    it('creates an item with the correct category and text', () => {
      const item = createSwotItem('Strong brand', 'strengths')
      expect(item.text).toBe('Strong brand')
      expect(item.category).toBe('strengths')
      expect(typeof item.id).toBe('string')
      expect(item.id.length).toBeGreaterThan(0)
    })

    it('trims whitespace from text', () => {
      const item = createSwotItem('  Strong brand  ', 'strengths')
      expect(item.text).toBe('Strong brand')
    })
  })

  describe('createEmptySwotData', () => {
    it('creates empty arrays for all categories', () => {
      const data = createEmptySwotData()
      expect(data.strengths).toEqual([])
      expect(data.weaknesses).toEqual([])
      expect(data.opportunities).toEqual([])
      expect(data.threats).toEqual([])
    })

    it('uses the provided title', () => {
      const data = createEmptySwotData('My Plan')
      expect(data.title).toBe('My Plan')
    })

    it('uses default title when not provided', () => {
      const data = createEmptySwotData()
      expect(typeof data.title).toBe('string')
      expect(data.title.length).toBeGreaterThan(0)
    })
  })
})
