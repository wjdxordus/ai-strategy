import { CONFIG } from '../config'

// ─── 파일 업로드 ──────────────────────────────────────────────────────────────

/**
 * base64 data URL → Blob 변환
 */
function base64ToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/**
 * 사진 1장 업로드 → upload_file_id 반환
 * @param {string|Blob} source - base64 data URL 또는 Blob
 * @param {string} filename
 */
export async function uploadFile(source, filename = 'photo.jpg') {
  const blob = typeof source === 'string' ? base64ToBlob(source) : source
  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('user', 'golden-one-file')

  const res = await fetch(`${CONFIG.DIFY_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.DIFY_API_KEY}`,
      // Content-Type 미설정 → 브라우저가 multipart boundary 자동 처리
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`파일 업로드 실패 (${res.status}): ${err}`)
  }

  const data = await res.json()
  console.log('[Dify] 파일 업로드 완료:', data.id)
  return data.id
}

// ─── 사진 분석 워크플로우 ─────────────────────────────────────────────────────

/**
 * 사진 분석 워크플로우 실행
 * @param {string} uploadFileId - uploadFile() 반환 id
 * @param {string} location - 위치 문자열 (네이버 역지오코딩 결과)
 * @param {{ emoji: string, label: string }} weather - 날씨 객체
 * @returns {{ aiRecord, categoryTags, emotionTags }}
 */
export async function analyzePhoto(uploadFileId, location, weather) {
  const res = await fetch(`${CONFIG.DIFY_BASE_URL}/workflows/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        BEST_CUT: {
          transfer_method: 'local_file',
          upload_file_id: uploadFileId,
          type: 'image',
        },
        LOCATION: location || '',
        WEATHER: weather ? `${weather.emoji} ${weather.label}` : '',
      },
      response_mode: 'blocking',
      user: 'golden-one-file',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`사진 분석 실패 (${res.status}): ${err}`)
  }

  const data = await res.json()
  console.log('[Dify] 워크플로우 응답:', data)

  if (data.data?.status !== 'succeeded') {
    throw new Error(`워크플로우 오류: ${data.data?.error || data.data?.status}`)
  }

  const response = data.data.outputs.response
  return {
    aiRecord: response.dailyLog || '',
    categoryTags: Array.isArray(response.category) ? response.category : [],
    emotionTags: response.emotion
      ? [{ icon: '💫', label: response.emotion }]
      : [],
  }
}

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
