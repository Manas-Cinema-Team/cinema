<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchMovies, fetchSessions, getApiErrorMessage } from '@/api/cinema'
import AppIcon from '@/components/AppIcon.vue'
import MovieCard from '@/components/MovieCard.vue'
import MovieCarousel from '@/components/MovieCarousel.vue'
import { formatDateLabel, formatPrice, formatTime, type Movie, type ScheduleItem } from '@/data/cinema'
import { t } from '@/stores/i18n'

const catalogMovies = ref<Movie[]>([])
const upcoming = ref<ScheduleItem[]>([])
const loading = ref(true)
const error = ref('')

const carouselMovies = computed(() => catalogMovies.value.slice(0, 5))
const featured = computed(() => catalogMovies.value.slice(0, 4))

const loadHomePage = async () => {
  loading.value = true
  error.value = ''

  try {
    const [movies, sessions] = await Promise.all([
      fetchMovies(),
      fetchSessions(),
    ])

    catalogMovies.value = movies
    upcoming.value = sessions.slice(0, 5)
  } catch (err) {
    error.value = getApiErrorMessage(err, t('auth.requestFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(loadHomePage)
</script>

<template>
  <div>
    <section class="stage relative min-h-[70vh] overflow-hidden pt-24">
      <div class="spotlight" />
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <p class="eyebrow mb-3">{{ t('home.welcome') }}</p>
        <h1 class="display mb-5 text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-copy">
          {{ t('home.heroLine1') }}<br />
          {{ t('home.heroConnector') }} <span class="text-brand">{{ t('home.heroLine2') }}</span>
        </h1>
        <p class="mb-8 max-w-3xl text-base leading-7 text-muted">
          {{ t('home.heroSub') }}
        </p>
        <div class="flex flex-wrap gap-3">
          <RouterLink to="/movies" class="btn-amber">
            <AppIcon name="film" :size="18" />
            {{ t('home.ctaMovies') }}
          </RouterLink>
          <RouterLink to="/schedule" class="btn-ghost">
            <AppIcon name="calendar" :size="16" />
            {{ t('home.ctaSchedule') }}
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-6 gap-4">
        <div>
          <h2 class="display text-[clamp(1.5rem,3vw,2rem)] text-copy">
            🔥 {{ t('home.popular') }}
          </h2>
          <p class="mt-1 text-[0.82rem] text-dim">{{ t('home.popularSub') }}</p>
        </div>
        <RouterLink to="/movies" class="inline-flex items-center gap-1 text-sm font-semibold text-brand">
          {{ t('home.allMovies') }}
          <AppIcon name="chevron-right" :size="14" />
        </RouterLink>
      </div>

      <div v-if="error" class="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
        {{ error }}
      </div>
      <div v-else-if="loading" class="rounded-xl border border-line bg-panel p-6 text-sm text-dim">
        {{ t('home.loadingMovies') }}
      </div>
      <MovieCarousel v-else :movies="carouselMovies" />
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-6 gap-4">
        <h2 class="display text-[clamp(1.5rem,3vw,2rem)] text-copy">
          {{ t('home.nowShowing') }}
        </h2>
        <RouterLink to="/movies" class="inline-flex items-center gap-1 text-sm font-semibold text-brand">
          {{ t('home.allMovies') }}
          <AppIcon name="chevron-right" :size="14" />
        </RouterLink>
      </div>

      <div v-if="loading" class="rounded-xl border border-line bg-panel p-6 text-sm text-dim">
        {{ t('home.loadingCatalog') }}
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <MovieCard v-for="movie in featured" :key="movie.id" :movie="movie" />
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-6 gap-4">
        <h2 class="display text-[clamp(1.5rem,3vw,2rem)] text-copy">
          {{ t('home.upcoming') }}
        </h2>
        <RouterLink to="/schedule" class="inline-flex items-center gap-1 text-sm font-semibold text-brand">
          {{ t('home.fullSchedule') }}
          <AppIcon name="chevron-right" :size="14" />
        </RouterLink>
      </div>

      <div v-if="loading" class="rounded-xl border border-line bg-panel p-6 text-sm text-dim">
        {{ t('home.loadingSessions') }}
      </div>
      <div v-else class="flex flex-col gap-2">
        <RouterLink
          v-for="item in upcoming"
          :key="item.session.id"
          :to="`/sessions/${item.session.id}/seats`"
          class="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-line bg-panel px-4 py-3 text-muted shadow-[var(--shadow-card)] transition duration-200 hover:translate-x-0.5 hover:border-brand sm:grid-cols-[120px_minmax(0,1fr)_auto_auto]"
        >
          <div class="flex flex-col">
            <span class="display text-[1.3rem] tracking-[0.04em] text-copy">
              {{ formatTime(item.session.startDateTime) }}
            </span>
            <span class="text-[0.75rem] text-dim">
              {{ formatDateLabel(item.date) }}
            </span>
          </div>
          <div class="min-w-0">
            <div class="text-[0.95rem] font-semibold text-copy">
              {{ item.movie.title }}
            </div>
            <div class="text-[0.78rem] text-dim">
              {{ item.hall.name }}
            </div>
          </div>
          <div class="whitespace-nowrap text-sm font-bold text-brand">
            {{ formatPrice(item.session.price, item.session.currency) }}
          </div>
          <AppIcon name="chevron-right" :size="16" class="hidden sm:block" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
