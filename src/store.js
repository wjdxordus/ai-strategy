import Vue from 'vue'
import { fetchWeather } from './services/weather'
import { processGroupForRecord } from './services/dify'

// 데모용 오늘 기록 (Android 데이터 없을 때 표시)
const demoTodayRecords = [
  {
    id: 'demo_1',
    date: '2026-04-10',
    time: '13:23',
    location: '삼성금융캠퍼스',
    lat: 37.4919, lng: 127.0202,
    thumbnail: '/photos/16601.jpg',
    gradient: null,
    weather: { emoji: '🌧️', label: '비' },
    aiRecord: '비 내리는 오후, 삼성금융캠퍼스에서 팀원들과 머리를 맞댔다. 노트북 화면을 함께 들여다보며 나누는 대화가 빗소리만큼 조용하고 집중됐던 시간.',
    emotionTags: [{ icon: '🤝', label: '협업' }, { icon: '💡', label: '집중' }],
    categoryTags: ['삼성금융캠퍼스', '워크숍', '팀작업'],
    userNote: '',
  }
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
    date: '2026-02-28',
    time: '20:13',
    location: '문경시 호계면',
    lat: 36.6323968, lng: 128.2060617,
    thumbnail: '/photos/202602282013pr0.jpg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '문경 여행의 저녁, 낡은 목조 인테리어가 따뜻한 분위기를 풍기는 카페에서 오랜 친구와 마주 앉았다. 꽃장식 사이로 나누는 이야기가 긴 여행의 피로를 잊게 했다.',
    emotionTags: [{ icon: '😊', label: '반가움' }, { icon: '🍶', label: '여유' }],
    categoryTags: ['문경', '카페', '친구', '여행'],
    userNote: '',
  },
  {
    id: 'hist_2',
    date: '2026-02-28',
    time: '07:47',
    location: '문경시 창리강변길',
    lat: 36.6024886, lng: 128.2137048,
    thumbnail: '/photos/202602280747j31.jpg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '이른 아침 강변길을 따라 함께 달렸다. 쌀쌀한 공기를 가르며 나란히 뛰던 그 느낌이, 하루를 시작하는 가장 좋은 방법이었다.',
    emotionTags: [{ icon: '💪', label: '활력' }, { icon: '💕', label: '함께' }],
    categoryTags: ['문경', '러닝', '아침', '커플'],
    userNote: '',
  },
  {
    id: 'hist_5',
    date: '2026-03-01',
    time: '18:34',
    location: '문경시 모전동',
    lat: 36.5872788, lng: 128.1823087,
    thumbnail: '/photos/2026030118342w2.jpg',
    gradient: null,
    weather: { emoji: '🌙', label: '야간' },
    aiRecord: '문경에서의 저녁, 아이는 빨간 컵을 손에 쥐고 의자에 앉아 뭔가를 열심히 탐구 중이었다. 이 집중하는 표정이 너무 귀여워서 멈출 수가 없었다.',
    emotionTags: [{ icon: '🥰', label: '사랑스러움' }, { icon: '😄', label: '행복' }],
    categoryTags: ['문경여행', '아이', '저녁'],
    userNote: '',
  },
  {
    id: 'hist_6',
    date: '2026-03-01',
    time: '22:31',
    location: '성동구 금호동4가',
    lat: 37.548090, lng: 127.015855,
    thumbnail: '/photos/202603012231y45.jpg',
    gradient: null,
    weather: { emoji: '🌙', label: '야간' },
    aiRecord: '긴 하루를 마치고 집으로 돌아오는 차 안, 아이는 어느새 깊이 잠들었다. 창문 너머로 스쳐가는 가로등 빛이 잠든 얼굴을 부드럽게 비췄다.',
    emotionTags: [{ icon: '😴', label: '고요함' }, { icon: '❤️', label: '따뜻함' }],
    categoryTags: ['귀가', '아이', '야간'],
    userNote: '',
  },
  {
    id: 'hist_7',
    date: '2026-03-02',
    time: '14:23',
    location: '종로구 장사동',
    lat: 37.568470, lng: 126.992376,
    thumbnail: '/photos/2026030214232a2.jpg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '종로 나들이, 차 안에서도 아이는 잠시도 쉬지 않았다. 세상 모든 것이 신기하다는 듯 두리번거리는 눈빛이 옆에서 보기만 해도 즐거웠다.',
    emotionTags: [{ icon: '😊', label: '설렘' }, { icon: '👶', label: '아이와함께' }],
    categoryTags: ['종로', '외출', '아이'],
    userNote: '',
  },
  {
    id: 'hist_8',
    date: '2026-03-02',
    time: '14:55',
    location: '종로구 삼청로',
    lat: 37.581491, lng: 126.979243,
    thumbnail: '/photos/202603021455xsi.jpg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '경복궁 근처 문화 공간에서, 곰돌이 패딩을 입은 아이가 처음 보는 것들에 눈을 반짝였다. 회색 모자를 눌러쓴 채 두리번거리는 모습이 어찌나 귀여웠는지.',
    emotionTags: [{ icon: '✨', label: '신기함' }, { icon: '🐻', label: '귀여움' }],
    categoryTags: ['경복궁', '문화체험', '아이', '나들이'],
    userNote: '',
  },
  {
    id: 'hist_9',
    date: '2026-03-02',
    time: '08:27',
    location: '성동구 옥수동',
    lat: 37.5472636, lng: 127.013108,
    thumbnail: '/photos/202603020827lqe.jpg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '아침 산책길, 옥수동 골목을 걷다 카메라를 들었다. 노란 장갑이 유독 눈에 띄던 그 출근길 아침, 추운 공기도 발걸음만큼은 가볍게 해줬다.',
    emotionTags: [{ icon: '🌤️', label: '상쾌함' }, { icon: '🚶', label: '산책' }],
    categoryTags: ['옥수동', '아침', '산책', '출근'],
    userNote: '',
  },
  {
    id: 'hist_11',
    date: '2026-03-03',
    time: '08:11',
    location: '성동구 옥수동',
    lat: 37.547030, lng: 127.014060,
    thumbnail: '/photos/202603030811vad.jpg',
    gradient: null,
    weather: { emoji: '⛅', label: '구름조금' },
    aiRecord: '등원 아침, 옥수동 골목에서 찍은 셀카. 아이가 어린이집 가는 날마다 이 표정을 짓는다 — 설레는 듯 의심스러운 듯. 노란 가방이 아이보다 더 커 보였다.',
    emotionTags: [{ icon: '👩‍👦', label: '엄마와아이' }, { icon: '🎒', label: '등원' }],
    categoryTags: ['옥수동', '등원', '아이', '아침'],
    userNote: '',
  },
  {
    id: 'hist_12',
    date: '2026-03-05',
    time: '07:37',
    location: '성동구 금호동3가',
    lat: 37.548389, lng: 127.015833,
    thumbnail: '/photos/202603050737prk.jpg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '이른 아침 지하철역에서 짐을 잔뜩 들고 서 있는 순간. 한 손에는 종이 한 장, 또 한 손은 카메라를 향해 익살스럽게 손을 들어올렸다. 피곤한 아침도 유머는 필요하다.',
    emotionTags: [{ icon: '😅', label: '바쁨' }, { icon: '🚇', label: '출퇴근' }],
    categoryTags: ['금호동', '지하철', '아침'],
    userNote: '',
  },
  {
    id: 'hist_13',
    date: '2026-03-06',
    time: '20:42',
    location: '서초구 잠원동',
    lat: 37.505660, lng: 127.003196,
    thumbnail: '/photos/202603062042chc.jpg',
    gradient: null,
    weather: { emoji: '🌙', label: '야간' },
    aiRecord: '반포 쇼핑몰 야경 아래, 아이는 홀로 당당하게 긴 복도를 걸었다. 반짝이는 조명 사이로 혼자 소풍 나온 것처럼 의젓한 발걸음.',
    emotionTags: [{ icon: '🛍️', label: '쇼핑' }, { icon: '✨', label: '야경' }],
    categoryTags: ['반포', '쇼핑몰', '아이', '저녁'],
    userNote: '',
  },
  {
    id: 'hist_15',
    date: '2026-03-07',
    time: '14:40',
    location: '중구 장충동2가',
    lat: 37.560007, lng: 127.002515,
    thumbnail: '/photos/202603071440f25.jpg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '장충동 근처 카페에서 마주한 오후의 미소. 유리 테이블에 비친 모습이 두 배로 환했다. 빨간 스웨터가 공간을 밝힌 오후.',
    emotionTags: [{ icon: '😄', label: '즐거움' }, { icon: '☕', label: '카페' }],
    categoryTags: ['장충동', '카페', '만남', '점심'],
    userNote: '',
  },
  {
    id: 'hist_16',
    date: '2026-03-08',
    time: '13:44',
    location: '양천구 목동',
    lat: 37.526544, lng: 126.875337,
    thumbnail: '/photos/202603081344sit.jpg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '목동 공원의 맑은 오후, 아이는 넓은 하늘 아래 팔을 활짝 펼쳤다. 흰 우주복처럼 생긴 옷에 파란 하늘까지 — 우리 아이 우주비행사 됐다.',
    emotionTags: [{ icon: '🌈', label: '자유' }, { icon: '☀️', label: '맑음' }],
    categoryTags: ['목동', '공원', '아이', '봄'],
    userNote: '',
  },
  {
    id: 'hist_18',
    date: '2026-03-12',
    time: '20:49',
    location: '영등포구 선유로',
    lat: 37.534469, lng: 126.897803,
    thumbnail: '/photos/202603122049k0i.jpg',
    gradient: null,
    weather: { emoji: '🌙', label: '야간' },
    aiRecord: '선유도 근처 포장마차에서 이야기꽃을 피웠다. 안경 너머 열정적인 눈빛, 잔을 들고 한마디씩 건네는 사람들 사이에서 밤이 깊어갔다.',
    emotionTags: [{ icon: '🍺', label: '회식' }, { icon: '🔥', label: '열정' }],
    categoryTags: ['영등포', '포장마차', '회식', '저녁'],
    userNote: '',
  },
  {
    id: 'hist_19',
    date: '2026-03-13',
    time: '21:06',
    location: '중구 을지로7가',
    lat: 37.566435, lng: 127.008865,
    thumbnail: '/photos/202603132106jsl.jpg',
    gradient: null,
    weather: { emoji: '🌙', label: '야간' },
    aiRecord: '을지로 저녁, 번쩍이는 조명 아래서 아이는 공항처럼 생긴 공간에 눈이 커졌다. 목에 두른 스카프가 어른스러웠지만 두리번거리는 모습은 여전히 아이다.',
    emotionTags: [{ icon: '✈️', label: '설렘' }, { icon: '😮', label: '신기함' }],
    categoryTags: ['을지로', '쇼핑', '아이', '야간'],
    userNote: '',
  },
  {
    id: 'hist_24',
    date: '2026-03-20',
    time: '17:53',
    location: '성동구 옥수동',
    lat: 37.546875, lng: 127.014703,
    thumbnail: '/photos/2026032017537w4.jpg',
    gradient: null,
    weather: { emoji: '⛅', label: '구름조금' },
    aiRecord: '집으로 돌아오는 엘리베이터 안, 아이는 공룡 패딩을 입고 진지한 표정으로 거울을 응시했다. 엄마의 웃음이 그 진지함을 더 귀엽게 만들었다.',
    emotionTags: [{ icon: '🏠', label: '귀가' }, { icon: '😊', label: '행복' }],
    categoryTags: ['옥수동', '아이', '귀가'],
    userNote: '',
  },
  {
    id: 'hist_26',
    date: '2026-03-22',
    time: '10:06',
    location: '성동구 옥수동',
    lat: 37.547544, lng: 127.014766,
    thumbnail: '/photos/202603221006jpo.jpg',
    gradient: null,
    weather: { emoji: '⛅', label: '구름조금' },
    aiRecord: '주말 오전, 아이는 공룡 조끼를 걸치고 어딘가로 향할 준비를 마쳤다. 엘리베이터 안에서도 바깥을 내다보는 눈빛이 진지했다. 어딜 가는 건지 본인이 더 기대하는 것 같다.',
    emotionTags: [{ icon: '🦕', label: '귀여움' }, { icon: '🌞', label: '주말' }],
    categoryTags: ['옥수동', '아이', '외출준비', '주말'],
    userNote: '',
  },
  {
    id: 'hist_27',
    date: '2026-03-22',
    time: '11:02',
    location: '은평구 갈현동',
    lat: 37.618892, lng: 126.920614,
    thumbnail: '/photos/202603221102tw9.jpg',
    gradient: null,
    weather: { emoji: '⛅', label: '구름조금' },
    aiRecord: '은평구 갈현동 지하철역, 아이는 역 입구에서 서서 호기심 가득한 표정으로 뭔가를 기다렸다. 오렌지 끈이 달린 네이비 니트가 꽤 잘 어울렸다.',
    emotionTags: [{ icon: '🚇', label: '외출' }, { icon: '👀', label: '호기심' }],
    categoryTags: ['은평구', '갈현동', '지하철', '외출'],
    userNote: '',
  },
  {
    id: 'hist_28',
    date: '2026-03-22',
    time: '14:27',
    location: '파주시 와동동',
    lat: 37.728434, lng: 126.764687,
    thumbnail: '/photos/202603221427wn4.jpg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '파주 농장에서 봄 준비가 한창이었다. 대나무 시렁 사이로 스며드는 따뜻한 햇살에 얼어 있던 땅도 조금씩 깨어나는 것 같았다.',
    emotionTags: [{ icon: '🌱', label: '자연' }, { icon: '🌾', label: '농촌' }],
    categoryTags: ['파주', '농장', '봄', '자연'],
    userNote: '',
  },
  {
    id: 'hist_samsung_1',
    date: '2026-03-23',
    time: '14:56',
    location: '삼성금융캠퍼스',
    lat: 37.4919, lng: 127.0202,
    thumbnail: '/photos/20260323_145616.jpg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '삼성금융캠퍼스에서의 오후. 넓고 정돈된 공간 사이로 봄볕이 가득했다. 잠깐 멈춰 서서 바라본 캠퍼스 풍경이 분주한 일상 속 작은 여유처럼 느껴졌다.',
    emotionTags: [{ icon: '🏢', label: '업무' }, { icon: '☀️', label: '여유' }],
    categoryTags: ['삼성금융캠퍼스', '오후', '서초'],
    userNote: '',
  },
  {
    id: 'hist_samsung_2',
    date: '2026-03-24',
    time: '14:46',
    location: '삼성금융캠퍼스',
    lat: 37.4919, lng: 127.0202,
    thumbnail: '/photos/20260324_144602.jpg',
    gradient: null,
    weather: { emoji: '⛅', label: '구름조금' },
    aiRecord: '어제에 이어 다시 찾은 삼성금융캠퍼스. 오늘은 구름이 햇살을 살짝 가렸다. 어제와 같은 자리지만 조금 다른 빛이 공간을 감싸고 있었다.',
    emotionTags: [{ icon: '🏢', label: '업무' }, { icon: '💼', label: '집중' }],
    categoryTags: ['삼성금융캠퍼스', '오후', '서초'],
    userNote: '',
  },
  {
    id: 'hist_samsung_3',
    date: '2026-03-26',
    time: '08:11',
    location: '삼성금융캠퍼스',
    lat: 37.4919, lng: 127.0202,
    thumbnail: '/photos/20260326_081129.jpg',
    gradient: null,
    weather: { emoji: '🌤️', label: '맑음' },
    aiRecord: '이른 아침 삼성금융캠퍼스. 출근길 사람들이 하나둘 모이기 시작하는 시간, 조용하고 청량한 공기가 하루의 시작을 차분하게 열어줬다.',
    emotionTags: [{ icon: '🌅', label: '아침' }, { icon: '💪', label: '활력' }],
    categoryTags: ['삼성금융캠퍼스', '아침', '출근', '서초'],
    userNote: '',
  },
  {
    id: 'hist_30',
    date: '2026-03-28',
    time: '07:40',
    location: '종로구 세종대로',
    lat: 37.573432, lng: 126.977142,
    thumbnail: '/photos/202603280740r0f.jpg',
    gradient: null,
    weather: { emoji: '🌫️', label: '흐림' },
    aiRecord: '서울 K마라톤 출발선. 수천 명이 광화문 광장을 가득 메웠다. 붐비는 함성과 함께 신호가 울렸고, 달리는 것 외에는 아무 생각도 없었다.',
    emotionTags: [{ icon: '🏃', label: '달리기' }, { icon: '💪', label: '도전' }],
    categoryTags: ['마라톤', '광화문', 'K마라톤', '달리기'],
    userNote: '',
  },
  {
    id: 'hist_31',
    date: '2026-03-28',
    time: '08:52',
    location: '중구 무교동',
    lat: 37.566950, lng: 126.979418,
    thumbnail: '/photos/202603280852v2i.jpg',
    gradient: null,
    weather: { emoji: '🌫️', label: '흐림' },
    aiRecord: '완주 메달을 목에 걸고 찍은 첫 사진. 땀에 젖은 얼굴이지만 웃음은 진심이었다. 함께 달려줘서 고마워, 그 한마디가 가장 훈훈했다.',
    emotionTags: [{ icon: '🥇', label: '완주' }, { icon: '💕', label: '함께' }],
    categoryTags: ['마라톤', '완주', '메달', '커플런'],
    userNote: '',
  },
  {
    id: 'hist_32',
    date: '2026-03-29',
    time: '09:12',
    location: '종로구 세종대로',
    lat: 37.570907, lng: 126.976759,
    thumbnail: '/photos/202603290912ng4.jpg',
    gradient: null,
    weather: { emoji: '⛅', label: '구름조금' },
    aiRecord: '광화문 세종대왕상 앞에서 메달을 들고 찍은 인증샷. 엄지를 세우고 V를 만든 두 손이 온몸의 기쁨을 말해줬다. 다음 대회도 함께.',
    emotionTags: [{ icon: '🏆', label: '성취' }, { icon: '🎉', label: '축하' }],
    categoryTags: ['마라톤', '광화문', '인증샷', '완주'],
    userNote: '',
  },
  {
    id: 'hist_33',
    date: '2026-03-30',
    time: '09:05',
    location: '성북구 정릉동',
    lat: 37.610725, lng: 126.997604,
    thumbnail: '/photos/20260330090541g.jpg',
    gradient: null,
    weather: { emoji: '⛅', label: '구름조금' },
    aiRecord: '정릉동에서 프레젠테이션 중 화면에 띄운 단체 사진. 초가지붕 앞에서 찍은 이 사진 속 얼굴들이 유독 정겨웠다. 사진 속 사람들 모두 잘 지내고 있겠지.',
    emotionTags: [{ icon: '🏛️', label: '전통' }, { icon: '👥', label: '단체' }],
    categoryTags: ['정릉동', '발표', '단체사진', '전통가옥'],
    userNote: '',
  },
  {
    id: 'hist_34',
    date: '2026-03-30',
    time: '18:53',
    location: '중구 신당동',
    lat: 37.550134, lng: 127.011722,
    thumbnail: '/photos/20260330185384q.jpg',
    gradient: null,
    weather: { emoji: '🌆', label: '저녁' },
    aiRecord: '신당동 저녁 놀이터, 아이는 철봉에 매달려 하루의 마지막 에너지를 불태웠다. 어둑해지는 하늘 아래 불 켜진 아파트가 하나둘 빛났다.',
    emotionTags: [{ icon: '🌆', label: '저녁' }, { icon: '🛝', label: '놀이터' }],
    categoryTags: ['신당동', '놀이터', '아이', '저녁'],
    userNote: '',
  },
  {
    id: 'hist_35',
    date: '2026-03-31',
    time: '06:57',
    location: '성동구 옥수동',
    lat: 37.547296, lng: 127.013911,
    thumbnail: '/photos/202603310657yuw.jpg',
    gradient: null,
    weather: { emoji: '🌤️', label: '맑음' },
    aiRecord: '이른 아침 여섯시 반, 아이는 아직 일어나지 못하고 바닥 한쪽에 누워 있었다. 곰 인형 잠옷을 입은 채로 눈꺼풀이 스르르 내려갔다.',
    emotionTags: [{ icon: '😴', label: '졸림' }, { icon: '🌙', label: '이른아침' }],
    categoryTags: ['옥수동', '아침', '아이', '잠옷'],
    userNote: '',
  },
  {
    id: 'hist_36',
    date: '2026-04-01',
    time: '13:14',
    location: '종로구 평창동',
    lat: 37.611245, lng: 126.977973,
    thumbnail: '/photos/202604011314i5w.jpg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '평창동 루프탑에서 여섯 명이 모였다. 뒤로 펼쳐진 북한산이 우리의 봄을 배경 삼아줬다. 오래도록 기억하고 싶은 모임.',
    emotionTags: [{ icon: '🏔️', label: '북한산' }, { icon: '🎊', label: '모임' }],
    categoryTags: ['평창동', '모임', '루프탑', '봄'],
    userNote: '',
  },
  {
    id: 'hist_38',
    date: '2026-04-02',
    time: '12:57',
    location: '성북구 정릉동',
    lat: 37.610944, lng: 126.997240,
    thumbnail: '/photos/202604021257da0.jpg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '정릉동 벚꽃 아래, 친구들과 함께한 봄날 점심. 하얀 꽃비가 흩날리는 그늘 아래 서 있는 것만으로도 충분히 행복했다.',
    emotionTags: [{ icon: '🌸', label: '벚꽃' }, { icon: '😊', label: '봄나들이' }],
    categoryTags: ['정릉동', '벚꽃', '봄', '친구'],
    userNote: '',
  },
  {
    id: 'hist_40',
    date: '2026-04-04',
    time: '11:12',
    location: '성동구 옥수동',
    lat: 37.547412, lng: 127.013097,
    thumbnail: '/photos/202604041112y4a.jpg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '옥수동 주변에 벚꽃이 만개했다. 고개를 들어보니 하얀 꽃잎과 파란 하늘, 유리 건물이 어우러져 한 폭의 그림이 됐다.',
    emotionTags: [{ icon: '🌸', label: '벚꽃' }, { icon: '☀️', label: '봄하늘' }],
    categoryTags: ['옥수동', '벚꽃', '봄', '산책'],
    userNote: '',
  },
  {
    id: 'hist_41',
    date: '2026-04-04',
    time: '13:20',
    location: '성동구 금호동3가',
    lat: 37.550392, lng: 127.014017,
    thumbnail: '/photos/202604041320rzx.jpg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '금호동 공원에서 아이는 그물 타기에 도전했다. 흔들리는 그물 위에서도 당당한 표정이 역시나 이 아이답다. 도전은 멈추지 않는다.',
    emotionTags: [{ icon: '🧗', label: '도전' }, { icon: '😄', label: '신남' }],
    categoryTags: ['금호동', '공원', '아이', '봄'],
    userNote: '',
  },
  {
    id: 'hist_42',
    date: '2026-04-05',
    time: '10:11',
    location: '성동구 옥수동',
    lat: 37.547019, lng: 127.014037,
    thumbnail: '/photos/202604051011vah.jpg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '주말 오전, 아이는 책장 옆에 앉아 그림카드를 꼼꼼히 살펴보고 있었다. 햇살 가득한 방 안에서 혼자만의 독서 시간. 이게 최고의 주말이 아닐까.',
    emotionTags: [{ icon: '📚', label: '독서' }, { icon: '😌', label: '집중' }],
    categoryTags: ['옥수동', '집', '아이', '독서', '주말'],
    userNote: '',
  },
  {
    id: 'hist_43',
    date: '2026-04-05',
    time: '17:47',
    location: '강남구 삼성동',
    lat: 37.510843, lng: 127.059915,
    thumbnail: '/photos/2026040517470r3.jpg',
    gradient: null,
    weather: { emoji: '🌆', label: '저녁' },
    aiRecord: '코엑스 근처 레스토랑에서 아이와 함께한 저녁 식사. 아이는 고기를 집어들며 진지한 표정이었고, 아빠는 그 옆에서 흐뭇했다.',
    emotionTags: [{ icon: '🍖', label: '식사' }, { icon: '👨‍👦', label: '아빠와아이' }],
    categoryTags: ['삼성동', 'COEX', '외식', '아이'],
    userNote: '',
  },
  {
    id: 'hist_44',
    date: '2026-04-05',
    time: '19:07',
    location: '광진구 자양동',
    lat: 37.530286, lng: 127.067903,
    thumbnail: '/photos/202604051907ymc.jpg',
    gradient: null,
    weather: { emoji: '🌃', label: '야간' },
    aiRecord: '자양동 야경을 배경으로 아이가 그물 놀이기구에 매달렸다. 사방으로 불이 켜지는 저녁, 아이의 눈빛은 더 빛났다.',
    emotionTags: [{ icon: '🌃', label: '야경' }, { icon: '🧗', label: '놀이' }],
    categoryTags: ['자양동', '놀이터', '야경', '아이'],
    userNote: '',
  },
  {
    id: 'hist_48',
    date: '2026-04-08',
    time: '08:02',
    location: '성동구 옥수동',
    lat: 37.547472, lng: 127.013573,
    thumbnail: '/photos/202604080802cqf.jpg',
    gradient: null,
    weather: { emoji: '🌤️', label: '맑음' },
    aiRecord: '등원 아침, 아이가 혀를 내밀며 카메라 앞에서 포즈를 취했다. 잔뜩 웃긴 척 하는 표정이 하루를 가장 밝게 시작하는 방법이었다.',
    emotionTags: [{ icon: '😜', label: '장난' }, { icon: '👩‍👦', label: '엄마와아이' }],
    categoryTags: ['옥수동', '등원', '아이', '아침'],
    userNote: '',
  },
  {
    id: 'hist_0314',
    date: '2026-03-14',
    time: '11:32',
    location: '안산시 대부도',
    lat: 37.282325, lng: 126.56860277777777,
    thumbnail: '/photos/0314.jpeg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '대부도 바다뷰 카페에서 할아버지 무릎 위에 자리잡은 아기. 노란 장난감을 꼭 쥔 채 창밖 바다를 바라보는 표정이 사뭇 진지했다. 할머니와 할아버지 사이에서 이미 여행의 주인공이 된 날.',
    emotionTags: [{ icon: '👴', label: '조부모' }, { icon: '🌊', label: '바다' }],
    categoryTags: ['대부도', '가족', '카페', '바다뷰'],
    userNote: '',
  },
  {
    id: 'hist_0325',
    date: '2026-03-25',
    time: '15:23',
    location: '부천시 소사구 송내동',
    lat: 37.48551944444444, lng: 126.75366944444444,
    thumbnail: '/photos/0325.jpeg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '오후 햇살을 받으며 활짝 웃던 순간. 볼살이 터질 듯한 미소가 카메라를 꽉 채웠다. 이 표정 하나로 하루가 다 좋아지는 기분이었다.',
    emotionTags: [{ icon: '😄', label: '행복' }, { icon: '☀️', label: '따뜻함' }],
    categoryTags: ['집', '일상', '아기', '미소'],
    userNote: '',
  },
  {
    id: 'hist_0327',
    date: '2026-03-27',
    time: '19:32',
    location: '부천시 소사구 송내동',
    lat: 37.48531388888889, lng: 126.75320555555555,
    thumbnail: '/photos/0327.jpeg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '저녁 무렵, 거실 바닥에서 혼자 앉아 활짝 웃던 순간. 장난감들에 둘러싸여 이미 자기 세계를 완성한 듯한 표정이었다. 이 웃음이 오늘 하루의 정답이었다.',
    emotionTags: [{ icon: '😁', label: '신남' }, { icon: '🧸', label: '장난감' }],
    categoryTags: ['집', '거실', '아기', '장난감'],
    userNote: '',
  },
  {
    id: 'hist_0403',
    date: '2026-04-03',
    time: '19:39',
    location: '부천시 소사구 송내동',
    lat: 37.485216666666666, lng: 126.75308333333334,
    thumbnail: '/photos/0403.jpeg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '흐린 저녁이었지만 이 웃음 하나로 충분했다. 볼이 빨갛게 달아오를 만큼 크게 터져나온 웃음. 카메라를 보고 이렇게 웃어주는 날은 어떤 하루도 좋은 하루다.',
    emotionTags: [{ icon: '😂', label: '폭소' }, { icon: '❤️', label: '사랑' }],
    categoryTags: ['집', '일상', '아기', '웃음'],
    userNote: '',
  },
  {
    id: 'hist_0309',
    date: '2026-03-09',
    time: '09:46',
    location: '송파구 방이동',
    lat: 37.51596111111111, lng: 127.11636388888888,
    thumbnail: '/photos/0309.jpeg',
    gradient: null,
    weather: { emoji: '⛅', label: '흐림' },
    aiRecord: '흐린 아침, 창가 자리에서 맞이한 브런치. 따뜻한 커피 한 잔과 에그 머핀, 그리고 요거트. 창밖 나무들이 아직 겨울인 척하는 3월 아침이었지만, 이 정도면 충분히 좋은 하루의 시작이었다.',
    emotionTags: [{ icon: '☕', label: '여유' }, { icon: '🌥️', label: '흐린날' }],
    categoryTags: ['카페', '브런치', '스타벅스', '방이동'],
    userNote: '',
  },
  {
    id: 'hist_0310',
    date: '2026-03-10',
    time: '20:17',
    location: '송파구 신천동',
    lat: 37.520241666666664, lng: 127.10431666666666,
    thumbnail: '/photos/0310.jpeg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '밤 가로등 아래에서 막 피어나기 시작한 노란 산수유. 0도의 찬 공기 속에서도 봄이 오고 있다는 신호처럼 환하게 빛났다. 송파의 밤이 조금 따뜻해 보였다.',
    emotionTags: [{ icon: '🌼', label: '봄' }, { icon: '🌃', label: '야경' }],
    categoryTags: ['봄꽃', '야경', '신천동', '산수유'],
    userNote: '',
  },
  {
    id: 'hist_0311',
    date: '2026-03-11',
    time: '14:06',
    location: '송파구 잠실동',
    lat: 37.50980277777778, lng: 127.07627222222222,
    thumbnail: '/photos/0311.jpeg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '잠실에서 올려다 본 봄 하늘. 파란 하늘에 막 피어나기 시작한 벚꽃이 아직은 수줍은 듯 가지 끝에만 걸려 있었다. 완전히 피기까지 조금만 더 기다리면 될 것 같았다.',
    emotionTags: [{ icon: '🌸', label: '봄' }, { icon: '💙', label: '기대' }],
    categoryTags: ['벚꽃', '잠실', '봄', '올림픽공원'],
    userNote: '',
  },
  {
    id: 'hist_0316',
    date: '2026-03-16',
    time: '14:09',
    location: '강화군 교동면',
    lat: 37.78241666666666, lng: 126.28023611111111,
    thumbnail: '/photos/0316.jpeg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '교동도 나들이에서 만난 할아버지의 다정함. 유모차에 앉아 눈을 동그랗게 뜬 아기와 무릎을 굽혀 마주 앉은 할아버지 사이에, 흐린 하늘도 따뜻해 보였다.',
    emotionTags: [{ icon: '👴', label: '가족' }, { icon: '🥰', label: '사랑스러움' }],
    categoryTags: ['교동도', '강화', '나들이', '아기'],
    userNote: '',
  },
  {
    id: 'hist_0317',
    date: '2026-03-17',
    time: '11:01',
    location: '낙가산 보문사 · 강화군 삼산면',
    lat: 37.68831944444444, lng: 126.32155555555555,
    thumbnail: '/photos/0317.jpeg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '낙가산 보문사에서 온 가족이 함께 찍은 봄 사진. 알록달록 연등 아래 유모차를 가운데 두고 선 네 식구. 맑은 하늘만큼 환한 얼굴들이 오래 기억될 것 같다.',
    emotionTags: [{ icon: '🏮', label: '봄나들이' }, { icon: '👨‍👩‍👧', label: '가족' }],
    categoryTags: ['보문사', '석모도', '강화', '가족여행'],
    userNote: '',
  },
  {
    id: 'hist_0318',
    date: '2026-03-18',
    time: '20:19',
    location: '부천시 소사구 송내동',
    lat: 37.48515833333333, lng: 126.75327222222222,
    thumbnail: '/photos/0318.jpeg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '밤 8시, 아기가 배를 깔고 엎드려 목을 드는 연습을 하던 중이었다. 옆에서 아빠가 슬쩍 끼어들어 셀카를 찍었더니, 두 쌍의 눈이 똑같이 카메라를 빤히 바라봤다.',
    emotionTags: [{ icon: '👨‍👧', label: '아빠' }, { icon: '💕', label: '애정' }],
    categoryTags: ['집', '일상', '아빠와아기', '부천'],
    userNote: '',
  },
  {
    id: 'hist_0319',
    date: '2026-03-19',
    time: '21:35',
    location: '부천시 소사구 송내동',
    lat: 37.485302777777775, lng: 126.75356388888889,
    thumbnail: '/photos/0319.jpeg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '밤 9시가 넘도록 잠이 들 기색이 없던 밤. 블라인드 너머 어둠 속에서도 두 눈만은 또렷했다. 사자 프린트 잠옷을 입고 카메라를 빤히 바라보던 표정이 오래 남는다.',
    emotionTags: [{ icon: '🌙', label: '밤' }, { icon: '👶', label: '아기' }],
    categoryTags: ['집', '밤', '아기', '일상'],
    userNote: '',
  },
  {
    id: 'hist_0304',
    date: '2026-03-04',
    time: '17:30',
    location: '삼성에버랜드 · 용인시 처인구',
    lat: 37.29136388888889, lng: 127.20025,
    thumbnail: '/photos/0304.jpeg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '에버랜드 실내에서 바닥에 앉아 깔깔대는 두 아이. 분홍 패딩이 양손을 번쩍 들며 무언가를 발견했다는 듯 눈을 반짝였다. 밖은 차가운 3월이었지만 이 안은 아이들 웃음소리로 따뜻했다.',
    emotionTags: [{ icon: '😊', label: '즐거움' }, { icon: '🎡', label: '설렘' }],
    categoryTags: ['에버랜드', '아이들', '나들이', '용인'],
    userNote: '',
  },
  {
    id: 'hist_0315',
    date: '2026-03-15',
    time: '16:16',
    location: '연수구 동춘동',
    lat: 37.41656388888889, lng: 126.659875,
    thumbnail: '/photos/0315.jpeg',
    gradient: null,
    weather: { emoji: '⛅', label: '부분적으로 흐림' },
    aiRecord: '흐린 하늘 아래 사슴 친구들을 만난 날. 양손을 번쩍 들고 환하게 웃는 표정이 구름보다 환했다. 인천 스카이라인이 뒤로 그림처럼 펼쳐졌다.',
    emotionTags: [{ icon: '😄', label: '신남' }, { icon: '🦌', label: '동물' }],
    categoryTags: ['공원', '나들이', '인천', '사슴'],
    userNote: '',
  },
  {
    id: 'hist_0321',
    date: '2026-03-21',
    time: '15:31',
    location: '화성시 병점구 반월동',
    lat: 37.2384, lng: 127.06395833333333,
    thumbnail: '/photos/0321.jpeg',
    gradient: null,
    weather: { emoji: '☀️', label: '맑음' },
    aiRecord: '헬멧을 눌러쓰고 진지하게 광장에 선 모습이 꼭 경기를 앞둔 선수 같았다. 맑은 봄 오후, 아파트 단지 광장이 특훈 트랙이 됐다.',
    emotionTags: [{ icon: '🪖', label: '진지함' }, { icon: '🌱', label: '성장' }],
    categoryTags: ['킥보드', '야외활동', '화성', '봄'],
    userNote: '',
  },
  {
    id: 'hist_0409',
    date: '2026-04-09',
    time: '19:10',
    location: '부평구 삼산동',
    lat: 37.50987222222222, lng: 126.73761666666667,
    thumbnail: '/photos/0409.jpeg',
    gradient: null,
    weather: { emoji: '🌦️', label: '이슬비' },
    aiRecord: '이슬비가 내리는데 오히려 더 신이 났다. 빨간 티셔츠가 젖을 것도 모르고 국자로 물을 퍼 담는 집중력. 세상에서 제일 진지한 물놀이였다.',
    emotionTags: [{ icon: '💦', label: '신남' }, { icon: '🌧️', label: '빗속놀이' }],
    categoryTags: ['물놀이', '야외', '부평', '봄비'],
    userNote: '',
  },
  {
    id: 'hist_0411',
    date: '2026-04-11',
    time: '16:29',
    location: '스플라스 리솜 · 예산군 덕산면',
    lat: 36.69349722222222, lng: 126.65673055555555,
    thumbnail: '/photos/0411.jpeg',
    gradient: null,
    weather: { emoji: '☁️', label: '흐림' },
    aiRecord: '꽃무늬 버킷햇을 꾹 눌러쓰고 미끄럼틀 위로 올라가는 뒷모습. 잠깐 주저하는 듯 멈췄다가 이내 쭈욱 내려갔다. 스플라스 리솜에서의 봄 물놀이.',
    emotionTags: [{ icon: '🎢', label: '짜릿함' }, { icon: '🌊', label: '물놀이' }],
    categoryTags: ['물놀이', '워터파크', '스플라스리솜', '덕산', '예산'],
    userNote: '',
  },
  {
    id: 'hist_0412',
    date: '2026-04-12',
    time: '13:06',
    location: '강화군 강화읍',
    lat: 37.75183888888889, lng: 126.4842388888889,
    thumbnail: '/photos/0412.jpeg',
    gradient: null,
    weather: { emoji: '🌤️', label: '대체로 맑음' },
    aiRecord: '강화도 벚꽃길이 터질 것처럼 피어있던 날. 유모차를 밀며 꽃잎이 쌓인 길을 천천히 걸었다. 21도의 봄바람이 꽃을 흩날리고, 발걸음은 자연스레 느려졌다.',
    emotionTags: [{ icon: '🌸', label: '봄' }, { icon: '😌', label: '여유' }],
    categoryTags: ['벚꽃', '강화도', '봄나들이', '유모차'],
    userNote: '',
  },
]

