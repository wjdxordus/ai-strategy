<template>
  <nav class="gnb">
    <router-link to="/home" class="gnb-item" active-class="active">
      <svg class="gnb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span class="gnb-label">홈</span>
    </router-link>

    <router-link to="/timebridge" class="gnb-item" active-class="active">
      <svg class="gnb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span class="gnb-label">타임브릿지</span>
    </router-link>

    <router-link to="/cinema" class="gnb-item" active-class="active">
      <svg class="gnb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/>
        <line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="2" y1="7" x2="7" y2="7"/>
        <line x1="2" y1="17" x2="7" y2="17"/>
        <line x1="17" y1="17" x2="22" y2="17"/>
        <line x1="17" y1="7" x2="22" y2="7"/>
      </svg>
      <span class="gnb-label">시네마</span>
    </router-link>

    <router-link to="/my" class="gnb-item" active-class="active">
      <svg class="gnb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span class="gnb-label">MY</span>
    </router-link>
  </nav>
</template>

<style scoped>
.gnb {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(49px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-top: 0.5px solid rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  padding-top: 6px;
  z-index: 200;
}

.gnb-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: #aeaeb2;
  transition: color 0.2s;
}

.gnb-item.active { color: #1d1d1f; }

.gnb-icon {
  width: 22px;
  height: 22px;
}

.gnb-label {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: -0.1px;
  white-space: nowrap;
}
</style>
