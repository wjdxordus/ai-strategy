<template>
  <div class="my">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-title">MY</div>
    </div>

    <!-- 프로필 -->
    <div class="profile">
      <div class="avatar">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="profile-name">나의 일상기록</div>
    </div>

    <!-- 통계 -->
    <div class="stats">
      <div class="stat">
        <div class="stat-val">{{ totalRecords }}</div>
        <div class="stat-key">전체 기록</div>
      </div>
      <div class="stat-divider" />
      <div class="stat">
        <div class="stat-val">{{ uniqueLocations }}</div>
        <div class="stat-key">방문 장소</div>
      </div>
      <div class="stat-divider" />
      <div class="stat">
        <div class="stat-val">{{ activeDays }}</div>
        <div class="stat-key">기록한 날</div>
      </div>
    </div>

    <!-- 메뉴 그룹 -->
    <div class="group-label">설정</div>
    <div class="menu-group">
      <div class="menu-row">
        <span class="menu-text">알림 설정</span>
        <svg class="menu-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <div class="menu-sep" />
      <div class="menu-row">
        <span class="menu-text">개인정보 보호</span>
        <svg class="menu-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <div class="menu-sep" />
      <div class="menu-row">
        <span class="menu-text">데이터 백업</span>
        <svg class="menu-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>

    <div class="group-label">앱 정보</div>
    <div class="menu-group">
      <div class="menu-row">
        <span class="menu-text">버전 정보</span>
        <span class="menu-value">1.0.0</span>
      </div>
      <div class="menu-sep" />
      <div class="menu-row">
        <span class="menu-text">이용약관</span>
        <svg class="menu-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
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
    totalRecords() { return store.records.length },
    uniqueLocations() { return new Set(store.records.map(r => r.location)).size },
    activeDays() { return new Set(store.records.map(r => r.date)).size },
  },
}
</script>

<style scoped>
.my { background: #f5f5f7; min-height: 100%; }

/* 헤더 */
.header {
  padding: 28px 24px 0;
  background: #f5f5f7;
}
.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

/* 프로필 */
.profile {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 20px 16px 0;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aeaeb2;
  flex-shrink: 0;
}
.profile-name {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

/* 통계 */
.stats {
  display: flex;
  align-items: center;
  margin: 10px 16px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}
.stat {
  flex: 1;
  text-align: center;
}
.stat-val {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
  margin-bottom: 3px;
}
.stat-key {
  font-size: 11px;
  color: #86868b;
  font-weight: 500;
}
.stat-divider {
  width: 0.5px;
  height: 36px;
  background: #e5e5ea;
}

/* 메뉴 */
.group-label {
  font-size: 12px;
  font-weight: 600;
  color: #86868b;
  padding: 18px 28px 6px;
  letter-spacing: 0.2px;
}
.menu-group {
  margin: 0 16px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}
.menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  cursor: pointer;
}
.menu-row:active { background: #f5f5f7; }
.menu-text {
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 400;
  letter-spacing: -0.1px;
}
.menu-chevron { color: #c7c7cc; }
.menu-value {
  font-size: 14px;
  color: #86868b;
}
.menu-sep {
  height: 0.5px;
  background: #e5e5ea;
  margin: 0 18px;
}
</style>
