<template>
  <div class="timebridge">

    <!-- ─── Sticky Header ──────────────────────── -->
    <div class="tb-header">
      <!-- 타이틀 -->
      <div class="tb-title-row">
        <h1 class="tb-title">Time Bridge</h1>
      </div>

      <!-- 메인 탭 -->
      <div class="tb-main-tabs">
        <button
          class="tb-main-tab"
          :class="{ active: mainTab === 'record_archive' }"
          @click="setMainTab('record_archive')"
        >Record Archive</button>
        <button
          class="tb-main-tab"
          :class="{ active: mainTab === 'moment_track' }"
          @click="setMainTab('moment_track')"
        >Moment Track</button>
      </div>

      <!-- 서브 행 (Record Archive 전용) -->
      <div v-if="mainTab === 'record_archive'" class="tb-sub-row">
        <div class="tb-view-tabs">
          <button
            class="tb-view-tab"
            :class="{ active: viewMode === 'calendar' }"
            @click="viewMode = 'calendar'; selectedDate = null"
          >캘린더</button>
          <button
            class="tb-view-tab"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'; selectedDate = null"
          >리스트</button>
        </div>
        <div v-if="selectedDate" class="tb-date-nav">
          <button class="tb-nav-btn" :disabled="!hasPrevDate" @click="prevDate">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="tb-nav-date">{{ selectedDateLabel }}</span>
          <button class="tb-nav-btn" :disabled="!hasNextDate" @click="nextDate">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 요일 헤더 (캘린더 뷰 && 상세 미선택 시) -->
      <div v-if="mainTab === 'record_archive' && viewMode === 'calendar' && !selectedDate" class="tb-week-header">
        <span v-for="d in ['일','월','화','수','목','금','토']" :key="d" class="tb-week-day">{{ d }}</span>
      </div>
    </div>

    <!-- ─── 캘린더 뷰 ────────────────────────────── -->
    <div v-if="mainTab === 'record_archive' && viewMode === 'calendar' && !selectedDate" class="tb-scroll">
      <div v-if="!calendarMonths.length" class="tb-empty">
        <div class="tb-empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <p class="tb-empty-title">기록이 없어요</p>
        <p class="tb-empty-desc">사진을 찍으면 기록이 쌓여요.</p>
      </div>

      <div v-for="mg in calendarMonths" :key="mg.key" class="cal-month-block">
        <div class="cal-month-label">{{ mg.label }}</div>
        <div class="cal-grid">
          <div
            v-for="(cell, ci) in mg.cells"
            :key="ci"
            class="cal-cell"
            :class="{
              empty: !cell,
              'has-record': cell && !!recordMap[cell.dateStr],
              today: cell && cell.dateStr === todayStr,
              'is-sun': ci % 7 === 0,
              'is-sat': ci % 7 === 6,
            }"
            @click="cell && recordMap[cell.dateStr] && selectDate(cell.dateStr)"
          >
            <template v-if="cell">
              <div
                v-if="recordMap[cell.dateStr]"
                class="cal-thumb"
                :style="thumbStyle(recordMap[cell.dateStr])"
              />
              <div v-if="recordMap[cell.dateStr]" class="cal-overlay" />
              <span class="cal-day-num">{{ cell.day }}</span>
            </template>
          </div>
        </div>
      </div>
      <div style="height: 80px" />
    </div>

    <!-- ─── 리스트 뷰 ────────────────────────────── -->
    <div v-else-if="mainTab === 'record_archive' && viewMode === 'list' && !selectedDate" class="tb-scroll">
      <div v-if="!listMonths.length" class="tb-empty">
        <div class="tb-empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <circle cx="3" cy="6" r="1" fill="currentColor"/>
            <circle cx="3" cy="12" r="1" fill="currentColor"/>
            <circle cx="3" cy="18" r="1" fill="currentColor"/>
          </svg>
        </div>
        <p class="tb-empty-title">기록이 없어요</p>
        <p class="tb-empty-desc">사진을 찍으면 기록이 쌓여요.</p>
      </div>

      <div v-for="mg in listMonths" :key="mg.key" class="list-month-block">
        <div class="list-month-label">{{ mg.label }}</div>
        <div
          v-for="dg in mg.dateGroups"
          :key="dg.dateStr"
          class="list-day-row"
          @click="selectDate(dg.dateStr)"
        >
          <div class="list-day-left">
            <span class="list-dow">{{ dg.dow }}</span>
            <span class="list-day-num">{{ dg.day }}</span>
          </div>
          <div class="list-day-records">
            <div v-for="r in dg.records" :key="r.id" class="list-record-item">
              <div class="list-record-thumb" :style="thumbStyle(r)" />
              <div class="list-record-info">
                <div class="list-record-meta">
                  <span class="list-record-time">{{ r.time }}</span>
                  <span class="list-record-location">{{ r.location }}</span>
                </div>
                <p class="list-record-text">{{ r.aiRecord }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="height: 80px" />
    </div>

    <!-- ─── 일별 상세 뷰 ─────────────────────────── -->
    <div v-else-if="mainTab === 'record_archive' && selectedDate" class="tb-scroll">
      <div v-if="!selectedDateRecords.length" class="tb-empty" style="padding-top: 60px">
        <p class="tb-empty-title">이 날의 기록이 없어요</p>
      </div>

      <div v-for="r in selectedDateRecords" :key="r.id" class="detail-card-outer">
        <div class="detail-card">
          <!-- 사진 -->
          <div class="detail-photo-wrap">
            <img v-if="r.thumbnail" :src="r.thumbnail" class="detail-photo-img" alt="기록 사진" />
            <div v-else class="detail-photo-gradient" :style="{ background: r.gradient || 'var(--nm-s1)' }" />
          </div>
          <!-- 본문 -->
          <div class="detail-body">
            <div class="detail-meta">
              <span class="detail-weather">{{ r.weather && r.weather.emoji }}</span>
              <span class="detail-time">{{ r.time }}</span>
              <svg class="detail-pin" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span class="detail-location">{{ r.location }}</span>
            </div>
            <p class="detail-text">{{ r.aiRecord }}</p>
            <div class="detail-tags">
              <span
                v-for="tag in (r.emotionTags || [])"
                :key="tag.label"
                class="detail-tag detail-tag-emotion"
              >{{ tag.icon }}&thinsp;{{ tag.label }}</span>
              <span
                v-for="tag in (r.categoryTags || [])"
                :key="tag"
                class="detail-tag detail-tag-category"
              >#&thinsp;{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="height: 80px" />
    </div>

    <!-- ─── Moment Track ─────────────────────────── -->
    <div v-else-if="mainTab === 'moment_track'" class="tb-scroll">
      <div class="moment-coming-soon">
        <div class="moment-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p class="moment-title">준비 중</p>
        <p class="moment-desc">특별한 순간들이 모여<br>하나의 타임라인이 됩니다.</p>
      </div>
    </div>

  </div>
</template>

<script>
import { store } from '../store'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

export default {
  name: 'TimeBridgeView',
  data() {
    return {
      mainTab: 'record_archive',
      viewMode: 'calendar',
      selectedDate: null,
    }
  },
  computed: {
    todayStr() {
      const t = new Date()
      return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
    },
    allRecords() {
      return [...store.records].sort((a, b) => a.date > b.date ? -1 : 1)
    },
    allDates() {
      return [...new Set(this.allRecords.map(r => r.date))].sort((a, b) => a > b ? -1 : 1)
    },
    recordMap() {
      const map = {}
      for (const r of store.records) {
        if (!map[r.date]) map[r.date] = r
      }
      return map
    },
    recordsByDate() {
      const map = {}
      for (const r of this.allRecords) {
        if (!map[r.date]) map[r.date] = []
        map[r.date].push(r)
      }
      return map
    },
    calendarMonths() {
      const now = new Date()
      // 기본 12개월 전부터 표시, 더 오래된 기록이 있으면 그 월까지 확장
      let ey = now.getFullYear(), em = now.getMonth() + 1 - 11
      while (em < 1) { em += 12; ey-- }
      if (store.records.length) {
        const dates = store.records.map(r => r.date).sort()
        const [ry, rm] = dates[0].split('-').map(Number)
        if (ry < ey || (ry === ey && rm < em)) { ey = ry; em = rm }
      }
      const months = []
      let y = now.getFullYear(), m = now.getMonth() + 1
      while (y > ey || (y === ey && m >= em)) {
        months.push({ year: y, month: m })
        m--; if (m < 1) { m = 12; y-- }
      }
      return months.map(({ year, month }) => {
        const mm = String(month).padStart(2, '0')
        const firstDay = new Date(year, month - 1, 1).getDay()
        const lastDate = new Date(year, month, 0).getDate()
        const cells = Array(firstDay).fill(null)
        for (let d = 1; d <= lastDate; d++) {
          cells.push({ day: d, dateStr: `${year}-${mm}-${String(d).padStart(2,'0')}` })
        }
        while (cells.length % 7 !== 0) cells.push(null)
        return { key: `${year}-${mm}`, label: `${year}년 ${month}월`, cells }
      })
    },
    listMonths() {
      if (!store.records.length) return []
      const dates = store.records.map(r => r.date).sort()
      const [ey, em] = dates[0].split('-').map(Number)
      const now = new Date()
      const months = []
      let y = now.getFullYear(), m = now.getMonth() + 1
      while (y > ey || (y === ey && m >= em)) {
        months.push({ year: y, month: m })
        m--; if (m < 1) { m = 12; y-- }
      }
      return months.map(({ year, month }) => {
        const key = `${year}-${String(month).padStart(2,'0')}`
        const monthDates = this.allDates.filter(d => d.startsWith(key))
        if (!monthDates.length) return null
        return {
          key,
          label: `${year}년 ${month}월`,
          dateGroups: monthDates.map(dateStr => {
            const d = new Date(dateStr)
            return { dateStr, dow: DOW[d.getDay()], day: d.getDate(), records: this.recordsByDate[dateStr] || [] }
          }),
        }
      }).filter(Boolean)
    },
    selectedDateRecords() {
      return this.selectedDate ? (this.recordsByDate[this.selectedDate] || []) : []
    },
    selectedDateLabel() {
      if (!this.selectedDate) return ''
      const d = new Date(this.selectedDate)
      return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`
    },
    hasPrevDate() {
      return this.allDates.indexOf(this.selectedDate) < this.allDates.length - 1
    },
    hasNextDate() {
      return this.allDates.indexOf(this.selectedDate) > 0
    },
  },
  methods: {
    setMainTab(tab) {
      this.mainTab = tab
      this.selectedDate = null
    },
    selectDate(dateStr) {
      this.selectedDate = dateStr
    },
    prevDate() {
      const idx = this.allDates.indexOf(this.selectedDate)
      if (idx < this.allDates.length - 1) this.selectedDate = this.allDates[idx + 1]
    },
    nextDate() {
      const idx = this.allDates.indexOf(this.selectedDate)
      if (idx > 0) this.selectedDate = this.allDates[idx - 1]
    },
    thumbStyle(record) {
      if (record.thumbnail) return { backgroundImage: `url(${record.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      return { background: record.gradient || 'var(--nm-s1)' }
    },
  },
}
</script>

<style scoped>
.timebridge { background: var(--nm-bg); min-height: 100%; }

/* ─── Sticky Header ─────────────────────────── */
.tb-header {
  position: sticky; top: 0; z-index: 20;
  background: var(--nm-bg);
  box-shadow: 0 4px 16px rgba(195,201,212,0.55);
  flex-shrink: 0;
}

.tb-title-row {
  padding: 48px 20px 0;
}
.tb-title {
  font-size: 32px; font-weight: 700;
  color: var(--text); letter-spacing: -1px;
  line-height: 1.1;
}

/* ─── 메인 탭 (언더라인 스타일) ──────────────── */
.tb-main-tabs {
  display: flex; gap: 20px;
  padding: 14px 20px 0;
  border-bottom: 1.5px solid var(--nm-s1);
}
.tb-main-tab {
  border: none; background: none; padding: 0 0 12px;
  font-size: 14px; font-weight: 600; font-family: inherit;
  color: var(--text-sub); letter-spacing: -0.2px;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  margin-bottom: -1.5px;
}
.tb-main-tab.active {
  color: var(--text);
  border-bottom-color: var(--accent);
}

/* ─── 서브 행 ────────────────────────────────── */
.tb-sub-row {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
}

.tb-view-tabs {
  display: flex; gap: 6px;
}
.tb-view-tab {
  border: none; background: var(--nm-bg);
  box-shadow: var(--nm-out-sm);
  border-radius: 20px;
  padding: 7px 16px;
  font-size: 13px; font-weight: 600; font-family: inherit;
  color: var(--text-sub);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  letter-spacing: -0.2px;
  transition: box-shadow 0.18s, color 0.18s;
}
.tb-view-tab.active {
  box-shadow: var(--nm-in-sm);
  color: var(--accent);
}

/* ─── 날짜 내비 ──────────────────────────────── */
.tb-date-nav {
  display: flex; align-items: center; gap: 8px;
}
.tb-nav-btn {
  width: 30px; height: 30px; border-radius: 50%;
  border: none; background: var(--nm-bg);
  box-shadow: var(--nm-out-sm);
  color: var(--text-sub);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: box-shadow 0.18s;
}
.tb-nav-btn:active { box-shadow: var(--nm-in-sm); }
.tb-nav-btn:disabled { opacity: 0.35; cursor: default; }
.tb-nav-date {
  font-size: 13px; font-weight: 600;
  color: var(--text); letter-spacing: -0.2px;
  white-space: nowrap;
}

/* ─── 요일 헤더 ──────────────────────────────── */
.tb-week-header {
  display: grid; grid-template-columns: repeat(7, 1fr);
  padding: 8px 0 6px;
}
.tb-week-day {
  text-align: center;
  font-size: 11px; font-weight: 600;
  color: var(--text-sub); letter-spacing: 0;
}
.tb-week-header span:first-child { color: #e05c5c; }
.tb-week-header span:last-child { color: var(--accent); }

/* ─── 공통 콘텐츠 영역 (스크롤은 외부 .page-view 담당) ── */
.tb-scroll {
  padding-bottom: env(safe-area-inset-bottom);
}

/* ─── 빈 상태 ────────────────────────────────── */
.tb-empty {
  display: flex; flex-direction: column;
  align-items: center; padding-top: 80px; gap: 12px;
}
.tb-empty-icon {
  width: 64px; height: 64px;
  background: var(--nm-bg);
  box-shadow: var(--nm-out);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-sub);
}
.tb-empty-title { font-size: 17px; font-weight: 600; color: var(--text); letter-spacing: -0.3px; }
.tb-empty-desc { font-size: 14px; color: var(--text-sub); }

/* ─── 캘린더 뷰 ──────────────────────────────── */
.cal-month-block { padding-bottom: 28px; }
.cal-month-label {
  font-size: 14px; font-weight: 600;
  color: var(--text-sub); letter-spacing: -0.1px;
  padding: 20px 20px 8px;
}
.cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr);
  gap: 1px; background: var(--nm-s1);
  margin: 0 16px; border-radius: 16px; overflow: hidden;
  box-shadow: var(--nm-out);
}
.cal-cell {
  aspect-ratio: 1; position: relative;
  background: var(--nm-bg); overflow: hidden;
  cursor: default;
}
.cal-cell.empty { background: var(--nm-bg); opacity: 0.45; }
.cal-cell.has-record { cursor: pointer; }
.cal-cell.has-record:active { opacity: 0.82; }
.cal-thumb {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
}
.cal-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.22);
}
.cal-day-num {
  position: absolute; top: 6px; left: 0; right: 0;
  text-align: center;
  font-size: 11px; font-weight: 500;
  color: var(--text-sub); z-index: 1;
}
.cal-cell.has-record .cal-day-num { color: rgba(255,255,255,0.92); font-weight: 600; }
.cal-cell.is-sun .cal-day-num { color: #e05c5c; }
.cal-cell.has-record.is-sun .cal-day-num { color: rgba(255,255,255,0.92); }
.cal-cell.is-sat .cal-day-num { color: var(--accent); }
.cal-cell.has-record.is-sat .cal-day-num { color: rgba(255,255,255,0.92); }
.cal-cell.today::after {
  content: ''; position: absolute; inset: 3px;
  border: 2px solid var(--accent); border-radius: 6px;
  z-index: 2; pointer-events: none;
}
.cal-cell.has-record.today::after { border-color: rgba(255,255,255,0.7); }

/* ─── 리스트 뷰 ──────────────────────────────── */
.list-month-block { padding-bottom: 12px; }
.list-month-label {
  font-size: 20px; font-weight: 700;
  color: var(--text); letter-spacing: -0.5px;
  padding: 24px 20px 8px;
}
.list-day-row {
  display: flex; align-items: flex-start;
  padding: 10px 20px;
  gap: 14px; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.list-day-row:active { opacity: 0.7; }
.list-day-left {
  display: flex; flex-direction: column;
  align-items: center; flex-shrink: 0;
  width: 36px; padding-top: 4px;
}
.list-dow {
  font-size: 11px; font-weight: 500;
  color: var(--text-sub); letter-spacing: 0;
  margin-bottom: 2px;
}
.list-day-num {
  font-size: 22px; font-weight: 700;
  color: var(--text); letter-spacing: -0.5px;
  line-height: 1;
}
.list-day-records {
  flex: 1; display: flex; flex-direction: column; gap: 8px;
}
.list-record-item {
  display: flex; gap: 10px; align-items: flex-start;
  background: var(--nm-bg);
  box-shadow: var(--nm-out-sm);
  border-radius: 14px; padding: 10px; overflow: hidden;
}
.list-record-thumb {
  width: 56px; height: 56px; border-radius: 10px;
  flex-shrink: 0; background-size: cover; background-position: center;
}
.list-record-info { flex: 1; min-width: 0; }
.list-record-meta {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 4px;
}
.list-record-time {
  font-size: 11px; font-weight: 500; color: var(--text-sub);
}
.list-record-location {
  font-size: 11px; color: var(--text-sub);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.list-record-text {
  font-size: 13px; font-weight: 400; color: var(--text);
  line-height: 1.5; letter-spacing: -0.1px;
  display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ─── 일별 상세 뷰 ───────────────────────────── */
.detail-card-outer {
  margin: 20px 16px 0;
  border-radius: 20px;
  box-shadow: var(--nm-out);
}
.detail-card {
  border-radius: 20px; overflow: hidden;
  background: var(--nm-bg);
}
.detail-photo-wrap { width: 100%; overflow: hidden; }
.detail-photo-img {
  width: 100%; display: block;
  object-fit: cover; aspect-ratio: 4 / 3;
}
.detail-photo-gradient {
  width: 100%; aspect-ratio: 4 / 3;
}
.detail-body { padding: 16px 18px 20px; }
.detail-meta {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 10px;
}
.detail-weather { font-size: 16px; flex-shrink: 0; }
.detail-time { font-size: 13px; font-weight: 500; color: var(--text); }
.detail-pin { color: var(--text-sub); flex-shrink: 0; }
.detail-location {
  font-size: 13px; font-weight: 500; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.detail-text {
  font-size: 15px; font-weight: 400; color: var(--text);
  line-height: 1.65; letter-spacing: -0.2px; margin-bottom: 14px;
}
.detail-tags {
  display: flex; flex-wrap: wrap; gap: 7px;
}
.detail-tag {
  font-size: 12px; font-weight: 500;
  padding: 5px 11px; border-radius: 20px;
  background: var(--nm-bg);
}
.detail-tag-emotion { box-shadow: var(--nm-out-sm); color: var(--text); }
.detail-tag-category { box-shadow: var(--nm-out-sm); color: var(--accent); }

/* ─── Moment Track ───────────────────────────── */
.moment-coming-soon {
  display: flex; flex-direction: column;
  align-items: center; padding-top: 100px; gap: 14px;
}
.moment-icon {
  width: 72px; height: 72px;
  background: var(--nm-bg); box-shadow: var(--nm-in);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--accent);
}
.moment-title {
  font-size: 20px; font-weight: 700;
  color: var(--text); letter-spacing: -0.4px;
}
.moment-desc {
  font-size: 14px; color: var(--text-sub);
  letter-spacing: -0.1px; line-height: 1.65;
  text-align: center;
}
</style>
