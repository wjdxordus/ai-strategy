<template>
  <div class="my">

    <!-- 히어로 헤더 -->
    <section class="hero">
      <p class="hero-eyebrow">나의 일상기록</p>
      <h1 class="hero-title">MY</h1>
    </section>

    <!-- 통계 -->
    <section class="stats-section">
      <div class="stat">
        <p class="stat-num">{{ totalRecords }}</p>
        <p class="stat-label">전체 기록</p>
      </div>
      <div class="stat-rule" />
      <div class="stat">
        <p class="stat-num">{{ uniqueLocations }}</p>
        <p class="stat-label">방문 장소</p>
      </div>
      <div class="stat-rule" />
      <div class="stat">
        <p class="stat-num">{{ activeDays }}</p>
        <p class="stat-label">기록한 날</p>
      </div>
    </section>

    <!-- 설정 -->
    <p class="group-label">설정</p>
    <section class="list-section">
      <div class="list-row">
        <span class="list-title">알림 설정</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <div class="list-sep" />
      <div class="list-row">
        <span class="list-title">개인정보 보호</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <div class="list-sep" />
      <div class="list-row">
        <span class="list-title">데이터 백업</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </section>

    <p class="group-label">앱 정보</p>
    <section class="list-section">
      <div class="list-row">
        <span class="list-title">버전 정보</span>
        <span class="list-value">1.0.0</span>
      </div>
      <div class="list-sep" />
      <div class="list-row">
        <span class="list-title">이용약관</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <div class="list-sep" />
      <div class="list-row">
        <span class="list-title">오픈소스 라이선스</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </section>

    <p class="footer-note">일상기록 1.0.0 · © 2026</p>

    <div style="height: 60px" />
  </div>
</template>

<script>
import { store } from '../store'

export default {
  name: 'MyView',
  computed: {
    totalRecords() { return store.records.length },
    uniqueLocations() { return new Set(store.records.map(r => r.location)).size },
    activeDays() { return new Set(store.records.map(r => r.date)).size },
  },
}
</script>

<style scoped>
.my { background: #f5f5f7; min-height: 100%; }

/* ─── 히어로 ─────────────────────────────────── */
.hero {
  padding: 52px 24px 40px;
  background: #fff;
}
.hero-eyebrow {
  font-size: 11px;
  font-weight: 500;
  color: #6e6e73;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -1.5px;
  line-height: 1.05;
}

/* ─── 통계 ──────────────────────────────────── */
.stats-section {
  display: flex;
  align-items: center;
  background: #fff;
  margin-top: 1px;
  padding: 28px 0;
}
.stat {
  flex: 1;
  text-align: center;
}
.stat-num {
  font-size: 36px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -1px;
  line-height: 1;
  margin-bottom: 6px;
}
.stat-label {
  font-size: 11px;
  font-weight: 500;
  color: #6e6e73;
  letter-spacing: 0.1px;
}
.stat-rule {
  width: 0.5px;
  height: 40px;
  background: rgba(0,0,0,0.12);
}

/* ─── 그룹 라벨 ─────────────────────────────── */
.group-label {
  font-size: 13px;
  font-weight: 400;
  color: #6e6e73;
  padding: 28px 20px 8px;
  letter-spacing: -0.1px;
}

/* ─── 리스트 섹션 ───────────────────────────── */
.list-section {
  background: #fff;
  margin: 0;
}
.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
}
.list-row:active { background: #f5f5f7; }
.list-title {
  font-size: 15px;
  color: #1d1d1f;
  letter-spacing: -0.2px;
}
.list-value {
  font-size: 15px;
  color: #6e6e73;
}
.list-sep {
  height: 0.5px;
  background: rgba(0,0,0,0.1);
  margin-left: 20px;
}

/* ─── 푸터 ──────────────────────────────────── */
.footer-note {
  text-align: center;
  font-size: 12px;
  color: #aeaeb2;
  padding: 28px 20px 0;
  letter-spacing: -0.1px;
}
</style>
