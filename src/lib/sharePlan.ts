import type { TravelPlan } from './generatePlan'

/**
 * TravelPlan を Base64 エンコードして ?plan=xxxxx 形式のクエリ文字列を返す。
 */
export function encodePlan(plan: TravelPlan): string {
  const json = JSON.stringify(plan)
  const base64 = btoa(encodeURIComponent(json))
  return `?plan=${base64}`
}

/**
 * URL のクエリ文字列から plan パラメータを取得し、TravelPlan にデコードする。
 * 失敗時は null を返す。
 */
export function decodePlan(query: string): TravelPlan | null {
  try {
    const params = new URLSearchParams(query)
    const base64 = params.get('plan')
    if (!base64) return null
    const json = decodeURIComponent(atob(base64))
    return JSON.parse(json) as TravelPlan
  } catch {
    return null
  }
}
