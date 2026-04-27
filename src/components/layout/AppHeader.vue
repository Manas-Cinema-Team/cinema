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

          <!-- Авторизован: иконка профиля с дропдауном -->
          <template v-if="isAuthenticated">
            <div class="profile-dropdown-wrap" ref="dropdownRef">
              <button
                class="profile-avatar-btn"
                :class="{ 'profile-avatar-btn--open': profileDropdownOpen }"
                :aria-label="'Профиль'"
                @click="toggleProfileDropdown"
              >
                <span class="profile-avatar-initials">{{ userInitials }}</span>
                <span class="profile-avatar-pulse" />
              </button>

              <transition name="dropdown">
                <div v-if="profileDropdownOpen" class="profile-dropdown">
                  <div class="profile-dropdown__header">
                    <div class="profile-dropdown__avatar-lg">{{ userInitials }}</div>
                    <div>
                      <div class="profile-dropdown__email">{{ currentUser?.email }}</div>
                      <div class="profile-dropdown__badge">Авторизован</div>
                    </div>
                  </div>
                  <div class="profile-dropdown__divider" />
                  <RouterLink to="/profile" class="profile-dropdown__item">
                    <AppIcon name="user" :size="15" />
                    Мой профиль
                  </RouterLink>
                  <RouterLink to="/booking/success" class="profile-dropdown__item">
                    <AppIcon name="ticket" :size="15" />
                    Мои билеты
                  </RouterLink>
                  <div class="profile-dropdown__divider" />
                  <button class="profile-dropdown__item profile-dropdown__item--danger" @click="onLogout">
                    <AppIcon name="log-out" :size="15" />
                    Выйти
                  </button>
                </div>
              </transition>
            </div>
          </template>

          <!-- Не авторизован -->
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

          <!-- Мобильный: аватар профиля или меню -->
          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="profile-avatar-btn profile-avatar-btn--sm">
              <span class="profile-avatar-initials">{{ userInitials }}</span>
            </RouterLink>
          </template>

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
            <RouterLink to="/profile" class="drawer-profile-link">
              <div class="profile-avatar-btn profile-avatar-btn--sm">
                <span class="profile-avatar-initials">{{ userInitials }}</span>
              </div>
              <div>
                <div class="drawer-profile-email">{{ currentUser?.email }}</div>
                <div class="drawer-profile-sub">Перейти в профиль →</div>
              </div>
            </RouterLink>
            <button class="btn-compact-ghost w-full" @click="onLogout">{{ t('auth.logout') }}</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-compact-ghost w-full text-center">{{ t('auth.login') }}</RouterLink>
            <RouterLink to="/register" class="btn-compact-amber w-full text-center">
              {{ t('auth.register') }} lox
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

/* ── Аватар профиля ── */
.profile-dropdown-wrap {
  position: relative;
}

.profile-avatar-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--amber), var(--amber-dark));
  border: 2px solid transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 150ms ease;
  overflow: visible;
}
.profile-avatar-btn:hover,
.profile-avatar-btn--open {
  border-color: var(--amber);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
  transform: scale(1.05);
}
.profile-avatar-btn--sm {
  width: 32px;
  height: 32px;
}

.profile-avatar-initials {
  font-size: 0.85rem;
  font-weight: 700;
  color: #18181b;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

/* Пульсирующая точка "онлайн" */
.profile-avatar-pulse {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg);
}
.profile-avatar-pulse::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.4);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0%   { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* ── Dropdown меню профиля ── */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 230px;
  background: var(--bg-elev, var(--bg));
  border: 1px solid var(--line);
  border-radius: 0.9rem;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
}

.profile-dropdown__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
}

.profile-dropdown__avatar-lg {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--amber), var(--amber-dark));
  display: grid;
  place-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #18181b;
  flex-shrink: 0;
}

.profile-dropdown__email {
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 600;
  word-break: break-all;
}
.profile-dropdown__badge {
  margin-top: 2px;
  font-size: 0.7rem;
  color: #22c55e;
  font-weight: 500;
}

.profile-dropdown__divider {
  height: 1px;
  background: var(--line);
  margin: 0;
}

.profile-dropdown__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.7rem 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 150ms ease, color 150ms ease;
  text-decoration: none;
}
.profile-dropdown__item:hover {
  background: var(--surface-soft);
  color: var(--text);
}
.profile-dropdown__item--danger:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

/* Dropdown анимация */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* ── Мобильный ящик: профиль ── */
.drawer-profile-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  text-decoration: none;
}
.drawer-profile-email {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
}
.drawer-profile-sub {
  font-size: 0.72rem;
  color: var(--amber);
  margin-top: 1px;
}

/* ── Кнопки ── */
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
