<template>
  <div class="my">

    <!-- 헤더 -->
    <section class="hero">
      <p class="hero-eyebrow">나의 일상기록</p>
      <h1 class="hero-title">MY</h1>
    </section>

    <!-- 통계 -->
    <section class="stats-section">
      <div class="stat-card">
        <p class="stat-num">{{ totalRecords }}</p>
        <p class="stat-label">전체 기록</p>
      </div>
      <div class="stat-card">
        <p class="stat-num">{{ uniqueLocations }}</p>
        <p class="stat-label">방문 장소</p>
      </div>
      <div class="stat-card">
        <p class="stat-num">{{ activeDays }}</p>
        <p class="stat-label">기록한 날</p>
      </div>
    </section>

    <!-- 설정 -->
    <p class="group-label">설정</p>
    <section class="list-section">
      <div class="list-card">
        <div class="list-row">
          <span class="list-title">알림 설정</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div class="list-sep" />
        <div class="list-row">
          <span class="list-title">개인정보 보호</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div class="list-sep" />
        <div class="list-row">
          <span class="list-title">데이터 백업</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </section>

    <p class="group-label">앱 정보</p>
    <section class="list-section">
      <div class="list-card">
        <div class="list-row">
          <span class="list-title">버전 정보</span>
          <span class="list-value">1.0.0</span>
        </div>
        <div class="list-sep" />
        <div class="list-row">
          <span class="list-title">이용약관</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div class="list-sep" />
        <div class="list-row">
          <span class="list-title">오픈소스 라이선스</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
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
.my { background: var(--nm-bg); min-height: 100%; }

/* ─── 헤더 ──────────────────────────────── */
.hero { padding: 52px 24px 36px; }
.hero-eyebrow {
  font-size: 11px; font-weight: 600;
  color: var(--text-sub); letter-spacing: 0.6px;
  text-transform: uppercase; margin-bottom: 8px;
}
.hero-title {
  font-size: 44px; font-weight: 700;
  color: var(--text); letter-spacing: -1.4px; line-height: 1.05;
}

/* ─── 통계 ──────────────────────────────── */
.stats-section {
  display: flex; align-items: stretch;
  gap: 12px; padding: 0 20px 28px;
}
.stat-card {
  flex: 1; text-align: center;
  background: var(--nm-bg);
  box-shadow: var(--nm-out);
  border-radius: 18px;
  padding: 22px 8px;
}
.stat-num {
  font-size: 32px; font-weight: 700;
  color: var(--text); letter-spacing: -0.8px;
  line-height: 1; margin-bottom: 6px;
}
.stat-label {
  font-size: 11px; font-weight: 500;
  color: var(--text-sub); letter-spacing: 0;
}

/* ─── 그룹 라벨 ─────────────────────────── */
.group-label {
  font-size: 12px; font-weight: 600;
  color: var(--text-sub);
  padding: 0 24px 10px;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}

/* ─── 리스트 섹션 ───────────────────────── */
.list-section { padding: 0 20px 20px; }
.list-card {
  background: var(--nm-bg);
  box-shadow: var(--nm-out);
  border-radius: 18px;
  overflow: hidden;
}
.list-row {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 15px 18px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  color: var(--text-sub);
}
.list-row:active { box-shadow: var(--nm-in-sm); }
.list-title { font-size: 15px; color: var(--text); letter-spacing: -0.2px; }
.list-value { font-size: 15px; color: var(--text-sub); }
.list-sep { height: 1px; background: linear-gradient(to right, transparent, var(--nm-s1), transparent); opacity: 0.5; margin: 0 18px; }

/* ─── 푸터 ──────────────────────────────── */
.footer-note {
  text-align: center; font-size: 12px;
  color: var(--text-sub); padding: 8px 20px 0;
}
</style>
