<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'

interface CarouselMovie {
  id: string
  title: string
  genre: string[]
  duration: number
  ageRating: string
  posterUrl?: string
  description?: string
  rating?: number
}

const props = defineProps<{
  movies: CarouselMovie[]
}>()

const router = useRouter()

const currentIndex = ref(0)
const isAnimating = ref(false)
const posterErrors = ref<Record<string, boolean>>({})
const autoplayTimer = ref<ReturnType<typeof setInterval> | null>(null)
const isDragging = ref(false)
const dragStartX = ref(0)

const AUTOPLAY_DELAY = 5000

const goTo = (index: number) => {
  if (isAnimating.value) return
  isAnimating.value = true
  currentIndex.value = (index + props.movies.length) % props.movies.length
  setTimeout(() => { isAnimating.value = false }, 420)
}

const prev = () => goTo(currentIndex.value - 1)
const next = () => goTo(currentIndex.value + 1)

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer.value = setInterval(next, AUTOPLAY_DELAY)
}
const stopAutoplay = () => {
  if (autoplayTimer.value) clearInterval(autoplayTimer.value)
}

onMounted(startAutoplay)
onUnmounted(stopAutoplay)

// Свайп
const onTouchStart = (e: TouchEvent) => {
  const touch = e.touches.item(0)
  if (touch) dragStartX.value = touch.clientX
  stopAutoplay()
}
const onTouchEnd = (e: TouchEvent) => {
  const touch = e.changedTouches.item(0)
  if (!touch) return
  const dx = touch.clientX - dragStartX.value
  if (Math.abs(dx) > 50) dx > 0 ? prev() : next()
  startAutoplay()
}

const onMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  dragStartX.value = e.clientX
  stopAutoplay()
}
const onMouseUp = (e: MouseEvent) => {
  if (!isDragging.value) return
  const dx = e.clientX - dragStartX.value
  if (Math.abs(dx) > 50) dx > 0 ? prev() : next()
  isDragging.value = false
  startAutoplay()
}

const formatDuration = (min: number) => `${Math.floor(min / 60)}ч ${min % 60}мин`

const goToMovie = (id: string) => router.push(`/movies/${id}`)

// Возвращаем CarouselMovie (не undefined) — компонент рендерится только если movies.length > 0
const currentMovie = computed((): CarouselMovie => {
  return props.movies[currentIndex.value] ?? props.movies[0] ?? {
    id: '', title: '', genre: [], duration: 0, ageRating: ''
  }
})
</script>

<template>
  <div
    v-if="movies.length"
    class="carousel"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="isDragging = false"
  >
    <!-- Слайды -->
    <div class="carousel__track">
      <transition name="slide-fade">
        <div
          :key="currentIndex"
          class="carousel__slide"
        >
          <!-- Фон: постер размытый -->
          <div class="carousel__bg">
            <img
              v-if="currentMovie.posterUrl && !posterErrors[currentMovie.id]"
              :src="(currentMovie.posterUrl as string)"
              :alt="currentMovie.title"
              class="carousel__bg-img"
              @error="posterErrors[currentMovie.id] = true"
            />
            <div class="carousel__bg-overlay" />
          </div>

          <!-- Контент -->
          <div class="carousel__content max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="carousel__inner">
              <!-- Постер -->
              <div class="carousel__poster-wrap">
                <div class="carousel__poster">
                  <div
                    v-if="posterErrors[currentMovie.id] || !currentMovie.posterUrl"
                    class="carousel__poster-fallback"
                  >
                    <AppIcon name="film" :size="40" fill="rgba(245,158,11,0.5)" />
                  </div>
                  <img
                    v-else
                    :src="(currentMovie.posterUrl as string)"
                    :alt="currentMovie.title"
                    @error="posterErrors[currentMovie.id] = true"
                  />
                </div>
              </div>

              <!-- Информация -->
              <div class="carousel__info">
                <div class="carousel__genres">
                  <span
                    v-for="g in currentMovie.genre.slice(0, 3)"
                    :key="g"
                    class="carousel__genre-chip"
                  >{{ g }}</span>
                </div>

                <h2 class="carousel__title display">
                  {{ currentMovie.title }}
                </h2>

                <div class="carousel__meta">
                  <span class="carousel__meta-item">
                    <AppIcon name="clock" :size="14" />
                    {{ formatDuration(currentMovie.duration) }}
                  </span>
                  <span class="carousel__meta-item carousel__meta-item--rating">
                    {{ currentMovie.ageRating }}
                  </span>
                  <span
                    v-if="currentMovie.rating"
                    class="carousel__meta-item carousel__meta-item--star"
                  >
                    <AppIcon name="star" :size="14" fill="currentColor" />
                    {{ currentMovie.rating }}
                  </span>
                </div>

                <p v-if="currentMovie.description" class="carousel__desc">
                  {{ currentMovie.description?.slice(0, 160) }}{{ currentMovie.description && currentMovie.description.length > 160 ? '…' : '' }}
                </p>

                <button
                  class="carousel__cta btn-amber"
                  @click="goToMovie(currentMovie.id)"
                >
                  <AppIcon name="ticket" :size="16" />
                  Купить билет
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Навигация -->
    <button class="carousel__nav carousel__nav--prev" aria-label="Предыдущий" @click="prev">
      <AppIcon name="chevron-left" :size="20" />
    </button>
    <button class="carousel__nav carousel__nav--next" aria-label="Следующий" @click="next">
      <AppIcon name="chevron-right" :size="20" />
    </button>

    <!-- Индикаторы -->
    <div class="carousel__dots">
      <button
        v-for="(_, i) in movies"
        :key="i"
        class="carousel__dot"
        :class="{ 'carousel__dot--active': i === currentIndex }"
        :aria-label="`Слайд ${i + 1}`"
        @click="goTo(i)"
      />
    </div>

    <!-- Прогресс-бар автоплея -->
    <div class="carousel__progress-bar" :key="`bar-${currentIndex}`" />
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  user-select: none;
  cursor: grab;
  border: 1px solid var(--line);
  box-shadow: 0 8px 40px rgba(0,0,0,0.2);
}
.carousel:active { cursor: grabbing; }

