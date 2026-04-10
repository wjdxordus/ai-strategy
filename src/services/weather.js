import { CONFIG } from '../config'

// WMO 날씨 코드 → 앱 날씨 분류
// https://open-meteo.com/en/docs (WMO Weather Code 참조)
function wmoToWeather(code) {
  if (code === 0 || code === 1)                                        return { emoji: '☀️', label: '맑음' }
  if (code === 2 || code === 3 || (code >= 45 && code <= 48))          return { emoji: '☁️', label: '흐림' }
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82))        return { emoji: '🌦️', label: '흐린비' }
  if ((code >= 61 && code <= 67) || (code >= 95 && code <= 99))        return { emoji: '🌧️', label: '비' }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))        return { emoji: '❄️', label: '눈' }
  return { emoji: '🌡️', label: '알 수 없음' }
}

/**
 * 주어진 위치와 타임스탬프(ms)의 날씨를 조회
 * - 오늘 날짜: forecast API hourly
 * - 과거 날짜: archive API hourly
 * timestamp가 없으면 현재 시각을 사용
 */
export async function fetchWeather(lat, lng, timestamp) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const photoDate = timestamp ? new Date(timestamp) : new Date()
    const dateStr = photoDate.toISOString().slice(0, 10)          // 'YYYY-MM-DD'
    const targetHour = photoDate.getHours()                        // 0~23

    // 오늘이면 forecast, 과거면 archive
    const today = new Date().toISOString().slice(0, 10)
    const baseUrl = dateStr < today
      ? 'https://archive-api.open-meteo.com/v1/archive'
      : CONFIG.OPEN_METEO_URL

    const url = `${baseUrl}?latitude=${lat}&longitude=${lng}` +
      `&hourly=weathercode` +
      `&timezone=Asia%2FSeoul` +
      `&start_date=${dateStr}&end_date=${dateStr}`

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
    const data = await res.json()

    // hourly.time 배열에서 촬영 시각과 일치하는 인덱스 찾기
    const times = data.hourly?.time ?? []
    const codes = data.hourly?.weathercode ?? []

    // 'YYYY-MM-DDTHH:00' 형태로 매칭
    const hourStr = `${dateStr}T${String(targetHour).padStart(2, '0')}:00`
    let idx = times.indexOf(hourStr)

    // 정확한 시각이 없으면 가장 가까운 이전 시각 사용
    if (idx === -1) {
      idx = times.reduce((best, t, i) => t <= hourStr ? i : best, 0)
    }

    const code = codes[idx] ?? -1
    return wmoToWeather(code)
  } catch (e) {
    clearTimeout(timer)
    console.warn('[Weather] 날씨 조회 실패, fallback 사용:', e.message)
    return { emoji: '🌡️', label: '알 수 없음' }
  }
}
