<template>
  <div class="timebridge">

    <!-- 헤더 -->
    <div class="header">
      <p class="header-eyebrow">나의 기록</p>
      <h1 class="header-title">타임브릿지</h1>
      <!-- 탭 -->
      <div class="tab-bar">
        <button class="tab" :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">일별</button>
        <button class="tab" :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">월별</button>
      </div>
    </div>

    <!-- 일별 -->
    <div v-if="activeTab === 'daily'" class="daily-wrapper">

      <!-- 필터 패널 -->
      <div class="filter-panel">
        <!-- 검색창 -->
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" class="search-input" type="text" placeholder="장소, 감정, 태그 검색..." />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 감정 필터 -->
        <div class="filter-row">
          <div class="filter-scroll">
            <button class="filter-chip" :class="{ active: selectedEmotions.length === 0 && selectedCategories.length === 0 }" @click="clearAll">전체</button>
            <button
              v-for="tag in allEmotions" :key="tag.label"
              class="filter-chip"
              :class="{ active: selectedEmotions.includes(tag.label) }"
              @click="toggleEmotion(tag.label)"
            >{{ tag.icon }}&thinsp;{{ tag.label }}</button>
          </div>
        </div>

        <!-- 카테고리 필터 -->
        <div class="filter-row">
          <div class="filter-scroll">
            <button
              v-for="tag in allCategories" :key="tag"
              class="filter-chip filter-chip-cat"
              :class="{ active: selectedCategories.includes(tag) }"
              @click="toggleCategory(tag)"
            >#&thinsp;{{ tag }}</button>
          </div>
        </div>

        <!-- 필터 요약 -->
        <div v-if="hasActiveFilter" class="filter-summary">
          <span class="filter-summary-text">{{ filteredRecords.length }}개의 기록</span>
          <button class="filter-reset" @click="clearAll">
            초기화
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 결과 없음 -->
      <div v-if="filteredGroups.length === 0" class="empty-result">
        <div class="empty-result-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div class="empty-result-title">기록이 없어요</div>
        <div class="empty-result-desc">다른 필터를 선택해보세요.</div>
      </div>

      <!-- 기록 목록 -->
      <div v-else class="daily-list">
        <div v-for="(group, gi) in filteredGroups" :key="gi" class="date-group">

          <div class="date-label">{{ group.dateLabel }}</div>

          <!-- 이미지 메인 카드 -->
          <div
            v-for="record in group.records"
            :key="record.id"
            class="card"
            :style="thumbStyle(record)"
          >
            <!-- 그라디언트 오버레이 -->
            <div class="card-gradient" />

            <!-- 상단: 시간 + 날씨 -->
            <div class="card-top">
              <span class="card-time">{{ record.time }}</span>
              <span class="card-weather">{{ record.weather.emoji }}&thinsp;{{ record.weather.label }}</span>
            </div>

            <!-- 하단: 정보 -->
            <div class="card-bottom">
              <div class="card-location">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ record.location }}
              </div>
              <p class="card-comment">{{ record.aiRecord }}</p>
              <div class="card-chips">
                <span
                  v-for="tag in record.emotionTags"
                  :key="tag.label"
                  class="chip"
                  :class="{ 'chip-active': selectedEmotions.includes(tag.label) }"
                >{{ tag.icon }}&thinsp;{{ tag.label }}</span>
                <span
                  v-for="tag in record.categoryTags"
                  :key="tag"
                  class="chip"
                  :class="{ 'chip-active': selectedCategories.includes(tag) }"
                >#&thinsp;{{ tag }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div style="height: 80px" />
    </div>

    <!-- 월별 -->
    <div v-else class="monthly-view">
      <div
        v-for="m in monthList"
        :key="`${m.year}-${m.month}`"
        class="month-block"
      >
        <div class="month-block-label">
          <span class="month-block-year">{{ m.year }}</span>
          <span class="month-block-month">{{ m.month + 1 }}월</span>
        </div>
        <div class="calendar">
          <div class="cal-grid">
            <div
              v-for="(cell, ci) in calCellsFor(m.year, m.month)"
              :key="ci"
              class="cal-cell"
              :class="{ empty: !cell, today: cell && isToday(cell), hasRecord: cell && recordMap[cell.dateStr] }"
            >
              <template v-if="cell">
                <div v-if="recordMap[cell.dateStr]" class="cal-bg" :style="thumbStyle(recordMap[cell.dateStr])" />
                <div v-if="recordMap[cell.dateStr]" class="cal-overlay" />
                <span class="cal-day" :class="{ sun: ci % 7 === 0, sat: ci % 7 === 6 }">{{ cell.day }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 80px" />
    </div>

  </div>
</template>

<script>
import { store } from '../store'

export default {
  name: 'TimeBridgeView',
  data() {
    return {
      activeTab: 'daily',
      searchQuery: '',
      selectedEmotions: [],
      selectedCategories: [],
    }
  },
  computed: {
    allRecords() {
      return [...store.records].sort((a, b) => (a.date < b.date ? 1 : -1))
    },
    allEmotions() {
      const seen = new Set()
      const result = []
      for (const r of this.allRecords) {
        for (const t of r.emotionTags) {
          if (!seen.has(t.label)) { seen.add(t.label); result.push(t) }
        }
      }
      return result
    },
    allCategories() {
      const seen = new Set()
      for (const r of this.allRecords) {
        for (const t of r.categoryTags) seen.add(t)
      }
      return [...seen]
    },
    hasActiveFilter() {
      return this.searchQuery.trim() !== '' || this.selectedEmotions.length > 0 || this.selectedCategories.length > 0
    },
    filteredRecords() {
      let list = this.allRecords
      const q = this.searchQuery.trim().toLowerCase()
      if (q) {
        list = list.filter(r =>
          r.location.toLowerCase().includes(q) ||
          r.aiRecord.toLowerCase().includes(q) ||
          r.emotionTags.some(t => t.label.includes(q)) ||
          r.categoryTags.some(t => t.toLowerCase().includes(q))
        )
      }
      if (this.selectedEmotions.length > 0) {
        list = list.filter(r => r.emotionTags.some(t => this.selectedEmotions.includes(t.label)))
      }
      if (this.selectedCategories.length > 0) {
        list = list.filter(r => r.categoryTags.some(t => this.selectedCategories.includes(t)))
      }
      return list
    },
    filteredGroups() {
      const map = {}
      for (const r of this.filteredRecords) {
        if (!map[r.date]) map[r.date] = []
        map[r.date].push(r)
      }
      return Object.keys(map)
        .sort((a, b) => (a < b ? 1 : -1))
        .map(date => ({ dateLabel: this.formatDateLabel(date), records: map[date] }))
    },
    monthList() {
      const now = new Date()
      const list = []
      for (let i = 0; i < 12; i++) {
        let year = now.getFullYear()
        let month = now.getMonth() - i
        while (month < 0) { month += 12; year-- }
        list.push({ year, month })
      }
      return list
    },
    recordMap() {
      const map = {}
      for (const r of store.records) {
        if (!map[r.date]) map[r.date] = r
      }
      return map
    },
  },
  methods: {
    toggleEmotion(label) {
      const i = this.selectedEmotions.indexOf(label)
      if (i >= 0) this.selectedEmotions.splice(i, 1)
      else this.selectedEmotions.push(label)
    },
    toggleCategory(tag) {
      const i = this.selectedCategories.indexOf(tag)
      if (i >= 0) this.selectedCategories.splice(i, 1)
      else this.selectedCategories.push(tag)
    },
    clearAll() {
      this.selectedEmotions = []
      this.selectedCategories = []
      this.searchQuery = ''
    },
    thumbStyle(record) {
      if (record.thumbnail) {
        return { backgroundImage: `url(${record.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      }
      return { background: record.gradient }
    },
    formatDateLabel(dateStr) {
      const d = new Date(dateStr)
      const days = ['일', '월', '화', '수', '목', '금', '토']
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
      if (dateStr === todayStr) return '오늘'
      return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
    },
    calCellsFor(y, m) {
      const firstDay = new Date(y, m, 1).getDay()
      const lastDate = new Date(y, m + 1, 0).getDate()
      const cells = Array(firstDay).fill(null)
      for (let d = 1; d <= lastDate; d++) {
        const mm = String(m + 1).padStart(2, '0')
        const dd = String(d).padStart(2, '0')
        cells.push({ day: d, dateStr: `${y}-${mm}-${dd}` })
      }
      while (cells.length % 7 !== 0) cells.push(null)
      return cells
    },
    isToday(cell) {
      const t = new Date()
      const mm = String(t.getMonth() + 1).padStart(2, '0')
      const dd = String(t.getDate()).padStart(2, '0')
      return cell.dateStr === `${t.getFullYear()}-${mm}-${dd}`
    },
  },
}
</script>

<style scoped>
.timebridge { background: #fff; min-height: 100%; }

/* ─── 헤더 ─────────────────────────────────── */
.header {
  padding: 52px 24px 0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  background: rgba(255,255,255,0.88);
}
.header-eyebrow {
  font-size: 11px;
  font-weight: 500;
  color: #6e6e73;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.header-title {
  font-size: 34px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -1px;
  margin-bottom: 0;
}

/* ─── 탭 ────────────────────────────────────── */
.tab-bar {
  display: flex;
  margin-top: 16px;
  border-bottom: 0.5px solid rgba(0,0,0,0.12);
}
.tab {
  padding: 10px 20px 10px 0;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 600;
  color: #aeaeb2;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -0.5px;
  transition: color 0.2s, border-color 0.2s;
  font-family: inherit;
  letter-spacing: -0.3px;
}
.tab.active { color: #1d1d1f; border-bottom-color: #1d1d1f; }

/* ─── 필터 패널 ─────────────────────────────── */
.filter-panel {
  padding: 16px 0 0;
  background: #fff;
  border-bottom: 0.5px solid rgba(0,0,0,0.1);
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 20px 14px;
  background: #f5f5f7;
  border-radius: 12px;
  padding: 11px 15px;
}
.search-icon { color: #aeaeb2; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 15px;
  color: #1d1d1f;
  font-family: inherit;
  outline: none;
  letter-spacing: -0.2px;
}
.search-input::placeholder { color: #aeaeb2; }
.search-clear {
  border: none;
  background: #c7c7cc;
  color: #fff;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.filter-row { margin-bottom: 10px; }
.filter-scroll {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 0 20px;
  -webkit-overflow-scrolling: touch;
}
.filter-scroll::-webkit-scrollbar { display: none; }

.filter-chip {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 20px;
  border: none;
  background: #f5f5f7;
  font-size: 13px;
  font-weight: 500;
  color: #3a3a3c;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.1px;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.filter-chip.active { background: #1d1d1f; color: #fff; }

.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 14px;
}
.filter-summary-text { font-size: 13px; font-weight: 400; color: #6e6e73; }
.filter-reset {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #6e6e73;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

/* ─── 빈 상태 ───────────────────────────────── */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
  gap: 12px;
}
.empty-result-icon {
  width: 64px; height: 64px;
  background: #f5f5f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aeaeb2;
}
.empty-result-title { font-size: 17px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.3px; }
.empty-result-desc { font-size: 14px; color: #6e6e73; }

/* ─── 일별 목록 ──────────────────────────────── */
.daily-list { padding: 0; }
.date-group {}
.date-label {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
  padding: 32px 20px 12px;
}

/* ─── 이미지 카드 ────────────────────────────── */
.card {
  position: relative;
  margin: 0 0 3px;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: opacity 0.2s;
}
.card:active { opacity: 0.88; }

.card-gradient {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%),
    linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 45%, transparent 72%);
}

.card-top {
  position: absolute;
  top: 18px; left: 20px; right: 20px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-time {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.1px;
}
.card-weather {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0;
}

.card-bottom {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 20px 20px 24px;
  z-index: 1;
}
.card-location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-comment {
  font-size: 17px;
  font-weight: 600;
  color: rgba(255,255,255,0.96);
  line-height: 1.45;
  letter-spacing: -0.4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}
.card-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 11px;
  border-radius: 20px;
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.88);
  white-space: nowrap;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background 0.15s;
}
.chip.chip-active { background: rgba(255,255,255,0.92); color: #1d1d1f; }

/* ─── 월별 ──────────────────────────────────── */
.monthly-view { padding: 0; }

.month-block { margin-bottom: 0; }

.month-block-label {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 36px 20px 14px;
}
.month-block-year {
  font-size: 15px;
  font-weight: 400;
  color: #6e6e73;
}
.month-block-month {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.8px;
}

.calendar { overflow: hidden; }
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(0,0,0,0.08);
  border-top: 0.5px solid rgba(0,0,0,0.08);
}
.cal-cell { aspect-ratio: 1; position: relative; overflow: hidden; background: #f5f5f7; }
.cal-cell.empty { background: #fff; }
.cal-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.cal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.22); }
.cal-day {
  position: absolute;
  top: 8px; left: 0; right: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #3a3a3c;
  z-index: 1;
}
.cal-cell.hasRecord .cal-day { color: #fff; font-weight: 600; }
.cal-day.sun { color: #ff3b30; }
.cal-cell.hasRecord .cal-day.sun { color: #fff; }
.cal-day.sat { color: #007aff; }
.cal-cell.hasRecord .cal-day.sat { color: #fff; }
.cal-cell.today::after {
  content: '';
  position: absolute;
  inset: 3px;
  border: 2px solid #1d1d1f;
  border-radius: 8px;
  z-index: 2;
  pointer-events: none;
}
.cal-cell.hasRecord.today::after { border-color: rgba(255,255,255,0.75); }
</style>
