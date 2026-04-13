<template>
  <div id="app">

    <!-- AI 처리 진행 바 -->
    <transition name="fade">
      <div v-if="isProcessing" class="processing-bar">
        <div class="processing-track">
          <div class="processing-fill" :style="{ width: store.processingProgress + '%' }" />
        </div>
        <span class="processing-label">{{ processingLabel }}</span>
      </div>
    </transition>

    <router-view class="page-view" />
    <GNB />
  </div>
</template>

<script>
import GNB from './components/GNB.vue'
import { store, processPhotoGroups, loadMemoryRecords } from './store'

export default {
  name: 'App',
  components: { GNB },
  data() {
    return { store }
  },
  computed: {
    isProcessing() {
      return store.processingStatus === 'loading_weather' || store.processingStatus === 'loading_ai'
    },
    processingLabel() {
      if (store.processingStatus === 'loading_weather') return '날씨 정보 가져오는 중...'
      if (store.processingStatus === 'loading_ai') return `AI 기록 생성 중 ${store.processingProgress}%`
      return ''
    },
  },
  mounted() {
    // 1년 전 메모리 기록 로드
    loadMemoryRecords()

    // 모든 기록 썸네일 백그라운드 프리로드
    this.$nextTick(() => {
      const urls = store.records
        .map(r => r.thumbnail)
        .filter(url => url && url.startsWith('/photos/'))
      const seen = new Set()
      urls.forEach(url => {
        if (seen.has(url)) return
        seen.add(url)
        const img = new Image()
        img.src = url
      })
    })

    // Android → Web 브릿지 설정
    window._pendingBridgeData = null
    window.DailyLogBridge = {
      onPhotosReady: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr)

          // 새 포맷: { userInfo, photoGroups, date }
          if (parsed && parsed.photoGroups) {
            const { userInfo, photoGroups, date } = parsed
            store.userInfo = userInfo || store.userInfo
            store.photoGroups = photoGroups
            store.isAndroidDataLoaded = true
            store.bridgeDate = date || new Date().toISOString().slice(0, 10)
            processPhotoGroups(photoGroups, store.userInfo, store.bridgeDate)

          // 구 포맷: 배열
          } else if (Array.isArray(parsed)) {
            store.photoGroups = parsed
            store.isAndroidDataLoaded = true
            processPhotoGroups(parsed, store.userInfo, store.bridgeDate)
          }
        } catch (e) {
          console.error('[Bridge] 파싱 오류:', e)
        }
      },
    }

    if (window._pendingBridgeData) {
      window.DailyLogBridge.onPhotosReady(window._pendingBridgeData)
      window._pendingBridgeData = null
    }
  },
}
</script>

<style>
/* ─── Pretendard Variable 폰트 ──────────────────── */
@font-face {
  font-family: 'Pretendard Variable';
  font-weight: 45 920;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/PretendardVariable.woff2') format('woff2-variations');
}

/* ─── Webflow-Inspired Design System ──────────────── */
:root {
  /* Base */
  --bg:           #ffffff;
  --text:         #080808;
  --text-sub:     #ababab;
  --text-mid:     #363636;

  /* Brand */
  --accent:       #146ef5;
  --accent-hover: #0055d4;
  --accent-light: rgba(20,110,245,0.08);

  /* Secondary */
  --purple:       #7a3dff;
  --pink:         #ed52cb;
  --green:        #00d722;

  /* Structure */
  --border:       #d8d8d8;
  --border-hover: #898989;

  /* 5-layer cascade shadow */
  --shadow:
    rgba(0,0,0,0)    0px 84px 24px,
    rgba(0,0,0,0.01) 0px 54px 22px,
    rgba(0,0,0,0.04) 0px 30px 18px,
    rgba(0,0,0,0.08) 0px 13px 13px,
    rgba(0,0,0,0.09) 0px 3px 7px;
  --shadow-sm:
    rgba(0,0,0,0)    0px 12px 6px,
    rgba(0,0,0,0.01) 0px 8px 5px,
    rgba(0,0,0,0.03) 0px 5px 4px,
    rgba(0,0,0,0.05) 0px 2px 3px,
    rgba(0,0,0,0.06) 0px 1px 2px;

  /* Radius — conservative */
  --radius:       8px;
  --radius-lg:    12px;
  --radius-xl:    16px;
  --radius-pill:  100px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--bg);
  font-family: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text);
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

.page-view {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(49px + env(safe-area-inset-bottom));
  background: var(--bg);
}

::-webkit-scrollbar { display: none; }

/* ─── AI 처리 바 ─────────────────────────────── */
.processing-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 7px;
}
.processing-track {
  height: 3px; background: #f0f0f0;
  border-radius: 2px; overflow: hidden;
}
.processing-fill {
  height: 100%; background: var(--accent);
  border-radius: 2px; transition: width 0.4s ease;
}
.processing-label {
  font-size: 10px; font-weight: 500;
  color: var(--text-sub); letter-spacing: 1px; text-transform: uppercase;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
