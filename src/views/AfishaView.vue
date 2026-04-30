<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { fetchMovies, getApiErrorMessage } from '@/api/cinema'
import AppIcon from '@/components/AppIcon.vue'
import MovieCard from '@/components/MovieCard.vue'
import type { Movie } from '@/data/cinema'
import { t } from '@/stores/i18n'

const ALL_OPTION = '__all__'

const movies = ref<Movie[]>([])
const loading = ref(true)
const error = ref('')

const allGenres = computed(() => {
  const set = new Set<string>()
  movies.value.forEach((movie) => movie.genre.forEach((genre) => set.add(genre)))
  return Array.from(set).sort()
})

const allRatings = computed(() => {
  const set = new Set<string>()
  movies.value.forEach((movie) => set.add(movie.ageRating))
  return Array.from(set).sort()
})

const search = ref('')
const selectedGenre = ref(ALL_OPTION)
const selectedRating = ref(ALL_OPTION)
const sortBy = ref<'default' | 'duration'>('default')

const resultLabel = computed(() =>
  filtered.value.length === movies.value.length
    ? t('afisha.resultAll', { count: movies.value.length })
    : t('afisha.resultFiltered', { shown: filtered.value.length, total: movies.value.length }),
)

const optionLabel = (value: string) => value === ALL_OPTION ? t('common.all') : value

const resetFilters = () => {
  search.value = ''
  selectedGenre.value = ALL_OPTION
  selectedRating.value = ALL_OPTION
  sortBy.value = 'default'
}

const hasActiveFilters = computed(() => {
  return (
    search.value !== '' ||
    selectedGenre.value !== ALL_OPTION ||
    selectedRating.value !== ALL_OPTION ||
    sortBy.value !== 'default'
  )
})

const filtered = computed(() => {
  let list = [...movies.value]

  if (search.value.trim()) {
    const query = search.value.trim().toLowerCase()
    list = list.filter((movie) => movie.title.toLowerCase().includes(query))
  }

  if (selectedGenre.value !== ALL_OPTION) {
    list = list.filter((movie) => movie.genre.includes(selectedGenre.value))
  }

  if (selectedRating.value !== ALL_OPTION) {
    list = list.filter((movie) => movie.ageRating === selectedRating.value)
  }

  if (sortBy.value === 'duration') {
    list.sort((left, right) => left.duration - right.duration)
  }

  return list
})

const loadMoviesList = async () => {
  loading.value = true
  error.value = ''

  try {
    movies.value = await fetchMovies()
  } catch (err) {
    error.value = getApiErrorMessage(err, t('auth.requestFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(loadMoviesList)
</script>

<template>
  <section class="stage min-h-screen pt-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p class="eyebrow mb-2">{{ t('afisha.eyebrow') }}</p>
      <h1 class="display mb-7 text-[clamp(2rem,4vw,3rem)] text-copy">{{ t('afisha.title') }}</h1>

      <div class="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-panel px-6 py-5 shadow-[var(--shadow-card)]">
        <div class="relative flex items-center">
          <AppIcon name="search" :size="16" class="pointer-events-none absolute left-3.5 text-dim" />
          <input
            v-model="search"
            class="w-full rounded-xl border border-line bg-surface-soft py-2.5 pl-10 pr-10 text-[0.9rem] text-copy outline-none transition placeholder:text-fade focus:border-brand"
            type="text"
            :placeholder="t('afisha.searchPlaceholder')"
            autocomplete="off"
          />
          <button v-if="search" class="absolute right-3 rounded-md bg-transparent p-1 text-dim transition hover:text-copy" @click="search = ''">
            <AppIcon name="close" :size="14" />
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-dim">{{ t('afisha.genre') }}</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              :key="ALL_OPTION"
              class="rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition"
              :class="
                selectedGenre === ALL_OPTION
                  ? 'border-brand/50 bg-brand/15 font-semibold text-brand'
                  : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'
              "
              @click="selectedGenre = ALL_OPTION"
            >
              {{ optionLabel(ALL_OPTION) }}
            </button>
            <button
              v-for="genre in allGenres"
              :key="genre"
              class="rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition"
              :class="
                selectedGenre === genre
                  ? 'border-brand/50 bg-brand/15 font-semibold text-brand'
                  : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'
              "
              @click="selectedGenre = genre"
            >
              {{ optionLabel(genre) }}
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-dim">{{ t('afisha.age') }}</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                :key="`${ALL_OPTION}-rating`"
                class="rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition"
                :class="
                  selectedRating === ALL_OPTION
                    ? 'border-brand/50 bg-brand/15 font-semibold text-brand'
                    : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'
                "
                @click="selectedRating = ALL_OPTION"
              >
                {{ optionLabel(ALL_OPTION) }}
              </button>
              <button
                v-for="rating in allRatings"
                :key="rating"
                class="rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition"
                :class="
                  selectedRating === rating
                    ? 'border-brand/50 bg-brand/15 font-semibold text-brand'
                    : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'
                "
                @click="selectedRating = rating"
              >
                {{ optionLabel(rating) }}
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-dim">{{ t('afisha.sort') }}</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                class="rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition"
                :class="
                  sortBy === 'default'
                    ? 'border-brand/50 bg-brand/15 font-semibold text-brand'
                    : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'
                "
                @click="sortBy = 'default'"
              >
                {{ t('afisha.sortDefault') }}
              </button>
              <button
                class="rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition"
                :class="
                  sortBy === 'duration'
                    ? 'border-brand/50 bg-brand/15 font-semibold text-brand'
                    : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'
                "
                @click="sortBy = 'duration'"
              >
                {{ t('afisha.sortDuration') }}
              </button>
            </div>
          </div>

          <button
            v-if="hasActiveFilters"
            class="inline-flex h-fit items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-[0.78rem] font-medium text-danger transition hover:bg-danger/20"
            @click="resetFilters"
          >
            <AppIcon name="rotate-ccw" :size="13" />
            {{ t('afisha.reset') }}
          </button>
        </div>
      </div>

      <div class="mb-4">
        <span class="text-[0.82rem] text-dim">{{ resultLabel }}</span>
      </div>

      <div v-if="error" class="mb-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
        {{ error }}
      </div>
      <div v-else-if="loading" class="rounded-xl border border-line bg-panel p-6 text-sm text-dim">
        {{ t('afisha.loading') }}
      </div>
      <div v-else-if="filtered.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <MovieCard v-for="movie in filtered" :key="movie.id" :movie="movie" />
      </div>
      <div v-else class="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div class="mb-5 grid h-[72px] w-[72px] place-items-center rounded-full border border-line bg-surface-soft text-dim">
          <AppIcon name="search" :size="32" />
        </div>
        <div class="mb-1.5 text-[1.1rem] font-bold text-copy">{{ t('afisha.emptyTitle') }}</div>
        <div class="max-w-[280px] text-[0.85rem] text-dim">{{ t('afisha.emptyText') }}</div>
        <button class="btn-ghost mt-4" @click="resetFilters">
          <AppIcon name="rotate-ccw" :size="14" />
          {{ t('afisha.resetFilters') }}
        </button>
      </div>
    </div>
  </section>
</template>
