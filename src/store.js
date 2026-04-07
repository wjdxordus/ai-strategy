import Vue from 'vue'

// 데모 기록 데이터
const demoRecords = [
  {
    id: 1,
    date: '2026-04-07',
    time: '14:32',
    location: '강남구 테헤란로 521',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    thumbnail: null,
    aiComment: '봄날의 따뜻한 오후, 도심 속 카페에서 잠시 여유를 찾았네요. 창밖으로 보이는 벚꽃이 마음을 설레게 합니다.',
    emotionTags: [{ icon: '😊', label: '행복' }, { icon: '🌸', label: '설렘' }],
    categoryTags: ['카페', '벚꽃', '봄', '도심'],
    userNote: '',
  },
  {
    id: 2,
    date: '2026-04-05',
    time: '11:20',
    location: '종로구 인사동길 27',
    gradient: 'linear-gradient(135deg, #5C7AFF 0%, #7B61FF 100%)',
    thumbnail: null,
    aiComment: '전통 찻집에서 고즈넉한 오전을 보냈네요. 오래된 골목길과 전통 공예품들이 어우러진 인사동의 정취가 물씬 풍깁니다.',
    emotionTags: [{ icon: '😌', label: '여유' }, { icon: '🍵', label: '힐링' }],
    categoryTags: ['전통찻집', '인사동', '전통', '혼자만의시간'],
    userNote: '다음에 또 오고 싶다',
  },
  {
    id: 3,
    date: '2026-04-03',
    time: '18:45',
    location: '마포구 홍대입구 걷고싶은거리',
    gradient: 'linear-gradient(135deg, #45C48A 0%, #0FB08B 100%)',
    thumbnail: null,
    aiComment: '홍대의 활기찬 저녁, 거리 곳곳에서 넘치는 에너지가 느껴집니다. 버스킹 공연이 분위기를 한층 더 생동감 있게 만들어줬어요.',
    emotionTags: [{ icon: '🎶', label: '신남' }, { icon: '✨', label: '활기참' }],
    categoryTags: ['홍대', '버스킹', '친구', '저녁'],
    userNote: '',
  },
  {
    id: 4,
    date: '2026-04-01',
    time: '10:15',
    location: '송파구 석촌호수로 166',
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B6B 100%)',
    thumbnail: null,
    aiComment: '석촌호수의 벚꽃이 절정을 이뤘어요. 호수에 비친 분홍빛 꽃잎이 마치 한 폭의 수채화 같았습니다.',
    emotionTags: [{ icon: '🌸', label: '감동' }, { icon: '😊', label: '행복' }],
    categoryTags: ['벚꽃', '석촌호수', '봄', '산책', '나들이'],
    userNote: '올해 벚꽃은 유독 예뻤다',
  },
  {
    id: 5,
    date: '2026-03-28',
    time: '17:30',
    location: '서초구 반포한강공원',
    gradient: 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)',
    thumbnail: null,
    aiComment: '한강에서 바라본 노을이 오늘따라 유독 아름다웠어요. 잔잔한 강물 위로 물드는 붉은 하늘이 마음을 차분하게 만들어줬습니다.',
    emotionTags: [{ icon: '🌅', label: '감성' }, { icon: '💭', label: '사색' }],
    categoryTags: ['한강', '노을', '산책', '혼자만의시간'],
    userNote: '',
  },
]

// 오늘 홈 화면용 피처드 레코드 (가장 최근)
const featuredRecord = demoRecords[0]

export const store = Vue.observable({
  // Android WebView에서 전달받은 오늘 사진 그룹
  photoGroups: [],
  isAndroidDataLoaded: false,

  // 저장된 기록 목록
  records: demoRecords,

  // 홈 화면 표시용
  featuredRecord,

  // 오늘 홈 화면 사용자 노트
  todayNote: '',
})
