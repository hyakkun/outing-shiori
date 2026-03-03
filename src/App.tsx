import { useState, useCallback, useRef, useEffect } from 'react'
import { PlanForm } from './components/PlanForm'
import { PlanResult } from './components/PlanResult'
import { PlanMap } from './components/PlanMap'
import type { FormValues } from './components/PlanForm'
import { generatePlan } from './lib/generatePlan'
import type { TravelPlan } from './lib/generatePlan'
import { encodePlan, decodePlan } from './lib/sharePlan'

function App() {
  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpotIndex, setSelectedSpotIndex] = useState<number | null>(null)
  const [geocodedIndices, setGeocodedIndices] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // URL に ?plan= があれば自動復元
  useEffect(() => {
    const restored = decodePlan(window.location.search)
    if (restored) {
      setPlan(restored)
      // クエリパラメータを消してURLをクリーンにする
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const handleGeocodedIndicesChange = useCallback((indices: Set<number>) => {
    setGeocodedIndices(indices)
  }, [])

  const handleSubmit = async (values: FormValues) => {
    setPlan(null)
    setError(null)
    setSelectedSpotIndex(null)
    setGeocodedIndices(new Set())
    setLoading(true)
    try {
      const result = await generatePlan(values)
      setPlan(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <PlanForm onSubmit={handleSubmit} />

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-amber-700">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
            <p className="text-sm font-medium">プランを作成中...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {plan && (
          <div className="mt-8 space-y-6">
            <PlanResult plan={plan} geocodedIndices={geocodedIndices} onSpotClick={(index) => {
              setSelectedSpotIndex(index)
              mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }} />
            <div ref={mapRef}>
              <PlanMap plan={plan} selectedSpotIndex={selectedSpotIndex} onGeocodedIndicesChange={handleGeocodedIndicesChange} />
            </div>
            <button
              type="button"
              onClick={async () => {
                const url = window.location.origin + window.location.pathname + encodePlan(plan)
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="w-full rounded-lg border border-amber-300 bg-white py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 active:bg-amber-100"
            >
              {copied ? 'コピーしました！' : 'このプランを共有'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
