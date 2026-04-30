<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { formatDateLabel, formatTime } from '@/data/formatters'
import { t } from '@/stores/i18n'
import BookingSummary from './seats/BookingSummary.vue'
import SeatMap from './seats/SeatMap.vue'
import { useSeatSelection } from './seats/useSeatSelection'

const route = useRoute()
const router = useRouter()

const sessionId = computed(() =>
  Array.isArray(route.params.sessionId)
    ? route.params.sessionId[0]
    : route.params.sessionId,
)

const {
  MAX_SEATS,
  loading,
  loadError,
  actionError,
  isSubmitting,
  movie,
  hall,
  session,
  availableSeats,
  pollingInterval,
  expiresAt,
  secondsLeft,
  timerLabel,
  selectedList,
  total,
  currency,
  reload,
  seatStatus,
  toggle,
  confirm,
} = useSeatSelection(() => sessionId.value)

const statusClass = computed(() =>
  expiresAt.value
    ? (secondsLeft.value < 60 ? 'hold-timer hold-timer--low' : 'hold-timer')
    : 'sync-pill',
)
</script>

<template>
  <div
    v-if="loading"
    class="stage flex items-center justify-center"
    style="min-height: 100vh"
  >
    <div class="text-center" style="color: var(--text-dim)">
      {{ t('seats.loading') }}
    </div>
  </div>

  <div
    v-else-if="loadError || !session || !movie || !hall"
    class="stage flex items-center justify-center"
    style="min-height: 100vh"
  >
    <div class="max-w-md rounded-2xl border border-line bg-panel p-6 text-center shadow-[var(--shadow-card)]">
      <div class="mb-3 inline-flex rounded-full border border-danger/25 bg-danger/10 px-3 py-1 text-sm text-danger">
        {{ t('seats.loadErrorTitle') }}
      </div>
      <p class="mb-5 text-sm" style="color: var(--text-dim)">
        {{ loadError || t('seats.notFound') }}
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <button class="btn-ghost" @click="reload">
          {{ t('seats.reload') }}
        </button>
        <button class="btn-amber" @click="router.push('/schedule')">
          {{ t('seats.toSchedule') }}
        </button>
      </div>
    </div>
  </div>

  <section v-else class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <span>{{ t('seats.available', { count: availableSeats }) }}</span>
          </div>
        </div>

        <div :class="statusClass">
          <template v-if="expiresAt">
            <AppIcon name="clock" :size="14" />
            <span>{{ t('seats.holdTimer', { time: timerLabel }) }}</span>
          </template>
          <template v-else>
            <AppIcon name="calendar" :size="14" />
            <span>{{ t('seats.syncEvery', { seconds: pollingInterval }) }}</span>
          </template>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div class="xl:col-span-3">
          <div class="text-center mb-8">
            <div class="screen-bar mx-auto" style="max-width: 560px" />
            <p class="screen-label">{{ t('seats.screen') }}</p>
          </div>

          <SeatMap
            :schema="hall.schema"
            :seat-status="seatStatus"
            @toggle="toggle"
          />
        </div>

        <BookingSummary
          :selected-list="selectedList"
          :total="total"
          :currency="currency"
          :max-seats="MAX_SEATS"
          :action-error="actionError"
          :is-submitting="isSubmitting"
          @remove="toggle"
          @confirm="confirm"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.back-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
}

.back-btn:hover {
  color: var(--text);
}

.screen-label {
  margin-top: 0.5rem;
  color: var(--text-fade);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hold-timer {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: var(--amber);
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.hold-timer--low {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
  color: var(--red);
}

.sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #93c5fd;
  font-size: 0.82rem;
  font-weight: 600;
}
</style>
