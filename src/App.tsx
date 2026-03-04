import { useState, useCallback, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PlanForm } from './components/PlanForm'
import { PlanResult } from './components/PlanResult'
import { PlanMap } from './components/PlanMap'
import type { FormValues } from './components/PlanForm'
import { generatePlan } from './lib/generatePlan'
import type { TravelPlan } from './lib/generatePlan'
import { SharedPlanPage } from './pages/SharedPlanPage'

function HomePage() {
  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpotIndex, setSelectedSpotIndex] = useState<number | null>(null)
  const [geocodedIndices, setGeocodedIndices] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)
  const [budget, setBudget] = useState<string>('')
  const [shareId, setShareId] = useState<string | undefined>(undefined)
  const mapRef = useRef<HTMLDivElement>(null)

  const handleGeocodedIndicesChange = useCallback((indices: Set<number>) => {
    setGeocodedIndices(indices)
  }, [])

  const handleSubmit = async (values: FormValues) => {
    setPlan(null)
    setError(null)
    setSelectedSpotIndex(null)
    setGeocodedIndices(new Set())
    setShareId(undefined)
    setLoading(true)
    setBudget(values.budget)
    try {
      const result = await generatePlan(values)
      setPlan(result)

      // プランをSupabaseに保存
      try {
        const saveRes = await fetch('/api/save-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planData: result, formValues: values }),
        })
        if (saveRes.ok) {
          const { id } = await saveRes.json()
          setShareId(id)
        }
      } catch {
        // 保存失敗してもプラン表示は継続
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PlanForm onSubmit={handleSubmit} loading={loading} />

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
          <PlanResult
            plan={plan}
            budget={budget}
            shareId={shareId}
            geocodedIndices={geocodedIndices}
            onSpotClick={(index) => {
              setSelectedSpotIndex(index)
              mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
            onShare={async () => {
              if (!shareId) return
              const url = `${window.location.origin}/plan/${shareId}`
              await navigator.clipboard.writeText(url)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            copied={copied}
          />
          <div ref={mapRef}>
            <PlanMap plan={plan} selectedSpotIndex={selectedSpotIndex} onGeocodedIndicesChange={handleGeocodedIndicesChange} />
          </div>
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-center text-3xl font-bold text-stone-800">
          🗺️ お出かけのしおり
        </h1>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plan/:id" element={<SharedPlanPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
