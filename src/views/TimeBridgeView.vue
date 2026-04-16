<template>
  <div class="timebridge">

    <!-- ─── Sticky Header ──────────────────────── -->
    <div class="tb-header">
      <!-- 타이틀 -->
      <div class="tb-title-row">
        <h1 class="tb-title">타임브릿지</h1>
        <div class="tb-header-icons">
          <button class="tb-icon-btn" aria-label="알림">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
          <button class="tb-icon-btn" aria-label="검색" @click="$router.push({ path: '/my', query: { tab: 'tag_album' } })">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 메인 탭 -->
      <div class="tb-main-tabs">
        <button
          class="tb-main-tab"
          :class="{ active: mainTab === 'moment_track' }"
          @click="setMainTab('moment_track')"
        >모먼트 트랙</button>
        <button
          class="tb-main-tab"
          :class="{ active: mainTab === 'record_archive' }"
          @click="setMainTab('record_archive')"
        >기록함</button>
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
          <button class="tb-nav-date-btn" @click="openDatePicker">
            <span class="tb-nav-date">{{ selectedDateLabel }}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px;opacity:0.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
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
              'in-journey': cell && !!journeyDateMap[cell.dateStr],
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
              <span v-if="journeyDateMap[cell.dateStr] && recordMap[cell.dateStr]" class="cal-journey-icon">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <defs>
                    <linearGradient id="cal-journey-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#146ef5"/>
                      <stop offset="100%" stop-color="#8B5CF6"/>
                    </linearGradient>
                  </defs>
                  <path d="M9 3h6v3H9z" stroke="url(#cal-journey-grad)"/>
                  <rect x="3" y="6" width="18" height="13" rx="2" stroke="url(#cal-journey-grad)"/>
                  <line x1="3" y1="11" x2="21" y2="11" stroke="url(#cal-journey-grad)" stroke-width="1.5"/>
                  <circle cx="8" cy="21" r="1.2" stroke="url(#cal-journey-grad)" stroke-width="1.5"/>
                  <circle cx="16" cy="21" r="1.2" stroke="url(#cal-journey-grad)" stroke-width="1.5"/>
                </svg>
              </span>
            </template>
          </div>
        </div>

        <!-- 감정 흐름 그래프 -->
        <div
          v-if="emotionChartMap[mg.key] && emotionChartMap[mg.key].pts.length >= 2 && mg.key < todayStr.slice(0, 7)"
          class="emotion-chart-wrap"
        >
          <p class="emotion-chart-label">감정 흐름</p>
          <svg class="emotion-chart-svg" viewBox="0 0 320 115" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient :id="`ec-lg-${mg.key}`" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                <stop offset="0%" stop-color="#146ef5"/>
                <stop offset="100%" stop-color="#8B5CF6"/>
              </linearGradient>
              <linearGradient :id="`ec-fg-${mg.key}`" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0%" stop-color="#146ef5" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/>
              </linearGradient>
            </defs>

            <!-- Y축 레이블 -->
            <text x="2" y="20" font-size="8.5" fill="#c8c8d8" font-family="system-ui,sans-serif" dominant-baseline="middle">좋음</text>
            <text x="2" y="85" font-size="8.5" fill="#c8c8d8" font-family="system-ui,sans-serif" dominant-baseline="middle">나쁨</text>

            <!-- Y축 기준선 (상단·하단 경계) -->
            <line x1="28" y1="16" x2="308" y2="16" stroke="#ebebf0" stroke-width="0.8"/>
            <line x1="28" :y1="emotionChartMap[mg.key].chartBottom" x2="308" :y2="emotionChartMap[mg.key].chartBottom" stroke="#ebebf0" stroke-width="0.8"/>

            <!-- 중립선 (점선) -->
            <line
              x1="28" :y1="emotionChartMap[mg.key].neutralY"
              x2="308" :y2="emotionChartMap[mg.key].neutralY"
              stroke="#dcdce8" stroke-width="1" stroke-dasharray="4 3"
            />
            <text x="310" :y="emotionChartMap[mg.key].neutralY" font-size="7.5" fill="#c8c8d8" font-family="system-ui,sans-serif" dominant-baseline="middle">중립</text>

            <!-- 채우기 영역 -->
            <path :d="emotionChartMap[mg.key].fillPath" :fill="`url(#ec-fg-${mg.key})`"/>

            <!-- 감정 라인 -->
            <path
              :d="emotionChartMap[mg.key].linePath"
              fill="none"
              :stroke="`url(#ec-lg-${mg.key})`"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 날짜별 점 (탭 가능) -->
            <g
              v-for="pt in emotionChartMap[mg.key].pts"
              :key="pt.dateStr"
              @click.stop="selectDate(pt.dateStr)"
              style="cursor:pointer"
            >
              <circle :cx="pt.x" :cy="pt.y" r="11" fill="transparent"/>
              <circle
                :cx="pt.x" :cy="pt.y" r="3.5"
                :fill="`url(#ec-lg-${mg.key})`"
                stroke="white" stroke-width="1.8"
              />
            </g>

            <!-- X축 고정 레이블: 1, 10, 20, 말일 -->
            <text
              v-for="lbl in emotionChartMap[mg.key].xLabels"
              :key="lbl.day"
              :x="lbl.x" y="103"
              text-anchor="middle" font-size="9"
              fill="#c0c0cc" font-family="system-ui,sans-serif"
            >{{ lbl.day }}</text>
          </svg>
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
        <template v-for="dg in mg.dateGroups">
          <!-- 여정 카드 (여정 첫날에만 한 번 렌더링, 전체 기록 포함) -->
          <div
            v-if="journeyDateMap[dg.dateStr] && journeyDateMap[dg.dateStr].startDate === dg.dateStr"
            :key="'j-' + dg.dateStr"
            class="journey-card"
          >
            <div class="journey-card-head">
              <div class="journey-card-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <defs>
                    <linearGradient id="journey-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#146ef5"/>
                      <stop offset="100%" stop-color="#8B5CF6"/>
                    </linearGradient>
                  </defs>
                  <path d="M9 3h6v3H9z" stroke="url(#journey-grad)"/>
                  <rect x="3" y="6" width="18" height="13" rx="2" stroke="url(#journey-grad)"/>
                  <line x1="3" y1="11" x2="21" y2="11" stroke="url(#journey-grad)" stroke-width="1.5"/>
                  <line x1="3" y1="15" x2="21" y2="15" stroke="url(#journey-grad)" stroke-width="1.5"/>
                  <circle cx="8" cy="21" r="1.2" stroke="url(#journey-grad)" stroke-width="1.5"/>
                  <circle cx="16" cy="21" r="1.2" stroke="url(#journey-grad)" stroke-width="1.5"/>
                </svg>
              </div>
              <div class="journey-card-info">
                <span class="journey-card-title">{{ journeyDateMap[dg.dateStr].label }} 여정</span>
                <span class="journey-card-dates">{{ journeyDateLabel(journeyDateMap[dg.dateStr]) }}</span>
              </div>
            </div>
            <div class="journey-card-body">
              <div
                v-for="jDateStr in journeyDateMap[dg.dateStr].dates"
                :key="jDateStr"
                class="journey-day-group"
              >
                <div class="journey-day-label">{{ formatJourneyDate(jDateStr) }}</div>
                <div class="journey-day-records">
                  <div
                    v-for="r in journeyRecordsForDate(journeyDateMap[dg.dateStr], jDateStr)"
                    :key="r.id"
                    class="journey-record-row"
                    @click="selectDate(jDateStr)"
                  >
                    <div class="journey-record-thumb" :style="thumbStyle(r)" />
                    <div class="journey-record-info">
                      <div class="journey-record-meta">
                        <span>{{ r.time }}</span>
                        <span>{{ displayLocation(r.location) }}</span>
                      </div>
                      <p class="journey-record-text">{{ r.aiRecord }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 일반 날짜 행 (여정 날짜는 비여정 기록만, 없으면 숨김) -->
          <div
            v-else-if="!journeyDateMap[dg.dateStr] || nonJourneyRecords(dg.dateStr, journeyDateMap[dg.dateStr]).length > 0"
            :key="dg.dateStr"
            class="list-day-row"
            @click="selectDate(dg.dateStr)"
          >
            <div class="list-day-left">
              <span class="list-dow">{{ dg.dow }}</span>
              <span class="list-day-num">{{ dg.day }}</span>
            </div>
            <div class="list-day-records">
              <div
                v-for="r in (journeyDateMap[dg.dateStr] ? nonJourneyRecords(dg.dateStr, journeyDateMap[dg.dateStr]) : dg.records)"
                :key="r.id"
                class="list-record-item"
              >
                <div class="list-record-thumb" :style="thumbStyle(r)" />
                <div class="list-record-info">
                  <div class="list-record-meta">
                    <span class="list-record-time">{{ r.time }}</span>
                    <span class="list-record-location">{{ displayLocation(r.location) }}</span>
                  </div>
                  <p class="list-record-text">{{ r.aiRecord }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
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
            <div v-else class="detail-photo-gradient" :style="{ background: r.gradient || '#f0f0f0' }" />
            <button class="detail-btn-share" @click.stop="store.sharingRecord = r" aria-label="공유하기">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
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
    <div v-else-if="mainTab === 'moment_track'" class="moment-track-wrap">

      <!-- 지도 영역 (sticky) -->
      <div ref="momentMapSection" class="moment-map-section" :style="{ top: headerHeight + 'px' }">
        <p class="moment-tagline">나의 기록으로 지도를 따라 다시 여행해보세요</p>
        <div class="moment-map-head">
          <span class="moment-map-title">내 지도</span>
          <span class="moment-place-count">{{ mapRecords.length }}개 장소</span>
        </div>
        <div ref="naverMapDiv" class="moment-naver-map">
          <div v-if="mapLoading" class="moment-map-loading">
            <div class="moment-map-spinner" />
            <span>지도 불러오는 중...</span>
          </div>
        </div>
      </div>

      <!-- 기록 카드 목록 -->
      <div class="moment-cards-list">
        <div v-if="!momentTrackRecords.length" class="moment-empty">
          <p class="moment-empty-text">기록이 없어요</p>
        </div>
        <div
          v-for="r in momentTrackRecords"
          :key="r.id"
          class="moment-card-outer"
          :class="{ 'is-active': activeMarkerId === r.id }"
          :data-record-id="r.id"
          @click="selectRecord(r)"
        >
          <div class="moment-card">
            <div class="moment-card-photo-wrap">
              <img v-if="r.thumbnail" :src="r.thumbnail" class="moment-card-photo" />
              <div v-else class="moment-card-gradient" :style="{ background: r.gradient || '#f0f0f0' }" />
            </div>
            <div class="moment-card-body">
              <div class="moment-card-meta">
                <span class="moment-card-weather">{{ r.weather && r.weather.emoji }}</span>
                <span class="moment-card-time">{{ r.time }}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" class="moment-card-pin">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span class="moment-card-location">{{ r.location }}</span>
              </div>
              <p class="moment-card-text">{{ r.aiRecord }}</p>
              <div class="moment-card-tags">
                <span v-for="tag in (r.categoryTags || []).slice(0, 3)" :key="tag" class="moment-card-tag">#{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
        <div style="height: 80px" />
      </div>
    </div>

    <!-- ─── 날짜 피커 (v-if 체인 바깥) ──────────── -->
    <transition name="picker-fade">
      <div v-if="showDatePicker" class="picker-overlay" @click.self="closeDatePicker">
        <transition name="picker-slide">
          <div v-if="showDatePicker" class="picker-sheet">
            <div class="picker-handle" />
            <div class="picker-header">
              <button class="picker-month-btn" @click="pickerPrevMonth">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <span class="picker-month-label">{{ pickerMonthLabel }}</span>
              <button class="picker-month-btn" @click="pickerNextMonth" :disabled="!pickerCanGoNext">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
            <div class="picker-week-row">
              <span v-for="d in ['일','월','화','수','목','금','토']" :key="d" class="picker-week-day">{{ d }}</span>
            </div>
            <div class="picker-grid">
              <button
                v-for="(cell, i) in pickerCells"
                :key="i"
                class="picker-cell"
                :class="{
                  empty: !cell,
                  'has-record': cell && !!recordMap[cell.dateStr],
                  'is-selected': cell && cell.dateStr === selectedDate,
                  'is-today': cell && cell.dateStr === todayStr,
                  'is-sun': i % 7 === 0,
                  'is-sat': i % 7 === 6,
                }"
                :disabled="!cell || !recordMap[cell.dateStr]"
                @click="cell && pickDate(cell.dateStr)"
              >
                <span v-if="cell">{{ cell.day }}</span>
              </button>
            </div>
            <button class="picker-close-btn" @click="closeDatePicker">닫기</button>
          </div>
        </transition>
      </div>
    </transition>

  </div>
</template>

<script>
import { store } from '../store'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

// 감정 태그 → 점수 (0~100) 매핑
// 실제 store 데이터의 태그 레이블 기준 (명사형 + 형용사형 모두 포함)
const EMOTION_SCORE = {
  // ── 매우 긍정 (85~100) ──
  '성취': 95, '완주': 93, '행복': 91, '축하': 90, '설렘': 89,
  '신남': 88, '즐거움': 87, '사랑스러움': 86, '귀여움': 85,
  // 형용사형
  '행복한': 91, '즐거운': 87, '설레는': 89, '뿌듯한': 88,
  '사랑스러운': 86, '신나는': 88, '기쁜': 90, '감사한': 83,

  // ── 긍정 (65~84) ──
  '활력': 82, '도전': 80, '열정': 79, '봄나들이': 78, '함께': 76,
  '자유': 76, '상쾌함': 75, '반가움': 74, '신기함': 72, '호기심': 71,
  '여유': 70, '따뜻함': 70, '장난': 68, '고요함': 67, '감성': 65,
  '봄': 68, '봄하늘': 68, '벚꽃': 70, '맑음': 67,
  '아이와함께': 78, '엄마와아이': 75, '아빠와아이': 75, '조부모': 68,
  // 형용사형
  '활기찬': 82, '편안한': 72, '포근한': 70, '따뜻한': 70,
  '여유로운': 68, '상쾌한': 75, '평온한': 65,

  // ── 중립/활동 (45~64) ──
  '사색': 60, '집중': 58, '협업': 55, '독서': 55, '자연': 58,
  '모임': 60, '카페': 58, '야경': 60, '산책': 62, '아침': 52,
  '저녁': 52, '주말': 65, '외출': 55, '귀가': 58, '쇼핑': 55,
  '놀이': 65, '놀이터': 65, '농촌': 55, '전통': 52, '단체': 52,
  '바다': 68, '북한산': 60, '달리기': 62, '회식': 60, '식사': 55,
  // 형용사형
  '차분한': 55, '담담한': 50,

  // ── 약간 부정 (25~44) ──
  '바쁨': 38, '출퇴근': 38, '업무': 40, '등원': 42,
  '졸림': 32, '이른아침': 42,
  // 형용사형
  '피곤한': 34, '그리운': 38, '걱정되는': 35, '쓸쓸한': 32,
  '지친': 30, '외로운': 28, '수줍은': 42,

  // ── 부정 (0~24) ──
  '슬픈': 22, '힘든': 20, '우울한': 18, '속상한': 15,
}

export default {
  name: 'TimeBridgeView',
  data() {
    return {
      store,
      mainTab: 'moment_track',
      viewMode: 'calendar',
      selectedDate: null,
      // 날짜 피커
      showDatePicker: false,
      pickerYear: new Date().getFullYear(),
      pickerMonth: new Date().getMonth() + 1,
      // Moment Track
      naverMap: null,
      naverMarkers: {},
      activeMarkerId: null,
      mapLoading: false,
      headerHeight: 140,
      _scrollHandler: null,
    }
  },
  mounted() {
    const date = this.$route.query.date
    if (date) {
      this.mainTab = 'record_archive'
      this.viewMode = 'calendar'
      this.selectedDate = date
    } else if (this.mainTab === 'moment_track') {
      // 초기값이 moment_track이면 watch가 발동하지 않으므로 직접 초기화
      this.$nextTick(() => this.initMomentTrack())
    }
  },
  watch: {
    '$route.query.date'(date) {
      if (date) {
        this.mainTab = 'record_archive'
        this.viewMode = 'calendar'
        this.selectedDate = date
      }
    },
    mainTab(val) {
      if (val === 'moment_track') {
        this.$nextTick(() => this.initMomentTrack())
      } else {
        this.removeScrollSync()
        if (this.naverMap && window.naver) {
          window.naver.maps.Event.clearListeners(this.naverMap)
        }
        this.naverMap = null
        this.naverMarkers = {}
      }
    },
  },
  computed: {
    todayStr() {
      const t = new Date()
      return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
    },
    allRecords() {
      return [...store.records].sort((a, b) => a.date > b.date ? -1 : 1)
    },
    // 모먼트 트랙 카드 정렬: 사진 수 많은 지역 → 지역 내 최근 날짜 순
    momentTrackRecords() {
      const records = [...store.records]
      const locationMap = {}
      for (const r of records) {
        const key = r.location || '알 수 없는 위치'
        if (!locationMap[key]) locationMap[key] = []
        locationMap[key].push(r)
      }
      return Object.entries(locationMap)
        .sort((a, b) => b[1].length - a[1].length)
        .flatMap(([, group]) => group.sort((a, b) => a.date > b.date ? -1 : 1))
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
      // 2026년 2월 ~ 이번 달까지 고정
      const ey = 2026, em = 2
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
    pickerMonthLabel() {
      return `${this.pickerYear}년 ${this.pickerMonth}월`
    },
    pickerCanGoNext() {
      const now = new Date()
      return !(this.pickerYear === now.getFullYear() && this.pickerMonth === now.getMonth() + 1)
    },
    pickerCells() {
      const { pickerYear: y, pickerMonth: m } = this
      const mm = String(m).padStart(2, '0')
      const firstDay = new Date(y, m - 1, 1).getDay()
      const lastDate = new Date(y, m, 0).getDate()
      const cells = Array(firstDay).fill(null)
      for (let d = 1; d <= lastDate; d++) {
        cells.push({ day: d, dateStr: `${y}-${mm}-${String(d).padStart(2, '0')}` })
      }
      while (cells.length % 7 !== 0) cells.push(null)
      return cells
    },
    mapRecords() {
      return this.allRecords.filter(r => r.lat && r.lng)
    },

    // ── 특별한 여정 감지 ─────────────────────────
    journeys() {
      const sorted = [...this.allDates].sort()
      const dateAreas = sorted.map(dateStr => {
        const recs = this.recordsByDate[dateStr] || []
        const areas = recs.map(r => this.extractTripArea(r.location)).filter(Boolean)
        if (!areas.length) return { dateStr, area: null }
        const freq = {}
        areas.forEach(a => { freq[a] = (freq[a] || 0) + 1 })
        const topArea = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
        const isTrip = areas.length > 0
        return { dateStr, area: isTrip ? topArea : null }
      })
      const journeys = []
      let current = null
      for (const { dateStr, area } of dateAreas) {
        if (area) {
          if (current && current.area === area) {
            current.dates.push(dateStr)
            current.endDate = dateStr
          } else {
            if (current) journeys.push(current)
            current = {
              id: 'journey-' + dateStr,
              area,
              label: area.replace(/시$/, '').replace(/군$/, ''),
              startDate: dateStr,
              endDate: dateStr,
              dates: [dateStr],
            }
          }
        } else {
          if (current) { journeys.push(current); current = null }
        }
      }
      if (current) journeys.push(current)
      return journeys
    },
    journeyDateMap() {
      const map = {}
      for (const j of this.journeys) {
        for (const d of j.dates) map[d] = j
      }
      return map
    },

    // ── 감정 그래프 데이터 (월별 사전 계산) ─────────────────────────
    emotionChartMap() {
      const W = 320, H = 115
      const PL = 28, PR = 12, PT = 16, PB = 30  // PB: X축 레이블 공간
      const uw = W - PL - PR   // 280
      const uh = H - PT - PB  // 69  (chart area height)
      const chartBottom = H - PB  // 85
      const neutralY = PT + uh * 0.5  // 중립선 Y (score=50)

      const map = {}
      for (const mg of this.calendarMonths) {
        const [year, month] = mg.key.split('-').map(Number)
        const daysInMonth = new Date(year, month, 0).getDate()
        const pts = []

        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${mg.key}-${String(d).padStart(2, '0')}`
          const records = this.recordsByDate[dateStr]
          if (!records || !records.length) continue
          let total = 0, count = 0
          for (const r of records) {
            for (const tag of (r.emotionTags || [])) {
              const label = (tag.label || '').trim()
              if (label in EMOTION_SCORE) {
                total += EMOTION_SCORE[label]
                count++
              }
              // 매핑 없는 태그는 점수 계산에서 제외
            }
          }
          if (!count) continue  // 매핑된 감정 태그가 없는 날은 그래프에서 제외
          const score = total / count
          const y = PT + (1 - score / 100) * uh
          // x는 나중에 인덱스 기반 등간격으로 재계산
          pts.push({ day: d, score: Math.round(score), x: 0, y, dateStr })
        }

        // 점 X 위치: 인덱스 기반 등간격 (날짜 간격 무관)
        pts.forEach((pt, i) => {
          pt.x = pts.length === 1
            ? PL + uw / 2
            : PL + (i / (pts.length - 1)) * uw
        })

        let linePath = '', fillPath = ''
        if (pts.length >= 2) {
          linePath = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
          for (let i = 1; i < pts.length; i++) {
            const p0 = pts[i - 1], p1 = pts[i]
            const dx = (p1.x - p0.x) * 0.45
            linePath += ` C ${(p0.x + dx).toFixed(1)} ${p0.y.toFixed(1)},${(p1.x - dx).toFixed(1)} ${p1.y.toFixed(1)},${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
          }
          fillPath = linePath
            + ` L ${pts[pts.length - 1].x.toFixed(1)} ${H - PB}`
            + ` L ${pts[0].x.toFixed(1)} ${H - PB} Z`
        }

        // X축 고정 레이블: 1일, 10일, 20일, 말일
        const xLabels = [1, 10, 20, daysInMonth]
          .filter((d, i, arr) => arr.indexOf(d) === i)  // 중복 제거 (말일=20이면 한 번만)
          .map(d => ({
            day: d,
            x: PL + ((d - 1) / Math.max(daysInMonth - 1, 1)) * uw,
          }))

        map[mg.key] = { pts, linePath, fillPath, neutralY, chartBottom, xLabels }
      }
      return map
    },
  },
  beforeDestroy() {
    this.removeScrollSync()
    if (this.naverMap && window.naver) {
      window.naver.maps.Event.clearListeners(this.naverMap)
    }
    this.naverMap = null
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
    openDatePicker() {
      const d = this.selectedDate ? new Date(this.selectedDate) : new Date()
      this.pickerYear = d.getFullYear()
      this.pickerMonth = d.getMonth() + 1
      this.showDatePicker = true
    },
    closeDatePicker() {
      this.showDatePicker = false
    },
    pickerPrevMonth() {
      if (this.pickerMonth === 1) { this.pickerYear--; this.pickerMonth = 12 }
      else this.pickerMonth--
    },
    pickerNextMonth() {
      if (!this.pickerCanGoNext) return
      if (this.pickerMonth === 12) { this.pickerYear++; this.pickerMonth = 1 }
      else this.pickerMonth++
    },
    pickDate(dateStr) {
      if (!this.recordMap[dateStr]) return
      this.selectedDate = dateStr
      this.closeDatePicker()
    },
    // ── 여정 헬퍼 ────────────────────────────────
    extractTripArea(location) {
      if (!location) return null
      const addr = location.includes(' · ') ? location.split(' · ')[1] : location
      // 시/군 레벨 추출 (구 제외)
      const m = addr.match(/^([가-힣]+(?:시|군))(?:\s|$)/)
      if (!m) return null
      const city = m[1]
      if (city.endsWith('구')) return null
      // homeAddress에 포함된 도시면 여정 아님
      const home = store.userInfo && store.userInfo.homeAddress || ''
      if (home && home.includes(city)) return null
      return city
    },
    journeyDateLabel(journey) {
      const fmt = d => {
        const dt = new Date(d)
        return `${dt.getMonth() + 1}월 ${dt.getDate()}일 (${DOW[dt.getDay()]})`
      }
      if (journey.startDate === journey.endDate) return fmt(journey.startDate)
      return `${fmt(journey.startDate)} – ${fmt(journey.endDate)}`
    },
    journeyThumbnail(journey) {
      const recs = this.recordsByDate[journey.startDate] || []
      return recs[0] && recs[0].thumbnail || null
    },
    formatJourneyDate(dateStr) {
      const d = new Date(dateStr)
      return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`
    },
    journeyRecordsForDate(journey, dateStr) {
      return (this.recordsByDate[dateStr] || []).filter(r => this.extractTripArea(r.location) === journey.area)
    },
    nonJourneyRecords(dateStr, journey) {
      return (this.recordsByDate[dateStr] || []).filter(r => this.extractTripArea(r.location) !== journey.area)
    },

    // "건물명 · 주소" 형태면 건물명만, 아니면 전체 반환
    displayLocation(location) {
      if (!location) return ''
      const sep = location.indexOf(' · ')
      return sep !== -1 ? location.slice(0, sep) : location
    },
    thumbStyle(record) {
      if (record.thumbnail) return { backgroundImage: `url(${record.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      return { background: record.gradient || '#f0f0f0' }
    },

    // ── Moment Track ────────────────────────────
    initMomentTrack() {
      // 헤더 높이 측정
      const header = this.$el.querySelector('.tb-header')
      if (header) this.headerHeight = header.offsetHeight

      // Naver Maps SDK 로드
      if (window.naver && window.naver.maps) {
        this.$nextTick(() => this.initNaverMap())
      } else if (!document.getElementById('naver-maps-sdk')) {
        this.mapLoading = true
        const script = document.createElement('script')
        script.id = 'naver-maps-sdk'
        script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=mxxnjmmj8h'
        script.onload = () => { this.mapLoading = false; this.$nextTick(() => this.initNaverMap()) }
        script.onerror = () => { this.mapLoading = false }
        document.head.appendChild(script)
      } else {
        // 이미 로딩 중 — 완료 대기
        const poll = setInterval(() => {
          if (window.naver && window.naver.maps) {
            clearInterval(poll)
            this.$nextTick(() => this.initNaverMap())
          }
        }, 200)
      }

      this.setupScrollSync()
    },

    initNaverMap() {
      if (!this.$refs.naverMapDiv || !window.naver) return
      if (this.naverMap) return  // 이미 초기화됨

      // 첫 번째 카드(momentTrackRecords[0]) 위치를 초기 중심으로
      const firstCard = this.momentTrackRecords.find(r => r.lat && r.lng)
      const center = firstCard
        ? new window.naver.maps.LatLng(firstCard.lat, firstCard.lng)
        : new window.naver.maps.LatLng(37.5665, 126.9780)

      this.naverMap = new window.naver.maps.Map(this.$refs.naverMapDiv, {
        center,
        zoom: 17,
        zoomControl: true,
        zoomControlOptions: { position: window.naver.maps.Position.RIGHT_CENTER },
        scaleControl: false,
        mapDataControl: false,
      })

      this.createMarkers()

      if (firstCard) {
        this.activeMarkerId = firstCard.id
        this.updateActiveMarker()
      }
    },

    buildMarkerContent(record, isActive) {
      const size = isActive ? 58 : 46
      const border = isActive ? '3px solid #146ef5' : '2.5px solid #fff'
      const shadow = isActive
        ? '0 4px 14px rgba(20,110,245,0.55)'
        : '0 2px 7px rgba(0,0,0,0.28)'
      const inner = record.thumbnail
        ? `<img src="${record.thumbnail}" style="width:100%;height:100%;object-fit:cover;display:block" />`
        : `<div style="width:100%;height:100%;background:${record.gradient || '#888'}"></div>`
      return `<div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;border:${border};box-shadow:${shadow};cursor:pointer;">${inner}</div>`
    },

    createMarkers() {
      Object.values(this.naverMarkers).forEach(m => m.setMap(null))
      this.naverMarkers = {}

      for (const record of this.mapRecords) {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(record.lat, record.lng),
          map: this.naverMap,
          icon: {
            content: this.buildMarkerContent(record, false),
            anchor: new window.naver.maps.Point(23, 23),
          },
        })
        this.naverMarkers[record.id] = marker
      }
    },

    updateActiveMarker() {
      Object.entries(this.naverMarkers).forEach(([id, marker]) => {
        const isActive = id === this.activeMarkerId
        const record = this.allRecords.find(r => r.id === id)
        if (record) {
          const size = isActive ? 58 : 46
          marker.setIcon({
            content: this.buildMarkerContent(record, isActive),
            anchor: new window.naver.maps.Point(size / 2, size / 2),
          })
        }
      })
    },

    selectRecord(record) {
      if (!record.lat || !record.lng || !this.naverMap) return
      this.naverMap.panTo(new window.naver.maps.LatLng(record.lat, record.lng))
      this.activeMarkerId = record.id
      this.updateActiveMarker()
    },

    setupScrollSync() {
      this.removeScrollSync()
      const pageView = document.querySelector('.page-view')
      if (!pageView) return
      this._scrollHandler = () => this.onPageScroll()
      pageView.addEventListener('scroll', this._scrollHandler, { passive: true })
    },

    removeScrollSync() {
      if (!this._scrollHandler) return
      const pageView = document.querySelector('.page-view')
      if (pageView) pageView.removeEventListener('scroll', this._scrollHandler)
      this._scrollHandler = null
    },

    onPageScroll() {
      if (this.mainTab !== 'moment_track' || !this.naverMap) return
      const cards = this.$el.querySelectorAll('.moment-card-outer')
      if (!cards.length) return

      const mapSection = this.$refs.momentMapSection
      const threshold = mapSection
        ? mapSection.getBoundingClientRect().bottom + 50
        : 420

      let bestCard = null
      let minDist = Infinity
      cards.forEach(card => {
        const rect = card.getBoundingClientRect()
        const dist = Math.abs(rect.top - threshold)
        if (dist < minDist) { minDist = dist; bestCard = card }
      })

      if (bestCard) {
        const id = bestCard.dataset.recordId
        if (id && id !== this.activeMarkerId) {
          const record = this.allRecords.find(r => r.id === id)
          if (record && record.lat && record.lng) {
            this.naverMap.panTo(new window.naver.maps.LatLng(record.lat, record.lng))
            this.activeMarkerId = id
            this.updateActiveMarker()
          }
        }
      }
    },
  },
}
</script>

<style scoped>
.timebridge { background: var(--bg); min-height: 100%; }

/* ─── Sticky Header ─────────────────────────── */
.tb-header {
  position: sticky; top: 0; z-index: 20;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.tb-title-row {
  padding: 20px 20px 0;
  display: flex; align-items: center;
}
.tb-title {
  font-size: 24px; font-weight: 600;
  color: var(--text); letter-spacing: -0.8px; line-height: 1.04;
}
.tb-header-icons { margin-left: auto; display: flex; gap: 4px; }
.tb-icon-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: none; cursor: pointer;
  color: var(--text-mid); border-radius: var(--radius);
}
.tb-icon-btn:active { background: var(--accent-light); color: var(--accent); }

/* ─── 메인 탭 ───────────────────────────────── */
.tb-main-tabs {
  display: flex; align-items: stretch;
  border-bottom: 1px solid var(--border);
  margin-top: 14px;
}
.tb-main-tab {
  position: relative;
  flex: 1; padding: 10px 0 12px;
  border: none; background: none; font-family: inherit;
  font-size: 14px; font-weight: 600; color: var(--text-sub);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 0.2s; letter-spacing: -0.16px;
}
.tb-main-tab.active { color: var(--text); border-bottom-color: transparent; }
.tb-main-tab.active::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #146ef5 0%, #8B5CF6 100%);
  border-radius: 1px;
}

