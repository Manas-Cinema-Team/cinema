<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { formatDuration } from '@/data/cinema'
import { t } from '@/stores/i18n'

interface CarouselMovie {
  id: number
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

const goToMovie = (id: number) => router.push(`/movies/${id}`)

// Возвращаем CarouselMovie (не undefined) — компонент рендерится только если movies.length > 0
const currentMovie = computed((): CarouselMovie => {
  return props.movies[currentIndex.value] ?? props.movies[0] ?? {
    id: 0, title: '', genre: [], duration: 0, ageRating: ''
  }
})
</script>

<template>
  <div
    v-if="movies.length"
    class="relative overflow-hidden rounded-[1.25rem] border border-line shadow-[0_8px_40px_rgba(0,0,0,0.2)] select-none"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="isDragging = false"
  >
    <!-- Слайды -->
    <div class="relative h-[clamp(300px,50vw,420px)] cursor-grab active:cursor-grabbing">
      <transition name="slide-fade">
        <div
          :key="currentIndex"
          class="absolute inset-0 flex items-center"
        >
          <!-- Фон: постер размытый -->
          <div class="absolute inset-0 bg-panel">
            <img
              v-if="currentMovie.posterUrl && !posterErrors[currentMovie.id]"
              :src="(currentMovie.posterUrl as string)"
              :alt="currentMovie.title"
              class="h-full w-full scale-110 object-cover [filter:blur(24px)_brightness(0.35)_saturate(1.5)]"
              @error="posterErrors[currentMovie.id] = true"
            />
            <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.15)_100%)]" />
          </div>

          <!-- Контент -->
          <div class="relative z-[2] mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-8">
              <!-- Постер -->
              <div class="shrink-0 max-[480px]:hidden">
                <div class="relative aspect-[2/3] w-[clamp(100px,14vw,160px)] overflow-hidden rounded-[0.8rem] border-2 border-brand/30 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
                  <div
                    v-if="posterErrors[currentMovie.id] || !currentMovie.posterUrl"
                    class="absolute inset-0 grid place-items-center bg-surface-soft"
                  >
                    <AppIcon name="film" :size="40" fill="rgba(245,158,11,0.5)" />
                  </div>
                  <img
                    v-else
                    :src="(currentMovie.posterUrl as string)"
                    :alt="currentMovie.title"
                    class="h-full w-full object-cover"
                    @error="posterErrors[currentMovie.id] = true"
                  />
                </div>
              </div>

              <!-- Информация -->
              <div class="min-w-0 flex-1 max-[480px]:pb-11">
                <div class="mb-3 flex flex-wrap gap-1.5">
                  <span
                    v-for="g in currentMovie.genre.slice(0, 3)"
                    :key="g"
                    class="rounded-full border border-brand/35 bg-brand/20 px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.05em] text-brand"
                  >{{ g }}</span>
                </div>

                <h2 class="display mb-3 text-[clamp(1.4rem,3.5vw,2.5rem)] leading-[1.1] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
                  {{ currentMovie.title }}
                </h2>

                <div class="mb-3.5 flex flex-wrap items-center gap-3">
                  <span class="inline-flex items-center gap-1.5 text-[0.82rem] text-white/65">
                    <AppIcon name="clock" :size="14" />
                    {{ formatDuration(currentMovie.duration) }}
                  </span>
                  <span class="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[0.82rem] font-semibold text-white/65">
                    {{ currentMovie.ageRating }}
                  </span>
                  <span
                    v-if="currentMovie.rating"
                    class="inline-flex items-center gap-1.5 text-[0.82rem] font-bold text-brand"
                  >
                    <AppIcon name="star" :size="14" fill="currentColor" />
                    {{ currentMovie.rating }}
                  </span>
                </div>

                <p
                  v-if="currentMovie.description"
                  class="mb-5 max-w-[36rem] overflow-hidden text-[0.85rem] leading-[1.6] text-white/55 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [line-clamp:3]"
                >
                  {{ currentMovie.description?.slice(0, 160) }}{{ currentMovie.description && currentMovie.description.length > 160 ? '…' : '' }}
                </p>

                <button
                  class="btn-amber inline-flex max-[480px]:w-full max-[480px]:max-w-[12.5rem] max-[480px]:gap-2 max-[480px]:px-4 max-[480px]:py-3 max-[480px]:text-[0.85rem]"
                  @click="goToMovie(currentMovie.id)"
                >
                  <AppIcon name="ticket" :size="16" />
                  {{ t('carousel.buyTicket') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Навигация -->
    <button
      class="absolute left-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition hover:scale-110 hover:border-brand hover:bg-brand/80 max-[480px]:hidden"
      :aria-label="t('carousel.prev')"
      @click="prev"
    >
      <AppIcon name="chevron-left" :size="20" />
    </button>
    <button
      class="absolute right-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition hover:scale-110 hover:border-brand hover:bg-brand/80 max-[480px]:hidden"
      :aria-label="t('carousel.next')"
      @click="next"
    >
      <AppIcon name="chevron-right" :size="20" />
    </button>

    <!-- Индикаторы -->
    <div class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
      <button
        v-for="(_, i) in movies"
        :key="i"
        class="h-1.5 w-1.5 rounded-full bg-white/30 transition-all"
        :class="{ 'w-5 bg-brand': i === currentIndex }"
        :aria-label="t('carousel.slide', { n: i + 1 })"
        @click="goTo(i)"
      />
    </div>

    <!-- Прогресс-бар автоплея -->
    <div class="absolute bottom-0 left-0 z-10 h-0.5 bg-brand [animation:progress-fill_5s_linear_forwards]" :key="`bar-${currentIndex}`" />
  </div>
</template>
