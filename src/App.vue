<template>
  <div id="app">
    <router-view class="page-view" />
    <GNB />
  </div>
</template>

<script>
import GNB from './components/GNB.vue'
import { store } from './store'

export default {
  name: 'App',
  components: { GNB },
  mounted() {
    window._pendingPhotos = null
    window.DailyLogBridge = {
      onPhotosReady: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr)
          const groups = Array.isArray(parsed) ? parsed : []
          store.photoGroups = groups
          store.isAndroidDataLoaded = true
          if (groups.length > 0 && groups[0].photos.length > 0) {
            store.featuredRecord = {
              ...store.featuredRecord,
              thumbnail: groups[0].photos[0].thumbnail,
              location: groups[0].locationLabel,
            }
          }
        } catch (e) {
          console.error('Bridge error:', e)
        }
      }
    }
    if (window._pendingPhotos) {
      window.DailyLogBridge.onPhotosReady(window._pendingPhotos)
      window._pendingPhotos = null
    }
  },
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: #ffffff;
  font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
  color: #1d1d1f;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
}

.page-view {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(56px + env(safe-area-inset-bottom));
}

::-webkit-scrollbar { display: none; }
</style>
