import { CONFIG } from '../config'

// WMO 날씨 코드 → 앱 날씨 분류
// https://open-meteo.com/en/docs (WMO Weather Code 참조)
function wmoToWeather(code) {
  if (code === 0 || code === 1)                          return { emoji: '☀️', label: '맑음' }
  if (code === 2 || code === 3 || (code >= 45 && code <= 48)) return { emoji: '☁️', label: '흐림' }
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) return { emoji: '🌦️', label: '흐린비' }
  if ((code >= 61 && code <= 67) || (code >= 95 && code <= 99)) return { emoji: '🌧️', label: '비' }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { emoji: '❄️', label: '눈' }
  return { emoji: '🌡️', label: '알 수 없음' }
}

export async function fetchWeather(lat, lng) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)

  try {
    const url = `${CONFIG.OPEN_METEO_URL}?latitude=${lat}&longitude=${lng}&current=weathercode&timezone=Asia%2FSeoul`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
    const data = await res.json()
    const code = data.current?.weathercode ?? data.current?.weather_code ?? -1
    return wmoToWeather(code)
  } catch (e) {
    clearTimeout(timer)
    console.warn('[Weather] 날씨 조회 실패, fallback 사용:', e.message)
    return { emoji: '🌡️', label: '알 수 없음' }
  }
}
