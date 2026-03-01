import { useState } from 'react'

export type FormValues = {
  departure: string
  schedule: string
  budget: string
  styles: string[]
}

const SCHEDULE_OPTIONS = ['日帰り', '1泊2日', '2泊3日'] as const
const BUDGET_OPTIONS = ['〜1万円', '1〜3万円', '3〜5万円', '5万円〜'] as const
const STYLE_OPTIONS = ['自然', 'グルメ', '観光地', '温泉', '穴場・ローカル'] as const

const initialValues: FormValues = {
  departure: '',
  schedule: SCHEDULE_OPTIONS[0],
  budget: BUDGET_OPTIONS[0],
  styles: [],
}

type Props = {
  onSubmit: (values: FormValues) => void
}

export function PlanForm({ onSubmit }: Props) {
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
      className="mx-auto max-w-lg space-y-6 rounded-2xl bg-white p-8 shadow-lg"
    >
      <h2 className="text-center text-2xl font-bold text-gray-800">
        旅行プランを作成
      </h2>

      {/* 出発地 */}
      <div className="space-y-1">
        <label htmlFor="departure" className="block text-sm font-medium text-gray-700">
          出発地
        </label>
        <input
          id="departure"
          type="text"
          placeholder="例: 東京"
          value={values.departure}
          onChange={(e) => setValues({ ...values, departure: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* 日程 */}
      <div className="space-y-1">
        <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
          日程
        </label>
        <select
          id="schedule"
          value={values.schedule}
          onChange={(e) => setValues({ ...values, schedule: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {SCHEDULE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* 予算 */}
      <div className="space-y-1">
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
          予算
        </label>
        <select
          id="budget"
          value={values.budget}
          onChange={(e) => setValues({ ...values, budget: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* 旅スタイル */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-700">
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
                    ? 'border-blue-600 bg-white text-blue-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
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
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
      >
        プランを提案してもらう
      </button>
    </form>
  )
}
