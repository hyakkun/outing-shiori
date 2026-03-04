import type { FormValues } from '../components/PlanForm'

export type ScheduleItem = {
  day: number
  time: string
  spot: string
  address?: string
  description: string
  estimatedCost: number
  category: '食事' | '観光' | '移動' | '宿泊'
}

export type TravelPlan = {
  destination: string
  description: string
  totalEstimatedCost: number
  schedule: ScheduleItem[]
}

const VALID_CATEGORIES: ScheduleItem['category'][] = ['食事', '観光', '移動', '宿泊']
const MAX_SCHEDULE_ITEMS = 50

export function isTravelPlan(data: unknown): data is TravelPlan {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>

  if (typeof obj.destination !== 'string' || typeof obj.description !== 'string') return false
  if (typeof obj.totalEstimatedCost !== 'number' || !Number.isInteger(obj.totalEstimatedCost) || obj.totalEstimatedCost < 0) return false
  if (!Array.isArray(obj.schedule) || obj.schedule.length > MAX_SCHEDULE_ITEMS) return false

  for (const item of obj.schedule) {
    if (!item || typeof item !== 'object') return false
    const s = item as Record<string, unknown>
    if (typeof s.day !== 'number' || !Number.isInteger(s.day) || s.day < 1) return false
    if (typeof s.time !== 'string') return false
    if (typeof s.spot !== 'string') return false
    if (s.address !== undefined && typeof s.address !== 'string') return false
    if (typeof s.description !== 'string') return false
    if (typeof s.estimatedCost !== 'number' || !Number.isInteger(s.estimatedCost) || s.estimatedCost < 0) return false
    if (typeof s.category !== 'string' || !VALID_CATEGORIES.includes(s.category as ScheduleItem['category'])) return false
  }

  return true
}

export async function generatePlan(values: FormValues): Promise<TravelPlan> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      departure: values.departure,
      schedule: values.schedule,
      budget: values.budget,
      groupSize: values.groupSize,
      transport: values.transport,
      styles: values.styles,
    }),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(`API エラー (${res.status}): ${errorBody.error ?? res.statusText}`)
  }

  const data: unknown = await res.json()
  if (!isTravelPlan(data)) {
    throw new Error('サーバーから不正なレスポンスが返されました')
  }
  return data
}
