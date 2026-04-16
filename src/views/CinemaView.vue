<template>
  <div class="cinema-wrap">

    <!-- ── 헤더 (sticky) ── -->
    <div class="cinema-header">
      <div class="cinema-title-row">
        <h2 class="cinema-title">시네마</h2>
        <div class="cinema-header-icons">
          <button class="cinema-icon-btn" aria-label="알림">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span class="notif-badge">1</span>
          </button>
          <button class="cinema-icon-btn" aria-label="검색" @click="$router.push({ path: '/my', query: { tab: 'tag_album' } })">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="cinema-tab-bar">
        <div class="cinema-tab" :class="{ active: tab === 'story' }" @click="tab = 'story'">스토리</div>
        <div class="cinema-tab" :class="{ active: tab === 'photobook' }" @click="tab = 'photobook'">포토북</div>
      </div>
    </div>

    <!-- ── Story 탭 — 움직이는 신문 ── -->
    <div v-if="tab === 'story'" class="story-wrap">
      <div class="newspaper">

        <!-- 마스트헤드 -->
        <div class="np-masthead">
          <div class="np-masthead-inner">
            <span class="np-edition">제 {{ editionNumber }}호</span>
            <h1 class="np-title">Ai-ary 일보</h1>
            <span class="np-date">{{ todayLabel }}</span>
          </div>
          <div class="np-masthead-rule" />
        </div>

        <!-- 메인 섹션: 영상(좌) + 기록1(우) -->
        <div class="np-main">
          <div class="np-vcell np-vcell--1">
            <video
              src="/videos/video_kookmin.mp4"
              autoplay muted loop playsinline
              class="np-video"
            />
          </div>
          <div class="np-tcell np-tcell--1">
            <div class="np-rule" />
            <h2 class="np-headline">봄 캠퍼스에서,<br>배움과 동료</h2>
            <div class="np-rule" />
            <p class="np-byline">📍 국민대학교 &nbsp;·&nbsp; ☀️ 맑음</p>
            <p class="np-body">
              {{ typedText1 }}<span v-if="typingPhase === 1" class="np-cursor">|</span>
            </p>
          </div>
        </div>

        <!-- 중간 구분선 -->
        <div class="np-h-rule" />

        <!-- 서브 섹션: 기록2(좌) + 영상(우) -->
        <div class="np-sub">
          <div class="np-tcell np-tcell--2">
            <h2 class="np-headline np-headline--sm">두 발로 선 오늘의<br>작은 영웅</h2>
            <div class="np-rule" />
            <p class="np-byline">📍 성동구 옥수동 &nbsp;·&nbsp; ☀️ 맑음</p>
            <p class="np-body">
              {{ typedText2 }}<span v-if="typingPhase === 2" class="np-cursor">|</span>
            </p>
          </div>
          <div class="np-vcell np-vcell--2">
            <video
              src="/videos/video_oksu.mp4"
              autoplay muted loop playsinline
              class="np-video"
            />
          </div>
        </div>

      </div>
    </div>

    <!-- ── Photo Book 탭 ── -->
    <div v-else class="pb-wrap">
      <PhotoBookEditor v-if="tab === 'photobook'" />
    </div>

    <!-- ── 확대 모달 ── -->
    <transition name="zoom-fade">
      <div v-if="zoomedPhoto" class="zoom-overlay" @click.self="zoomedPhoto = null">
        <div class="zoom-card">
          <button class="zoom-close" @click="zoomedPhoto = null">✕</button>
          <div class="zoom-photo-wrap">
            <img v-if="zoomedPhoto.thumbnail" :src="zoomedPhoto.thumbnail" class="zoom-img" />
            <div v-else class="zoom-img-ph" :style="{ background: zoomedPhoto.gradient }" />
          </div>
          <div class="zoom-body">
            <div class="zoom-meta">
              {{ zoomedPhoto.weather.emoji }} {{ zoomedPhoto.date }} {{ zoomedPhoto.time }}
              &nbsp;·&nbsp;📍 {{ zoomedPhoto.location }}
            </div>
            <p class="zoom-text">{{ zoomedPhoto.aiRecord }}</p>
            <div class="zoom-tags">
              <span v-for="tag in zoomTags(zoomedPhoto)" :key="tag" class="zoom-tag">#{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { store } from '../store'
import PhotoBookEditor from '../components/PhotoBookEditor.vue'

