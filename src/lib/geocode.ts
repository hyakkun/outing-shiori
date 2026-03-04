export type GeocodedSpot = {
  index: number
  lat: number
  lon: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 日本の緯度経度バウンディングボックス（離島含む）
const JAPAN_BOUNDS = { latMin: 20, latMax: 46, lonMin: 122, lonMax: 154 }

function isInJapan(lat: number, lon: number): boolean {
  return (
    lat >= JAPAN_BOUNDS.latMin &&
    lat <= JAPAN_BOUNDS.latMax &&
    lon >= JAPAN_BOUNDS.lonMin &&
    lon <= JAPAN_BOUNDS.lonMax
  )
}

export type SpotInput = {
  name: string
  address?: string
}

/**
 * Nominatim API でスポット名を緯度経度に変換する。
 * レート制限（1 req/sec）を遵守するため逐次リクエスト + 1.1秒ディレイ。
 * address がある場合はそれを優先し、なければ regionHint を付加する。
 * 日本国外の座標はスキップする。
 */
export async function geocodeSpots(
  spots: SpotInput[],
  regionHint?: string,
): Promise<GeocodedSpot[]> {
  const results: GeocodedSpot[] = []

  for (let i = 0; i < spots.length; i++) {
    if (i > 0) await sleep(1100)

    const { name, address } = spots[i]
    const query = address ? `${name} ${address}` : regionHint ? `${name} ${regionHint}` : name
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: { 'User-Agent': 'outing-shiori/1.0' },
          signal: AbortSignal.timeout(5000),
        },
      )
      const data = await res.json()
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        if (isInJapan(lat, lon)) {
          results.push({ index: i, lat, lon })
        }
      }
    } catch {
      console.warn(`Geocoding failed for: ${name}`)
    }
  }

  return results
}
