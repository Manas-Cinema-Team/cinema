<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { formatLongDate, formatPrice } from '@/data/cinema'
import { currentSessionStartedAt, currentUser, isAuthenticated, logout } from '@/stores/auth'
import { allTickets, removeTicket, ticketCount } from '@/stores/bookings'
import { t } from '@/stores/i18n'

const router = useRouter()

if (!isAuthenticated.value) router.push('/login')

const userInitials = computed(() => {
  const email = currentUser.value?.email
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
})

const memberSince = computed(() => {
  const date = currentUser.value?.createdAt || currentSessionStartedAt.value
  if (!date) return '—'
  return formatLongDate(date)
})

const onLogout = async () => {
  await logout()
  router.push('/')
}

const activeTab = ref<'info' | 'tickets'>('info')

const confirmRemove = (id: string) => {
  if (confirm(t('profile.confirmRemove'))) removeTicket(id)
}

const uniqueMovies = computed(() => new Set(allTickets.value.map(tk => tk.movieId)).size)
const tabClass = (active: boolean) =>
  active
    ? 'border-brand text-brand'
    : 'border-transparent text-dim hover:text-copy'
</script>

<template>
  <div class="stage relative min-h-screen pt-24">
    <div class="pointer-events-none fixed left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.12),transparent_70%)]" />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <button class="mb-6 inline-flex items-center gap-2 bg-transparent text-[0.85rem] text-dim transition hover:text-copy" @click="router.back()">
        <AppIcon name="arrow-left" :size="15" />
        {{ t('common.back') }}
      </button>

      <!-- Карточка профиля -->
      <div class="relative mb-6 flex flex-col gap-4 overflow-hidden rounded-[1.2rem] border border-line bg-panel p-6 shadow-[0_4px_24px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center sm:justify-between">
        <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(245,158,11,0.06)_0%,transparent_60%)]" />
        <div class="relative flex items-center gap-5">
          <div class="relative grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--amber),var(--amber-dark))] text-[1.8rem] font-extrabold text-zinc-900">
            <span>{{ userInitials }}</span>
            <div class="absolute -inset-1 rounded-full border-2 border-brand/40 border-t-brand [animation:ring-spin_6s_linear_infinite]" />
          </div>
          <div>
            <h1 class="mb-1 text-[1.05rem] font-bold text-copy">{{ currentUser?.email }}</h1>
            <span class="inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-success">
              <span class="h-[7px] w-[7px] rounded-full bg-success" /> {{ t('profile.statusAuthorized') }}
            </span>
          </div>
        </div>
        <button class="relative inline-flex items-center gap-2 self-start rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-[0.85rem] font-medium text-danger transition hover:bg-danger/20 sm:self-auto" @click="onLogout">
          <AppIcon name="log-out" :size="16" />
          {{ t('auth.logout') }}
        </button>
      </div>

      <!-- Статистика -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="flex items-center gap-4 rounded-[0.9rem] border border-line bg-surface-soft px-5 py-4">
          <div class="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[0.6rem] bg-brand/15 text-brand"><AppIcon name="calendar" :size="18" /></div>
          <div>
            <div class="mb-0.5 text-[0.72rem] text-dim">{{ t('profile.memberSince') }}</div>
            <div class="text-[0.95rem] font-bold text-copy">{{ memberSince }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4 rounded-[0.9rem] border border-line bg-surface-soft px-5 py-4">
          <div class="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[0.6rem] bg-brand/15 text-brand"><AppIcon name="ticket" :size="18" /></div>
          <div>
            <div class="mb-0.5 text-[0.72rem] text-dim">{{ t('profile.ticketsBought') }}</div>
            <div class="text-[0.95rem] font-bold text-copy">{{ ticketCount }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4 rounded-[0.9rem] border border-line bg-surface-soft px-5 py-4">
          <div class="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[0.6rem] bg-brand/15 text-brand"><AppIcon name="film" :size="18" /></div>
          <div>
            <div class="mb-0.5 text-[0.72rem] text-dim">{{ t('profile.moviesWatched') }}</div>
            <div class="text-[0.95rem] font-bold text-copy">{{ uniqueMovies }}</div>
          </div>
        </div>
      </div>

      <!-- Табы -->
      <div class="mb-5 flex gap-2 border-b border-line">
        <button
          class="mb-[-1px] inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[0.85rem] font-semibold transition"
          :class="tabClass(activeTab === 'info')"
          @click="activeTab = 'info'"
        >
          <AppIcon name="user" :size="15" />
          {{ t('profile.tabInfo') }}
        </button>
        <button
          class="mb-[-1px] inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[0.85rem] font-semibold transition"
          :class="tabClass(activeTab === 'tickets')"
          @click="activeTab = 'tickets'"
        >
          <AppIcon name="ticket" :size="15" />
          {{ t('profile.tabTickets') }}
          <span v-if="ticketCount > 0" class="rounded-full bg-brand px-2 py-0.5 text-[0.68rem] font-bold text-zinc-900">{{ ticketCount }}</span>
        </button>
      </div>

      <transition name="tab-fade" mode="out-in">

        <!-- Данные профиля -->
        <div v-if="activeTab === 'info'" key="info" class="py-6">
          <div class="mb-4 overflow-hidden rounded-[0.9rem] border border-line">
            <div class="grid gap-4 border-b border-line px-5 py-3.5 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div class="text-[0.8rem] font-medium text-dim">{{ t('auth.email') }}</div>
              <div class="break-all text-[0.88rem] text-copy">{{ currentUser?.email }}</div>
            </div>
            <div class="grid gap-4 border-b border-line px-5 py-3.5 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div class="text-[0.8rem] font-medium text-dim">{{ t('profile.role') }}</div>
              <div class="break-all text-[0.88rem] text-copy">{{ t('profile.user') }}</div>
            </div>
            <div class="grid gap-4 px-5 py-3.5 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div class="text-[0.8rem] font-medium text-dim">{{ t('profile.sessionState') }}</div>
              <div class="break-all text-[0.88rem] text-copy">
                {{ t('profile.sessionActive') }}
              </div>
            </div>
          </div>
          <div class="flex items-start gap-2 rounded-xl border border-brand/20 bg-brand/10 px-4 py-3 text-[0.8rem] text-dim">
            <AppIcon name="info" :size="15" />
            {{ t('profile.localHistoryNote') }}
          </div>
        </div>

        <!-- Мои билеты -->
        <div v-else key="tickets" class="py-6">

          <div v-if="allTickets.length > 0" class="flex flex-col gap-4">
            <div
              v-for="ticket in allTickets"
              :key="ticket.id"
              class="grid gap-4 rounded-xl border border-line bg-panel p-4 shadow-[var(--shadow-card)] transition duration-200 hover:border-brand/35 sm:grid-cols-[56px_minmax(0,1fr)] md:grid-cols-[56px_minmax(0,1fr)_auto] md:items-center"
            >

              <!-- Постер -->
              <div class="grid h-20 w-14 place-items-center overflow-hidden rounded-lg border border-line bg-surface-soft">
                <img
                  v-if="ticket.moviePoster"
                  :src="ticket.moviePoster"
                  :alt="ticket.movieTitle"
                  class="h-full w-full object-cover"
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
                <div v-else>
                  <AppIcon name="film" :size="20" fill="rgba(245,158,11,0.5)" />
                </div>
              </div>

              <!-- Инфо -->
              <div class="min-w-0">
                <div class="mb-1 text-[0.68rem] font-bold tracking-[0.12em] text-brand">{{ ticket.bookingCode }}</div>
                <div class="mb-1.5 text-[0.95rem] font-bold text-copy">{{ ticket.movieTitle }}</div>
                <div class="mb-2 flex flex-wrap gap-3 text-[0.72rem] text-dim">
                  <span class="inline-flex items-center gap-1"><AppIcon name="calendar" :size="12" /> {{ formatLongDate(ticket.date) }}</span>
                  <span class="inline-flex items-center gap-1"><AppIcon name="clock" :size="12" /> {{ ticket.time }}</span>
                  <span class="inline-flex items-center gap-1"><AppIcon name="map-pin" :size="12" /> {{ ticket.hallName }}</span>
                </div>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="seat in ticket.seats"
                    :key="seat"
                    class="rounded-[0.3rem] border border-brand/30 bg-brand/15 px-[0.45rem] py-[0.15rem] text-[0.72rem] font-bold text-brand"
                  >
                    {{ seat }}
                  </span>
                </div>
              </div>

              <!-- Цена + действия -->
              <div class="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                <div class="whitespace-nowrap text-[0.95rem] font-bold text-brand">{{ formatPrice(ticket.total, ticket.currency) }}</div>
                <RouterLink
                  :to="{ name: 'booking-success', query: { booking: String(ticket.bookingId) } }"
                  class="inline-flex items-center gap-1 rounded-md border border-line bg-surface-soft px-2.5 py-1.5 text-[0.75rem] text-muted transition hover:border-brand hover:text-brand"
                >
                  <AppIcon name="eye" :size="13" />
                  {{ t('common.view') }}
                </RouterLink>
                <button class="rounded-md border border-danger/20 bg-transparent px-2 py-1.5 text-danger/60 transition hover:border-danger/50 hover:bg-danger/10 hover:text-danger" @click="confirmRemove(ticket.id)">
                  <AppIcon name="trash-2" :size="13" />
                </button>
              </div>
            </div>
          </div>

          <!-- Пусто -->
          <div v-else class="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div class="mb-5 grid h-[72px] w-[72px] place-items-center rounded-full border border-line bg-surface-soft text-dim">
              <AppIcon name="ticket" :size="36" />
            </div>
            <div class="mb-1.5 text-[1.1rem] font-bold text-copy">{{ t('profile.noTicketsTitle') }}</div>
            <div class="max-w-[280px] text-[0.85rem] text-dim">{{ t('profile.noTicketsText') }}</div>
            <RouterLink to="/movies" class="btn-amber mt-4">
              <AppIcon name="film" :size="16" />
              {{ t('profile.browseMovies') }}
            </RouterLink>
          </div>

        </div>
      </transition>
    </div>
  </div>
</template>
