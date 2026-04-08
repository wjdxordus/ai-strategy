<template>
  <div class="timebridge">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-title">타임브릿지</div>
    </div>

    <!-- 탭 -->
    <div class="tab-bar">
      <button class="tab" :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">일별</button>
      <button class="tab" :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">월별</button>
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

            <!-- 상단: 시간 -->
            <div class="card-top">
              <span class="card-time">{{ record.time }}</span>
            </div>

            <!-- 하단: 정보 -->
            <div class="card-bottom">
              <div class="card-location">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ record.location }}
              </div>
              <p class="card-comment">{{ record.aiComment }}</p>
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
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="month-label">{{ calYear }}년 {{ calMonth + 1 }}월</span>
        <button class="nav-btn" @click="nextMonth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div class="calendar">
        <div class="cal-dow-row">
          <span v-for="d in ['일','월','화','수','목','금','토']" :key="d" class="cal-dow">{{ d }}</span>
        </div>
        <div class="cal-grid">
          <div
            v-for="(cell, ci) in calCells" :key="ci"
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

      <div style="height: 80px" />
    </div>

  </div>
</template>

<script>
import { store } from '../store'

export default {
  name: 'TimeBridgeView',
  data() {
    const now = new Date()
    return {
      activeTab: 'daily',
      searchQuery: '',
      selectedEmotions: [],
      selectedCategories: [],
      calYear: now.getFullYear(),
      calMonth: now.getMonth(),
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
          r.aiComment.toLowerCase().includes(q) ||
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
    calCells() {
      const { calYear: y, calMonth: m } = this
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
    isToday(cell) {
      const t = new Date()
      const mm = String(t.getMonth() + 1).padStart(2, '0')
      const dd = String(t.getDate()).padStart(2, '0')
      return cell.dateStr === `${t.getFullYear()}-${mm}-${dd}`
    },
    prevMonth() {
      if (this.calMonth === 0) { this.calYear--; this.calMonth = 11 } else this.calMonth--
    },
    nextMonth() {
      if (this.calMonth === 11) { this.calYear++; this.calMonth = 0 } else this.calMonth++
    },
  },
}
</script>

<style scoped>
.timebridge { background: #fff; min-height: 100%; }

/* 헤더 */
.header { padding: 28px 24px 0; }
.header-title { font-size: 28px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.5px; }

/* 탭 */
.tab-bar {
  display: flex;
  padding: 16px 24px 0;
  position: sticky;
  top: 0;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10;
  border-bottom: 0.5px solid #e5e5ea;
}
.tab {
  padding: 10px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: #aeaeb2;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -0.5px;
  transition: color 0.2s, border-color 0.2s;
  font-family: inherit;
  letter-spacing: -0.2px;
}
.tab.active { color: #1d1d1f; border-bottom-color: #1d1d1f; }

/* 필터 패널 */
.filter-panel { padding: 14px 0 0; border-bottom: 0.5px solid #e5e5ea; }

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 12px;
  background: #f5f5f7;
  border-radius: 12px;
  padding: 10px 14px;
}
.search-icon { color: #aeaeb2; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #1d1d1f;
  font-family: inherit;
  outline: none;
  letter-spacing: -0.1px;
}
.search-input::placeholder { color: #aeaeb2; }
.search-clear {
  border: none;
  background: #c7c7cc;
  color: #fff;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.filter-row { margin-bottom: 8px; }
.filter-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 0 16px;
  -webkit-overflow-scrolling: touch;
}
.filter-scroll::-webkit-scrollbar { display: none; }

.filter-chip {
  flex-shrink: 0;
  padding: 6px 13px;
  border-radius: 20px;
  border: 1.5px solid #e5e5ea;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: #3a3a3c;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.1px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}
.filter-chip.active {
  background: #1d1d1f;
  border-color: #1d1d1f;
  color: #fff;
}

.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 12px;
}
.filter-summary-text { font-size: 12px; font-weight: 500; color: #86868b; }
.filter-reset {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

/* 결과 없음 */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 72px;
  gap: 10px;
}
.empty-result-icon {
  width: 60px;
  height: 60px;
  background: #f5f5f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aeaeb2;
}
.empty-result-title { font-size: 16px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.2px; }
.empty-result-desc { font-size: 13px; color: #86868b; }

/* 기록 목록 */
.daily-list { padding: 12px 0; }
.date-group { margin-bottom: 6px; }
.date-label {
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 10px 20px 8px;
}

/* 이미지 메인 카드 */
.card {
  position: relative;
  margin: 0 16px 12px;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: transform 0.2s;
}
.card:active { transform: scale(0.98); }

/* 그라디언트: 상단 살짝 + 하단 강하게 */
.card-gradient {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 28%),
    linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 40%, transparent 70%);
}

/* 시간 - 좌상단 */
.card-top {
  position: absolute;
  top: 14px;
  left: 16px;
  z-index: 1;
}
.card-time {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  letter-spacing: 0.2px;
}

/* 하단 정보 */
.card-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 16px 18px;
  z-index: 1;
}
.card-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-comment {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.95);
  line-height: 1.5;
  letter-spacing: -0.2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}
.card-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.chip {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: background 0.15s;
}
.chip.chip-active {
  background: rgba(255,255,255,0.9);
  color: #1d1d1f;
}

/* 월별 */
.monthly-view { padding: 4px 16px 0; }

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 8px 16px;
}
.month-label { font-size: 16px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.3px; }
.nav-btn {
  border: none;
  background: #f5f5f7;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1d1d1f;
  transition: background 0.15s;
}
.nav-btn:active { background: #e5e5ea; }

.calendar { border-radius: 16px; overflow: hidden; background: #f5f5f7; }
.cal-dow-row { display: grid; grid-template-columns: repeat(7, 1fr); padding: 10px 0 8px; }
.cal-dow { text-align: center; font-size: 11px; font-weight: 600; color: #aeaeb2; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: rgba(0,0,0,0.06); }
.cal-cell { aspect-ratio: 1; position: relative; overflow: hidden; background: #f5f5f7; }
.cal-cell.empty { background: transparent; }
.cal-bg { position: absolute; inset: 0; }
.cal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); }
.cal-day {
  position: absolute;
  top: 5px; left: 0; right: 0;
  text-align: center;
  font-size: 11px;
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
  inset: 2px;
  border: 1.5px solid #1d1d1f;
  border-radius: 6px;
  z-index: 2;
  pointer-events: none;
}
.cal-cell.hasRecord.today::after { border-color: rgba(255,255,255,0.7); }
</style>
