<template>
  <div class="timebridge">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-title">타임브릿지</div>
      <div class="header-sub">나의 기록들</div>
    </div>

    <!-- 탭 -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'daily' }"
        @click="activeTab = 'daily'"
      >일별</button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'monthly' }"
        @click="activeTab = 'monthly'"
      >월별</button>
    </div>

    <!-- 일별 뷰 -->
    <div v-if="activeTab === 'daily'" class="daily-list">
      <div
        v-for="(group, gi) in groupedByDate"
        :key="gi"
        class="date-group"
      >
        <!-- 날짜 구분선 -->
        <div class="date-divider">
          <span class="date-divider-text">{{ group.dateLabel }}</span>
        </div>

        <!-- 카드 -->
        <div
          v-for="record in group.records"
          :key="record.id"
          class="record-card"
          @click="openDetail(record)"
        >
          <!-- 썸네일 -->
          <div
            class="card-thumb"
            :style="thumbStyle(record)"
          />

          <!-- 정보 -->
          <div class="card-body">
            <div class="card-time">{{ record.time }}</div>
            <div class="card-location">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {{ record.location }}
            </div>
            <p class="card-comment">{{ record.aiComment }}</p>
            <div class="card-tags">
              <span
                v-for="tag in record.emotionTags.slice(0, 2)"
                :key="tag.label"
                class="card-tag card-tag-emotion"
              >{{ tag.icon }} {{ tag.label }}</span>
              <span
                v-for="tag in record.categoryTags.slice(0, 2)"
                :key="tag"
                class="card-tag card-tag-category"
              ># {{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 80px" />
    </div>

    <!-- 월별 뷰 -->
    <div v-else class="monthly-view">
      <!-- 월 네비게이션 -->
      <div class="month-nav">
        <button class="month-nav-btn" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="month-nav-label">{{ calYear }}년 {{ calMonth + 1 }}월</span>
        <button class="month-nav-btn" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <!-- 캘린더 -->
      <div class="calendar">
        <!-- 요일 헤더 -->
        <div class="cal-header">
          <span v-for="d in ['일','월','화','수','목','금','토']" :key="d" class="cal-dow">{{ d }}</span>
        </div>
        <!-- 날짜 그리드 -->
        <div class="cal-grid">
          <div
            v-for="(cell, ci) in calCells"
            :key="ci"
            class="cal-cell"
            :class="{ empty: !cell, today: cell && isToday(cell), hasRecord: cell && recordMapForCal[cell.dateStr] }"
          >
            <template v-if="cell">
              <!-- 기록 있으면 배경 이미지 -->
              <div
                v-if="recordMapForCal[cell.dateStr]"
                class="cal-cell-bg"
                :style="thumbStyle(recordMapForCal[cell.dateStr])"
              />
              <div class="cal-cell-overlay" />
              <span class="cal-day" :class="{ sunday: ci % 7 === 0, saturday: ci % 7 === 6 }">{{ cell.day }}</span>
            </template>
          </div>
        </div>
      </div>

      <!-- 선택된 날 기록 (있을 경우) -->
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
      calYear: now.getFullYear(),
      calMonth: now.getMonth(),
    }
  },
  computed: {
    records() {
      return [...store.records].sort((a, b) => (a.date < b.date ? 1 : -1))
    },
    groupedByDate() {
      const map = {}
      for (const r of this.records) {
        if (!map[r.date]) map[r.date] = []
        map[r.date].push(r)
      }
      return Object.keys(map)
        .sort((a, b) => (a < b ? 1 : -1))
        .map(date => ({
          dateLabel: this.formatDateLabel(date),
          records: map[date],
        }))
    },
    calCells() {
      const year = this.calYear
      const month = this.calMonth
      const firstDay = new Date(year, month, 1).getDay()
      const lastDate = new Date(year, month + 1, 0).getDate()
      const cells = []
      for (let i = 0; i < firstDay; i++) cells.push(null)
      for (let d = 1; d <= lastDate; d++) {
        const mm = String(month + 1).padStart(2, '0')
        const dd = String(d).padStart(2, '0')
        cells.push({ day: d, dateStr: `${year}-${mm}-${dd}` })
      }
      // pad to complete last row
      while (cells.length % 7 !== 0) cells.push(null)
      return cells
    },
    recordMapForCal() {
      const map = {}
      for (const r of store.records) {
        if (!map[r.date]) map[r.date] = r
      }
      return map
    },
  },
  methods: {
    thumbStyle(record) {
      if (record.thumbnail) {
        return {
          backgroundImage: `url(${record.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
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
      const today = new Date()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      return cell.dateStr === `${today.getFullYear()}-${mm}-${dd}`
    },
    prevMonth() {
      if (this.calMonth === 0) { this.calYear--; this.calMonth = 11 }
      else this.calMonth--
    },
    nextMonth() {
      if (this.calMonth === 11) { this.calYear++; this.calMonth = 0 }
      else this.calMonth++
    },
    openDetail(record) {
      // TODO: 상세 화면 연결
    },
  },
}
</script>

<style scoped>
.timebridge { background: #F7F8FC; min-height: 100%; }

/* 헤더 */
.header {
  padding: 20px 20px 14px;
  background: #F7F8FC;
}
.header-title { font-size: 22px; font-weight: 700; color: #1A1A2E; }
.header-sub { font-size: 12px; color: #AAAAAA; margin-top: 2px; }

/* 탭 */
.tab-bar {
  display: flex;
  gap: 0;
  padding: 0 20px 0;
  border-bottom: 1.5px solid #F0F0F0;
  background: #F7F8FC;
  position: sticky;
  top: 0;
  z-index: 10;
}
.tab-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: #BBBBBB;
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  margin-bottom: -1.5px;
  transition: color 0.2s, border-color 0.2s;
}
.tab-btn.active {
  color: #FF6B6B;
  border-bottom-color: #FF6B6B;
}

/* 일별 목록 */
.daily-list { padding: 0 16px; }

.date-group { margin-top: 20px; }
.date-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.date-divider::before,
.date-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #EBEBEB;
}
.date-divider-text {
  font-size: 11px;
  font-weight: 600;
  color: #AAAAAA;
  white-space: nowrap;
}

.record-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  margin-bottom: 12px;
  display: flex;
  cursor: pointer;
  transition: transform 0.15s;
}
.record-card:active { transform: scale(0.985); }

.card-thumb {
  width: 96px;
  flex-shrink: 0;
  min-height: 110px;
}

.card-body {
  flex: 1;
  padding: 12px 14px;
  min-width: 0;
}
.card-time {
  font-size: 11px;
  color: #AAAAAA;
  margin-bottom: 3px;
}
.card-location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-comment {
  font-size: 12px;
  line-height: 1.6;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.card-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}
.card-tag-emotion { background: #FFF0F0; color: #E85555; }
.card-tag-category { background: #EEF2FF; color: #5C7AFF; }

/* 월별 뷰 */
.monthly-view { padding: 0 16px; }

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 4px 12px;
}
.month-nav-label {
  font-size: 16px;
  font-weight: 700;
  color: #1A1A2E;
}
.month-nav-btn {
  border: none;
  background: none;
  padding: 6px;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 캘린더 */
.calendar { background: #fff; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); overflow: hidden; }

.cal-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 10px 0 8px;
  border-bottom: 1px solid #F5F5F5;
}
.cal-dow {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #BBBBBB;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cal-cell {
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  border: 0.5px solid #F5F5F5;
}
.cal-cell.empty { background: transparent; border-color: transparent; }

.cal-cell-bg {
  position: absolute;
  inset: 0;
}
.cal-cell-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.15);
}

.cal-day {
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #444;
  z-index: 1;
}
.cal-cell.hasRecord .cal-day { color: #fff; }
.cal-day.sunday { color: #FF6B6B; }
.cal-cell.hasRecord .cal-day.sunday { color: #fff; }
.cal-day.saturday { color: #5C7AFF; }
.cal-cell.hasRecord .cal-day.saturday { color: #fff; }

.cal-cell.today::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 2px solid #FF6B6B;
  border-radius: 4px;
  z-index: 2;
  pointer-events: none;
}
</style>
