export type GeocodedSpot = {
  index: number
  lat: number
  lon: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Nominatim API でスポット名を緯度経度に変換する。
 * レート制限（1 req/sec）を遵守するため逐次リクエスト + 1.1秒ディレイ。
 * regionHint（例: "京都"）をクエリに付加して精度を向上させる。
 */
export async function geocodeSpots(
  spots: string[],
  regionHint?: string,
): Promise<GeocodedSpot[]> {
  const results: GeocodedSpot[] = []

  for (let i = 0; i < spots.length; i++) {
    if (i > 0) await sleep(1100)

    const query = regionHint ? `${spots[i]} ${regionHint}` : spots[i]
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
        results.push({
          index: i,
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        })
      }
    } catch {
      console.warn(`Geocoding failed for: ${spots[i]}`)
    }
  }

  return results
}
