import { useState } from 'react'

export type FormValues = {
  departure: string
  schedule: string
  budget: string
  groupSize: string
  transport: string
  styles: string[]
}

const SCHEDULE_OPTIONS = ['日帰り', '1泊2日', '2泊3日'] as const
const BUDGET_OPTIONS = ['〜1万円', '1〜3万円', '3〜5万円', '5万円〜'] as const
const GROUP_SIZE_OPTIONS = ['1人', '2人', '3〜4人', '5人以上'] as const
const TRANSPORT_OPTIONS = ['公共交通機関', '車あり'] as const
const STYLE_OPTIONS = ['自然', 'グルメ', '観光地', '温泉', '穴場・ローカル'] as const

const initialValues: FormValues = {
  departure: '',
  schedule: SCHEDULE_OPTIONS[0],
  budget: BUDGET_OPTIONS[0],
  groupSize: GROUP_SIZE_OPTIONS[1],
  transport: TRANSPORT_OPTIONS[0],
  styles: [],
}

type Props = {
  onSubmit: (values: FormValues) => void
  loading?: boolean
}

export function PlanForm({ onSubmit, loading }: Props) {
  const [values, setValues] = useState<FormValues>(initialValues)

  const handleStyleToggle = (style: string) => {
    setValues((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-lg space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-lg"
    >
      <h2 className="text-center text-2xl font-bold text-stone-800">
        旅行プランを作成
      </h2>

      {/* 出発地 */}
      <div className="space-y-1">
        <label htmlFor="departure" className="block text-sm font-medium text-stone-600">
          出発地
        </label>
        <input
          id="departure"
          type="text"
          placeholder="例: 東京"
          value={values.departure}
          onChange={(e) => setValues({ ...values, departure: e.target.value })}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
      </div>

      {/* 日程 */}
      <div className="space-y-1">
        <label htmlFor="schedule" className="block text-sm font-medium text-stone-600">
          日程
        </label>
        <select
          id="schedule"
          value={values.schedule}
          onChange={(e) => setValues({ ...values, schedule: e.target.value })}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          {SCHEDULE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* 予算 */}
      <div className="space-y-1">
        <label htmlFor="budget" className="block text-sm font-medium text-stone-600">
          予算（1人あたり）
        </label>
        <select
          id="budget"
          value={values.budget}
          onChange={(e) => setValues({ ...values, budget: e.target.value })}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* 人数 */}
      <div className="space-y-1">
        <label htmlFor="groupSize" className="block text-sm font-medium text-stone-600">
          人数
        </label>
        <select
          id="groupSize"
          value={values.groupSize}
          onChange={(e) => setValues({ ...values, groupSize: e.target.value })}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          {GROUP_SIZE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* 移動手段 */}
      <div className="space-y-1">
        <label htmlFor="transport" className="block text-sm font-medium text-stone-600">
          移動手段
        </label>
        <select
          id="transport"
          value={values.transport}
          onChange={(e) => setValues({ ...values, transport: e.target.value })}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          {TRANSPORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* 旅スタイル */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-stone-600">
          旅スタイル（複数選択可）
        </span>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => {
            const selected = values.styles.includes(style)
            return (
              <button
                key={style}
                type="button"
                onClick={() => handleStyleToggle(style)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  selected
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                {style}
              </button>
            )
          })}
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d4744a] py-3 font-semibold text-white transition hover:bg-[#c0663f] active:bg-[#ab5a37] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {loading ? 'プランを作成中...' : 'プランを提案してもらう'}
      </button>
    </form>
  )
}
