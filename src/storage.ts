import type { SwotData } from './types'
import { createEmptySwotData } from './types'

const STORAGE_KEY = 'swot-analysis-data'

export function loadFromStorage(): SwotData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as SwotData
    }
  } catch {
    // If parsing fails, return empty data
  }
  return createEmptySwotData()
}

export function saveToStorage(data: SwotData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // If saving fails (e.g., storage quota exceeded), silently ignore
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportToJson(data: SwotData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}-swot.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function importFromJson(file: File): Promise<SwotData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as SwotData
        if (!data.title || !Array.isArray(data.strengths)) {
          reject(new Error('Invalid SWOT data format'))
          return
        }
        resolve(data)
      } catch {
        reject(new Error('Failed to parse JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
