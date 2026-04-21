<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import MovieCard from '@/components/MovieCard.vue'
import {
  formatDateLabel,
  formatTime,
  movies,
  upcomingSessions,
} from '@/data/cinema'

const featured = computed(() => movies.slice(0, 4))
const soon = computed(() => upcomingSessions(5))
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="stage relative overflow-hidden" style="min-height: 70vh; padding-top: 96px">
      <div class="spotlight" />
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <p class="eyebrow mb-3">Добро пожаловать</p>
        <h1
          class="display mb-5"
          style="color: #fff; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1"
        >
          Фильмы, сеансы<br />
          и <span style="color: #f59e0b">бронь в пару кликов</span>
        </h1>
        <p
          class="mb-8 max-w-xl"
          style="color: #a1a1aa; font-size: 1rem; line-height: 1.6"
        >
          Выберите фильм, сеанс и удобное место в зале — онлайн, без очередей.
        </p>
        <div class="flex flex-wrap gap-3">
          <RouterLink to="/movies" class="btn-amber">
            <AppIcon name="film" :size="18" />
            Афиша
          </RouterLink>
          <RouterLink to="/schedule" class="btn-ghost">
            <AppIcon name="calendar" :size="16" />
            Расписание
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Afisha preview -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-6 gap-4">
        <h2 class="display" style="color: #fff; font-size: clamp(1.5rem, 3vw, 2rem)">
          В прокате
        </h2>
        <RouterLink to="/movies" class="link-more">
          Вся афиша
          <AppIcon name="chevron-right" :size="14" />
        </RouterLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <MovieCard v-for="m in featured" :key="m.id" :movie="m" />
      </div>
    </section>

    <!-- Upcoming sessions -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-6 gap-4">
        <h2 class="display" style="color: #fff; font-size: clamp(1.5rem, 3vw, 2rem)">
          Ближайшие сеансы
        </h2>
        <RouterLink to="/schedule" class="link-more">
          Полное расписание
          <AppIcon name="chevron-right" :size="14" />
        </RouterLink>
      </div>

      <div class="flex flex-col gap-2">
        <RouterLink
          v-for="item in soon"
          :key="item.session.id"
          :to="`/sessions/${item.session.id}/seats`"
          class="session-row"
        >
          <div class="session-row__time">
            <span class="display" style="color: #fff; font-size: 1.3rem">
              {{ formatTime(item.session.startDateTime) }}
            </span>
            <span style="color: #71717a; font-size: 0.75rem">
              {{ formatDateLabel(item.date) }}
            </span>
          </div>
          <div class="session-row__info">
            <div style="color: #fff; font-size: 0.95rem; font-weight: 600">
              {{ item.movie.title }}
            </div>
            <div style="color: #71717a; font-size: 0.78rem">
              {{ item.hall.name }}
            </div>
          </div>
          <div class="session-row__price">
            от {{ item.session.priceStandard }} сом
          </div>
          <AppIcon name="chevron-right" :size="16" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.link-more {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #f59e0b;
  font-size: 0.85rem;
  font-weight: 600;
}

.session-row {
  display: grid;
  grid-template-columns: 120px 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 1rem;
  border-radius: 0.75rem;
  background: #14141c;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #a1a1aa;
  transition: border-color 180ms ease, transform 180ms ease;
}
.session-row:hover {
  border-color: rgba(245, 158, 11, 0.3);
  transform: translateX(3px);
}
.session-row__time {
  display: flex;
  flex-direction: column;
}
.session-row__info { min-width: 0; }
.session-row__price {
  color: #f59e0b;
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .session-row {
    grid-template-columns: 80px 1fr auto;
  }
  .session-row svg:last-child { display: none; }
}
</style>
