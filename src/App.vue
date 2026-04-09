<template>
  <div id="app">

    <!-- 웹 스플래시 오버레이 -->
    <transition name="splash-fade">
      <div v-if="showSplash" class="splash-overlay" :style="splashBgStyle">
        <!-- 배경 스크림 -->
        <div class="splash-scrim" />

        <!-- 상단 텍스트 -->
        <div class="splash-top">
          <p class="splash-title">Today's Best Moment</p>
          <p class="splash-sub">오늘의 기록을 확인하세요</p>
        </div>

        <!-- 하단 정보 -->
        <div class="splash-bottom">
          <!-- 태그 목록 -->
          <div v-if="splashRecord" class="splash-tags">
            <span
              v-for="tag in splashRecord.emotionTags"
              :key="tag.label"
              class="splash-tag"
            >{{ tag.icon }}&thinsp;{{ tag.label }}</span>
            <span
              v-for="tag in splashRecord.categoryTags"
              :key="tag"
              class="splash-tag"
            >#&thinsp;{{ tag }}</span>
          </div>
          <p class="splash-byline">By. Golden Record</p>
        </div>
      </div>
    </transition>

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
    return { store, showSplash: true }
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
    // 오늘 기록 중 가장 최근 항목
    splashRecord() {
      const records = store.todayRecords
      if (!records || records.length === 0) return null
      return records.reduce((latest, r) => {
        return (!latest || r.time > latest.time) ? r : latest
      }, null)
    },
    splashBgStyle() {
      const rec = this.splashRecord
      if (!rec) return { background: '#1d1d1f' }
      if (rec.thumbnail) return { backgroundImage: `url(${rec.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      return { background: rec.gradient }
    },
  },
  mounted() {
    // 2초 후 스플래시 숨김
    setTimeout(() => { this.showSplash = false }, 2000)

    // 1년 전 메모리 기록 로드
    loadMemoryRecords()

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
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: #fff;
  font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
  color: #1d1d1f;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-view {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(49px + env(safe-area-inset-bottom));
}

::-webkit-scrollbar { display: none; }

/* ─── 스플래시 ──────────────────────────────── */
.splash-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.splash-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%),
    linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 45%, transparent 70%);
}
.splash-top {
  position: relative;
  z-index: 1;
  padding: 60px 28px 0;
  padding-top: calc(60px + env(safe-area-inset-top));
}
.splash-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -1px;
  line-height: 1.15;
  margin-bottom: 8px;
}
.splash-sub {
  font-size: 15px;
  font-weight: 400;
  color: rgba(255,255,255,0.65);
  letter-spacing: -0.2px;
}
.splash-bottom {
  position: relative;
  z-index: 1;
  padding: 0 28px 48px;
  padding-bottom: calc(48px + env(safe-area-inset-bottom));
}
.splash-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 20px;
}
.splash-tag {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 5px 13px;
  border-radius: 20px;
  letter-spacing: 0;
}
.splash-byline {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.3px;
}

.splash-fade-leave-active { transition: opacity 0.7s ease; }
.splash-fade-leave-to { opacity: 0; }

/* ─── 처리 바 ───────────────────────────────── */
.processing-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 10px 20px;
  padding-top: calc(10px + env(safe-area-inset-top));
  background: rgba(255,255,255,0.92);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.processing-track {
  height: 2px;
  background: #e5e5ea;
  border-radius: 1px;
  overflow: hidden;
}
.processing-fill {
  height: 100%;
  background: #1d1d1f;
  border-radius: 1px;
  transition: width 0.4s ease;
}
.processing-label {
  font-size: 11px;
  color: #6e6e73;
  letter-spacing: 0.2px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
