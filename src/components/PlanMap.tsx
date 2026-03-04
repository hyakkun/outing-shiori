import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { TravelPlan, ScheduleItem } from '../lib/generatePlan'
import { geocodeSpots, type GeocodedSpot } from '../lib/geocode'

// Leaflet デフォルトアイコンパス問題の workaround
// @ts-expect-error accessing private Leaflet internals
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CATEGORY_COLORS: Record<ScheduleItem['category'], string> = {
  食事: '#fb923c', // orange-400
  観光: '#60a5fa', // blue-400
  移動: '#9ca3af', // gray-400
  宿泊: '#c084fc', // purple-400
}

function createMarkerIcon(category: ScheduleItem['category']): L.DivIcon {
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS['観光']
  return L.divIcon({
    className: '',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z"
              fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <circle cx="14" cy="14" r="6" fill="#fff"/>
      </svg>
    `,
  })
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [map, positions])
  return null
}

type Props = {
  plan: TravelPlan
  selectedSpotIndex: number | null
  onGeocodedIndicesChange?: (indices: Set<number>) => void
}

function OpenSelectedPopup({
  geocoded,
  selectedSpotIndex,
  markerRefs,
}: {
  geocoded: GeocodedSpot[]
  selectedSpotIndex: number | null
  markerRefs: React.RefObject<Map<number, L.Marker>>
}) {
  const map = useMap()
  useEffect(() => {
    if (selectedSpotIndex === null) return
    const geo = geocoded.find((g) => g.index === selectedSpotIndex)
    if (!geo) return
    const marker = markerRefs.current.get(geo.index)
    if (!marker) return
    map.setView([geo.lat, geo.lon], map.getZoom(), { animate: true })
    marker.openPopup()
  }, [map, geocoded, selectedSpotIndex, markerRefs])
  return null
}

export function PlanMap({ plan, selectedSpotIndex, onGeocodedIndicesChange }: Props) {
  const [geocoded, setGeocoded] = useState<GeocodedSpot[]>([])
  const [loading, setLoading] = useState(true)
  const markerRefs = useRef<Map<number, L.Marker>>(new Map())

  const setMarkerRef = useCallback((index: number, marker: L.Marker | null) => {
    if (marker) {
      markerRefs.current.set(index, marker)
    } else {
      markerRefs.current.delete(index)
    }
  }, [])

  const targetItems = useMemo(
    () =>
      plan.schedule
        .map((item, i) => ({ item, originalIndex: i }))
        .filter(({ item }) => item.category !== '移動'),
    [plan.schedule],
  )

  useEffect(() => {
    let cancelled = false

    const spots = targetItems.map(({ item }) => ({ name: item.spot, address: item.address }))
    geocodeSpots(spots, plan.destination).then((results) => {
      if (!cancelled) {
        const remapped = results.map((r) => ({
          ...r,
          index: targetItems[r.index].originalIndex,
        }))
        setGeocoded(remapped)
        onGeocodedIndicesChange?.(new Set(remapped.map((r) => r.index)))
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [plan, targetItems, onGeocodedIndicesChange])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-amber-700">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <p className="text-sm font-medium">地図を読み込み中...</p>
      </div>
    )
  }

  if (geocoded.length === 0) {
    return null
  }

  const positions: [number, number][] = geocoded.map((g) => [g.lat, g.lon])
  const center = positions[0]

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-100 shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        <OpenSelectedPopup
          geocoded={geocoded}
          selectedSpotIndex={selectedSpotIndex}
          markerRefs={markerRefs}
        />
        {geocoded.map((geo) => {
          const item = plan.schedule[geo.index]
          return (
            <Marker
              key={geo.index}
              position={[geo.lat, geo.lon]}
              icon={createMarkerIcon(item.category)}
              ref={(marker) => setMarkerRef(geo.index, marker)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">
                    {item.day}日目 {item.time} {item.spot}
                  </p>
                  <p className="mt-1 text-gray-600">{item.description}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
