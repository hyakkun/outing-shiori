import type { TravelPlan, ScheduleItem } from '../lib/generatePlan'

const CATEGORY_STYLES: Record<ScheduleItem['category'], { bg: string; text: string; dot: string }> = {
  食事: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  観光: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' },
  移動: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  宿泊: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
}

type Props = {
  plan: TravelPlan
  geocodedIndices?: Set<number>
  onSpotClick?: (index: number) => void
  onShare?: () => void
  copied?: boolean
}

export function PlanResult({ plan, geocodedIndices, onSpotClick, onShare, copied }: Props) {
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
      </div>

      {/* タイムライン */}
      <div className="relative pl-8">
        {/* 縦線 */}
        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-amber-400" />

        {plan.schedule.map((item, i) => {
          const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES['観光']
          const hasMarker = geocodedIndices?.has(i) ?? false
          return (
            <div key={i} className="relative mb-6 last:mb-0">
              {/* ドット */}
              <div
                className={`absolute -left-8 top-1 h-3 w-3 rounded-full ring-2 ring-amber-50 ${style.dot}`}
              />

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
