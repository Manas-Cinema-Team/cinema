import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import { isAuthenticated } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/movies',
      name: 'afisha',
      component: () => import('@/views/AfishaView.vue'),
    },
    {
      path: '/movies/:id',
      name: 'movie',
      component: () => import('@/views/MovieView.vue'),
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('@/views/ScheduleView.vue'),
    },
    {
      path: '/sessions/:sessionId/seats',
      name: 'seats',
      component: () => import('@/views/SeatsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/booking/success',
      name: 'booking-success',
      component: () => import('@/views/BookingSuccessView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// ТЗ 6.5: «при попытке бронирования гостем — редирект на регистрацию / вход»
router.beforeEach((to: RouteLocationNormalized) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
