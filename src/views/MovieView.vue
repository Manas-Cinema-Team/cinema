<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import {
  findMovie,
  formatDateLabel,
  formatDuration,
  formatPrice,
  formatTime,
  sessionsForMovie,
} from '@/data/cinema'
import { t } from '@/stores/i18n'

const route = useRoute()
const router = useRouter()

const movie = computed(() => findMovie(route.params.id))
const sessions = computed(() => (movie.value ? sessionsForMovie(movie.value.id) : []))

const dates = computed(() => [...new Set(sessions.value.map((s) => s.date))])
const selectedDate = ref<string>('')

watchEffect(() => {
  const first = dates.value[0]
  if (first && !dates.value.includes(selectedDate.value)) {
    selectedDate.value = first
  }
})

const forSelectedDate = computed(() =>
  sessions.value.filter((s) => s.date === selectedDate.value),
)

const posterFailed = ref(false)

const openSeats = (sessionId: string) => {
  router.push(`/sessions/${sessionId}/seats`)
}
</script>

<template>
  <div v-if="!movie" class="stage flex items-center justify-center" style="min-height: 100vh">
    <div class="not-found">
      {{ t('movie.notFound') }}
      <button class="btn-amber mt-6" @click="router.push('/movies')">{{ t('movie.toAfisha') }}</button>
    </div>
  </div>

  <section v-else class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button class="back-btn" @click="router.back()">
        <AppIcon name="arrow-left" :size="16" />
        {{ t('common.back') }}
      </button>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div class="md:col-span-1">
          <div class="poster-frame" style="aspect-ratio: 2 / 3; max-width: 320px">
            <div v-if="posterFailed" class="poster-fallback">
              <AppIcon name="film" :size="44" fill="rgba(245,158,11,0.45)" />
              <span class="display poster-fallback__title">
                {{ movie.title }}
              </span>
            </div>
            <img
              v-else
              :src="movie.posterUrl"
              :alt="movie.title"
              @error="posterFailed = true"
            />
          </div>
        </div>

        <div class="md:col-span-2">
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="g in movie.genre" :key="g" class="chip">{{ g }}</span>
          </div>
          <h1 class="display movie-title">
            {{ movie.title }}
          </h1>

          <div class="movie-meta">
            <div class="flex items-center gap-1.5">
              <AppIcon name="clock" :size="16" />
              <span class="movie-meta__duration">{{ formatDuration(movie.duration) }}</span>
            </div>
            <span class="movie-meta__rating">{{ movie.ageRating }}</span>
            <span class="movie-meta__release">{{ t('movie.release') }}: {{ movie.releaseDate }}</span>
          </div>

          <p class="movie-description">
            {{ movie.description }}
          </p>
        </div>
      </div>

      <div>
        <h2 class="display section-heading">
          {{ t('movie.sessions') }}
        </h2>

        <div v-if="dates.length === 0" class="surface p-8 text-center empty-sessions">
          {{ t('movie.noSessions') }}
        </div>

        <template v-else>
          <div class="flex gap-2 mb-5 overflow-x-auto pb-2">
            <button
              v-for="d in dates"
              :key="d"
              class="date-tab"
              :class="{ 'date-tab--active': selectedDate === d }"
              @click="selectedDate = d"
            >
              {{ formatDateLabel(d) }}
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              v-for="item in forSelectedDate"
              :key="item.session.id"
              class="session-btn"
              @click="openSeats(item.session.id)"
            >
              <span class="session-btn__time display">
                {{ formatTime(item.session.startDateTime) }}
              </span>
              <span class="session-btn__hall">
                {{ item.hall.name }}
              </span>
              <span class="session-btn__price">
                {{ formatPrice(item.session.price) }}
              </span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  color: var(--text-dim);
  text-align: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-dim);
  font-size: 0.85rem;
  background: transparent;
  border: none;
  cursor: pointer;
}
.back-btn:hover { color: var(--text); }

.poster-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(245, 158, 11, 0.2), transparent 60%),
    var(--bg-elev);
}
.poster-fallback__title {
  color: var(--text);
  font-size: 1.2rem;
}

.movie-title {
  color: var(--text);
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1;
  margin-bottom: 1rem;
}

.movie-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: var(--text-dim);
}
.movie-meta__duration { font-size: 0.9rem; }
.movie-meta__rating {
  padding: 0.25rem 0.65rem;
  border-radius: 0.4rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
}
.movie-meta__release {
  color: var(--text-fade);
  font-size: 0.85rem;
}

.movie-description {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
}

.section-heading {
  color: var(--text);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.empty-sessions { color: var(--text-dim); }

.date-tab {
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 0.6rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 180ms ease;
}
.date-tab:hover {
  color: var(--text);
  border-color: var(--line-strong);
}
.date-tab--active {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.45);
  color: var(--amber);
}

.session-btn {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: flex-start;
  padding: 0.85rem 1rem;
  border-radius: 0.7rem;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 180ms ease, transform 180ms ease;
}
.session-btn:hover {
  border-color: var(--amber);
  transform: translateY(-2px);
}
.session-btn__time {
  color: var(--text);
  font-size: 1.4rem;
}
.session-btn__hall {
  color: var(--text-dim);
  font-size: 0.78rem;
}
.session-btn__price {
  color: var(--amber);
  font-size: 0.85rem;
  font-weight: 700;
}
</style>
