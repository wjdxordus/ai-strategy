<template>
  <div class="pd-page">

    <!-- ─── 헤더 ───────────────────────────────── -->
    <div class="pd-header">
      <img src="/images/logo.png" class="pd-logo" alt="Golden Record" />
      <div class="pd-header-text">
        <p class="pd-title">{{ allDone ? '기록이 완성됐어요! 🎉' : '오늘의 기록을 만드는 중' }}</p>
        <p class="pd-sub">{{ allDone ? groups.length + '개의 기록 카드가 생성됐어요' : 'AI가 사진을 분석하고 기록을 작성하고 있어요' }}</p>
      </div>
    </div>

    <!-- ─── 전체 진행률 ─────────────────────────── -->
    <div class="pd-overall-wrap">
      <div class="pd-overall-bar">
        <div class="pd-overall-fill" :style="{ width: overallPct + '%' }" />
      </div>
      <span class="pd-overall-pct">{{ Math.round(overallPct) }}%</span>
    </div>

    <!-- ─── 데이터 대기 중 스피너 ─── -->
    <div v-if="!groups.length" class="pd-waiting">
      <div class="pd-waiting-spinner" />
      <p class="pd-waiting-text">사진 불러오는 중...</p>
    </div>

    <!-- ─── 그룹 카드 ────────────────────────────── -->
    <div v-else class="pd-groups">
      <div
        v-for="(g, gi) in groups"
        :key="gi"
        class="pd-card"
        :class="{
          'pd-card--active': g.stage !== 'waiting' && g.stage !== 'done',
          'pd-card--done': g.stage === 'done',
        }"
      >
        <!-- 카드 상단: 위치 + 상태 pill -->
        <div class="pd-card-top">
          <div class="pd-location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{{ g.location }}</span>
          </div>
          <span v-if="g.stage === 'waiting'" class="pd-pill pd-pill--waiting">대기 중</span>
          <span v-if="g.stage === 'done'" class="pd-pill pd-pill--done">완료 ✓</span>
        </div>

        <!-- ─── 3단계 파이프라인 ─── -->
        <div v-if="g.stage !== 'waiting'" class="pd-pipeline">
          <div class="pd-pipe-step" :class="{ 'is-done': isPipeDone(g, 'upload'), 'is-active': g.stage === 'uploading' }">
            <div class="pd-pipe-dot">
              <svg v-if="isPipeDone(g, 'upload')" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span v-else-if="g.stage === 'uploading'" class="pd-pipe-pulse" />
              <span v-else class="pd-pipe-num">1</span>
            </div>
            <span class="pd-pipe-label">업로드</span>
          </div>
          <div class="pd-pipe-line" :class="{ filled: isPipeDone(g, 'upload') }" />
          <div class="pd-pipe-step" :class="{ 'is-done': isPipeDone(g, 'select'), 'is-active': g.stage === 'selecting' }">
            <div class="pd-pipe-dot">
              <svg v-if="isPipeDone(g, 'select')" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span v-else-if="g.stage === 'selecting'" class="pd-pipe-pulse" />
              <span v-else class="pd-pipe-num">2</span>
            </div>
            <span class="pd-pipe-label">사진 선별</span>
          </div>
          <div class="pd-pipe-line" :class="{ filled: isPipeDone(g, 'select') }" />
          <div class="pd-pipe-step" :class="{ 'is-done': isPipeDone(g, 'generate'), 'is-active': g.stage === 'generating' }">
            <div class="pd-pipe-dot">
              <svg v-if="isPipeDone(g, 'generate')" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span v-else-if="g.stage === 'generating'" class="pd-pipe-pulse" />
              <span v-else class="pd-pipe-num">3</span>
            </div>
            <span class="pd-pipe-label">기록 작성</span>
          </div>
        </div>

        <!-- 사진 스트립 -->
        <div class="pd-strip">
          <div
            v-for="(photo, pi) in g.photos"
            :key="pi"
            class="pd-thumb-wrap"
            :class="{
              'is-best': isBest(g, pi),
              'is-dim':  isDim(g, pi),
              'is-pending': isPending(g, pi),
            }"
          >
            <div class="pd-thumb" :style="{ backgroundImage: 'url(' + photo.src + ')' }" />
            <transition name="badge-pop">
              <div v-if="isBest(g, pi)" class="pd-best-badge">BEST</div>
            </transition>
            <div v-if="isPending(g, pi)" class="pd-pending-overlay">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- ─── AI 에이전트 섹션 ─── -->
        <transition name="agent-fade" mode="out-in">

          <!-- 업로드 -->
          <div v-if="g.stage === 'uploading'" key="uploading" class="pd-agent">
            <div class="pd-agent-icons">
              <svg class="ag-icon ag-float-1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <div class="ag-center-wrap">
                <svg class="ag-icon ag-icon--cloud" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                </svg>
              </div>
              <svg class="ag-icon ag-float-2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p class="pd-agent-msg">사진을 AI에게 전달하는 중이에요.</p>
            <p class="pd-agent-sub">{{ g.uploadedCount }} / {{ g.photos.length }}장 전송 완료</p>
          </div>

          <!-- 선별 -->
          <div v-else-if="g.stage === 'selecting'" key="selecting" class="pd-agent">
            <div class="pd-agent-icons">
              <svg class="ag-icon ag-star ag-star-1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <div class="ag-center-wrap">
                <svg class="ag-icon ag-icon--eye" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <div class="ag-eye-ring" />
              </div>
              <svg class="ag-icon ag-star ag-star-2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <p class="pd-agent-msg">최고의 사진을 선별중이에요.</p>
            <p class="pd-agent-sub">AI가 모든 사진을 분석하고 있어요</p>
          </div>

          <!-- 기록 생성 -->
          <div v-else-if="g.stage === 'generating'" key="generating" class="pd-agent">
            <div class="pd-agent-icons">
              <svg class="ag-icon ag-spark ag-spark-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
              <div class="ag-center-wrap">
                <svg class="ag-icon ag-icon--pen" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <svg class="ag-icon ag-spark ag-spark-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
            </div>
            <p class="pd-agent-msg">기록을 작성하고 있어요.</p>
            <p class="pd-agent-sub">AI가 당신만의 기록을 만들고 있어요<span class="pd-cursor">|</span></p>
          </div>

        </transition>

        <!-- 그룹 진행바 -->
        <div v-if="g.stage !== 'waiting'" class="pd-group-bar-row">
          <div class="pd-group-bar">
            <div class="pd-group-fill" :style="{ width: groupPct(g) + '%' }" />
          </div>
          <span class="pd-group-label">{{ Math.round(groupPct(g)) }}%</span>
        </div>

        <!-- 완료 시 미니 기록 카드 -->
        <transition name="result-slide">
          <div v-if="g.stage === 'done'" class="pd-result">
            <div class="pd-result-thumb" :style="resultThumbStyle(g)" />
            <div class="pd-result-body">
              <p class="pd-result-meta">{{ g.weather }}&nbsp;&nbsp;{{ g.location }}</p>
              <p class="pd-result-text">{{ g.aiRecord }}</p>
              <div class="pd-result-tags">
                <span v-for="tag in g.tags" :key="tag" class="pd-tag">#{{ tag }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ─── 완료 버튼 ─────────────────────────── -->
    <transition name="fade-up">
      <div v-if="allDone" class="pd-done-wrap">
        <button class="pd-btn-home" @click="$router.push('/home')">홈에서 기록 확인하기</button>
      </div>
    </transition>

    <div style="height: 80px" />
  </div>
