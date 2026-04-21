<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { currentUser, isAuthenticated, logout } from '@/stores/auth'

const scrolled = ref(false)
const menuOpen = ref(false)
const route = useRoute()
const router = useRouter()

const onScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

const navLinks = [
  { label: 'Главная', to: '/' },
  { label: 'Афиша', to: '/movies' },
  { label: 'Расписание', to: '/schedule' },
]

const onLogout = () => {
  logout()
  router.push('/')
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50"
    :style="{
      background: scrolled ? 'rgba(8,8,14,0.92)' : 'rgba(8,8,14,0.55)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      transition: 'background 300ms ease, border-color 300ms ease',
    }"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center gap-2">
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center"
            style="background: linear-gradient(135deg, #f59e0b, #d97706)"
          >
            <AppIcon name="film" :size="18" fill="#fff" />
          </div>
          <span class="display" style="font-size: 1.2rem; letter-spacing: 0.14em">
            <span style="color: #f59e0b">CINE</span><span style="color: #f5f5f5">MA</span>
          </span>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-7">
          <RouterLink
            v-for="link in navLinks"
            :key="link.label"
            :to="link.to"
            class="nav-link"
            active-class="nav-link--active"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="hidden md:flex items-center gap-3">
          <template v-if="isAuthenticated">
            <span style="color: #a1a1aa; font-size: 0.85rem">
              {{ currentUser?.email }}
            </span>
            <button class="btn-compact-ghost" @click="onLogout">
              Выйти
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-compact-ghost">Вход</RouterLink>
            <RouterLink to="/register" class="btn-compact-amber">Регистрация</RouterLink>
          </template>
        </div>

        <button
          class="md:hidden p-2"
          style="color: #d4d4d8"
          :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="22" />
        </button>
      </div>
    </div>

    <div
      v-if="menuOpen"
      class="md:hidden"
      style="background: rgba(8, 8, 14, 0.97); border-top: 1px solid rgba(255, 255, 255, 0.08)"
    >
      <div class="px-4 py-5 flex flex-col gap-3">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="nav-link py-2"
          active-class="nav-link--active"
        >
          {{ link.label }}
        </RouterLink>
        <div class="pt-3 flex flex-col gap-2" style="border-top: 1px solid rgba(255,255,255,0.06)">
          <template v-if="isAuthenticated">
            <span style="color: #a1a1aa; font-size: 0.85rem">{{ currentUser?.email }}</span>
            <button class="btn-compact-ghost w-full" @click="onLogout">Выйти</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-compact-ghost w-full text-center">Вход</RouterLink>
            <RouterLink to="/register" class="btn-compact-amber w-full text-center">
              Регистрация
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-link {
  color: #a1a1aa;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 180ms ease;
}
.nav-link:hover { color: #f5f5f5; }
.nav-link--active { color: #f59e0b; }

.btn-compact-ghost {
  padding: 0.45rem 0.95rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #d4d4d8;
  font-size: 0.85rem;
  font-weight: 500;
  background: transparent;
  transition: border-color 180ms ease, color 180ms ease;
  cursor: pointer;
}
.btn-compact-ghost:hover { color: #fff; border-color: rgba(255, 255, 255, 0.25); }

.btn-compact-amber {
  padding: 0.45rem 0.95rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #18181b;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
</style>
