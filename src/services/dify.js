import { CONFIG } from '../config'

/**
 * Dify Agent 공통 호출
 * response_mode: blocking → 동기 응답 대기
 */
async function callDifyAgent(apiKey, inputs, timeoutMs = 20000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${CONFIG.DIFY_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs,
        response_mode: 'blocking',
        user: 'daily-log-app',
        query: 'process',
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`Dify API ${res.status}`)
    const data = await res.json()
    return data.answer || data
  } catch (e) {
    clearTimeout(timer)
    throw e
  }
}

/**
 * [Agent 1] 사진 선정 — 그룹의 사진 목록에서 베스트컷 1장 선택
 * 반환: 선택된 썸네일 base64 문자열
 */
export async function selectBestPhoto(photos) {
  if (!CONFIG.DIFY_PHOTO_AGENT_KEY) {
    // Fallback: 첫 번째 사진
    return photos[0]?.thumbnail || null
  }

  try {
    const answer = await callDifyAgent(CONFIG.DIFY_PHOTO_AGENT_KEY, {
      photos: photos.slice(0, 10).map((p, i) => ({
        index: i,
        timestamp: p.timestamp,
        thumbnail: p.thumbnail,
      })),
    })

    // Agent가 선택한 index를 정수로 반환한다고 가정
    const idx = parseInt(answer, 10)
    if (!isNaN(idx) && idx >= 0 && idx < photos.length) {
      return photos[idx].thumbnail
    }
    return photos[0]?.thumbnail || null
  } catch (e) {
    console.warn('[Dify] 사진 선정 실패, fallback 사용:', e.message)
    return photos[0]?.thumbnail || null
  }
}

/**
 * [Agent 2] 기록 생성 — 베스트컷 + 위치/시간/날씨 → 기록 카드 데이터
 * 반환: { aiRecord, emotionTags: [{icon, label}], categoryTags: string[] }
 */
export async function generateRecord({ thumbnail, location, time, weather, userInfo }) {
  const fallback = {
    aiRecord: `${location}에서의 소중한 순간입니다.`,
    emotionTags: [{ icon: '📍', label: '기록' }],
    categoryTags: [location.split(' ')[0]].filter(Boolean),
  }

  if (!CONFIG.DIFY_RECORD_AGENT_KEY) return fallback

  try {
    const answer = await callDifyAgent(CONFIG.DIFY_RECORD_AGENT_KEY, {
      thumbnail: thumbnail || '',
      location,
      time,
      weather_emoji: weather.emoji,
      weather_label: weather.label,
      nickname: userInfo?.nickname || '사용자',
    })

    // Agent가 JSON 문자열 또는 객체를 반환한다고 가정
    const parsed = typeof answer === 'string' ? JSON.parse(answer) : answer
    return {
      aiRecord: parsed.aiRecord || parsed.record || fallback.aiRecord,
      emotionTags: parsed.emotionTags || parsed.emotions || fallback.emotionTags,
      categoryTags: parsed.categoryTags || parsed.categories || fallback.categoryTags,
    }
  } catch (e) {
    console.warn('[Dify] 기록 생성 실패, fallback 사용:', e.message)
    return fallback
  }
}
