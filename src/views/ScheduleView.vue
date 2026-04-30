<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { fetchSessions, getApiErrorMessage } from '@/api/cinema'
import AppIcon from '@/components/AppIcon.vue'
import { formatDateLabel, formatPrice, formatTime, type ScheduleItem } from '@/data/cinema'
import { t } from '@/stores/i18n'

const router = useRouter()

const items = ref<ScheduleItem[]>([])
const loading = ref(true)
const error = ref('')
const activeDate = ref('')

const dates = computed(() => [...new Set(items.value.map((item) => item.date))])
const forDate = computed(() => items.value.filter((item) => item.date === activeDate.value))

const openSeats = (sessionId: number) => {
  router.push(`/sessions/${sessionId}/seats`)
}

const loadSchedule = async () => {
  loading.value = true
  error.value = ''

  try {
    items.value = await fetchSessions()
    activeDate.value = dates.value[0] || ''
  } catch (err) {
    error.value = getApiErrorMessage(err, t('auth.requestFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(loadSchedule)
</script>

<template>
  <section class="stage min-h-screen pt-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p class="eyebrow mb-2">{{ t('schedule.eyebrow') }}</p>
      <h1 class="display mb-8 text-[clamp(2rem,4vw,3rem)] text-copy">
        {{ t('schedule.title') }}
      </h1>

      <div v-if="error" class="mb-6 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
        {{ error }}
      </div>

      <div class="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          v-for="date in dates"
          :key="date"
          class="shrink-0 rounded-xl border px-4 py-2.5 text-[0.85rem] font-semibold transition"
          :class="
            activeDate === date
              ? 'border-brand/45 bg-brand/15 text-brand'
              : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'
          "
          @click="activeDate = date"
        >
          {{ formatDateLabel(date) }}
        </button>
      </div>

      <div v-if="loading" class="rounded-xl border border-line bg-panel p-6 text-sm text-dim">
        {{ t('schedule.loading') }}
      </div>
      <div v-else-if="forDate.length === 0" class="rounded-xl border border-line bg-surface-soft p-10 text-center text-dim">
        {{ t('schedule.noSessions') }}
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="item in forDate"
          :key="item.session.id"
          class="grid grid-cols-[70px_minmax(0,1fr)_auto] gap-3 rounded-xl border border-line bg-panel p-4 text-muted shadow-[var(--shadow-card)] transition duration-200 hover:border-brand sm:grid-cols-[80px_minmax(0,1fr)_auto] lg:grid-cols-[80px_minmax(0,1fr)_180px_120px_auto] lg:items-center"
          @click="openSeats(item.session.id)"
        >
          <div class="display text-[1.3rem] tracking-[0.04em] text-copy">
            {{ formatTime(item.session.startDateTime) }}
          </div>
          <div class="min-w-0">
            <div class="text-[0.95rem] font-semibold text-copy">
              {{ item.movie.title }}
            </div>
            <div class="text-[0.78rem] text-dim">
              {{ item.movie.genre.join(', ') || '—' }} · {{ item.movie.ageRating }}
            </div>
          </div>
          <div class="col-span-2 text-[0.78rem] text-dim sm:col-start-2 lg:col-span-1 lg:col-start-auto lg:text-[0.85rem] lg:text-muted">
            {{ item.hall.name }}
          </div>
          <div class="col-start-3 row-start-1 text-right font-bold text-brand lg:col-start-auto lg:row-start-auto">
            {{ formatPrice(item.session.price, item.session.currency) }}
          </div>
          <AppIcon name="chevron-right" :size="16" class="hidden lg:block" />
        </div>
      </div>
    </div>
  </section>
</template>