</template>

<script>
import { store, saveProcessedRecords } from '../store'
import { fetchWeather } from '../services/weather'
import { uploadFile, analyzePhoto, parseBestCutIndex } from '../services/dify'
import { CONFIG } from '../config'

// ─── 데모 데이터 ────────────────────────────────────────────────────────────
const DEMO_GROUPS = [
  {
    location: '성동구 옥수동',
    photos: [
      { src: '/photos/202604041112y4a.jpg' },
      { src: '/photos/202604041320rzx.jpg' },
      { src: '/photos/202604051011vah.jpg' },
      { src: '/photos/202604080802cqf.jpg' },
      { src: '/photos/202604021257da0.jpg' },
    ],
    bestCutIndex: 1,
    delay: 0,
    weather: '☀️ 맑음',
    aiRecord: '옥수동 공원에서 아이와 함께한 봄 오전. 따스한 햇살 아래 그물을 타며 환하게 웃는 표정이 오늘 하루를 완성했다.',
    tags: ['옥수동', '봄나들이', '아이', '공원'],
  },
  {
    location: '성북구 정릉동',
    photos: [
      { src: '/photos/0309.jpeg' },
      { src: '/photos/0311.jpeg' },
      { src: '/photos/0316.jpeg' },
      { src: '/photos/0317.jpeg' },
      { src: '/photos/0321.jpeg' },
    ],
    bestCutIndex: 3,
    delay: 700,
    weather: '🌸 맑음',
    aiRecord: '정릉동 벚꽃길에서 마주친 봄. 흩날리는 꽃잎이 발걸음을 자꾸 느리게 만들었다. 가족과 함께라 더 오래 기억될 하루.',
    tags: ['정릉동', '벚꽃', '봄', '가족'],
  },
  {
    location: '삼성금융캠퍼스',
    photos: [
      { src: '/photos/16601.jpg' },
      { src: '/photos/0304.jpeg' },
      { src: '/photos/0325.jpeg' },
      { src: '/photos/0327.jpeg' },
      { src: '/photos/0403.jpeg' },
    ],
    bestCutIndex: 0,
    delay: 1400,
    weather: '🌧️ 비',
    aiRecord: '비 내리는 오후, 삼성금융캠퍼스에서 팀원들과 머리를 맞댔다. 노트북 화면을 함께 들여다보며 나누는 대화가 빗소리만큼 조용하고 집중됐던 시간.',
    tags: ['삼성금융캠퍼스', '워크숍', '팀작업'],
  },
]

