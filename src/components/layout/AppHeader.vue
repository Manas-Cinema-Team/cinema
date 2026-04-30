<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { currentUser, isAuthenticated, logout } from '@/stores/auth'
import { cycleLocale, localeLabel, t } from '@/stores/i18n'
import { theme, toggleTheme } from '@/stores/theme'

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

const navLinks = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.afisha'), to: '/movies' },
  { label: t('nav.schedule'), to: '/schedule' },
])

const onLogout = async () => {
  await logout()
  router.push('/')
}

// Инициалы пользователя для аватара
const userInitials = computed(() => {
  const email = currentUser.value?.email
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
})

// Dropdown профиля
const profileDropdownOpen = ref(false)
const toggleProfileDropdown = () => {
  profileDropdownOpen.value = !profileDropdownOpen.value
}

watch(
  () => route.fullPath,
  () => {
    profileDropdownOpen.value = false
  },
)

// Закрыть dropdown при клике вне
const dropdownRef = ref<HTMLElement | null>(null)
const onClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    profileDropdownOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur-xl transition duration-300"
    :class="scrolled ? 'border-line bg-canvas/95' : 'bg-canvas/70'"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="grid h-9 w-9 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--amber),var(--amber-dark))]">
            <AppIcon name="film" :size="18" fill="#fff" />
          </div>
          <span class="display text-[1.2rem] tracking-[0.14em]">
            <span class="text-brand">CINE</span><span class="text-copy">MA</span>
          </span>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-7">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium text-muted transition hover:text-copy"
            active-class="!text-brand"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="hidden md:flex items-center gap-3">
          <button
            class="grid h-9 place-items-center rounded-lg border border-line bg-surface-soft px-3 text-[0.75rem] font-bold tracking-[0.08em] text-muted transition hover:border-brand hover:bg-surface-hover hover:text-brand"
            :aria-label="t('aria.languageToggle')"
            @click="cycleLocale"
          >
            {{ localeLabel }}
          </button>

          <button
            class="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface-soft text-muted transition hover:border-brand hover:bg-surface-hover hover:text-brand"
            :aria-label="theme === 'dark' ? t('aria.themeLight') : t('aria.themeDark')"
            @click="toggleTheme"
          >
            <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
          </button>

          <!-- Авторизован: иконка профиля с дропдауном -->
          <template v-if="isAuthenticated">
            <div class="relative" ref="dropdownRef">
              <button
                class="relative grid h-9 w-9 place-items-center rounded-full border-2 border-transparent bg-[linear-gradient(135deg,var(--amber),var(--amber-dark))] transition duration-200"
                :class="profileDropdownOpen ? 'scale-105 border-brand shadow-[0_0_0_3px_rgba(245,158,11,0.25)]' : 'hover:scale-105 hover:border-brand hover:shadow-[0_0_0_3px_rgba(245,158,11,0.25)]'"
                :aria-label="t('header.profileAria')"
                @click="toggleProfileDropdown"
              >
                <span class="pointer-events-none select-none text-[0.85rem] font-bold leading-none text-zinc-900">{{ userInitials }}</span>
                <span class="absolute bottom-0 right-0 h-[9px] w-[9px] rounded-full border-2 border-canvas bg-success after:absolute after:-inset-[3px] after:rounded-full after:bg-success/40 after:content-[''] after:[animation:pulse-ring_2s_ease-out_infinite]" />
              </button>

              <transition name="dropdown">
                <div
                  v-if="profileDropdownOpen"
                  class="absolute right-0 top-[calc(100%+10px)] z-[100] w-[230px] overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_16px_48px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.15)]"
                >
                  <div class="flex items-center gap-3 px-4 py-3.5">
                    <div class="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--amber),var(--amber-dark))] text-base font-bold text-zinc-900">{{ userInitials }}</div>
                    <div>
                      <div class="break-all text-[0.82rem] font-semibold text-copy">{{ currentUser?.email }}</div>
                      <div class="mt-px text-[0.7rem] font-medium text-success">{{ t('header.statusAuthorized') }}</div>
                    </div>
                  </div>
                  <div class="h-px bg-line" />
                  <RouterLink to="/profile" class="flex items-center gap-2.5 px-4 py-3 text-[0.85rem] text-muted transition hover:bg-surface-soft hover:text-copy">
                    <AppIcon name="user" :size="15" />
                    {{ t('header.myProfile') }}
                  </RouterLink>
                  <RouterLink to="/profile" class="flex items-center gap-2.5 px-4 py-3 text-[0.85rem] text-muted transition hover:bg-surface-soft hover:text-copy">
                    <AppIcon name="ticket" :size="15" />
                    {{ t('header.myTickets') }}
                  </RouterLink>
                  <div class="h-px bg-line" />
                  <button class="flex w-full items-center gap-2.5 bg-transparent px-4 py-3 text-left text-[0.85rem] text-muted transition hover:bg-danger/10 hover:text-danger" @click="onLogout">
                    <AppIcon name="log-out" :size="15" />
                    {{ t('auth.logout') }}
                  </button>
                </div>
              </transition>
            </div>
          </template>

          <!-- Не авторизован -->
          <template v-else>
            <RouterLink to="/login" class="rounded-lg border border-line-strong px-4 py-2 text-[0.85rem] font-medium text-muted transition hover:border-brand hover:text-copy">{{ t('auth.login') }}</RouterLink>
            <RouterLink to="/register" class="inline-flex items-center rounded-lg bg-[linear-gradient(135deg,var(--amber),var(--amber-dark))] px-4 py-2 text-[0.85rem] font-semibold text-zinc-900">{{ t('auth.register') }}</RouterLink>
          </template>
        </div>

        <div class="flex items-center gap-2 md:hidden">
          <button
            class="grid h-9 place-items-center rounded-lg border border-line bg-surface-soft px-3 text-[0.75rem] font-bold tracking-[0.08em] text-muted transition hover:border-brand hover:bg-surface-hover hover:text-brand"
            :aria-label="t('aria.languageToggle')"
            @click="cycleLocale"
          >
            {{ localeLabel }}
          </button>
          <button
            class="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface-soft text-muted transition hover:border-brand hover:bg-surface-hover hover:text-brand"
            :aria-label="theme === 'dark' ? t('aria.themeLight') : t('aria.themeDark')"
            @click="toggleTheme"
          >
            <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
          </button>

          <!-- Мобильный: аватар профиля или меню -->
          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="grid h-8 w-8 place-items-center rounded-full border-2 border-transparent bg-[linear-gradient(135deg,var(--amber),var(--amber-dark))]">
              <span class="pointer-events-none select-none text-[0.8rem] font-bold leading-none text-zinc-900">{{ userInitials }}</span>
            </RouterLink>
          </template>

          <button
            class="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface-soft text-copy transition hover:border-brand hover:bg-surface-hover hover:text-brand"
            :aria-label="menuOpen ? t('aria.menuClose') : t('aria.menuOpen')"
            @click="menuOpen = !menuOpen"
          >
            <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="22" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="menuOpen"
      class="border-t border-line bg-canvas/95 backdrop-blur-xl md:hidden"
    >
      <div class="px-4 py-5 flex flex-col gap-3">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="py-2 text-sm font-medium text-muted transition hover:text-copy"
          active-class="!text-brand"
        >
          {{ link.label }}
        </RouterLink>
        <div class="flex flex-col gap-2 border-t border-line pt-3">
          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="flex items-center gap-3 py-2.5">
              <div class="grid h-8 w-8 place-items-center rounded-full border-2 border-transparent bg-[linear-gradient(135deg,var(--amber),var(--amber-dark))]">
                <span class="pointer-events-none select-none text-[0.8rem] font-bold leading-none text-zinc-900">{{ userInitials }}</span>
              </div>
              <div>
                <div class="text-[0.82rem] font-semibold text-copy">{{ currentUser?.email }}</div>
                <div class="mt-px text-[0.72rem] text-brand">{{ t('header.goToProfile') }} →</div>
              </div>
            </RouterLink>
            <button class="rounded-lg border border-line-strong px-4 py-2 text-[0.85rem] font-medium text-muted transition hover:border-brand hover:text-copy" @click="onLogout">{{ t('auth.logout') }}</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="rounded-lg border border-line-strong px-4 py-2 text-center text-[0.85rem] font-medium text-muted transition hover:border-brand hover:text-copy">{{ t('auth.login') }}</RouterLink>
            <RouterLink to="/register" class="inline-flex items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--amber),var(--amber-dark))] px-4 py-2 text-center text-[0.85rem] font-semibold text-zinc-900">
              {{ t('auth.register') }}
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
