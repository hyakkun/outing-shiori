import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PlanResult } from '../components/PlanResult'
import { PlanMap } from '../components/PlanMap'
import type { TravelPlan } from '../lib/generatePlan'
import { isTravelPlan } from '../lib/generatePlan'

export function SharedPlanPage() {
  const { id } = useParams<{ id: string }>()
  const [plan, setPlan] = useState<TravelPlan | null>(null)
  const [formValues, setFormValues] = useState<{ budget?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpotIndex, setSelectedSpotIndex] = useState<number | null>(null)
  const [geocodedIndices, setGeocodedIndices] = useState<Set<number>>(new Set())
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) {
      setError('プランが見つかりませんでした')
      setLoading(false)
      return
    }

    fetch(`/api/get-plan?id=${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'プランが見つかりませんでした' : 'プランの取得に失敗しました')
        }
        return res.json()
      })
      .then((data) => {
        if (!isTravelPlan(data.planData)) {
          throw new Error('プランデータが不正です')
        }
        setPlan(data.planData)
        setFormValues(data.formValues ?? null)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'エラーが発生しました')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const handleGeocodedIndicesChange = useCallback((indices: Set<number>) => {
    setGeocodedIndices(indices)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 text-amber-700">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <p className="text-sm font-medium">プランを読み込み中...</p>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="text-center">
        <div className="rounded-xl bg-red-50 p-6 text-sm text-red-600">
          {error ?? 'プランが見つかりませんでした'}
        </div>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg border border-amber-300 bg-white px-6 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
        >
          新しいプランを作成する
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <PlanResult
          plan={plan}
          budget={formValues?.budget}
          geocodedIndices={geocodedIndices}
          onSpotClick={(index) => {
            setSelectedSpotIndex(index)
            mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        />
        <div ref={mapRef}>
          <PlanMap plan={plan} selectedSpotIndex={selectedSpotIndex} onGeocodedIndicesChange={handleGeocodedIndicesChange} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-block rounded-lg border border-amber-300 bg-white px-6 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
        >
          新しいプランを作成する
        </Link>
      </div>
    </>
  )
}