const UPLOAD_PER_PHOTO = 480
const SELECT_DURATION  = 4200
const GEN_DURATION     = 2600
const TICK_MS          = 40

export default {
  name: 'ProcessingDemoView',

  data() {
    return {
      store,
      isRealMode: false,
      date: new Date().toISOString().slice(0, 10),
      userInfo: null,
      groups: [],   // 실제 데이터 or 데모 fallback 시점에 채워짐
    }
  },

  created() {
    this._timers = []
    this._bridgeTimeout = null
    this._cancelled = false
    // Vue 2는 _ 접두사 프로퍼티를 reactive 제외 → created()에서 인스턴스 직접 할당
    this._demoGroups = DEMO_GROUPS.map(g => ({
      ...g,
      stage: 'waiting',
      uploadedCount: 0,
      selectPct: 0,
      genPct: 0,
    }))
  },

  computed: {
    groupPct() {
      return (g) => {
        switch (g.stage) {
          case 'waiting':    return 0
          case 'uploading':  return (g.uploadedCount / g.photos.length) * 34
          case 'selecting':  return 34 + g.selectPct * 0.26
          case 'generating': return 60 + g.genPct * 0.4
          case 'done':       return 100
          default:           return 0
        }
      }
    },
    overallPct() {
      if (!this.groups.length) return 0
      const sum = this.groups.reduce((acc, g) => acc + this.groupPct(g), 0)
      return sum / this.groups.length
    },
    allDone() {
      return this.groups.length > 0 && this.groups.every(g => g.stage === 'done')
    },
  },

  watch: {
    // Android 브릿지 데이터 도착 시 실제 모드 전환
    'store.pendingPhotoData'(data) {
      if (data && !this.isRealMode) {
        clearTimeout(this._bridgeTimeout)
        this.startRealMode(data)
      }
    },
  },

  mounted() {
    if (store.pendingPhotoData) {
      this.startRealMode(store.pendingPhotoData)
    } else {
      // 5초 대기 후 데모 모드로 fallback (Android 데이터 수신 여유 확보)
      this._bridgeTimeout = setTimeout(() => {
        if (!this.isRealMode) this.startDemoMode()
      }, 5000)
    }
  },

  beforeDestroy() {
    this._cancelled = true
    this._timers.forEach(clearTimeout)
    this._timers = []
    clearTimeout(this._bridgeTimeout)
  },

  methods: {
    // ─── 데모 시뮬레이션 ──────────────────────────────────────────────────────

    startDemoMode() {
      // 데모 그룹을 이 시점에 채워서 대기 중 빈 화면 방지
      this.groups = this._demoGroups
      this.groups.forEach((_, gi) => {
        const delay = this._demoGroups[gi].delay || 0
        const t = setTimeout(() => this.startDemoGroup(gi), delay)
        this._timers.push(t)
      })
    },

    startDemoGroup(gi) {
      const g = this.groups[gi]
      g.stage = 'uploading'
      g.uploadedCount = 0
      this.demoUploadNext(gi)
    },

    demoUploadNext(gi) {
      const g = this.groups[gi]
      const t = setTimeout(() => {
        g.uploadedCount++
        if (g.uploadedCount < g.photos.length) {
          this.demoUploadNext(gi)
        } else {
          this.demoStartSelecting(gi)
        }
      }, UPLOAD_PER_PHOTO)
      this._timers.push(t)
    },

    demoStartSelecting(gi) {
      const g = this.groups[gi]
      g.stage = 'selecting'
      g.selectPct = 0
      const start = Date.now()
      const tick = setInterval(() => {
        g.selectPct = Math.min(100, ((Date.now() - start) / SELECT_DURATION) * 100)
        if (g.selectPct >= 100) {
          clearInterval(tick)
          this.demoStartGenerating(gi)
        }
      }, TICK_MS)
      this._timers.push(tick)
    },

    demoStartGenerating(gi) {
      const g = this.groups[gi]
      g.stage = 'generating'
      g.genPct = 0
      const start = Date.now()
      const tick = setInterval(() => {
        g.genPct = Math.min(100, ((Date.now() - start) / GEN_DURATION) * 100)
        if (g.genPct >= 100) {
          clearInterval(tick)
          g.stage = 'done'
        }
      }, TICK_MS)
      this._timers.push(tick)
    },

    // ─── 실제 API 처리 모드 ───────────────────────────────────────────────────

    startRealMode(pendingData) {
      this.isRealMode = true
      store.pendingPhotoData = null  // 소비 후 클리어

      this.date = pendingData.date || new Date().toISOString().slice(0, 10)
      this.userInfo = pendingData.userInfo || {}

      const photoGroups = pendingData.photoGroups || []

      // 실제 데이터로 groups 교체 (모든 mutable 프로퍼티를 upfront 정의 — Vue 2 reactivity 보장)
      this.groups = photoGroups.map(g => ({
        location: g.locationLabel || g.location || '알 수 없는 위치',
        lat: g.centerLat || g.lat || 0,
        lng: g.centerLng || g.lng || 0,
        timestamp: g.startTime || g.photos?.[0]?.timestamp || Date.now(),
        photos: (g.photos || []).map(p => ({
          src: p.thumbnail,
          thumbnail: p.thumbnail,
          ts: p.timestamp,
        })),
        stage: 'waiting',
        uploadedCount: 0,
        selectPct: 0,
        genPct: 0,
        bestCutIndex: -1,
        weather: '🌡️ 로딩 중',
        aiRecord: '',
        tags: [],
        _result: null,
      }))

      // 300ms 간격으로 그룹 순차 시작 (API 과부하 방지)
      this.groups.forEach((_, gi) => {
        const t = setTimeout(() => this.startRealGroup(gi), gi * 300)
        this._timers.push(t)
      })
    },

    async startRealGroup(gi) {
      if (this._cancelled) return
      const g = this.groups[gi]
      if (!g || !g.photos || g.photos.length === 0) {
        g.stage = 'done'
        this.checkAllDone()
        return
      }

      // 1. 날씨 조회
      let weatherObj = { emoji: '🌡️', label: '알 수 없음' }
      try {
        weatherObj = await fetchWeather(g.lat, g.lng, g.timestamp)
      } catch (e) {
        console.warn('[ProcessingDemo] 날씨 조회 실패:', e)
      }
      if (this._cancelled) return
      g.weather = `${weatherObj.emoji} ${weatherObj.label}`

      // 2. 사진 순차 업로드 (업로드 카운터 표시용)
      g.stage = 'uploading'
      g.uploadedCount = 0
      const uploadFileIds = []

      for (let pi = 0; pi < g.photos.length; pi++) {
        if (this._cancelled) return
        try {
          const id = await uploadFile(
            g.photos[pi].thumbnail,
            `photo_${pi + 1}.jpg`,
            'golden-multi-file'
          )
          uploadFileIds.push(id)
        } catch (e) {
          console.warn(`[ProcessingDemo] 사진 ${pi + 1} 업로드 실패:`, e)
          uploadFileIds.push(null)
        }
        g.uploadedCount = pi + 1
      }

      const validIds = uploadFileIds.filter(Boolean)
      if (validIds.length === 0) {
        this.finishWithFallback(g, weatherObj)
        return
      }

      // 3. 베스트컷 선정 (API 응답 대기 중 프로그레스 애니메이션)
      g.stage = 'selecting'
      g.selectPct = 0
      const selectAnim = this.animatePct(g, 'selectPct', 4200)

      let bestCutIndex = 0
      try {
        const res = await fetch(`${CONFIG.DIFY_BASE_URL}/workflows/run`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${CONFIG.DIFY_BESTCUT_WORKFLOW_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: {
              images: validIds.map(id => ({
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
        if (res.ok) {
          const raw = await res.json()
          bestCutIndex = parseBestCutIndex(raw, g.photos.length)
        }
      } catch (e) {
        console.warn('[ProcessingDemo] 베스트컷 선정 실패:', e)
      }

      if (this._cancelled) { selectAnim.stop(); return }
      selectAnim.stop()
      g.selectPct = 100
      g.bestCutIndex = bestCutIndex

      // 4. 기록 생성
      g.stage = 'generating'
      g.genPct = 0
      const genAnim = this.animatePct(g, 'genPct', 3000)

      let aiRecord = `${g.location}에서의 소중한 순간입니다.`
      let categoryTags = [g.location.split(' ')[0]].filter(Boolean)
      let emotionTags = [{ icon: '📍', label: '기록' }]

      try {
        const selectedId = uploadFileIds[bestCutIndex] || validIds[0]
        const generated = await analyzePhoto(selectedId, g.location, weatherObj)
        if (generated.aiRecord) aiRecord = generated.aiRecord
        if (generated.categoryTags) categoryTags = generated.categoryTags
        if (generated.emotionTags) emotionTags = generated.emotionTags
      } catch (e) {
        console.warn('[ProcessingDemo] 기록 생성 실패:', e)
      }

      if (this._cancelled) { genAnim.stop(); return }
      genAnim.stop()
      g.genPct = 100
      g.aiRecord = aiRecord
      g.tags = categoryTags
      g._result = {
        thumbnail: g.photos[bestCutIndex]?.thumbnail || g.photos[0]?.thumbnail,
        aiRecord,
        categoryTags,
        emotionTags,
        weather: weatherObj,
      }
      g.stage = 'done'

      this.checkAllDone()
    },

    finishWithFallback(g, weatherObj) {
      const loc0 = (g.location || '').split(' ')[0]
      g.aiRecord = `${g.location}에서의 소중한 순간입니다.`
      g.tags = [loc0].filter(Boolean)
      g._result = {
        thumbnail: g.photos[0]?.thumbnail || null,
        aiRecord: g.aiRecord,
        categoryTags: g.tags,
        emotionTags: [{ icon: '📍', label: '기록' }],
        weather: weatherObj,
      }
      g.stage = 'done'
      this.checkAllDone()
    },

    checkAllDone() {
      if (!this.isRealMode) return
      if (this.groups.every(gr => gr.stage === 'done')) {
        this.saveAndFinish()
      }
    },

    saveAndFinish() {
      const records = this.groups.map((g, gi) => {
        const r = g._result || {}
        const d = new Date(g.timestamp)
        return {
          id: `today_${this.date}_${gi}`,
          date: this.date,
          time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
          location: g.location,
          lat: g.lat,
          lng: g.lng,
          thumbnail: r.thumbnail || null,
          gradient: null,
          weather: r.weather || { emoji: '🌡️', label: '알 수 없음' },
          aiRecord: r.aiRecord || '',
          emotionTags: r.emotionTags || [],
          categoryTags: r.categoryTags || [],
          userNote: '',
        }
      })
      saveProcessedRecords(records, this.date)
    },

    // ─── 공통 헬퍼 ────────────────────────────────────────────────────────────

    animatePct(g, key, duration) {
      const start = Date.now()
      let stopped = false
      const id = setInterval(() => {
        if (stopped) return
        g[key] = Math.min(95, ((Date.now() - start) / duration) * 100)
      }, TICK_MS)
      this._timers.push(id)
      return { stop() { stopped = true; clearInterval(id) } }
    },

    isBest(g, pi) {
      if (g.bestCutIndex < 0) return false
      return g.bestCutIndex === pi && ['generating', 'done'].includes(g.stage)
    },
    isDim(g, pi) {
      if (g.bestCutIndex < 0) return false
      return g.bestCutIndex !== pi && ['generating', 'done'].includes(g.stage)
    },
    isPending(g, pi) {
      return g.stage === 'uploading' && pi >= g.uploadedCount
    },
    resultThumbStyle(g) {
      const idx = g.bestCutIndex >= 0 ? g.bestCutIndex : 0
      const src = g.photos[idx]?.src
      return src ? { backgroundImage: 'url(' + src + ')' } : {}
    },

    isPipeDone(g, step) {
      const doneWhen = {
        upload:   ['selecting', 'generating', 'done'],
        select:   ['generating', 'done'],
        generate: ['done'],
      }
      return (doneWhen[step] || []).includes(g.stage)
    },

    stageText(stage) {
      return {
        waiting:    '대기 중',
        uploading:  '업로드 중',
        selecting:  '베스트컷 선정 중',
        generating: '기록 생성 중',
        done:       '완료 ✓',
      }[stage] || ''
    },

    groupLabel(g) {
      switch (g.stage) {
        case 'waiting':    return '처리 대기 중'
        case 'uploading':  return `사진 업로드 ${g.uploadedCount} / ${g.photos.length}`
        case 'selecting':  return '베스트컷 선정 중...'
        case 'generating': return 'AI 기록 생성 중...'
        case 'done':       return '기록 생성 완료'
        default:           return ''
      }
    },
  },
}
</script>

<style scoped>
.pd-page {
  background: var(--bg);
  min-height: 100%;
  padding: 0 0 20px;
}

/* ─── 대기 스피너 ─── */
.pd-waiting {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 14px;
  padding: 60px 0;
}
.pd-waiting-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: pdSpin 0.8s linear infinite;
}
@keyframes pdSpin { to { transform: rotate(360deg); } }
.pd-waiting-text { font-size: 14px; color: var(--text-sub); letter-spacing: -0.2px; }

/* ─── 헤더 ─── */
.pd-header {
  display: flex; align-items: center; gap: 14px;
  padding: 24px 20px 16px;
}
.pd-logo { height: 36px; width: auto; object-fit: contain; flex-shrink: 0; }
.pd-title {
  font-size: 17px; font-weight: 700; color: var(--text);
  letter-spacing: -0.5px; line-height: 1.3;
}
.pd-sub {
  font-size: 12px; color: var(--text-sub);
  letter-spacing: -0.1px; margin-top: 3px; line-height: 1.5;
}

/* ─── 전체 진행바 ─── */
.pd-overall-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 0 20px 20px;
}
.pd-overall-bar {
  flex: 1; height: 6px; border-radius: 3px;
  background: var(--border); overflow: hidden;
}
.pd-overall-fill {
  height: 100%;
  background: linear-gradient(90deg, #146ef5, #8B5CF6);
  border-radius: 3px;
  transition: width 0.4s ease;
}
.pd-overall-pct {
  font-size: 13px; font-weight: 700;
  color: var(--accent); letter-spacing: -0.2px;
  min-width: 36px; text-align: right;
}

/* ─── 그룹 카드 ─── */
.pd-groups { display: flex; flex-direction: column; gap: 12px; padding: 0 16px; }

.pd-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 16px;
  background: var(--bg);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.3s;
}
.pd-card--active { border-color: rgba(20,110,245,0.35); }
.pd-card--done   { border-color: rgba(20,110,245,0.2); }

.pd-card-top {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 12px;
}
.pd-location {
  display: flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600; color: var(--text);
  letter-spacing: -0.2px;
}
.pd-location svg { color: var(--text-sub); flex-shrink: 0; }

/* 상태 pill */
.pd-pill {
  font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
  padding: 4px 10px; border-radius: var(--radius-pill);
  white-space: nowrap;
}
.pd-pill--waiting { background: #f5f5f5; color: var(--text-sub); }
.pd-pill--done    { background: rgba(0,180,100,0.1); color: #00a86b; }

/* ─── 3단계 파이프라인 ─── */
.pd-pipeline {
  display: flex; align-items: center;
  padding: 10px 0 14px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}
.pd-pipe-step {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  flex-shrink: 0;
}
.pd-pipe-line {
  flex: 1; height: 2px;
  background: var(--border);
  margin: 0 4px;
  transition: background 0.5s ease;
}
.pd-pipe-line.filled {
  background: linear-gradient(90deg, #146ef5, #8B5CF6);
}
.pd-pipe-dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--border);
  background: var(--bg);
  transition: all 0.35s ease;
  position: relative;
}
.pd-pipe-step.is-done .pd-pipe-dot {
  background: linear-gradient(135deg, #146ef5, #8B5CF6);
  border-color: transparent;
  color: #fff;
}
.pd-pipe-step.is-active .pd-pipe-dot {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(20,110,245,0.12);
}
.pd-pipe-num {
  font-size: 10px; color: var(--text-sub); font-weight: 600; line-height: 1;
}
.pd-pipe-label {
  font-size: 10px; font-weight: 500; color: var(--text-sub);
  white-space: nowrap; letter-spacing: -0.1px;
}
.pd-pipe-step.is-done .pd-pipe-label  { color: var(--accent); font-weight: 600; }
.pd-pipe-step.is-active .pd-pipe-label { color: var(--accent); font-weight: 700; }

/* 활성 단계 펄스 점 */
.pd-pipe-pulse {
  display: block; width: 9px; height: 9px; border-radius: 50%;
  background: var(--accent);
  animation: pipePulse 1s ease-in-out infinite;
}
@keyframes pipePulse {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%       { transform: scale(1.5); opacity: 0.55; }
}

/* ─── 사진 스트립 ─── */
.pd-strip {
  display: flex; gap: 6px;
  margin-bottom: 14px;
}
.pd-thumb-wrap {
  flex: 1; position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  transition: opacity 0.4s, flex 0.4s;
}
.pd-thumb {
  width: 100%; aspect-ratio: 1;
  background-size: cover; background-position: center;
  background-color: var(--border);
}
.pd-thumb-wrap.is-best {
  flex: 1.6;
  box-shadow: 0 0 0 2.5px #146ef5;
  z-index: 1;
}
.pd-thumb-wrap.is-dim { opacity: 0.4; }
.pd-pending-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
}
.pd-best-badge {
  position: absolute; bottom: 5px; left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #146ef5, #8B5CF6);
  color: #fff; font-size: 9px; font-weight: 800;
  padding: 2px 7px; border-radius: 4px;
  letter-spacing: 0.5px; white-space: nowrap;
}

/* ─── AI 에이전트 섹션 ─── */
.pd-agent {
  display: flex; flex-direction: column; align-items: center;
  padding: 12px 0 10px; gap: 5px;
  min-height: 120px; justify-content: center;
}
.pd-agent-icons {
  display: flex; align-items: center; gap: 18px;
  margin-bottom: 10px;
}
.pd-agent-msg {
  font-size: 17px; font-weight: 800; color: var(--text);
  letter-spacing: -0.5px; text-align: center; line-height: 1.3;
}
.pd-agent-sub {
  font-size: 12px; color: var(--text-sub);
  letter-spacing: -0.1px; text-align: center;
}
.pd-cursor {
  display: inline-block;
  animation: cursorBlink 0.8s step-end infinite;
  margin-left: 1px; color: var(--accent);
}
@keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

/* 중앙 아이콘 래퍼 */
.ag-center-wrap { position: relative; display: flex; align-items: center; justify-content: center; }

/* 아이콘 기본 */
.ag-icon { flex-shrink: 0; }

/* 업로드 — 사진 아이콘 위아래 float */
.ag-icon--cloud { color: #146ef5; }
@keyframes floatUp {
  0%, 100% { transform: translateY(0);     opacity: 0.5; }
  50%       { transform: translateY(-10px); opacity: 1;   }
}
.ag-float-1 { color: var(--text-sub); animation: floatUp 1.7s ease-in-out infinite; }
.ag-float-2 { color: var(--text-sub); animation: floatUp 1.7s ease-in-out 0.55s infinite; }

/* 선별 — 눈 펄스 + 스캔 링 */
.ag-icon--eye { color: #8B5CF6; animation: eyePulse 2s ease-in-out infinite; }
@keyframes eyePulse {
  0%, 100% { transform: scale(1); }
  45%       { transform: scale(1.14); }
  65%       { transform: scale(1.08); }
}
.ag-eye-ring {
  position: absolute;
  width: 60px; height: 60px; border-radius: 50%;
  border: 2px solid rgba(139,92,246,0.35);
  pointer-events: none;
  animation: eyeRing 2s ease-out infinite;
}
@keyframes eyeRing {
  0%   { transform: scale(0.75); opacity: 0; }
  40%  { opacity: 1; }
  100% { transform: scale(1.45); opacity: 0; }
}
.ag-star { color: #f59e0b; }
@keyframes starBlink {
  0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
  50%       { opacity: 1;   transform: scale(1.25) rotate(22deg); }
}
.ag-star-1 { animation: starBlink 1.5s ease-in-out infinite; }
.ag-star-2 { animation: starBlink 1.5s ease-in-out 0.75s infinite; }

/* 기록 — 펜 흔들림 + 스파클 */
.ag-icon--pen {
  color: #146ef5;
  animation: penWobble 1.3s ease-in-out infinite;
  transform-origin: 80% 80%;
}
@keyframes penWobble {
  0%, 100% { transform: rotate(-8deg); }
  25%       { transform: rotate(2deg) translateY(-3px); }
  75%       { transform: rotate(-4deg) translateY(-1px); }
}
.ag-spark { color: #8B5CF6; }
@keyframes sparklePop {
  0%, 100% { transform: scale(0.55) rotate(0deg);  opacity: 0.3; }
  50%       { transform: scale(1.3)  rotate(30deg); opacity: 1;   }
}
.ag-spark-1 { animation: sparklePop 1.9s ease-in-out infinite; }
.ag-spark-2 { animation: sparklePop 1.9s ease-in-out 0.65s infinite; }

/* ─── 그룹 진행바 ─── */
.pd-group-bar-row {
  display: flex; align-items: center; gap: 10px;
  margin-top: 2px;
}
.pd-group-bar {
  flex: 1; height: 4px; border-radius: 2px;
  background: var(--border); overflow: hidden;
}
.pd-group-fill {
  height: 100%;
  background: linear-gradient(90deg, #146ef5, #8B5CF6);
  border-radius: 2px;
  transition: width 0.35s ease;
}
.pd-group-label {
  font-size: 11px; font-weight: 600; color: var(--accent);
  letter-spacing: -0.1px; white-space: nowrap; min-width: 30px; text-align: right;
}

/* ─── 결과 미니 카드 ─── */
.pd-result {
  display: flex; gap: 10px;
  margin-top: 14px; padding: 12px;
  background: #fafafa;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.pd-result-thumb {
  width: 60px; height: 60px; flex-shrink: 0;
  border-radius: var(--radius);
  background-size: cover; background-position: center;
  background-color: var(--border);
}
.pd-result-body { flex: 1; min-width: 0; }
.pd-result-meta { font-size: 11px; color: var(--text-sub); letter-spacing: -0.1px; margin-bottom: 4px; }
.pd-result-text {
  font-size: 12px; color: var(--text);
  line-height: 1.6; letter-spacing: -0.15px;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.pd-result-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.pd-tag { font-size: 11px; font-weight: 500; color: var(--accent); letter-spacing: -0.1px; }

/* ─── 완료 버튼 ─── */
.pd-done-wrap { padding: 24px 16px 0; display: flex; justify-content: center; }
.pd-btn-home {
  width: 100%; max-width: 320px;
  background: linear-gradient(90deg, #146ef5, #8B5CF6);
  color: #fff; border: none;
  border-radius: var(--radius-pill);
  padding: 16px 32px;
  font-size: 15px; font-weight: 700; font-family: inherit;
  letter-spacing: -0.3px; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 4px 20px rgba(20,110,245,0.35);
}
.pd-btn-home:active { opacity: 0.9; }

/* ─── 트랜지션 ─── */
.agent-fade-enter-active,
.agent-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.agent-fade-enter, .agent-fade-leave-to { opacity: 0; transform: translateY(8px); }

.badge-pop-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s; }
.badge-pop-enter        { transform: translateX(-50%) scale(0.4); opacity: 0; }

.result-slide-enter-active { transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.result-slide-enter        { transform: translateY(-8px); opacity: 0; }

.fade-up-enter-active { transition: all 0.5s ease; }
.fade-up-enter        { transform: translateY(16px); opacity: 0; }
</style>
