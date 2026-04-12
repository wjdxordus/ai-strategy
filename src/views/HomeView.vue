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

    <!-- 1년 전 오늘 -->
    <section v-if="memoryRecords.length" class="record-section memory-section">
      <div class="section-header">
        <div class="section-title-row">
          <h2 class="section-title">1년전 오늘</h2>
          <span class="section-date">{{ memoryLabel }}</span>
        </div>
        <p class="section-desc">1년 전 오늘 레코드가 있어요</p>
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
  height: 18px; width: auto;
  display: inline-block; vertical-align: middle;
  object-fit: contain;
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
