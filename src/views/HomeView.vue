<template>
  <div class="home">

    <!-- 오늘의 기록 -->
    <section class="record-section">
      <div class="section-header">
        <div class="section-title-row">
          <h2 class="section-title">Today's Record</h2>
          <span class="section-date">{{ todayLabel }}</span>
        </div>
        <p class="section-desc">골든레코드AI가 셀렉트한 베스트포토와 자동 기록입니다.</p>
      </div>

      <div class="carousel" ref="todayStrip" @scroll.passive="onTodayScroll">
        <RecordCard
          v-for="(rec, i) in todayRecords"
          :key="rec.id"
          :record="rec"
          class="carousel-item"
          :class="{ active: i === todayIndex }"
        />
      </div>
      <div class="dots" v-if="todayRecords.length > 1">
        <span
          v-for="(r, i) in todayRecords"
          :key="i"
          class="dot"
          :class="{ active: i === todayIndex }"
        />
      </div>
    </section>

    <!-- 1년 전 오늘 -->
    <section v-if="memoryRecords.length" class="record-section memory-section">
      <div class="section-header">
        <div class="section-title-row">
          <h2 class="section-title">1년 전 오늘</h2>
        </div>
      </div>
      <div class="carousel" ref="memoryStrip" @scroll.passive="onMemoryScroll">
        <RecordCard
          v-for="(rec, i) in memoryRecords"
          :key="rec.id"
          :record="rec"
          class="carousel-item"
          :class="{ active: i === memoryIndex }"
        />
      </div>
      <div class="dots" v-if="memoryRecords.length > 1">
        <span
          v-for="(r, i) in memoryRecords"
          :key="i"
          class="dot"
          :class="{ active: i === memoryIndex }"
        />
      </div>
    </section>

    <div style="height: 32px" />

  </div>
</template>

<script>
import { store } from '../store'
import RecordCard from '../components/RecordCard.vue'

export default {
  name: 'HomeView',
  components: { RecordCard },
  data() {
    return {
      store,
      todayIndex: 0,
      memoryIndex: 0,
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
  },
}
</script>

<style scoped>

/* ─── SECTION ────────────────────────────────── */
.record-section {
  background: #fff;
  padding: 44px 0 20px;
}
.memory-section {
  background: #f5f5f7;
  padding-top: 36px;
}

.section-header {
  padding: 0 24px;
  margin-bottom: 20px;
}
.section-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}
.section-title {
  font-size: 26px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.8px;
  line-height: 1.1;
}
.section-date {
  font-size: 13px;
  font-weight: 400;
  color: #6e6e73;
  letter-spacing: -0.1px;
}
.section-desc {
  font-size: 13px;
  font-weight: 400;
  color: #aeaeb2;
  letter-spacing: -0.1px;
  line-height: 1.5;
}

/* ─── CAROUSEL ───────────────────────────────── */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 12px;
  padding: 0 20px;
  scrollbar-width: none;
}
.carousel::-webkit-scrollbar { display: none; }

.carousel-item {
  flex-shrink: 0;
  width: calc(100% - 56px);
  scroll-snap-align: center;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s;
  transform: scale(0.94);
  opacity: 0.55;
}
.carousel-item.active {
  transform: scale(1);
  opacity: 1;
}

/* ─── DOTS ───────────────────────────────────── */
.dots {
  display: flex;
  justify-content: center;
  gap: 5px;
  padding: 14px 0 0;
}
.dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #c7c7cc;
  transition: width 0.3s, background 0.3s;
}
.dot.active {
  width: 18px;
  border-radius: 3px;
  background: #1d1d1f;
}
</style>
