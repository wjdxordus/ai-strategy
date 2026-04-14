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

    <!-- ── Story 탭 ── -->
    <div v-if="tab === 'story'" class="story-wrap">
      <p class="story-heading">{{ currentMonthLabel }}의 나의 이야기</p>

      <div class="story-player">
        <!-- 슬라이드 스테이지 -->
        <div class="story-stage">
          <transition name="sf">
            <div
              v-if="storyRecords.length"
              :key="currentSlide"
              class="story-slide"
              :style="slideBg(currentSlide)"
            >
              <div class="story-scrim-top" />
              <div class="story-scrim-bot" />
              <div class="story-weather-badge">
                {{ storyRecords[currentSlide].weather.emoji }}
                {{ storyRecords[currentSlide].weather.label }}
              </div>
              <div class="story-bottom-info">
                <p class="story-meta-line">
                  {{ storyRecords[currentSlide].time }}&nbsp;·&nbsp;📍 {{ storyRecords[currentSlide].location }}
                </p>
                <p class="story-record-text">{{ storyRecords[currentSlide].aiRecord }}</p>
                <div class="story-tags-row">
                  <span v-for="tag in storyRecords[currentSlide].categoryTags" :key="tag" class="story-tag">#{{ tag }}</span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!storyRecords.length" class="story-empty-state">이달의 기록이 없어요</div>
          <!-- 좌우 탭 영역 -->
          <div class="story-tap-left"  @click="prevSlide" />
          <div class="story-tap-right" @click="nextSlide" />
        </div>

        <!-- 컨트롤 바 -->
        <div class="story-ctrl-bar">
          <div class="story-segs">
            <div v-for="(r, i) in storyRecords" :key="i" class="story-seg-track">
              <div class="story-seg-fill" :style="segFill(i)" />
            </div>
          </div>
          <div class="story-btns">
            <button class="s-btn" @click="prevSlide">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>
            <button class="s-btn s-play" @click="togglePlay">
              <svg v-if="!playing" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <svg v-else           width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button class="s-btn" @click="nextSlide">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z"/></svg>
            </button>
            <span class="s-counter">{{ currentSlide + 1 }} / {{ storyRecords.length }}</span>
          </div>
        </div>

        <!-- 필름스트립 -->
        <div class="story-filmstrip" ref="filmstrip">
          <div
            v-for="(r, i) in storyRecords"
            :key="r.id"
            class="film-cell"
            :class="{ active: i === currentSlide }"
            @click="goToSlide(i)"
          >
            <img v-if="r.thumbnail" :src="r.thumbnail" class="film-img" />
            <div v-else class="film-ph" :style="{ background: r.gradient }" />
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

const SLIDE_DURATION = 4000

