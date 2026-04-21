<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import {
  findMovie,
  formatDateLabel,
  formatDuration,
  formatTime,
  sessionsForMovie,
} from '@/data/cinema'

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
    <div class="text-center" style="color: #71717a">
      Фильм не найден.
      <button class="btn-amber mt-6" @click="router.push('/movies')">В афишу</button>
    </div>
  </div>

  <section v-else class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        class="flex items-center gap-2 mb-6"
        style="color: #a1a1aa; font-size: 0.85rem"
        @click="router.back()"
      >
        <AppIcon name="arrow-left" :size="16" />
        Назад
      </button>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div class="md:col-span-1">
          <div class="poster-frame" style="aspect-ratio: 2 / 3; max-width: 320px">
            <div v-if="posterFailed" class="poster-fallback">
              <AppIcon name="film" :size="44" fill="rgba(245,158,11,0.45)" />
              <span class="display" style="color: #f5f5f5; font-size: 1.2rem">
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
          <h1
            class="display mb-4"
            style="color: #fff; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1"
          >
            {{ movie.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 mb-6" style="color: #a1a1aa">
            <div class="flex items-center gap-1.5">
              <AppIcon name="clock" :size="16" />
              <span style="font-size: 0.9rem">{{ formatDuration(movie.duration) }}</span>
            </div>
            <span
              class="px-2.5 py-1 rounded-md"
              style="
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #e4e4e7;
                font-size: 0.8rem;
                font-weight: 600;
              "
            >
              {{ movie.ageRating }}
            </span>
            <span style="color: #71717a; font-size: 0.85rem">
              Премьера: {{ movie.releaseDate }}
            </span>
          </div>

          <p style="color: #a1a1aa; font-size: 0.95rem; line-height: 1.7">
            {{ movie.description }}
          </p>
        </div>
      </div>

      <div>
        <h2 class="display mb-4" style="color: #fff; font-size: 1.5rem">
          Сеансы
        </h2>

        <div v-if="dates.length === 0" class="surface p-8 text-center" style="color: #71717a">
          Нет запланированных сеансов.
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
              <span class="display" style="color: #fff; font-size: 1.4rem">
                {{ formatTime(item.session.startDateTime) }}
              </span>
              <span style="color: #a1a1aa; font-size: 0.78rem">
                {{ item.hall.name }}
              </span>
              <span style="color: #f59e0b; font-size: 0.8rem; font-weight: 600">
                от {{ item.session.priceStandard }} сом
              </span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
    linear-gradient(180deg, #1a1a24 0%, #0b0b12 100%);
}

.date-tab {
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: #a1a1aa;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 180ms ease;
}
.date-tab:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.15);
}
.date-tab--active {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.35);
  color: #f59e0b;
}

.session-btn {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: flex-start;
  padding: 0.85rem 1rem;
  border-radius: 0.7rem;
  background: #14141c;
  border: 1px solid rgba(255, 255, 255, 0.07);
  cursor: pointer;
  transition: border-color 180ms ease, transform 180ms ease;
}
.session-btn:hover {
  border-color: rgba(245, 158, 11, 0.35);
  transform: translateY(-2px);
}
</style>
