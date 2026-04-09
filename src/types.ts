export type SwotCategory = 'strengths' | 'weaknesses' | 'opportunities' | 'threats'

export interface SwotItem {
  id: string
  text: string
  category: SwotCategory
}

export interface SwotData {
  title: string
  strengths: SwotItem[]
  weaknesses: SwotItem[]
  opportunities: SwotItem[]
  threats: SwotItem[]
}

export function createEmptySwotData(title = 'My SWOT Analysis'): SwotData {
  return {
    title,
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createSwotItem(text: string, category: SwotCategory): SwotItem {
  return {
    id: generateId(),
    text: text.trim(),
    category,
  }
}
