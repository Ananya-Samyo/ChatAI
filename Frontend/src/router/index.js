import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import UserDashboardView from '@/views/User/User_DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: UserDashboardView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router