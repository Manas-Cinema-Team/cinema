<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fetchMovieDetail, getApiErrorMessage } from '@/api/cinema'
import AppIcon from '@/components/AppIcon.vue'
import { formatDateLabel, formatDuration, formatPrice, formatTime, type Movie, type ScheduleItem } from '@/data/cinema'
import { t } from '@/stores/i18n'

const route = useRoute()
const router = useRouter()

const movie = ref<Movie | null>(null)
const sessions = ref<ScheduleItem[]>([])
const loading = ref(true)
const error = ref('')
const posterFailed = ref(false)
const selectedDate = ref('')

const movieId = computed(() => Number(route.params.id))
const dates = computed(() => [...new Set(sessions.value.map((session) => session.date))])
const forSelectedDate = computed(() => sessions.value.filter((session) => session.date === selectedDate.value))

watchEffect(() => {
  const firstDate = dates.value[0]
  if (firstDate && !dates.value.includes(selectedDate.value)) {
    selectedDate.value = firstDate
  }
})

watchEffect(async () => {
  if (!movieId.value) return

  loading.value = true
  error.value = ''
  posterFailed.value = false

  try {
    const payload = await fetchMovieDetail(movieId.value)
    movie.value = payload.movie
    sessions.value = payload.sessions
  } catch (err) {
    movie.value = null
    sessions.value = []
    error.value = getApiErrorMessage(err, t('auth.requestFailed'))
  } finally {
    loading.value = false
  }
})

const openSeats = (sessionId: number) => {
  router.push(`/sessions/${sessionId}/seats`)
}
</script>

<template>
  <div v-if="loading" class="stage flex min-h-screen items-center justify-center text-dim">
    {{ t('movie.loading') }}
  </div>

  <div v-else-if="!movie" class="stage flex min-h-screen items-center justify-center">
    <div class="text-center text-dim">
      {{ error || t('movie.notFound') }}
      <button class="btn-amber mt-6" @click="router.push('/movies')">{{ t('movie.toAfisha') }}</button>
    </div>
  </div>

  <section v-else class="stage min-h-screen pt-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button class="mb-6 inline-flex items-center gap-2 bg-transparent text-[0.85rem] text-dim transition hover:text-copy" @click="router.back()">
        <AppIcon name="arrow-left" :size="16" />
        {{ t('common.back') }}
      </button>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div class="md:col-span-1">
          <div class="relative aspect-[2/3] max-w-[320px] overflow-hidden rounded-2xl border border-line bg-panel-2 shadow-[var(--shadow-card)]">
            <div
              v-if="posterFailed"
              class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_50%_30%,rgba(245,158,11,0.2),transparent_60%),var(--bg-elev)] p-6 text-center"
            >
              <AppIcon name="film" :size="44" fill="rgba(245,158,11,0.45)" />
              <span class="display text-[1.2rem] text-copy">
                {{ movie.title }}
              </span>
            </div>
            <img
              v-else
              :src="movie.posterUrl"
              :alt="movie.title"
              class="block h-full w-full object-cover"
              @error="posterFailed = true"
            />
          </div>
        </div>

        <div class="md:col-span-2">
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="genre in movie.genre"
              :key="genre"
              class="inline-flex items-center rounded-full border border-brand/30 bg-brand/15 px-2.5 py-1 text-[0.72rem] font-semibold tracking-[0.05em] text-brand"
            >
              {{ genre }}
            </span>
          </div>
          <h1 class="display mb-4 text-[clamp(2rem,5vw,3.5rem)] leading-none text-copy">
            {{ movie.title }}
          </h1>

          <div class="mb-6 flex flex-wrap items-center gap-4 text-dim">
            <div class="flex items-center gap-1.5">
              <AppIcon name="clock" :size="16" />
              <span class="text-[0.9rem]">{{ formatDuration(movie.duration) }}</span>
            </div>
            <span class="rounded-md border border-line bg-surface-soft px-2.5 py-1 text-[0.8rem] font-semibold text-muted">{{ movie.ageRating }}</span>
            <span class="text-[0.85rem] text-fade">{{ t('movie.release') }}: {{ movie.releaseDate }}</span>
          </div>

          <p class="text-[0.95rem] leading-7 text-muted">
            {{ movie.description }}
          </p>
        </div>
      </div>

      <div>
        <h2 class="display mb-4 text-[1.5rem] text-copy">
          {{ t('movie.sessions') }}
        </h2>

        <div v-if="dates.length === 0" class="rounded-2xl border border-line bg-surface-soft p-8 text-center text-dim">
          {{ t('movie.noSessions') }}
        </div>

        <template v-else>
          <div class="flex gap-2 mb-5 overflow-x-auto pb-2">
            <button
              v-for="date in dates"
              :key="date"
              class="shrink-0 rounded-xl border px-4 py-2.5 text-[0.82rem] font-semibold transition"
              :class="
                selectedDate === date
                  ? 'border-brand/45 bg-brand/15 text-brand'
                  : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'
              "
              @click="selectedDate = date"
            >
              {{ formatDateLabel(date) }}
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              v-for="item in forSelectedDate"
              :key="item.session.id"
              class="flex cursor-pointer flex-col items-start gap-1.5 rounded-xl border border-line bg-panel px-4 py-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-brand"
              @click="openSeats(item.session.id)"
            >
              <span class="display text-[1.4rem] text-copy">
                {{ formatTime(item.session.startDateTime) }}
              </span>
              <span class="text-[0.78rem] text-dim">
                {{ item.hall.name }}
              </span>
              <span class="text-[0.85rem] font-bold text-brand">
                {{ formatPrice(item.session.price, item.session.currency) }}
              </span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
