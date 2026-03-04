import type { TravelPlan } from './generatePlan'
import { isTravelPlan } from './generatePlan'

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
 * 型ガードで構造を検証し、不正なデータの場合は null を返す。
 */
export function decodePlan(query: string): TravelPlan | null {
  try {
    const params = new URLSearchParams(query)
    const base64 = params.get('plan')
    if (!base64) return null
    const json = decodeURIComponent(atob(base64))
    const data: unknown = JSON.parse(json)

    // 後方互換: day フィールドがない旧データにフォールバック
    if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).schedule)) {
      for (const item of (data as Record<string, unknown>).schedule as Record<string, unknown>[]) {
        if (item && typeof item === 'object' && typeof item.day !== 'number') {
          item.day = 1
        }
      }
    }

    if (!isTravelPlan(data)) return null
    return data
  } catch {
    return null
  }
}
