<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { formatDuration, type Movie } from '@/data/cinema'

const props = defineProps<{
  movie: Movie
}>()

const router = useRouter()
const open = () => router.push(`/movies/${props.movie.id}`)

const posterFailed = ref(false)
</script>

<template>
  <article class="movie-card" @click="open">
    <div class="movie-card__poster" style="aspect-ratio: 2 / 3">
      <div v-if="posterFailed" class="movie-card__fallback">
        <div class="movie-card__fallback-grid" />
        <AppIcon name="film" :size="36" fill="rgba(245,158,11,0.45)" />
        <span class="display" style="color: #f5f5f5; font-size: 1.1rem; letter-spacing: 0.06em">
          {{ movie.title }}
        </span>
      </div>
      <img
        v-else
        :src="movie.posterUrl"
        :alt="movie.title"
        loading="lazy"
        @error="posterFailed = true"
      />
      <span class="movie-card__rating">{{ movie.ageRating }}</span>
    </div>

    <div class="movie-card__body">
      <h3 class="movie-card__title">{{ movie.title }}</h3>
      <div class="movie-card__meta">
        <AppIcon name="clock" :size="12" />
        <span>{{ formatDuration(movie.duration) }}</span>
        <span style="color: rgba(255, 255, 255, 0.2)">·</span>
        <span>{{ movie.genre[0] }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  background: #14141c;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 200ms ease, transform 200ms ease;
}
.movie-card:hover {
  border-color: rgba(245, 158, 11, 0.3);
  transform: translateY(-3px);
}

.movie-card__poster {
  position: relative;
  background: #0b0b12;
  overflow: hidden;
}
.movie-card__poster img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-card__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(245, 158, 11, 0.18), transparent 60%),
    linear-gradient(180deg, #1a1a24 0%, #0b0b12 100%);
}
.movie-card__fallback-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.6;
}

.movie-card__rating {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(8, 8, 14, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
  font-size: 0.7rem;
  font-weight: 600;
}

.movie-card__body {
  padding: 0.85rem 0.95rem 1rem;
}
.movie-card__title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.movie-card__meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #a1a1aa;
  font-size: 0.78rem;
}
</style>
