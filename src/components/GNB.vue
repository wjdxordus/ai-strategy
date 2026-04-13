<template>
  <nav class="gnb">
    <router-link to="/home" class="gnb-item" active-class="active">
      <div class="gnb-icon-wrap">
        <!-- default -->
        <svg class="gnb-icon icon-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <!-- active with gradient -->
        <svg class="gnb-icon icon-active" viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <defs>
            <linearGradient id="gnb-grad-home" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#146ef5"/>
              <stop offset="100%" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <path stroke="url(#gnb-grad-home)" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline stroke="url(#gnb-grad-home)" points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    </router-link>

    <router-link to="/timebridge" class="gnb-item" active-class="active">
      <div class="gnb-icon-wrap">
        <svg class="gnb-icon icon-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <svg class="gnb-icon icon-active" viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <defs>
            <linearGradient id="gnb-grad-time" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#146ef5"/>
              <stop offset="100%" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <circle stroke="url(#gnb-grad-time)" cx="12" cy="12" r="10"/>
          <polyline stroke="url(#gnb-grad-time)" points="12 6 12 12 16 14"/>
        </svg>
      </div>
    </router-link>

    <router-link to="/cinema" class="gnb-item" active-class="active">
      <div class="gnb-icon-wrap">
        <svg class="gnb-icon icon-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
          <line x1="7" y1="2" x2="7" y2="22"/>
          <line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="7" x2="7" y2="7"/>
          <line x1="2" y1="17" x2="7" y2="17"/>
          <line x1="17" y1="17" x2="22" y2="17"/>
          <line x1="17" y1="7" x2="22" y2="7"/>
        </svg>
        <svg class="gnb-icon icon-active" viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <defs>
            <linearGradient id="gnb-grad-cinema" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#146ef5"/>
              <stop offset="100%" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <rect stroke="url(#gnb-grad-cinema)" x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
          <line stroke="url(#gnb-grad-cinema)" x1="7" y1="2" x2="7" y2="22"/>
          <line stroke="url(#gnb-grad-cinema)" x1="17" y1="2" x2="17" y2="22"/>
          <line stroke="url(#gnb-grad-cinema)" x1="2" y1="12" x2="22" y2="12"/>
          <line stroke="url(#gnb-grad-cinema)" x1="2" y1="7" x2="7" y2="7"/>
          <line stroke="url(#gnb-grad-cinema)" x1="2" y1="17" x2="7" y2="17"/>
          <line stroke="url(#gnb-grad-cinema)" x1="17" y1="17" x2="22" y2="17"/>
          <line stroke="url(#gnb-grad-cinema)" x1="17" y1="7" x2="22" y2="7"/>
        </svg>
      </div>
    </router-link>

    <router-link to="/my" class="gnb-item" active-class="active">
      <div class="gnb-icon-wrap">
        <svg class="gnb-icon icon-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <svg class="gnb-icon icon-active" viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <defs>
            <linearGradient id="gnb-grad-my" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#146ef5"/>
              <stop offset="100%" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
          <path stroke="url(#gnb-grad-my)" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle stroke="url(#gnb-grad-my)" cx="12" cy="7" r="4"/>
        </svg>
      </div>
    </router-link>
  </nav>
</template>

<style scoped>
.gnb {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: calc(58px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border);
  display: flex; align-items: center;
  z-index: 200;
}

.gnb-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 3px;
  text-decoration: none; color: #555;
  transition: color 0.2s;
}

.gnb-item.active { color: #146ef5; }

.gnb-icon-wrap {
  width: 38px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius); transition: background 0.2s;
}

.gnb-item.active .gnb-icon-wrap {
  background: linear-gradient(90deg, rgba(20,110,245,0.08) 0%, rgba(139,92,246,0.08) 100%);
}

/* default/active 아이콘 토글 */
.icon-default { display: block; }
.icon-active  { display: none; }
.gnb-item.active .icon-default { display: none; }
.gnb-item.active .icon-active  { display: block; }

.gnb-icon { width: 24px; height: 24px; }

</style>
