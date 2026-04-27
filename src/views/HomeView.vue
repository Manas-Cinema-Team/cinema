<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import MovieCard from '@/components/MovieCard.vue'
import MovieCarousel from '@/components/MovieCarousel.vue'
import {
  formatDateLabel,
  formatPrice,
  formatTime,
  movies,
  upcomingSessions,
} from '@/data/cinema'
import { t } from '@/stores/i18n'

// Берём первые 5 фильмов для карусели (популярные)
const carouselMovies = computed(() => movies.slice(0, 5))

const featured = computed(() => movies.slice(0, 4))
const soon = computed(() => upcomingSessions(5))
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="stage relative overflow-hidden" style="min-height: 70vh; padding-top: 96px">
      <div class="spotlight" />
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <p class="eyebrow mb-3">{{ t('home.welcome') }}</p>
        <h1 class="display hero-title">
          {{ t('home.heroLine1') }}<br />
          {{ t('home.heroConnector') }} <span class="hero-title__accent">{{ t('home.heroLine2') }}</span>
        </h1>
        <p class="hero-sub">
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

    <!-- ── Карусель популярных фильмов ── -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-6 gap-4">
        <div>
          <h2 class="display section-title">
            🔥 Популярные фильмы
          </h2>
          <p class="section-sub">Хиты, которые сейчас смотрят все</p>
        </div>
        <RouterLink to="/movies" class="link-more">
          Все фильмы
          <AppIcon name="chevron-right" :size="14" />
        </RouterLink>
      </div>
      <MovieCarousel :movies="carouselMovies" />
    </section>

    <!-- Afisha preview -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-6 gap-4">
        <h2 class="display section-title">
          {{ t('home.nowShowing') }}
        </h2>
        <RouterLink to="/movies" class="link-more">
          {{ t('home.allMovies') }}
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
        <h2 class="display section-title">
          {{ t('home.upcoming') }}
        </h2>
        <RouterLink to="/schedule" class="link-more">
          {{ t('home.fullSchedule') }}
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
            <span class="session-row__clock">
              {{ formatTime(item.session.startDateTime) }}
            </span>
            <span class="session-row__date">
              {{ formatDateLabel(item.date) }}
            </span>
          </div>
          <div class="session-row__info">
            <div class="session-row__title">
              {{ item.movie.title }}
            </div>
            <div class="session-row__sub">
              {{ item.hall.name }}
            </div>
          </div>
          <div class="session-row__price">
            {{ formatPrice(item.session.price) }}
          </div>
          <AppIcon name="chevron-right" :size="16" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-title {
  color: var(--text);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1;
  margin-bottom: 1.25rem;
}
.hero-title__accent { color: var(--amber); }

.hero-sub {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 36rem;
  margin-bottom: 2rem;
}

.section-title {
  color: var(--text);
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.section-sub {
  color: var(--text-dim);
  font-size: 0.82rem;
  margin-top: 0.2rem;
}

.link-more {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--amber);
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
  background: var(--bg-elev);
  border: 1px solid var(--line);
  color: var(--text-muted);
  box-shadow: var(--shadow-card);
  transition: border-color 180ms ease, transform 180ms ease;
}
.session-row:hover {
  border-color: var(--amber);
  transform: translateX(3px);
}
.session-row__time { display: flex; flex-direction: column; }
.session-row__clock {
  font-family: var(--font-display);
  letter-spacing: 0.04em;
  color: var(--text);
  font-size: 1.3rem;
}
.session-row__date {
  color: var(--text-dim);
  font-size: 0.75rem;
}
.session-row__info { min-width: 0; }
.session-row__title {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 600;
}
.session-row__sub {
  color: var(--text-dim);
  font-size: 0.78rem;
}
.session-row__price {
  color: var(--amber);
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