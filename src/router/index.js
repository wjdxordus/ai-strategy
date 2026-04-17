import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TimeBridgeView from '../views/TimeBridgeView.vue'
import CinemaView from '../views/CinemaView.vue'
import MyView from '../views/MyView.vue'
import ProcessingDemoView from '../views/ProcessingDemoView.vue'
import LetterView from '../views/LetterView.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/letter' },
  { path: '/letter', component: LetterView, meta: { hideGNB: true } },
  { path: '/process', component: ProcessingDemoView, meta: { hideGNB: true } },
  { path: '/home', component: HomeView },
  { path: '/timebridge', component: TimeBridgeView },
  { path: '/cinema', component: CinemaView },
  { path: '/my', component: MyView },
]

export default new VueRouter({
  routes,
  mode: 'hash',
})