export const store = Vue.observable({
  // 공유 시트 (App.vue 루트에서 렌더링)
  sharingRecord: null,

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
  store.processingProgress = 0
  const total = photoGroups.length
  let completedCount = 0

  // 2단계: 그룹별 병렬 AI 처리
  // 각 그룹은 독립적으로: 업로드(병렬) → 베스트컷 선정 → 사진 분석 → 기록 카드
  const groupResults = await Promise.allSettled(
    photoGroups.map(async (group, i) => {
      const weather = weatherResults[i].status === 'fulfilled'
        ? weatherResults[i].value
        : { emoji: '🌡️', label: '알 수 없음' }

      const timestamp = group.startTime || group.photos?.[0]?.timestamp || Date.now()
      const d = new Date(timestamp)
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

      const result = await processGroupForRecord(group.photos, group.locationLabel, weather)

      completedCount++
      store.processingProgress = Math.round((completedCount / total) * 100)

      return {
        id: group.groupId,
        date,
        time,
        location: group.locationLabel,
        lat: group.centerLat,
        lng: group.centerLng,
        thumbnail: result.thumbnail,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        weather,
        aiRecord: result.aiRecord,
        emotionTags: result.emotionTags,
        categoryTags: result.categoryTags,
        userNote: '',
      }
    })
  )

  // 성공한 그룹만 수집, 실패한 그룹은 경고 로그
  const records = groupResults
    .map((result, i) => {
      if (result.status === 'fulfilled') return result.value
      console.error(`[store] 그룹 ${i + 1} 처리 실패:`, result.reason)
      return null
    })
    .filter(Boolean)

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
