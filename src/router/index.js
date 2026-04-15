import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TimeBridgeView from '../views/TimeBridgeView.vue'
import CinemaView from '../views/CinemaView.vue'
import MyView from '../views/MyView.vue'
import ProcessingDemoView from '../views/ProcessingDemoView.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/process' },
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
