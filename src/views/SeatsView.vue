<script setup lang="ts">
// ── SeatsView теперь только собирает экран ────────────────────────────────
// Логика → useSeatSelection.ts
// Схема зала → SeatMap.vue
// Панель заказа → BookingSummary.vue

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import SeatMap from './seats/SeatMap.vue'
import BookingSummary from './seats/BookingSummary.vue'
import { useSeatSelection } from './seats/useSeatSelection'

import { findHall, findMovie, findSession } from '@/data/selectors'
import { formatDateLabel, formatTime } from '@/data/formatters'
import { t } from '@/stores/i18n'

const route = useRoute()
const router = useRouter()

const sessionId = computed(() =>
  Array.isArray(route.params.sessionId)
    ? route.params.sessionId[0]
    : route.params.sessionId,
)

const session = computed(() => findSession(sessionId.value))
const movie   = computed(() => session.value ? findMovie(session.value.movieId) : undefined)
const hall    = computed(() => session.value ? findHall(session.value.hallId) : undefined)

const {
  MAX_SEATS,
  secondsLeft,
  timerLabel,
  selectedList,
  total,
  seatStatus,
  toggle,
  confirm,
} = useSeatSelection(
  () => session.value,
  () => hall.value,
  () => sessionId.value,
)
</script>

<template>
  <!-- Сеанс не найден -->
  <div
    v-if="!session || !movie || !hall"
    class="stage flex items-center justify-center"
    style="min-height: 100vh"
  >
    <div class="text-center" style="color: var(--text-dim)">
      {{ t('seats.notFound') }}
      <button class="btn-amber mt-6" @click="router.push('/schedule')">
        {{ t('seats.toSchedule') }}
      </button>
    </div>
  </div>

  <section v-else class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Шапка -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <button class="flex items-center gap-2 mb-3 back-btn" @click="router.back()">
            <AppIcon name="chevron-left" :size="16" />
            {{ t('common.back') }}
          </button>
          <h1 class="display" style="color: var(--text); font-size: clamp(1.5rem, 3vw, 2rem)">
            {{ movie.title }}
          </h1>
          <div class="flex flex-wrap gap-3 mt-1" style="color: var(--text-muted); font-size: 0.85rem">
            <span class="flex items-center gap-1">
              <AppIcon name="calendar" :size="12" />
              {{ formatDateLabel(session.startDateTime.slice(0, 10)) }}
            </span>
            <span class="flex items-center gap-1">
              <AppIcon name="clock" :size="12" />
              {{ formatTime(session.startDateTime) }}
            </span>
            <span>{{ hall.name }}</span>
          </div>
        </div>

        <!-- Таймер hold -->
        <div class="hold-timer" :class="{ 'hold-timer--low': secondsLeft < 60 }">
          <AppIcon name="clock" :size="14" />
          <span>{{ t('seats.holdTimer', { time: timerLabel }) }}</span>
        </div>
      </div>

      <!-- Основная сетка -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">

        <!-- Зал -->
        <div class="xl:col-span-3">
          <div class="text-center mb-8">
            <div class="screen-bar mx-auto" style="max-width: 560px" />
            <p class="screen-label">{{ t('seats.screen') }}</p>
          </div>

          <SeatMap
            :hall="hall"
            :seat-status="seatStatus"
            @toggle="toggle"
          />
        </div>

        <!-- Заказ -->
        <BookingSummary
          :selected-list="selectedList"
          :total="total"
          :price="session.price"
          :max-seats="MAX_SEATS"
          @remove="toggle"
          @confirm="confirm"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.back-btn {
  background: transparent; border: none;
  color: var(--text-muted); font-size: 0.85rem; cursor: pointer;
}
.back-btn:hover { color: var(--text); }

.screen-label {
  margin-top: 0.5rem;
  color: var(--text-fade); font-size: 0.7rem;
  letter-spacing: 0.2em; text-transform: uppercase;
}

.hold-timer {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.9rem; border-radius: 0.6rem;
  background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.35);
  color: var(--amber); font-size: 0.82rem; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.hold-timer--low {
  background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.4);
  color: var(--red);
}
</style>