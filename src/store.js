import Vue from 'vue'
import { fetchWeather } from './services/weather'
import { selectBestPhoto, generateRecord } from './services/dify'

// 데모용 오늘 기록 (Android 데이터 없을 때 표시)
const demoTodayRecords = [
  {
    id: 'demo_1',
    date: '2026-04-10',
    time: '13:23',
    location: '삼성금융캠퍼스',
    lat: 37.5049, lng: 127.0276,
    thumbnail: '/photos/16601.jpg',
    gradient: null,
    weather: { emoji: '🌧️', label: '비' },
    aiRecord: '비 내리는 오후, 삼성금융캠퍼스에서 팀원들과 머리를 맞댔다. 노트북 화면을 함께 들여다보며 나누는 대화가 빗소리만큼 조용하고 집중됐던 시간.',
    emotionTags: [{ icon: '🤝', label: '협업' }, { icon: '💡', label: '집중' }],
    categoryTags: ['삼성금융캠퍼스', '워크숍', '팀작업'],
    userNote: '',
  },
  {
    id: 'demo_2',
    date: new Date().toISOString().slice(0, 10),
    time: '13:40',
    location: '성북구 국민대학교',
    lat: 37.6116, lng: 126.9997,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #45C48A 0%, #0FB08B 100%)',
    weather: { emoji: '🌤️', label: '맑음' },
    aiRecord: '국민대 캠퍼스 점심 시간, 교정 잔디밭에 앉아 듣는 버스킹 공연이 봄 햇살만큼 따뜻했어요.',
    emotionTags: [{ icon: '🎶', label: '신남' }, { icon: '✨', label: '활기참' }],
    categoryTags: ['국민대', '버스킹', '점심'],
    userNote: '',
  },
]

// 데모용 메모리 기록 (1년 전)
const demoMemoryRecords = [
  {
    id: 'mem_1',
    date: '2025-04-10',
    time: '16:19',
    location: '부천시 중동',
    lat: 37.5034, lng: 126.7660,
    thumbnail: '/photos/20250410_1619.png',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '맑은 봄 오후, 부천에서 마주한 이 작은 미소. 손을 살짝 들어 인사하는 듯한 표정이 1년이 지난 지금도 선명하다.',
    emotionTags: [{ icon: '🥰', label: '사랑스러움' }, { icon: '🌼', label: '봄' }],
    categoryTags: ['부천', '소중한순간'],
    userNote: '',
  },
  {
    id: 'mem_2',
    date: (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10) })(),
    time: '17:30',
    location: '서초구 반포한강공원',
    lat: 37.5065, lng: 126.9996,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)',
    weather: { emoji: '🌅', label: '맑음' },
    aiRecord: '한강에서 바라본 노을이 오늘따라 유독 아름다웠어요. 잔잔한 강물 위로 물드는 붉은 하늘.',
    emotionTags: [{ icon: '🌅', label: '감성' }, { icon: '💭', label: '사색' }],
    categoryTags: ['한강', '노을', '산책'],
    userNote: '',
  },
]

// 전체 기록 (TimeBridge용 - 과거 기록 포함)
const allHistoryRecords = [
  ...demoTodayRecords,
  {
    id: 'hist_1',
    date: '2026-04-05',
    time: '11:20',
    location: '종로구 인사동길 27',
    lat: 37.5714, lng: 126.9876,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #5C7AFF 0%, #7B61FF 100%)',
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '전통 찻집에서 고즈넉한 오전을 보냈네요. 오래된 골목길과 전통 공예품들이 어우러진 인사동의 정취.',
    emotionTags: [{ icon: '😌', label: '여유' }, { icon: '🍵', label: '힐링' }],
    categoryTags: ['전통찻집', '인사동', '전통'],
    userNote: '다음에 또 오고 싶다',
  },
  {
    id: 'hist_2',
    date: '2026-04-03',
    time: '18:45',
    location: '성북구 국민대학교',
    lat: 37.6116, lng: 126.9997,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #45C48A 0%, #0FB08B 100%)',
    weather: { emoji: '🌤️', label: '맑음' },
    aiRecord: '국민대 캠퍼스의 저녁, 하교 길에 들려온 버스킹 선율이 긴 하루의 피로를 말끔히 씻어줬어요.',
    emotionTags: [{ icon: '🎶', label: '신남' }, { icon: '✨', label: '활기참' }],
    categoryTags: ['국민대', '버스킹', '친구', '저녁'],
    userNote: '',
  },
  {
    id: 'hist_3',
    date: '2026-04-01',
    time: '10:15',
    location: '송파구 석촌호수로 166',
    lat: 37.5085, lng: 127.1,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B6B 100%)',
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '석촌호수의 벚꽃이 절정을 이뤘어요. 호수에 비친 분홍빛 꽃잎이 마치 한 폭의 수채화 같았습니다.',
    emotionTags: [{ icon: '🌸', label: '감동' }, { icon: '😊', label: '행복' }],
    categoryTags: ['벚꽃', '석촌호수', '봄', '산책'],
    userNote: '올해 벚꽃은 유독 예뻤다',
  },
]