/* Трек */
.carousel__track {
  position: relative;
  height: clamp(300px, 50vw, 420px);
}

/* Слайд */
.carousel__slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
}

/* Фоновое изображение */
.carousel__bg {
  position: absolute;
  inset: 0;
  background: var(--bg-elev, #1a1a2e);
}
.carousel__bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(24px) brightness(0.35) saturate(1.5);
  transform: scale(1.1);
}
.carousel__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.85) 0%,
    rgba(0,0,0,0.5) 50%,
    rgba(0,0,0,0.15) 100%
  );
}

/* Контент */
.carousel__content {
  position: relative;
  z-index: 2;
  width: 100%;
}
.carousel__inner {
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Постер */
.carousel__poster-wrap {
  flex-shrink: 0;
}
.carousel__poster {
  width: clamp(100px, 14vw, 160px);
  aspect-ratio: 2/3;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 2px solid rgba(245,158,11,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
  position: relative;
  flex-shrink: 0;
}
.carousel__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.carousel__poster-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--surface-soft);
}

@media (max-width: 480px) {
  .carousel__poster-wrap { display: none; }
}

/* Инфо */
.carousel__info {
  flex: 1;
  min-width: 0;
}
.carousel__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}
.carousel__genre-chip {
  padding: 0.2rem 0.65rem;
  border-radius: 2rem;
  background: rgba(245,158,11,0.18);
  border: 1px solid rgba(245,158,11,0.35);
  color: var(--amber);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.carousel__title {
  font-size: clamp(1.4rem, 3.5vw, 2.5rem);
  color: #fff;
  line-height: 1.1;
  margin-bottom: 0.75rem;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
}

.carousel__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}
.carousel__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.65);
}
.carousel__meta-item--rating {
  padding: 0.2rem 0.55rem;
  border-radius: 0.35rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  font-weight: 600;
}
.carousel__meta-item--star {
  color: var(--amber);
  font-weight: 700;
}

.carousel__desc {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.6;
  margin-bottom: 1.25rem;
  max-width: 36rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.carousel__cta {
  display: inline-flex;
}

/* Навигация */
.carousel__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
  backdrop-filter: blur(8px);
}
.carousel__nav:hover {
  background: rgba(245,158,11,0.8);
  border-color: var(--amber);
  transform: translateY(-50%) scale(1.1);
}
.carousel__nav--prev { left: 1rem; }
.carousel__nav--next { right: 1rem; }

@media (max-width: 480px) {
  .carousel__nav { display: none; }
}

/* Точки */
.carousel__dots {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 0.4rem;
}
.carousel__dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.3);
  border: none;
  cursor: pointer;
  transition: width 280ms ease, background 280ms ease;
}
.carousel__dot--active {
  width: 20px;
  background: var(--amber);
}

/* Прогресс-бар */
.carousel__progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--amber);
  animation: progress-fill 5s linear forwards;
  z-index: 10;
}
@keyframes progress-fill {
  from { width: 0%; }
  to   { width: 100%; }
}

/* Анимация слайдов */
.slide-fade-enter-active {
  transition: opacity 380ms ease, transform 380ms ease;
}
.slide-fade-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
  position: absolute;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
</style>