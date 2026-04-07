<template>
  <div class="my">
    <div class="header">
      <div class="header-title">MY</div>
      <div class="header-sub">나의 정보</div>
    </div>

    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="avatar">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="profile-info">
        <div class="profile-name">나의 일상기록</div>
        <div class="profile-stats">총 {{ totalRecords }}개의 기록</div>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ totalRecords }}</div>
        <div class="stat-label">전체 기록</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ uniqueLocations }}</div>
        <div class="stat-label">방문 장소</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ activeDays }}</div>
        <div class="stat-label">기록한 날</div>
      </div>
    </div>

    <!-- 설정 메뉴 -->
    <div class="menu-section">
      <div class="menu-label">설정</div>
      <div class="menu-list">
        <div class="menu-item">
          <span class="menu-icon">🔔</span>
          <span class="menu-text">알림 설정</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div class="menu-item">
          <span class="menu-icon">🔒</span>
          <span class="menu-text">개인정보 보호</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div class="menu-item">
          <span class="menu-icon">💾</span>
          <span class="menu-text">데이터 백업</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <div class="menu-label">앱 정보</div>
      <div class="menu-list">
        <div class="menu-item">
          <span class="menu-icon">ℹ️</span>
          <span class="menu-text">버전 정보</span>
          <span class="menu-value">1.0.0</span>
        </div>
        <div class="menu-item">
          <span class="menu-icon">📋</span>
          <span class="menu-text">이용약관</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>

    <div style="height: 80px" />
  </div>
</template>

<script>
import { store } from '../store'

export default {
  name: 'MyView',
  computed: {
    totalRecords() {
      return store.records.length
    },
    uniqueLocations() {
      const locs = new Set(store.records.map(r => r.location))
      return locs.size
    },
    activeDays() {
      const days = new Set(store.records.map(r => r.date))
      return days.size
    },
  },
}
</script>

<style scoped>
.my { background: #F7F8FC; min-height: 100%; }

.header {
  padding: 20px 20px 14px;
}
.header-title { font-size: 22px; font-weight: 700; color: #1A1A2E; }
.header-sub { font-size: 12px; color: #AAAAAA; margin-top: 2px; }

/* 프로필 */
.profile-section {
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.profile-name {
  font-size: 16px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 4px;
}
.profile-stats {
  font-size: 12px;
  color: #AAAAAA;
}

/* 통계 */
.stats-row {
  display: flex;
  gap: 10px;
  margin: 0 16px 20px;
}
.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 14px;
  padding: 16px 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #FF6B6B;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 11px;
  color: #AAAAAA;
  font-weight: 500;
}

/* 메뉴 */
.menu-section { margin: 0 16px 16px; }
.menu-label {
  font-size: 12px;
  font-weight: 600;
  color: #AAAAAA;
  margin-bottom: 8px;
  padding-left: 4px;
}
.menu-list {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 16px;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
  gap: 12px;
}
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 18px; flex-shrink: 0; }
.menu-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.menu-arrow { color: #CCCCCC; flex-shrink: 0; }
.menu-value {
  font-size: 13px;
  color: #AAAAAA;
}
</style>
