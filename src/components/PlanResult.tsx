import type { TravelPlan, ScheduleItem } from '../lib/generatePlan'

const CATEGORY_STYLES: Record<ScheduleItem['category'], { bg: string; text: string }> = {
  食事: { bg: 'bg-orange-100', text: 'text-orange-700' },
  観光: { bg: 'bg-blue-100', text: 'text-blue-700' },
  移動: { bg: 'bg-gray-100', text: 'text-gray-600' },
  宿泊: { bg: 'bg-purple-100', text: 'text-purple-700' },
}

function formatCost(cost: number): string {
  if (cost === 0) return '無料'
  return `約${cost.toLocaleString()}円`
}

type Props = {
  plan: TravelPlan
  budget?: string
  geocodedIndices?: Set<number>
  onSpotClick?: (index: number) => void
  onShare?: () => void
  copied?: boolean
}

export function PlanResult({ plan, budget, geocodedIndices, onSpotClick, onShare, copied }: Props) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-100 bg-amber-50 px-8 py-10 shadow-lg">
      {/* ヘッダー */}
      <div className="mb-8 border-b border-amber-200 pb-8">
        <p className="mb-2 text-center text-sm font-medium tracking-widest text-amber-600">
          旅のしおり
        </p>
        <h2 className="mb-3 text-center text-3xl font-bold text-gray-800">
          {plan.destination}
        </h2>
        <p className="text-center text-sm leading-relaxed text-gray-600">
          {plan.description}
        </p>
        <p className="mt-3 text-center text-xs text-amber-600">
          概算費用: {formatCost(plan.totalEstimatedCost)}/人
          {budget && <span className="text-gray-400"> （予算: {budget}）</span>}
        </p>
      </div>

      {/* タイムライン */}
      <div>
        {plan.schedule.map((item, i) => {
          const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES['観光']
          const hasMarker = geocodedIndices?.has(i) ?? false
          const showDayLabel = i === 0 || item.day !== plan.schedule[i - 1].day
          return (
            <div key={i} className="mb-6 last:mb-0">
              {showDayLabel && (
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 border-t border-dashed border-amber-300" />
                  <span className="text-xs font-semibold tracking-wide text-amber-500">
                    {item.day}日目
                  </span>
                  <div className="h-px flex-1 border-t border-dashed border-amber-300" />
                </div>
              )}

              <div
                className={`rounded-xl bg-white/80 p-5 shadow-md ${hasMarker ? 'cursor-pointer transition hover:ring-2 hover:ring-amber-300' : ''}`}
                onClick={hasMarker ? () => onSpotClick?.(i) : undefined}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-800">
                    {item.time}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                  >
                    {item.category}
                  </span>
                  {hasMarker && (
                    <span className="text-xs text-amber-500" title="地図で表示">📍</span>
                  )}
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-800">
                  {item.spot}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
                <p className="mt-2 text-right text-xs text-amber-600">
                  {formatCost(item.estimatedCost)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 共有ボタン */}
      {onShare && (
        <div className="mt-8 border-t border-amber-200 pt-6">
          <button
            type="button"
            onClick={onShare}
            className="w-full rounded-lg border border-amber-300 bg-white py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 active:bg-amber-100"
          >
            {copied ? 'コピーしました！' : 'このプランを共有'}
          </button>
        </div>
      )}
    </div>
  )
}
