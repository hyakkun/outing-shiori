import type { FormValues } from '../components/PlanForm'

export type ScheduleItem = {
  time: string
  spot: string
  description: string
  category: '食事' | '観光' | '移動' | '宿泊'
}

export type TravelPlan = {
  destination: string
  description: string
  schedule: ScheduleItem[]
}

export async function generatePlan(values: FormValues): Promise<TravelPlan> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      departure: values.departure,
      schedule: values.schedule,
      budget: values.budget,
      styles: values.styles,
    }),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(`API エラー (${res.status}): ${errorBody.error ?? res.statusText}`)
  }

  return (await res.json()) as TravelPlan
}
