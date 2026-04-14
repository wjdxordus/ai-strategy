<template>
  <div class="home">

    <!-- 오늘의 기록 -->
    <section class="record-section">
      <div class="section-header">
        <div class="section-title-row">
          <h2 class="section-title">오늘의 기록</h2>
          <span class="section-date">{{ todayLabel }}</span>
          <div class="header-icons">
            <button class="header-icon-btn" aria-label="알림">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>
            <button class="header-icon-btn" aria-label="검색" @click="$router.push({ path: '/my', query: { tab: 'tag_album' } })">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </div>
        <p class="section-desc">
          <img src="/images/logo.png" class="section-desc-logo" alt="골든레코드" />가 큐레이션한 소중한 기록
        </p>
      </div>

      <div class="carousel" ref="todayStrip" @scroll.passive="onTodayScroll">
        <RecordCard
          v-for="(rec, i) in todayRecords"
          :key="rec.id"
          :record="rec"
          class="carousel-item"
          :class="{ active: i === todayIndex }"
          @edit="openEdit"
        />
      </div>
      <div class="dots" v-if="todayRecords.length > 1">
        <span v-for="(r, i) in todayRecords" :key="i" class="dot" :class="{ active: i === todayIndex }" />
      </div>
    </section>

    <!-- 배너 -->
    <section class="banner-section">
      <div class="banner-track" :style="{ transform: `translateX(-${bannerIndex * 100}%)` }">
        <div class="banner-slide banner-slide-cinema" @click="$router.push('/cinema')">
          <img src="/images/cinema.png" class="banner-img-half banner-img-left" alt="시네마" />
          <div class="banner-text banner-text-right">
            <p class="banner-sub">나의 기록</p>
            <p class="banner-title">나만의 시네마</p>
          </div>
        </div>
        <div class="banner-slide banner-slide-album" @click="$router.push('/cinema')">
          <img src="/images/album.png" class="banner-img-album" alt="포토북" />
          <div class="banner-text banner-text-left">
            <p class="banner-title">자동으로 완성된</p>
            <p class="banner-sub">포토북 보러가기</p>
          </div>
        </div>
        <div class="banner-slide banner-slide-monimo">
          <img src="/images/monimo.png" class="banner-img-monimo" alt="모니모" />
          <div class="banner-text banner-text-left">
            <p class="banner-title">모이는 금융</p>
            <p class="banner-sub">커지는 혜택</p>
          </div>
        </div>
      </div>
      <div class="banner-dots">
        <span
          v-for="(_, i) in 3" :key="i"
          class="banner-dot"
          :class="{ active: i === bannerIndex }"
          @click="bannerIndex = i"
        />
      </div>
    </section>

    <!-- 1년 전 오늘 -->
    <section v-if="memoryRecords.length" class="record-section memory-section">
      <div class="section-header">
        <div class="section-title-row">
          <h2 class="section-title">1년전 오늘</h2>
          <span class="section-date">{{ memoryLabel }}</span>
        </div>
        <p class="section-desc">1년 전 오늘의 기록이 도착했어요</p>
      </div>
      <div class="carousel" ref="memoryStrip" @scroll.passive="onMemoryScroll">
        <RecordCard
          v-for="(rec, i) in memoryRecords"
          :key="rec.id"
          :record="rec"
          class="carousel-item"
          :class="{ active: i === memoryIndex }"
          @edit="openEdit"
        />
      </div>
      <div class="dots" v-if="memoryRecords.length > 1">
        <span v-for="(r, i) in memoryRecords" :key="i" class="dot" :class="{ active: i === memoryIndex }" />
      </div>
    </section>

    <div style="height: 32px" />

    <!-- 기록 편집 모달 -->
    <RecordEditModal
      v-if="editingRecord"
      :record="editingRecord"
      @close="editingRecord = null"
    />

  </div>
</template>

<script>
import { store } from '../store'
import RecordCard from '../components/RecordCard.vue'
import RecordEditModal from '../components/RecordEditModal.vue'

export default {
  name: 'HomeView',
  components: { RecordCard, RecordEditModal },
  data() {
    return {
      store,
      todayIndex: 0,
      memoryIndex: 0,
      editingRecord: null,
      bannerIndex: 0,
      bannerTimer: null,
    }
  },
  computed: {
    todayRecords() { return store.todayRecords },
    memoryRecords() { return store.memoryRecords },
    todayLabel() {
      const d = new Date()
      const days = ['일', '월', '화', '수', '목', '금', '토']
      return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`
    },
    memoryLabel() {
      const d = new Date()
      d.setFullYear(d.getFullYear() - 1)
      const days = ['일', '월', '화', '수', '목', '금', '토']
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`
    },
  },
  mounted() {
    this.bannerTimer = setInterval(() => {
      this.bannerIndex = (this.bannerIndex + 1) % 3
    }, 3000)
  },
  beforeDestroy() {
    clearInterval(this.bannerTimer)
  },
  methods: {
    onTodayScroll() {
      const el = this.$refs.todayStrip
      if (!el || !el.children.length) return
      const w = el.children[0].offsetWidth + 12
      this.todayIndex = Math.max(0, Math.min(Math.round(el.scrollLeft / w), this.todayRecords.length - 1))
    },
    onMemoryScroll() {
      const el = this.$refs.memoryStrip
      if (!el || !el.children.length) return
      const w = el.children[0].offsetWidth + 12
      this.memoryIndex = Math.max(0, Math.min(Math.round(el.scrollLeft / w), this.memoryRecords.length - 1))
    },
    openEdit(record) {
      this.editingRecord = record
    },
  },
}
</script>

