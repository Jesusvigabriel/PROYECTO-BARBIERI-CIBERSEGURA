import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import PlayerJoin from '../views/PlayerJoin.vue'
import AdminPanel from '../views/AdminPanel.vue'
import Reports from '../views/Reports.vue'

const routes = [
  { path: '/', redirect: '/join' },
  { path: '/login', component: Login },
  { path: '/join', component: PlayerJoin },
  { path: '/admin', component: AdminPanel },
  { path: '/reports', component: Reports }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
