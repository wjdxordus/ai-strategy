import Vue from 'vue'
import { fetchWeather } from './services/weather'
import { selectBestPhoto, generateRecord } from './services/dify'

// 데모용 오늘 기록 (Android 데이터 없을 때 표시)
const demoTodayRecords = [
  {
    id: 'demo_1',
    date: new Date().toISOString().slice(0, 10),
    time: '09:15',
    location: '강남구 테헤란로 521',
    lat: 37.5023, lng: 127.0247,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '봄날의 따뜻한 아침, 도심 속 카페에서 하루를 시작했어요. 창밖으로 보이는 벚꽃이 마음을 설레게 합니다.',
    emotionTags: [{ icon: '😊', label: '행복' }, { icon: '🌸', label: '설렘' }],
    categoryTags: ['카페', '벚꽃', '봄'],
    userNote: '',
  },
  {
    id: 'demo_2',
    date: new Date().toISOString().slice(0, 10),
    time: '13:40',
    location: '마포구 홍대입구 걷고싶은거리',
    lat: 37.5563, lng: 126.9238,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #45C48A 0%, #0FB08B 100%)',
    weather: { emoji: '🌤️', label: '맑음' },
    aiRecord: '홍대의 활기찬 점심 거리, 버스킹 공연과 함께하는 특별한 하루 중간 쉼표.',
    emotionTags: [{ icon: '🎶', label: '신남' }, { icon: '✨', label: '활기참' }],
    categoryTags: ['홍대', '버스킹', '점심'],
    userNote: '',
  },
]

// 데모용 메모리 기록 (1년 전)
const demoMemoryRecords = [
  {
    id: 'mem_1',
    date: (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10) })(),
    time: '14:32',
    location: '종로구 인사동길 27',
    lat: 37.5714, lng: 126.9876,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #5C7AFF 0%, #7B61FF 100%)',
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '작년 오늘, 인사동의 고즈넉한 봄 오후. 전통 찻집에서 시간을 잊고 쉬었던 기억이 새록새록 납니다.',
    emotionTags: [{ icon: '😌', label: '여유' }, { icon: '🍵', label: '힐링' }],
    categoryTags: ['인사동', '전통찻집', '봄'],
    userNote: '다음에 또 오고 싶다',
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
    location: '마포구 홍대입구 걷고싶은거리',
    lat: 37.5563, lng: 126.9238,
    thumbnail: null,
    gradient: 'linear-gradient(135deg, #45C48A 0%, #0FB08B 100%)',
    weather: { emoji: '🌤️', label: '맑음' },
    aiRecord: '홍대의 활기찬 저녁, 거리 곳곳에서 넘치는 에너지가 느껴집니다. 버스킹 공연이 분위기를 한껏 높여줬어요.',
    emotionTags: [{ icon: '🎶', label: '신남' }, { icon: '✨', label: '활기참' }],
    categoryTags: ['홍대', '버스킹', '친구', '저녁'],
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

  // 1단계: 날씨 병렬 조회
  const weatherResults = await Promise.allSettled(
    photoGroups.map(g => fetchWeather(g.centerLat, g.centerLng))
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
  try {
    localStorage.setItem(`records_${date}`, JSON.stringify(records))
    // 전체 기록에도 추가
    const existing = store.records.filter(r => r.date !== date)
    store.records = [...records, ...existing].sort((a, b) => (a.date < b.date ? 1 : -1))
  } catch (e) {
    console.warn('기록 저장 실패:', e)
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