<style scoped>
.home { background: var(--bg); min-height: 100%; }

/* ─── SECTION ─────────────────────────────── */
.record-section { padding: 40px 0 20px; }
.memory-section { padding-top: 32px; position: relative; }
.memory-section::before {
  content: '';
  display: block; height: 1px;
  background: linear-gradient(to right, transparent, var(--border), transparent);
  margin: 0 24px 32px;
}

.section-header { padding: 0 24px; margin-bottom: 20px; }
.section-title-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 5px;
}
.header-icons { margin-left: auto; display: flex; gap: 4px; }
.header-icon-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: none; cursor: pointer;
  color: var(--text-mid); border-radius: var(--radius);
}
.header-icon-btn:active { background: var(--accent-light); color: var(--accent); }
.section-title {
  font-size: 24px; font-weight: 600; color: var(--text);
  letter-spacing: -0.8px; line-height: 1.04;
}
.section-date {
  font-size: 12px; font-weight: 500; color: var(--text-sub);
  letter-spacing: 0.6px; text-transform: uppercase;
}
.section-desc {
  font-size: 14px; font-weight: 400; color: var(--text-sub);
  letter-spacing: -0.16px; line-height: 1.50;
  display: flex; align-items: center; gap: 4px;
}
.section-desc-logo {
  height: 30px; width: auto;
  display: inline-block; vertical-align: middle;
  object-fit: contain;
}

/* ─── BANNER ──────────────────────────────── */
.banner-section {
  margin: 0 20px 28px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-sm);
}
.banner-track {
  display: flex;
  transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.banner-slide {
  flex-shrink: 0; width: 100%;
  position: relative; cursor: pointer;
  aspect-ratio: 21 / 5.6;
}
.banner-slide-cinema { background: #f5f0e8; }
.banner-slide-album  { background: #d4e9ff; }
.banner-img-album {
  position: absolute; top: 0; right: 0;
  width: 50%; height: 100%;
  object-fit: contain; display: block;
}
.banner-slide-monimo { background: #f5f5f5; }

.banner-img-half {
  position: absolute; top: 0; width: 50%; height: 100%;
  object-fit: cover; display: block;
}
.banner-img-left  { left: 0; }
.banner-img-right { right: 0; }

.banner-img-monimo {
  position: absolute; top: 0; right: 0;
  width: 50%; height: 100%;
  object-fit: contain; display: block;
}

.banner-text {
  position: absolute; top: 0; width: 50%; height: 100%;
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 18px; gap: 4px;
}
.banner-text-left  { left: 0; }
.banner-text-right { right: 0; }

.banner-title {
  font-size: 17px; font-weight: 800;
  color: #111; letter-spacing: -0.5px; line-height: 1.25;
}
.banner-sub {
  font-size: 13px; font-weight: 600;
  color: rgba(0,0,0,0.55); letter-spacing: -0.2px;
}
.banner-dots {
  position: absolute; bottom: 8px; right: 12px;
  display: flex; gap: 5px;
}
.banner-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,255,255,0.45);
  transition: width 0.3s, background 0.3s, border-radius 0.3s;
  cursor: pointer;
}
.banner-dot.active {
  width: 16px; border-radius: 3px;
  background: #fff;
}

/* ─── CAROUSEL ────────────────────────────── */
.carousel {
  display: flex; overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 14px; padding: 8px 20px 14px; scrollbar-width: none;
}
.carousel::-webkit-scrollbar { display: none; }

.carousel-item {
  flex-shrink: 0; width: calc(100% - 56px);
  scroll-snap-align: center;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s;
  transform: scale(0.93); opacity: 0.5;
}
.carousel-item.active { transform: scale(1); opacity: 1; }
.carousel-item:only-child {
  width: 100%;
  transform: scale(1); opacity: 1;
}

/* ─── DOTS ────────────────────────────────── */
.dots { display: flex; justify-content: center; gap: 6px; padding: 4px 0 0; }
.dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--border);
  transition: width 0.3s, background 0.3s, border-radius 0.3s;
}
.dot.active {
  width: 18px; border-radius: 3px;
  background: var(--accent);
}
</style>