export default {
  name: 'CinemaView',
  components: { PhotoBookEditor },
  data() {
    return {
      tab: 'story',
      // Story
      playing: false,
      currentSlide: 0,
      slideProgress: 0,
      timer: null,
      // Photo Book
      selectedYear: new Date().getFullYear(),
      currentPage: 0,
      pageDir: 'next',
      zoomedPhoto: null,
    }
  },
  computed: {
    currentMonthLabel() {
      return `${new Date().getMonth() + 1}월`
    },
    storyRecords() {
      const now = new Date()
      const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      return store.records.filter(r => r.date && r.date.startsWith(prefix))
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
      if (val !== 'story') this.stopTimer()
    },
  },
  beforeDestroy() {
    this.stopTimer()
  },
  methods: {
    // ── Story ──────────────────────────────────
    slideBg(i) {
      const r = this.storyRecords[i]
      if (!r) return {}
      return r.thumbnail
        ? { backgroundImage: `url(${r.thumbnail})` }
        : { background: r.gradient || '#222' }
    },
    segFill(i) {
      if (i < this.currentSlide) return { width: '100%' }
      if (i > this.currentSlide) return { width: '0%' }
      return { width: this.slideProgress + '%' }
    },
    togglePlay() {
      this.playing ? this.stopTimer() : this.startTimer()
    },
    startTimer() {
      if (!this.storyRecords.length) return
      this.playing = true
      const tick = 50
      const inc = (tick / SLIDE_DURATION) * 100
      this.timer = setInterval(() => {
        this.slideProgress += inc
        if (this.slideProgress >= 100) {
          this.slideProgress = 0
          this.currentSlide = (this.currentSlide + 1) % this.storyRecords.length
          this.scrollFilmstrip()
        }
      }, tick)
    },
    stopTimer() {
      this.playing = false
      if (this.timer) { clearInterval(this.timer); this.timer = null }
    },
    prevSlide() {
      this.slideProgress = 0
      this.currentSlide = Math.max(0, this.currentSlide - 1)
      this.scrollFilmstrip()
    },
    nextSlide() {
      this.slideProgress = 0
      this.currentSlide = (this.currentSlide + 1) % Math.max(1, this.storyRecords.length)
      this.scrollFilmstrip()
    },
    goToSlide(i) {
      this.slideProgress = 0
      this.currentSlide = i
      this.scrollFilmstrip()
    },
    scrollFilmstrip() {
      this.$nextTick(() => {
        const strip = this.$refs.filmstrip
        if (!strip) return
        const cell = strip.children[this.currentSlide]
        if (cell) cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      })
    },
    // ── Photo Book ─────────────────────────────
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
}
.cinema-icon-btn:active { background: var(--accent-light); color: var(--accent); }
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

/* ── Story ────────────────────────────────── */
.story-wrap { padding: 20px; }
.story-heading {
  font-size: 17px; font-weight: 600; color: var(--text);
  letter-spacing: -0.4px; margin-bottom: 16px;
}
.story-player {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
}

/* 스테이지 */
.story-stage {
  position: relative; height: 420px;
  background: #111; overflow: hidden;
}
.story-slide {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  animation: kenBurns 4.2s ease-out forwards;
}
@keyframes kenBurns {
  from { transform: scale(1); }
  to   { transform: scale(1.08); }
}
.story-scrim-top {
  position: absolute; top: 0; left: 0; right: 0; height: 100px;
  background: linear-gradient(to bottom, rgba(0,0,0,.55), transparent);
  z-index: 1;
}
.story-scrim-bot {
  position: absolute; bottom: 0; left: 0; right: 0; height: 220px;
  background: linear-gradient(to top, rgba(0,0,0,.75), transparent);
  z-index: 1;
}
.story-weather-badge {
  position: absolute; top: 14px; right: 14px;
  background: rgba(0,0,0,.38); backdrop-filter: blur(8px);
  color: white; padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px; font-weight: 500;
  z-index: 2;
}
.story-bottom-info {
  position: absolute; bottom: 16px; left: 16px; right: 16px; z-index: 2;
}
.story-meta-line { font-size: 11px; color: rgba(255,255,255,.75); margin-bottom: 6px; }
.story-record-text {
  font-size: 15px; font-weight: 500; color: #fff;
  line-height: 1.55; letter-spacing: -0.2px; margin-bottom: 8px;
}
.story-tags-row { display: flex; flex-wrap: wrap; gap: 4px; }
.story-tag {
  font-size: 11px; color: rgba(255,255,255,.8);
  background: rgba(255,255,255,.15);
  border-radius: var(--radius-pill); padding: 2px 8px;
}
.story-tap-left, .story-tap-right {
  position: absolute; top: 0; bottom: 0; width: 38%; z-index: 3;
}
.story-tap-left  { left: 0; }
.story-tap-right { right: 0; }
.story-empty-state {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,.4); font-size: 15px; background: #1a1a1a;
}

/* 슬라이드 트랜지션 */
.sf-enter-active { animation: sfIn .45s ease; }
.sf-leave-active { animation: sfOut .3s ease; }
@keyframes sfIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes sfOut { to   { opacity: 0; } }

/* 컨트롤 바 */
.story-ctrl-bar { background: var(--bg); padding: 10px 14px 0; }
.story-segs { display: flex; gap: 3px; margin-bottom: 8px; }
.story-seg-track {
  flex: 1; height: 2px; background: var(--border);
  border-radius: 2px; overflow: hidden;
}
.story-seg-fill {
  height: 100%; background: var(--accent);
  border-radius: 2px; transition: width .08s linear;
}
.story-btns { display: flex; align-items: center; gap: 4px; padding-bottom: 8px; }
.s-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius); color: var(--text);
  background: none; border: none; cursor: pointer;
}
.s-btn:active { background: var(--accent-light); }
.s-play {
  width: 40px; height: 40px;
  background: var(--accent); color: white; border-radius: 50%;
}
.s-play:active { background: var(--accent-hover); }
.s-counter {
  margin-left: auto;
  font-size: 12px; font-weight: 500; color: var(--text-sub);
}

/* 필름스트립 */
.story-filmstrip {
  display: flex; gap: 6px; overflow-x: auto;
  padding: 8px 14px 12px; background: var(--bg);
}
.story-filmstrip::-webkit-scrollbar { display: none; }
.film-cell {
  flex-shrink: 0; width: 52px; height: 52px;
  border-radius: var(--radius); overflow: hidden;
  border: 2px solid transparent; cursor: pointer;
  transition: border-color .15s;
}
.film-cell.active { border-color: var(--accent); }
.film-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.film-ph  { width: 100%; height: 100%; }

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