/* ─── 서브 행 ────────────────────────────────── */
.tb-sub-row {
  display: flex; align-items: center;
  justify-content: space-between; padding: 10px 20px;
}
.tb-view-tabs { display: flex; gap: 6px; }
.tb-view-tab {
  border: 1px solid var(--border); background: var(--bg);
  border-radius: var(--radius-pill);
  padding: 7px 16px; font-size: 13px; font-weight: 600; font-family: inherit;
  color: var(--text-sub); cursor: pointer; -webkit-tap-highlight-color: transparent;
  letter-spacing: -0.16px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.tb-view-tab.active {
  background: linear-gradient(90deg, #146ef5 0%, #8B5CF6 100%);
  border-color: transparent; color: #fff;
}

/* ─── 날짜 내비 ──────────────────────────────── */
.tb-date-nav { display: flex; align-items: center; gap: 8px; }
.tb-nav-btn {
  width: 30px; height: 30px; border-radius: 50%;
  border: 1px solid var(--border); background: var(--bg);
  color: var(--text-sub);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.tb-nav-btn:active { background: #f5f5f5; }
.tb-nav-btn:disabled { opacity: 0.35; cursor: default; }
.tb-nav-date-btn {
  display: flex; align-items: center;
  background: none; border: none; cursor: pointer; padding: 4px 6px;
  border-radius: var(--radius); -webkit-tap-highlight-color: transparent;
}
.tb-nav-date-btn:active { background: var(--accent-light); }
.tb-nav-date {
  font-size: 13px; font-weight: 600;
  color: var(--text); letter-spacing: -0.16px; white-space: nowrap;
}

/* ─── 요일 헤더 ──────────────────────────────── */
.tb-week-header {
  display: grid; grid-template-columns: repeat(7, 1fr); padding: 8px 0 6px;
}
.tb-week-day {
  text-align: center; font-size: 11px; font-weight: 600;
  color: var(--text-sub); letter-spacing: 0.6px; text-transform: uppercase;
}
.tb-week-header span:first-child { color: #ee1d36; }
.tb-week-header span:last-child { color: var(--accent); }

/* ─── 공통 콘텐츠 영역 ──────────────────────── */
.tb-scroll { padding-bottom: env(safe-area-inset-bottom); }

/* ─── 빈 상태 ────────────────────────────────── */
.tb-empty {
  display: flex; flex-direction: column;
  align-items: center; padding-top: 80px; gap: 12px;
}
.tb-empty-icon {
  width: 64px; height: 64px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-sub);
}
.tb-empty-title { font-size: 17px; font-weight: 600; color: var(--text); letter-spacing: -0.16px; }
.tb-empty-desc { font-size: 14px; color: var(--text-sub); }

/* ─── 캘린더 뷰 ──────────────────────────────── */
.cal-month-block { padding-bottom: 28px; }
.cal-month-label {
  font-size: 13px; font-weight: 600; text-transform: uppercase;
  color: var(--text-sub); letter-spacing: 1px; padding: 20px 20px 8px;
}
.cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr);
  gap: 1px; background: var(--border);
  margin: 0 16px; border-radius: var(--radius-lg); overflow: hidden;
  border: 1px solid var(--border); box-shadow: var(--shadow-sm);
}
.cal-cell {
  aspect-ratio: 1; position: relative;
  background: var(--bg); overflow: hidden; cursor: default;
}
.cal-cell.empty { background: var(--bg); opacity: 0.45; }
.cal-cell.has-record { cursor: pointer; }
.cal-cell.has-record:active { opacity: 0.82; }
.cal-thumb {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
}
.cal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.22); }
.cal-day-num {
  position: absolute; top: 6px; left: 0; right: 0;
  text-align: center; font-size: 11px; font-weight: 500;
  color: var(--text-sub); z-index: 1;
}
.cal-cell.has-record .cal-day-num { color: rgba(255,255,255,0.92); font-weight: 600; }
.cal-cell.is-sun .cal-day-num { color: #ee1d36; }
.cal-cell.has-record.is-sun .cal-day-num { color: rgba(255,255,255,0.92); }
.cal-cell.is-sat .cal-day-num { color: var(--accent); }
.cal-cell.has-record.is-sat .cal-day-num { color: rgba(255,255,255,0.92); }
.cal-cell.today::after {
  content: ''; position: absolute; inset: 3px;
  border: 2px solid var(--accent); border-radius: var(--radius);
  z-index: 2; pointer-events: none;
}
.cal-cell.has-record.today::after { border-color: rgba(255,255,255,0.7); }

/* ─── 리스트 뷰 ──────────────────────────────── */
.list-month-block { padding-bottom: 12px; }
.list-month-label {
  font-size: 20px; font-weight: 600;
  color: var(--text); letter-spacing: -0.5px; padding: 24px 20px 8px;
}
.list-day-row {
  display: flex; align-items: flex-start;
  padding: 10px 20px; gap: 14px; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.list-day-row:active { opacity: 0.7; }
.list-day-left {
  display: flex; flex-direction: column;
  align-items: center; flex-shrink: 0;
  width: 28px; padding-top: 4px;
}
.list-dow {
  font-size: 9px; font-weight: 600;
  color: var(--text-sub); letter-spacing: 0.6px; text-transform: uppercase;
  margin-bottom: 2px;
}
.list-day-num {
  font-size: 16px; font-weight: 600;
  color: var(--text); letter-spacing: -0.5px; line-height: 1;
}
.list-day-records { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.list-record-item {
  display: flex; gap: 10px; align-items: flex-start;
  background: var(--bg);
  border: 1px solid var(--border); box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg); padding: 10px; overflow: hidden;
}
.list-record-thumb {
  width: 72px; height: 72px; border-radius: var(--radius);
  flex-shrink: 0; background-size: cover; background-position: center;
}
.list-record-info { flex: 1; min-width: 0; }
.list-record-meta { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
.list-record-time { font-size: 11px; font-weight: 500; color: var(--text-sub); flex-shrink: 0; }
.list-record-location {
  font-size: 11px; color: var(--text-sub);
  word-break: break-word; line-height: 1.4;
}
.list-record-text {
  font-size: 13px; font-weight: 400; color: var(--text);
  line-height: 1.5; letter-spacing: -0.16px;
  display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ─── 여정 카드 ──────────────────────────────── */
.journey-card {
  margin: 12px 20px 4px;
  border: 1px solid rgba(139,92,246,0.25);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.journey-card-head {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(20,110,245,0.07), rgba(139,92,246,0.1));
  border-bottom: 1px solid rgba(139,92,246,0.15);
}
.journey-card-icon-wrap {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(20,110,245,0.1), rgba(139,92,246,0.12));
  border: 1px solid rgba(139,92,246,0.2);
  display: flex; align-items: center; justify-content: center;
}
.journey-card-info { display: flex; flex-direction: column; gap: 3px; }
.journey-card-title {
  font-size: 15px; font-weight: 700; letter-spacing: -0.3px;
  background: linear-gradient(90deg, #146ef5, #8B5CF6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.journey-card-dates { font-size: 11px; color: var(--text-sub); }
.journey-card-body { background: var(--bg); padding: 8px 0 4px; }
.journey-day-group { padding: 6px 16px 10px; }
.journey-day-group + .journey-day-group {
  border-top: 1px solid var(--border); padding-top: 10px;
}
.journey-day-label {
  font-size: 11px; font-weight: 600; color: var(--text-sub);
  letter-spacing: 0.3px; margin-bottom: 8px;
}
.journey-day-records { display: flex; flex-direction: column; gap: 8px; }
.journey-record-row {
  display: flex; gap: 10px; align-items: flex-start;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.journey-record-row:active { opacity: 0.7; }
.journey-record-thumb {
  width: 64px; height: 64px; border-radius: var(--radius);
  flex-shrink: 0; background-size: cover; background-position: center;
  border: 1px solid var(--border);
}
.journey-record-info { flex: 1; min-width: 0; }
.journey-record-meta {
  display: flex; gap: 6px; align-items: center;
  font-size: 10px; color: var(--text-sub); margin-bottom: 4px;
}
.journey-record-text {
  font-size: 12px; color: var(--text); line-height: 1.5; letter-spacing: -0.1px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ─── 캘린더 여정 셀 ─────────────────────────── */
.cal-cell.in-journey .cal-overlay {
  background: linear-gradient(135deg, rgba(20,110,245,0.22), rgba(139,92,246,0.22));
}
.cal-journey-icon {
  position: absolute; bottom: 3px; right: 3px;
  font-size: 9px; line-height: 1; z-index: 2;
}

/* ─── 감정 흐름 그래프 ──────────────────────── */
.emotion-chart-wrap {
  margin: 10px 16px 0;
  background: #f7f7fc;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  padding-top: 12px;
}
.emotion-chart-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
  text-transform: uppercase; color: var(--text-sub);
  padding: 0 16px 4px;
}
.emotion-chart-svg {
  display: block; width: 100%; height: auto;
}

/* ─── 일별 상세 뷰 ───────────────────────────── */
.detail-card-outer {
  margin: 20px 16px 0; border-radius: var(--radius-xl);
  border: 1px solid var(--border); box-shadow: var(--shadow);
}
.detail-card { border-radius: var(--radius-xl); overflow: hidden; background: var(--bg); }
.detail-photo-wrap { width: 100%; overflow: hidden; position: relative; }
.detail-btn-share {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  width: 30px; height: 30px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.38);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  color: rgba(255,255,255,0.9);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.detail-btn-share:active { background: rgba(0,0,0,0.6); }
.detail-photo-img { width: 100%; display: block; object-fit: cover; aspect-ratio: 4 / 3; }
.detail-photo-gradient { width: 100%; aspect-ratio: 4 / 3; }
.detail-body { padding: 16px 18px 20px; }
.detail-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.detail-weather { font-size: 16px; flex-shrink: 0; }
.detail-time { font-size: 13px; font-weight: 500; color: var(--text-mid); }
.detail-pin { color: var(--text-sub); flex-shrink: 0; }
.detail-location {
  font-size: 13px; font-weight: 500; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.detail-text {
  font-size: 15px; font-weight: 400; color: var(--text);
  line-height: 1.60; letter-spacing: -0.16px; margin-bottom: 14px;
}
.detail-tags { display: flex; flex-wrap: wrap; gap: 7px; }
.detail-tag {
  font-size: 12px; font-weight: 500;
  padding: 5px 11px; border-radius: var(--radius-pill);
  border: 1px solid var(--border); background: var(--bg);
}
.detail-tag-emotion { color: var(--text-mid); }
.detail-tag-category {
  color: var(--accent);
  border-color: rgba(20,110,245,0.25); background: var(--accent-light);
}

/* ─── Moment Track ───────────────────────────── */
.moment-track-wrap { background: var(--bg); }

.moment-map-section {
  position: sticky; z-index: 15;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}
.moment-tagline {
  font-size: 13px; color: var(--text-sub);
  letter-spacing: -0.16px; padding: 10px 20px 0;
}
.moment-map-head {
  display: flex; align-items: center;
  justify-content: space-between; padding: 6px 20px 8px;
}
.moment-map-title {
  font-size: 18px; font-weight: 600;
  color: var(--text); letter-spacing: -0.4px;
}
.moment-place-count {
  font-size: 12px; font-weight: 600; color: var(--accent);
  background: var(--accent-light);
  border: 1px solid rgba(20,110,245,0.2);
  border-radius: var(--radius-pill); padding: 4px 12px;
}
.moment-naver-map {
  height: 240px; margin: 0 16px;
  border-radius: var(--radius-xl); overflow: hidden;
  border: 1px solid var(--border); box-shadow: var(--shadow-sm);
  position: relative; background: #f0f0f0;
}
.moment-map-loading {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  background: var(--bg);
}
.moment-map-spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.moment-map-loading span { font-size: 13px; color: var(--text-sub); }

.moment-cards-list { padding: 16px 16px 0; }
.moment-empty { display: flex; justify-content: center; padding: 60px 0; }
.moment-empty-text { font-size: 15px; color: var(--text-sub); }

.moment-card-outer {
  margin-bottom: 14px;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border); box-shadow: var(--shadow);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.moment-card-outer.is-active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent), var(--shadow);
}
.moment-card-outer:active { opacity: 0.88; }
.moment-card { border-radius: var(--radius-xl); overflow: hidden; background: var(--bg); }

.moment-card-photo-wrap { width: 100%; }
.moment-card-photo { width: 100%; display: block; object-fit: cover; aspect-ratio: 16 / 9; }
.moment-card-gradient { width: 100%; aspect-ratio: 16 / 9; }

.moment-card-body { padding: 12px 16px 14px; }
.moment-card-meta { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; }
.moment-card-weather { font-size: 14px; flex-shrink: 0; }
.moment-card-time { font-size: 12px; font-weight: 500; color: var(--text-mid); flex-shrink: 0; }
.moment-card-pin { color: var(--text-sub); flex-shrink: 0; }
.moment-card-location {
  font-size: 12px; font-weight: 500; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.moment-card-text {
  font-size: 14px; color: var(--text); line-height: 1.6;
  letter-spacing: -0.16px; margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.moment-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.moment-card-tag {
  font-size: 11px; font-weight: 500; color: var(--accent);
  background: var(--accent-light);
  border: 1px solid rgba(20,110,245,0.2);
  border-radius: var(--radius-pill); padding: 3px 10px;
}

/* ─── 날짜 피커 ──────────────────────────────── */
.picker-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: flex-end;
}
.picker-sheet {
  width: 100%; background: var(--bg);
  border-radius: 20px 20px 0 0;
  padding: 0 0 env(safe-area-inset-bottom, 16px);
  box-shadow: 0 -4px 32px rgba(0,0,0,0.12);
}
.picker-handle {
  width: 36px; height: 4px; border-radius: 2px;
  background: var(--border); margin: 12px auto 4px;
}
.picker-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 20px 4px;
}
.picker-month-label {
  font-size: 15px; font-weight: 700;
  color: var(--text); letter-spacing: -0.3px;
}
.picker-month-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer; color: var(--text);
  border-radius: var(--radius); -webkit-tap-highlight-color: transparent;
}
.picker-month-btn:active { background: var(--accent-light); }
.picker-month-btn:disabled { opacity: 0.25; cursor: default; }

.picker-week-row {
  display: grid; grid-template-columns: repeat(7, 1fr);
  padding: 4px 12px 2px;
}
.picker-week-day {
  text-align: center; font-size: 11px; font-weight: 600;
  color: var(--text-sub); letter-spacing: 0.5px;
}
.picker-week-row span:first-child { color: #ee1d36; }
.picker-week-row span:last-child  { color: var(--accent); }

.picker-grid {
  display: grid; grid-template-columns: repeat(7, 1fr);
  padding: 4px 12px 8px; gap: 2px 0;
}
.picker-cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; aspect-ratio: 1;
  background: none; border: none; cursor: pointer;
  border-radius: var(--radius); color: var(--text-sub);
  font-size: 14px; font-weight: 400;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.12s;
}
.picker-cell.empty { pointer-events: none; }
.picker-cell:disabled { cursor: default; opacity: 0.3; }
.picker-cell.has-record { color: var(--text); font-weight: 600; }
.picker-cell.has-record:active { background: var(--accent-light); }
.picker-cell.is-sun.has-record { color: #ee1d36; }
.picker-cell.is-sat.has-record { color: var(--accent); }
.picker-cell.is-today { position: relative; }
.picker-cell.is-today::before {
  content: ''; position: absolute;
  inset: 4px; border-radius: 50%;
  border: 1.5px solid var(--accent);
  pointer-events: none;
}
.picker-cell.is-selected {
  background: linear-gradient(135deg, #146ef5, #8B5CF6) !important;
  color: #fff !important; border-radius: 50%;
}

.picker-close-btn {
  display: block; width: calc(100% - 40px); margin: 4px 20px 16px;
  padding: 13px; border-radius: var(--radius-pill);
  border: 1px solid var(--border); background: var(--bg);
  font-size: 14px; font-weight: 600; color: var(--text-mid);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.picker-close-btn:active { background: #f5f5f5; }

/* 피커 트랜지션 */
.picker-fade-enter-active, .picker-fade-leave-active { transition: opacity 0.22s; }
.picker-fade-enter, .picker-fade-leave-to { opacity: 0; }
.picker-slide-enter-active { transition: transform 0.28s cubic-bezier(0.32,0.72,0,1); }
.picker-slide-leave-active  { transition: transform 0.22s ease-in; }
.picker-slide-enter, .picker-slide-leave-to { transform: translateY(100%); }
</style>