// ── 신문 기사 원고 ─────────────────────────────────────────────────────────────
const NP_TEXT_1 =
  '꽃샘추위가 물러난 봄날 오전, 국민대학교 캠퍼스에서 교육 프로그램에 참여했다. ' +
  '강의를 마치고 따스한 햇살 아래 동료들과 나란히 섰다. ' +
  '각자의 자리에서 묵묵히 걸어온 사람들이 같은 봄볕 아래 잠시 숨을 고른 순간, ' +
  '그 연대감이 사진 한 장에 고스란히 담겼다.'

const NP_TEXT_2 =
  '봄볕이 거실 가득 들던 오후, 옥수동 집에서 아이가 처음으로 두 발을 딛고 섰다. ' +
  '흔들리는 몸을 스스로 잡아가며 한 걸음, 또 한 걸음. ' +
  '넘어질 듯 버텨낸 그 작은 발걸음이 카메라 너머로도 선명하게 느껴졌다. ' +
  '오늘 이 순간은 오래 기억될 것 같다.'

const NP_SPEED = 38  // ms / 글자

export default {
  name: 'CinemaView',
  components: { PhotoBookEditor },

  data() {
    return {
      tab: 'story',
      // 신문 타이핑
      typedText1: '',
      typedText2: '',
      typingPhase: 0,   // 0: 미시작 | 1: text1 타이핑 | 2: text2 타이핑 | 3: 완료
      // Photo Book
      selectedYear: new Date().getFullYear(),
      currentPage: 0,
      pageDir: 'next',
      zoomedPhoto: null,
    }
  },

  created() {
    this._typeTimers = []   // Vue 2 — _ 접두사는 reactive 프록시 제외
  },

  computed: {
    editionNumber() {
      const now = new Date()
      return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
    },
    todayLabel() {
      const d = new Date()
      const days = ['일', '월', '화', '수', '목', '금', '토']
      return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}(${days[d.getDay()]})`
    },
    availableYears() {
      const years = [...new Set(
        store.records.map(r => r.date?.slice(0, 4)).filter(Boolean)
      )].map(Number).sort((a, b) => b - a)
      const thisYear = new Date().getFullYear()
      if (!years.includes(thisYear)) years.unshift(thisYear)
      return years
    },
    yearRecords() {
      return store.records
        .filter(r => r.date?.startsWith(String(this.selectedYear)))
        .sort((a, b) => (a.date > b.date ? 1 : -1))
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.yearRecords.length / 3))
    },
    currentPageRecords() {
      const start = this.currentPage * 3
      return this.yearRecords.slice(start, start + 3)
    },
  },

  watch: {
    tab(val) {
      if (val === 'story') {
        this.$nextTick(() => this.startNewspaper())
      } else {
        this.stopNewspaper()
      }
    },
  },

  mounted() {
    if (this.tab === 'story') {
      this.$nextTick(() => this.startNewspaper())
    }
  },

  beforeDestroy() {
    this.stopNewspaper()
  },

  methods: {
    // ── 신문 타이핑 ────────────────────────────────────────────────────────
    startNewspaper() {
      this.stopNewspaper()
      this.typedText1 = ''
      this.typedText2 = ''
      this.typingPhase = 1

      this.typeText(NP_TEXT_1, 'typedText1', NP_SPEED, () => {
        const t = setTimeout(() => {
          this.typingPhase = 2
          this.typeText(NP_TEXT_2, 'typedText2', NP_SPEED, () => {
            this.typingPhase = 3
          })
        }, 700)
        this._typeTimers.push(t)
      })
    },

    stopNewspaper() {
      this._typeTimers.forEach(clearTimeout)
      this._typeTimers = []
    },

    typeText(fullText, key, speed, onDone) {
      let i = 0
      const tick = () => {
        if (i >= fullText.length) {
          if (onDone) onDone()
          return
        }
        this[key] += fullText[i++]
        const t = setTimeout(tick, speed)
        this._typeTimers.push(t)
      }
      const t = setTimeout(tick, speed)
      this._typeTimers.push(t)
    },

    // ── Photo Book ──────────────────────────────────────────────────────────
    selectYear(y) {
      this.selectedYear = y
      this.currentPage = 0
    },
    prevPage() {
      if (this.currentPage > 0) { this.pageDir = 'prev'; this.currentPage-- }
    },
    nextPage() {
      if (this.currentPage < this.totalPages - 1) { this.pageDir = 'next'; this.currentPage++ }
    },
    pbCardStyle(index) {
      const configs = [
        { transform: 'rotate(-3deg)',  alignSelf: 'flex-start', marginLeft: '12px' },
        { transform: 'rotate(3.5deg)', alignSelf: 'flex-end',   marginRight: '12px' },
        { transform: 'rotate(-1.5deg)', alignSelf: 'center' },
      ]
      return configs[index % configs.length]
    },
    zoomTags(rec) {
      const emotion = (rec.emotionTags || []).map(t => t.label)
      return [...emotion, ...(rec.categoryTags || [])]
    },
  },
}
</script>

<style scoped>
.cinema-wrap { background: var(--bg); min-height: 100%; }

/* ── 헤더 ─────────────────────────────────── */
.cinema-header {
  position: sticky; top: 0; z-index: 20;
  background: var(--bg); border-bottom: 1px solid var(--border);
}
.cinema-title-row {
  padding: 20px 20px 0;
  display: flex; align-items: center;
}
.cinema-title {
  font-size: 24px; font-weight: 600;
  color: var(--text); letter-spacing: -0.8px; line-height: 1.04;
}
.cinema-header-icons { margin-left: auto; display: flex; gap: 4px; }
.cinema-icon-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: none; cursor: pointer;
  color: var(--text-mid); border-radius: var(--radius);
  position: relative;
}
.cinema-icon-btn:active { background: var(--accent-light); color: var(--accent); }
.notif-badge {
  position: absolute; top: 3px; right: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  background: linear-gradient(135deg, #146ef5 0%, #8B5CF6 100%);
  color: #fff; font-size: 8px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  line-height: 1; border: 1.5px solid #fff;
}
.cinema-tab-bar {
  display: flex; align-items: stretch;
  margin-top: 14px;
}
.cinema-tab {
  position: relative;
  flex: 1; text-align: center;
  padding: 10px 0 12px;
  font-size: 14px; font-weight: 500; color: var(--text-sub);
  cursor: pointer; transition: color 0.15s;
}
.cinema-tab.active {
  color: var(--accent); font-weight: 600;
}
.cinema-tab.active::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #146ef5 0%, #8B5CF6 100%);
  border-radius: 1px;
}

/* ── Story — 움직이는 신문 ─────────────────── */
.story-wrap {
  padding: 16px 16px 24px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.newspaper {
  display: grid;
  grid-template-rows: auto 1fr auto 1fr;
  min-height: 560px;
  height: calc(100dvh - 190px);
  background: #f4ede0;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,.15);
  font-family: 'Pretendard Variable', sans-serif;
}

/* 마스트헤드 */
.np-masthead {
  padding: 8px 14px 6px;
  border-bottom: 3px double #1a1a1a;
  background: #f4ede0;
}
.np-masthead-inner {
  display: flex; align-items: baseline; justify-content: space-between;
}
.np-title {
  font-size: 24px; font-weight: 900; color: #1a1a1a;
  text-align: center; flex: 1; letter-spacing: -0.5px;
  margin: 0;
}
.np-edition, .np-date {
  font-size: 9px; color: #666; min-width: 50px;
}
.np-date { text-align: right; }

/* 메인·서브 섹션 */
.np-main { display: flex; overflow: hidden; }
.np-sub  { display: flex; overflow: hidden; }

/* 영상 셀 */
.np-vcell { overflow: hidden; }
.np-vcell--1 { flex: 0 0 58%; border-right: 1px solid #999; }
.np-vcell--2 { flex: 0 0 42%; }

/* 텍스트 셀 */
.np-tcell {
  padding: 8px 12px;
  display: flex; flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.np-tcell::-webkit-scrollbar { display: none; }
.np-tcell--1 { flex: 1; }
.np-tcell--2 { flex: 1; border-right: 1px solid #999; }

/* 영상 */
.np-video {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  filter: sepia(12%);
}

/* 중간 구분선 */
.np-h-rule { height: 3px; background: #1a1a1a; margin: 0 14px; flex-shrink: 0; }

/* 텍스트 요소 */
.np-rule { height: 1px; background: #1a1a1a; margin: 4px 0; flex-shrink: 0; }
.np-headline {
  font-size: 15px; font-weight: 800; color: #1a1a1a;
  line-height: 1.25; margin: 0 0 4px;
}
.np-headline--sm { font-size: 13px; }
.np-byline { font-size: 9px; color: #777; margin-bottom: 5px; flex-shrink: 0; }
.np-body {
  font-size: 11.5px; color: #1a1a1a;
  line-height: 1.75;
  word-break: keep-all;
}

/* 커서 깜박임 */
.np-cursor { animation: np-blink 0.7s step-end infinite; }
@keyframes np-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

/* ── Photo Book ───────────────────────────── */
.pb-wrap { padding-bottom: 40px; }

.pb-year-bar {
  display: flex; gap: 8px; padding: 14px 20px;
  overflow-x: auto; border-bottom: 1px solid var(--border);
}
.pb-year-bar::-webkit-scrollbar { display: none; }
.pb-year-btn {
  flex-shrink: 0; padding: 6px 18px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--bg); color: var(--text-mid);
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all .15s;
}
.pb-year-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.pb-viewer { overflow: hidden; }

/* 포토북 페이지 */
.pb-page {
  padding: 28px 20px 24px;
  display: flex; flex-direction: column; gap: 20px;
  background: #f7f4ef;
  min-height: 520px;
}
.pb-page-empty {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: 15px; color: var(--text-sub);
}

/* 포토카드 (폴라로이드) */
.pb-card {
  width: 74%;
  background: #fff;
  box-shadow: 0 3px 12px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.08);
  padding: 7px 7px 0;
  cursor: pointer;
  transition: box-shadow .15s;
}
.pb-card:active { box-shadow: 0 6px 20px rgba(0,0,0,.2); }
.pb-card-photo-wrap {
  width: 100%; position: relative; padding-bottom: 75%; overflow: hidden;
}
.pb-card-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.pb-card-img-ph { position: absolute; inset: 0; }
.pb-card-caption { padding: 8px 4px 12px; }
.pb-cap-meta { font-size: 10px; color: var(--text-sub); margin-bottom: 2px; }
.pb-cap-loc  { font-size: 10px; color: var(--text-sub); margin-bottom: 5px; }
.pb-cap-text {
  font-size: 12px; color: var(--text); line-height: 1.55; letter-spacing: -0.1px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.pb-cap-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 5px; }
.pb-cap-tag  { font-size: 10px; color: var(--accent); }

/* 페이지 트랜지션 */
.page-fwd-enter-active { animation: pgFwdIn  .3s ease; }
.page-fwd-leave-active { animation: pgFwdOut .2s ease; }
.page-bwd-enter-active { animation: pgBwdIn  .3s ease; }
.page-bwd-leave-active { animation: pgBwdOut .2s ease; }
@keyframes pgFwdIn  { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
@keyframes pgFwdOut { to   { opacity: 0; transform: translateX(-28px); } }
@keyframes pgBwdIn  { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: none; } }
@keyframes pgBwdOut { to   { opacity: 0; transform: translateX(28px); } }

/* 페이지 네비 */
.pb-nav {
  display: flex; align-items: center; justify-content: center; gap: 24px;
  padding: 14px 20px;
  background: var(--bg); border-top: 1px solid var(--border);
}
.pb-nav-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 50%;
  background: var(--bg); color: var(--text);
  cursor: pointer; transition: all .15s;
}
.pb-nav-btn:disabled { opacity: .3; cursor: default; }
.pb-nav-btn:not(:disabled):active { background: var(--accent-light); border-color: var(--accent); }
.pb-page-num { font-size: 13px; font-weight: 500; color: var(--text-mid); }

/* ── 확대 모달 ────────────────────────────── */
.zoom-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,.82); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.zoom-card {
  background: #fff; border-radius: var(--radius-xl);
  width: 100%; max-width: 400px;
  max-height: 85vh; overflow-y: auto; position: relative;
}
.zoom-close {
  position: absolute; top: 10px; right: 10px; z-index: 1;
  width: 28px; height: 28px;
  background: rgba(0,0,0,.25); color: #fff;
  border: none; border-radius: 50%;
  font-size: 12px; cursor: pointer; line-height: 28px; text-align: center;
}
.zoom-photo-wrap { position: relative; padding-bottom: 75%; overflow: hidden; }
.zoom-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}
.zoom-img-ph { position: absolute; inset: 0; border-radius: var(--radius-xl) var(--radius-xl) 0 0; }
.zoom-body    { padding: 16px 18px 20px; }
.zoom-meta    { font-size: 12px; color: var(--text-sub); margin-bottom: 8px; }
.zoom-text    { font-size: 15px; color: var(--text); line-height: 1.65; letter-spacing: -0.2px; margin-bottom: 10px; }
.zoom-tags    { display: flex; flex-wrap: wrap; gap: 6px; }
.zoom-tag     { font-size: 12px; color: var(--accent); }

.zoom-fade-enter-active, .zoom-fade-leave-active { transition: opacity .2s; }
.zoom-fade-enter, .zoom-fade-leave-to { opacity: 0; }
</style>
