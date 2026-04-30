import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import { ensureAuthReady, isAuthenticated } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/movies', name: 'afisha', component: () => import('@/views/AfishaView.vue') },
    { path: '/movies/:id', name: 'movie', component: () => import('@/views/MovieView.vue') },
    { path: '/schedule', name: 'schedule', component: () => import('@/views/ScheduleView.vue') },
    {
      path: '/sessions/:sessionId/seats',
      name: 'seats',
      component: () => import('@/views/SeatsView.vue'),
      meta: { requiresAuth: true },
    },
    // ── Страница оплаты (новая) ──
    {
      path: '/payment',
      name: 'payment',
      component: () => import('@/views/PaymentView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/booking/success',
      name: 'booking-success',
      component: () => import('@/views/BookingSuccessView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  await ensureAuthReady()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
