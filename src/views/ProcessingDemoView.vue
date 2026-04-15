<template>
  <div class="pd-page">

    <!-- ─── 헤더 ───────────────────────────────── -->
    <div class="pd-header">
      <img src="/images/logo.png" class="pd-logo" alt="Golden Record" />
      <div class="pd-header-text">
        <p class="pd-title">{{ allDone ? '기록이 완성됐어요! 🎉' : '오늘의 기록을 만드는 중' }}</p>
        <p class="pd-sub">{{ allDone ? groups.length + '개의 기록 카드가 생성됐어요' : '사진에서 베스트컷을 선정하고 기록을 작성하고 있어요' }}</p>
      </div>
    </div>

    <!-- ─── 전체 진행률 ─────────────────────────── -->
    <div class="pd-overall-wrap">
      <div class="pd-overall-bar">
        <div class="pd-overall-fill" :style="{ width: overallPct + '%' }" />
      </div>
      <span class="pd-overall-pct">{{ Math.round(overallPct) }}%</span>
    </div>

    <!-- ─── 그룹 카드 ────────────────────────────── -->
    <div class="pd-groups">
      <div
        v-for="(g, gi) in groups"
        :key="gi"
        class="pd-card"
        :class="{
          'pd-card--active': g.stage !== 'waiting' && g.stage !== 'done',
          'pd-card--done': g.stage === 'done',
        }"
      >
        <!-- 카드 상단 -->
        <div class="pd-card-top">
          <div class="pd-location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{{ g.location }}</span>
          </div>
          <span class="pd-pill" :class="'pd-pill--' + g.stage">{{ stageText(g.stage) }}</span>
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
            <!-- 업로드 대기 오버레이 -->
            <div v-if="isPending(g, pi)" class="pd-pending-overlay">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 그룹 진행바 -->
        <div class="pd-group-bar-row">
          <div class="pd-group-bar">
            <div class="pd-group-fill" :style="{ width: groupPct(g) + '%' }" />
          </div>
          <span class="pd-group-label">{{ groupLabel(g) }}</span>
        </div>

        <!-- 완료 시 미니 기록 카드 -->
        <transition name="result-slide">
          <div v-if="g.stage === 'done'" class="pd-result">
            <div class="pd-result-thumb" :style="{ backgroundImage: 'url(' + g.photos[g.bestCutIndex].src + ')' }" />
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

const UPLOAD_PER_PHOTO = 480   // ms per photo
const SELECT_DURATION  = 1400  // ms
const GEN_DURATION     = 2600  // ms
const TICK_MS          = 40    // progress bar update interval

