import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

// Android WebView는 onPageFinished 직후 DailyLogBridge를 호출한다.
// Vue mounted()보다 먼저 도착할 수 있으므로 여기서 선점 캡처 설정.
window._pendingBridgeData = null
window._pendingPickedData = null
window.DailyLogBridge = {
  onPhotosReady: (jsonStr) => { window._pendingBridgeData = jsonStr },
  onPhotoPicked: (jsonStr) => { window._pendingPickedData = jsonStr },
}

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
