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

const onLogout = () => {
  logout()
  router.push('/')
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 app-header"
    :class="{ 'app-header--scrolled': scrolled }"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="brand-mark">
            <AppIcon name="film" :size="18" fill="#fff" />
          </div>
          <span class="display brand-text">
            <span class="brand-text__accent">CINE</span><span class="brand-text__plain">MA</span>
          </span>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-7">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            active-class="nav-link--active"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="hidden md:flex items-center gap-3">
          <button
            class="lang-toggle"
            :aria-label="t('aria.languageToggle')"
            @click="cycleLocale"
          >
            {{ localeLabel }}
          </button>

          <button
            class="theme-toggle"
            :aria-label="theme === 'dark' ? t('aria.themeLight') : t('aria.themeDark')"
            @click="toggleTheme"
          >
            <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
          </button>

          <template v-if="isAuthenticated">
            <span class="header-email">
              {{ currentUser?.email }}
            </span>
            <button class="btn-compact-ghost" @click="onLogout">
              {{ t('auth.logout') }}
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-compact-ghost">{{ t('auth.login') }}</RouterLink>
            <RouterLink to="/register" class="btn-compact-amber">{{ t('auth.register') }}</RouterLink>
          </template>
        </div>

        <div class="flex items-center gap-2 md:hidden">
          <button
            class="lang-toggle"
            :aria-label="t('aria.languageToggle')"
            @click="cycleLocale"
          >
            {{ localeLabel }}
          </button>
          <button
            class="theme-toggle"
            :aria-label="theme === 'dark' ? t('aria.themeLight') : t('aria.themeDark')"
            @click="toggleTheme"
          >
            <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
          </button>
          <button
            class="menu-btn"
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
      class="md:hidden app-header__drawer"
    >
      <div class="px-4 py-5 flex flex-col gap-3">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link py-2"
          active-class="nav-link--active"
        >
          {{ link.label }}
        </RouterLink>
        <div class="pt-3 flex flex-col gap-2 app-header__drawer-foot">
          <template v-if="isAuthenticated">
            <span class="header-email">{{ currentUser?.email }}</span>
            <button class="btn-compact-ghost w-full" @click="onLogout">{{ t('auth.logout') }}</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-compact-ghost w-full text-center">{{ t('auth.login') }}</RouterLink>
            <RouterLink to="/register" class="btn-compact-amber w-full text-center">
              {{ t('auth.register') }}
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: color-mix(in srgb, var(--bg) 65%, transparent);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid transparent;
  transition: background 280ms ease, border-color 280ms ease;
}
.app-header--scrolled {
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  border-bottom-color: var(--line);
}

.app-header__drawer {
  background: color-mix(in srgb, var(--bg) 97%, transparent);
  border-top: 1px solid var(--line);
}
.app-header__drawer-foot {
  border-top: 1px solid var(--line);
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--amber), var(--amber-dark));
}
.brand-text {
  font-size: 1.2rem;
  letter-spacing: 0.14em;
}
.brand-text__accent { color: var(--amber); }
.brand-text__plain { color: var(--text); }

.header-email {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.nav-link {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 180ms ease;
}
.nav-link:hover { color: var(--text); }
.nav-link--active { color: var(--amber); }

.theme-toggle,
.lang-toggle,
.menu-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 0.5rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text-muted);
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}
.theme-toggle:hover,
.lang-toggle:hover,
.menu-btn:hover {
  color: var(--amber);
  border-color: var(--amber);
  background: var(--surface-hover);
}

.lang-toggle {
  width: auto;
  padding: 0 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
}

.menu-btn { color: var(--text); }

.btn-compact-ghost {
  padding: 0.45rem 0.95rem;
  border-radius: 0.5rem;
  border: 1px solid var(--line-strong);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  background: transparent;
  transition: border-color 180ms ease, color 180ms ease;
  cursor: pointer;
}
.btn-compact-ghost:hover { color: var(--text); border-color: var(--amber); }

.btn-compact-amber {
  padding: 0.45rem 0.95rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, var(--amber), var(--amber-dark));
  color: #18181b;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
</style>