export default {
  name: 'ProcessingDemoView',
  data() {
    return {
      groups: DEMO_GROUPS.map(g => ({
        ...g,
        stage: 'waiting',    // waiting | uploading | selecting | generating | done
        uploadedCount: 0,
        selectPct: 0,
        genPct: 0,
      })),
    }
  },
  created() {
    // Vue 2 does not proxy _-prefixed data properties — keep timers outside reactive system
    this._timers = []
  },
  computed: {
    groupPct() {
      return (g) => {
        switch (g.stage) {
          case 'waiting':    return 0
          case 'uploading':  return (g.uploadedCount / g.photos.length) * 34
          case 'selecting':  return 34 + g.selectPct * 0.26
          case 'generating': return 60 + g.genPct  * 0.4
          case 'done':       return 100
          default:           return 0
        }
      }
    },
    overallPct() {
      const sum = this.groups.reduce((acc, g) => acc + this.groupPct(g), 0)
      return sum / this.groups.length
    },
    allDone() {
      return this.groups.every(g => g.stage === 'done')
    },
  },
  mounted() {
    this.groups.forEach((_, gi) => {
      const t = setTimeout(() => this.startGroup(gi), DEMO_GROUPS[gi].delay)
      this._timers.push(t)
    })
  },
  beforeDestroy() {
    this._timers.forEach(clearTimeout)
    this._timers = []
  },
  methods: {
    /* ─── 처리 시뮬레이션 ─── */
    startGroup(gi) {
      const g = this.groups[gi]
      g.stage = 'uploading'
      g.uploadedCount = 0
      this.uploadNext(gi)
    },

    uploadNext(gi) {
      const g = this.groups[gi]
      if (g.uploadedCount < g.photos.length) {
        const t = setTimeout(() => {
          g.uploadedCount++
          if (g.uploadedCount < g.photos.length) {
            this.uploadNext(gi)
          } else {
            this.startSelecting(gi)
          }
        }, UPLOAD_PER_PHOTO)
        this._timers.push(t)
      }
    },

    startSelecting(gi) {
      const g = this.groups[gi]
      g.stage = 'selecting'
      g.selectPct = 0
      const start = Date.now()
      const tick = setInterval(() => {
        g.selectPct = Math.min(100, ((Date.now() - start) / SELECT_DURATION) * 100)
        if (g.selectPct >= 100) {
          clearInterval(tick)
          this.startGenerating(gi)
        }
      }, TICK_MS)
      this._timers.push(tick)
    },

    startGenerating(gi) {
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

    /* ─── 헬퍼 ─── */
    isBest(g, pi) {
      return g.bestCutIndex === pi &&
        ['selecting', 'generating', 'done'].includes(g.stage)
    },
    isDim(g, pi) {
      return g.bestCutIndex !== pi &&
        ['selecting', 'generating', 'done'].includes(g.stage)
    },
    isPending(g, pi) {
      return g.stage === 'uploading' && pi >= g.uploadedCount
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
        case 'waiting':
          return '처리 대기 중'
        case 'uploading':
          return `사진 업로드 ${g.uploadedCount} / ${g.photos.length}`
        case 'selecting':
          return '베스트컷 선정 중...'
        case 'generating':
          return 'AI 기록 생성 중...'
        case 'done':
          return '기록 생성 완료'
        default:
          return ''
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
.pd-pill--waiting    { background: #f5f5f5; color: var(--text-sub); }
.pd-pill--uploading  { background: rgba(20,110,245,0.1); color: var(--accent); }
.pd-pill--selecting  { background: rgba(139,92,246,0.1); color: #8B5CF6; }
.pd-pill--generating { background: rgba(139,92,246,0.15); color: #7c3aed; }
.pd-pill--done       { background: rgba(0,180,100,0.1); color: #00a86b; }

/* ─── 사진 스트립 ─── */
.pd-strip {
  display: flex; gap: 6px;
  margin-bottom: 12px;
}
.pd-thumb-wrap {
  flex: 1; position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  transition: opacity 0.4s, transform 0.4s;
}
.pd-thumb {
  width: 100%;
  aspect-ratio: 1;
  background-size: cover; background-position: center;
  background-color: var(--border);
}

/* 베스트컷 */
.pd-thumb-wrap.is-best {
  flex: 1.5;
  box-shadow: 0 0 0 2.5px #146ef5;
  border-radius: var(--radius);
  z-index: 1;
}
/* 나머지 사진 dim */
.pd-thumb-wrap.is-dim { opacity: 0.45; }

/* 업로드 대기 오버레이 */
.pd-pending-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
}

/* BEST 배지 */
.pd-best-badge {
  position: absolute; bottom: 5px; left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #146ef5, #8B5CF6);
  color: #fff; font-size: 9px; font-weight: 800;
  padding: 2px 7px; border-radius: 4px;
  letter-spacing: 0.5px; white-space: nowrap;
}

/* ─── 그룹 진행바 ─── */
.pd-group-bar-row {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 4px;
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
  font-size: 11px; color: var(--text-sub);
  letter-spacing: -0.1px; white-space: nowrap;
  min-width: 100px; text-align: right;
}

/* ─── 결과 미니 카드 ─── */
.pd-result {
  display: flex; gap: 10px;
  margin-top: 12px; padding: 12px;
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
.pd-result-meta {
  font-size: 11px; color: var(--text-sub);
  letter-spacing: -0.1px; margin-bottom: 4px;
}
.pd-result-text {
  font-size: 12px; color: var(--text);
  line-height: 1.6; letter-spacing: -0.15px;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.pd-result-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.pd-tag {
  font-size: 11px; font-weight: 500;
  color: var(--accent); letter-spacing: -0.1px;
}

/* ─── 완료 버튼 ─── */
.pd-done-wrap {
  padding: 24px 16px 0;
  display: flex; justify-content: center;
}
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
.badge-pop-enter-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s; }
.badge-pop-enter        { transform: translateX(-50%) scale(0.4); opacity: 0; }

.result-slide-enter-active { transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.result-slide-enter        { transform: translateY(-8px); opacity: 0; }

.fade-up-enter-active { transition: all 0.5s ease; }
.fade-up-enter        { transform: translateY(16px); opacity: 0; }

.fade-enter-active { transition: opacity 0.3s; }
.fade-enter        { opacity: 0; }
</style>