export const store = Vue.observable({
  // 사용자 정보 (Android 온보딩에서 입력)
  userInfo: { nickname: '', homeAddress: '', workAddress: '' },

  // Android 원본 사진 그룹 데이터 (최대 5개)
  photoGroups: [],
  isAndroidDataLoaded: false,
  bridgeDate: new Date().toISOString().slice(0, 10),

  // 처리 상태
  processingStatus: 'idle', // 'idle'|'loading_weather'|'loading_ai'|'done'|'error'
  processingProgress: 0,    // 0~100

  // 오늘 생성된 기록 카드 (홈 화면)
  todayRecords: demoTodayRecords,

  // 1년 전 기록 카드 (메모리 섹션)
  memoryRecords: demoMemoryRecords,

  // 전체 기록 (TimeBridge)
  records: allHistoryRecords,

  // 웹 스플래시 표시 여부
  showWebSplash: false,
})

/**
 * Android에서 받은 사진 그룹을 처리해 기록 카드로 변환
 * 날씨(Open-Meteo) → 사진 선정(Dify) → 기록 생성(Dify)
 */
export async function processPhotoGroups(photoGroups, userInfo, date) {
  store.processingStatus = 'loading_weather'
  store.processingProgress = 0

  // 1단계: 날씨 병렬 조회 (사진 촬영 시각 기준)
  const weatherResults = await Promise.allSettled(
    photoGroups.map(g => {
      const timestamp = g.startTime || g.photos?.[0]?.timestamp || Date.now()
      return fetchWeather(g.centerLat, g.centerLng, timestamp)
    })
  )

  store.processingStatus = 'loading_ai'
  const total = photoGroups.length
  const records = []

  // 2단계: 그룹별 AI 순차 처리
  for (let i = 0; i < photoGroups.length; i++) {
    const group = photoGroups[i]
    const weather = weatherResults[i].status === 'fulfilled'
      ? weatherResults[i].value
      : { emoji: '🌡️', label: '알 수 없음' }

    const timestamp = group.startTime || (group.photos[0]?.timestamp) || Date.now()
    const d = new Date(timestamp)
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

    const bestThumbnail = await selectBestPhoto(group.photos)
    const generated = await generateRecord({
      thumbnail: bestThumbnail,
      location: group.locationLabel,
      time,
      weather,
      userInfo,
    })

    records.push({
      id: group.groupId,
      date,
      time,
      location: group.locationLabel,
      lat: group.centerLat,
      lng: group.centerLng,
      thumbnail: bestThumbnail,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      weather,
      aiRecord: generated.aiRecord,
      emotionTags: generated.emotionTags,
      categoryTags: generated.categoryTags,
      userNote: '',
    })

    store.processingProgress = Math.round(((i + 1) / total) * 100)
  }

  store.todayRecords = records
  store.processingStatus = 'done'

  // 저장 (내년 메모리 기록으로 활용)
  // thumbnail은 base64로 용량이 크므로 localStorage에는 저장하지 않음
  try {
    localStorage.setItem(`records_${date}`, JSON.stringify(records.map(stripThumbnail)))
    // 전체 기록에도 추가
    const existing = store.records.filter(r => r.date !== date)
    store.records = [...records, ...existing].sort((a, b) => (a.date < b.date ? 1 : -1))
  } catch (e) {
    console.warn('기록 저장 실패:', e)
  }
}

/** thumbnail(base64)을 제거한 저장용 레코드 반환 */
function stripThumbnail(record) {
  const { thumbnail, ...rest } = record
  return rest
}

/**
 * 기록 카드 수정 — store 전체(today/memory/records) 및 localStorage 반영
 * patch: 수정할 필드 객체 (aiRecord, thumbnail, weather, location, emotionTags, categoryTags 등)
 */
export function updateRecord(id, patch) {
  const applyPatch = r => r.id === id ? { ...r, ...patch } : r

  store.todayRecords = store.todayRecords.map(applyPatch)
  store.memoryRecords = store.memoryRecords.map(applyPatch)
  store.records = store.records.map(applyPatch)

  // localStorage 업데이트 (thumbnail 제외)
  try {
    const updated = store.records.find(r => r.id === id) ||
                    store.todayRecords.find(r => r.id === id)
    if (!updated) return
    const dayRecords = store.records.filter(r => r.date === updated.date)
    localStorage.setItem(`records_${updated.date}`, JSON.stringify(dayRecords.map(stripThumbnail)))
  } catch (e) {
    console.warn('기록 업데이트 저장 실패:', e)
  }
}

/** 1년 전 기록을 localStorage에서 로드 */
export function loadMemoryRecords() {
  try {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const key = `records_${oneYearAgo.toISOString().slice(0, 10)}`
    const saved = localStorage.getItem(key)
    if (saved) {
      store.memoryRecords = JSON.parse(saved)
    }
    // 없으면 demo 유지
  } catch (e) {
    console.warn('메모리 기록 로드 실패:', e)
  }
}
