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
 * @param {string} userTag - 단일 업로드: 'golden-one-file' / 다중 업로드 루프: 'golden-multi-file'
 */
export async function uploadFile(source, filename = 'photo.jpg', userTag = 'golden-one-file') {
  const blob = typeof source === 'string' ? base64ToBlob(source) : source
  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('user', userTag)

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

// ─── 자동 파이프라인: 그룹 처리 (베스트컷 선정 → 사진 분석) ─────────────────────

/**
 * 위치 그룹 1개 전체 처리: 베스트컷 선정 → 사진 분석 → 기록 카드 데이터 반환
 *
 * 내부 흐름:
 *   1) 그룹 내 사진 전체 병렬 업로드 (golden-multi-file)
 *   2) 베스트컷 선정 워크플로우 호출 → 선정 인덱스 파싱
 *   3) 선정된 사진의 업로드 ID를 재사용해 사진 분석 호출 (재업로드 없음)
 *
 * @param {Array<{thumbnail: string, timestamp: number, lat: number, lng: number}>} photos
 * @param {string} location
 * @param {{emoji: string, label: string}} weather
 * @returns {{ thumbnail: string, aiRecord: string, categoryTags: string[], emotionTags: Array }}
 */
export async function processGroupForRecord(photos, location, weather) {
  if (!photos || photos.length === 0) throw new Error('사진이 없습니다')

  // 1단계: 그룹 내 사진 전체 병렬 업로드
  const uploadFileIds = await Promise.all(
    photos.map((photo, i) =>
      uploadFile(photo.thumbnail, `photo_${i + 1}.jpg`, 'golden-multi-file')
    )
  )
  console.log(`[Dify] 그룹 업로드 완료: ${uploadFileIds.length}장`)

  // 2단계: 베스트컷 선정 워크플로우
  const bestcutRes = await fetch(`${CONFIG.DIFY_BASE_URL}/workflows/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.DIFY_BESTCUT_WORKFLOW_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        images: uploadFileIds.map(id => ({
          transfer_method: 'local_file',
          upload_file_id: id,
          type: 'image',
        })),
      },
      query: '',
      response_mode: 'blocking',
      user: 'golden-12345',
    }),
  })

  if (!bestcutRes.ok) {
    const err = await bestcutRes.text()
    throw new Error(`베스트컷 선정 실패 (${bestcutRes.status}): ${err}`)
  }

  const bestcutData = await bestcutRes.json()
  console.log('[Dify] 베스트컷 응답:', bestcutData)

  // 3단계: 선정 인덱스 파싱 → 업로드 ID 및 썸네일 결정
  const selectedIndex = parseBestCutIndex(bestcutData, uploadFileIds.length)
  const selectedUploadId = uploadFileIds[selectedIndex]
  const selectedThumbnail = photos[selectedIndex].thumbnail
  console.log(`[Dify] 베스트컷 선택: photo_${selectedIndex + 1}/${photos.length}`)

  // 4단계: 선정된 업로드 ID 재사용 → 사진 분석 (재업로드 없음)
  const generated = await analyzePhoto(selectedUploadId, location, weather)

  return {
    thumbnail: selectedThumbnail,
    aiRecord: generated.aiRecord,
    categoryTags: generated.categoryTags,
    emotionTags: generated.emotionTags,
  }
}

/**
 * 베스트컷 워크플로우 응답에서 선정된 사진 인덱스(0-based) 파싱
 * 워크플로우 응답 형식에 따라 다양한 경우를 처리
 */
export function parseBestCutIndex(raw, total) {
  try {
    const response = raw?.data?.outputs?.response
    if (response == null) return 0

    // 문자열: "photo_3.jpg", "3", "2" 등
    if (typeof response === 'string') {
      const fileMatch = response.match(/photo_(\d+)/i)
      if (fileMatch) {
        const idx = parseInt(fileMatch[1], 10) - 1  // 1-based → 0-based
        if (idx >= 0 && idx < total) return idx
      }
      const num = parseInt(response, 10)
      if (!isNaN(num)) {
        if (num >= 1 && num <= total) return num - 1  // 1-based
        if (num >= 0 && num < total) return num        // 0-based
      }
    }

    // 객체: { filename, index, selected_index 등 }
    if (typeof response === 'object') {
      const filename = response.filename || response.file || response.selected_file || response.best_cut
      if (typeof filename === 'string') {
        const fileMatch = filename.match(/photo_(\d+)/i)
        if (fileMatch) {
          const idx = parseInt(fileMatch[1], 10) - 1
          if (idx >= 0 && idx < total) return idx
        }
      }
      const idx = response.index ?? response.selected_index ?? response.best_index
      if (typeof idx === 'number' && idx >= 0 && idx < total) return idx
    }
  } catch (e) {
    console.warn('[Dify] 베스트컷 인덱스 파싱 실패, 첫 번째 사진 사용:', e)
  }
  return 0  // fallback
}

// ─── 베스트컷 선정 워크플로우 ──────────────────────────────────────────────────

/**
 * 여러 장 사진 업로드 후 베스트컷 1장 선정
 * @param {Array<string|Blob>} sources - base64 data URL 또는 Blob 배열
 * @param {Function} onProgress - (current, total) 진행 콜백
 * @returns {{ uploadFileIds: string[], raw: object }} 업로드 ID 배열 + 워크플로우 원본 응답
 */
export async function uploadAndSelectBestCut(sources, onProgress) {
  // 1단계: 전체 파일 병렬 업로드 → ID 수집
  // sources 항목은 base64 문자열 또는 { data: base64, name: 원본파일명 } 객체
  if (onProgress) onProgress(0, sources.length)

  let completedCount = 0
  const uploadFileIds = await Promise.all(
    sources.map((item, i) => {
      const source = typeof item === 'object' && item.data ? item.data : item
      const filename = typeof item === 'object' && item.name ? item.name : `photo_${i + 1}.jpg`
      return uploadFile(source, filename, 'golden-multi-file').then(id => {
        completedCount++
        if (onProgress) onProgress(completedCount, sources.length)
        console.log(`[Dify] 업로드 완료 (${completedCount}/${sources.length}) ${filename}: ${id}`)
        return id
      })
    })
  )

  // 2단계: 베스트컷 선정 워크플로우 호출
  const images = uploadFileIds.map(id => ({
    transfer_method: 'local_file',
    upload_file_id: id,
    type: 'image',
  }))

  const res = await fetch(`${CONFIG.DIFY_BASE_URL}/workflows/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.DIFY_BESTCUT_WORKFLOW_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: { images },
      query: '',
      response_mode: 'blocking',
      user: 'golden-12345',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`베스트컷 선정 실패 (${res.status}): ${err}`)
  }

  const raw = await res.json()
  console.log('[Dify] 베스트컷 워크플로우 응답:', raw)

  return { uploadFileIds, raw }
}
