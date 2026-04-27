<script setup lang="ts">
import { computed, ref } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import MovieCard from '@/components/MovieCard.vue'
import { movies } from '@/data/cinema'
import { t } from '@/stores/i18n'

// ── Все уникальные жанры из данных ──
const allGenres = computed(() => {
  const set = new Set<string>()
  movies.forEach((m) => m.genre.forEach((g) => set.add(g)))
  return ['Все', ...Array.from(set).sort()]
})

// ── Все возрастные рейтинги ──
const allRatings = computed(() => {
  const set = new Set<string>()
  movies.forEach((m) => set.add(m.ageRating))
  return ['Все', ...Array.from(set).sort()]
})

// ── Состояние фильтров ──
const search = ref('')
const selectedGenre = ref('Все')
const selectedRating = ref('Все')
const sortBy = ref<'default' | 'price-asc' | 'price-desc' | 'duration'>('default')

const resetFilters = () => {
  search.value = ''
  selectedGenre.value = 'Все'
  selectedRating.value = 'Все'
  sortBy.value = 'default'
}

const hasActiveFilters = computed(
  () =>
    search.value !== '' ||
    selectedGenre.value !== 'Все' ||
    selectedRating.value !== 'Все' ||
    sortBy.value !== 'default',
)

// ── Фильтрация и сортировка ──
const filtered = computed(() => {
  let list = [...movies]

  // Поиск по названию
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((m) => m.title.toLowerCase().includes(q))
  }

  // Жанр
  if (selectedGenre.value !== 'Все') {
    list = list.filter((m) => m.genre.includes(selectedGenre.value))
  }

  // Возрастной рейтинг
  if (selectedRating.value !== 'Все') {
    list = list.filter((m) => m.ageRating === selectedRating.value)
  }

  // Сортировка
  if (sortBy.value === 'duration') {
    list.sort((a, b) => a.duration - b.duration)
  }

  return list
})
</script>

<template>
  <section class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Заголовок -->
      <p class="eyebrow mb-2">{{ t('afisha.eyebrow') }}</p>
      <h1 class="display page-title">{{ t('afisha.title') }}</h1>

      <!-- ── Панель фильтров ── -->
      <div class="filters-panel">

        <!-- Поиск -->
        <div class="search-wrap">
          <AppIcon name="search" :size="16" class="search-icon" />
          <input
            v-model="search"
            class="search-input"
            type="text"
            placeholder="Поиск по названию…"
            autocomplete="off"
          />
          <button v-if="search" class="search-clear" @click="search = ''">
            <AppIcon name="close" :size="14" />
          </button>
        </div>

        <!-- Жанр -->
        <div class="filter-group">
          <label class="filter-label">Жанр</label>
          <div class="chip-row">
            <button
              v-for="g in allGenres"
              :key="g"
              class="filter-chip"
              :class="{ 'filter-chip--active': selectedGenre === g }"
              @click="selectedGenre = g"
            >
              {{ g }}
            </button>
          </div>
        </div>

        <!-- Возраст + Сортировка -->
        <div class="filter-row">
          <div class="filter-group filter-group--inline">
            <label class="filter-label">Возраст</label>
            <div class="chip-row">
              <button
                v-for="r in allRatings"
                :key="r"
                class="filter-chip"
                :class="{ 'filter-chip--active': selectedRating === r }"
                @click="selectedRating = r"
              >
                {{ r }}
              </button>
            </div>
          </div>

          <div class="filter-group filter-group--inline">
            <label class="filter-label">Сортировка</label>
            <div class="chip-row">
              <button
                class="filter-chip"
                :class="{ 'filter-chip--active': sortBy === 'default' }"
                @click="sortBy = 'default'"
              >
                По умолчанию
              </button>
              <button
                class="filter-chip"
                :class="{ 'filter-chip--active': sortBy === 'duration' }"
                @click="sortBy = 'duration'"
              >
                По длительности
              </button>
            </div>
          </div>

          <!-- Сброс -->
          <button
            v-if="hasActiveFilters"
            class="reset-btn"
            @click="resetFilters"
          >
            <AppIcon name="rotate-ccw" :size="13" />
            Сбросить
          </button>
        </div>
      </div>

      <!-- Результат / счётчик -->
      <div class="results-bar">
        <span class="results-count">
          {{ filtered.length === movies.length
            ? `${movies.length} фильмов`
            : `Найдено: ${filtered.length} из ${movies.length}` }}
        </span>
      </div>

      <!-- Сетка фильмов -->
      <div v-if="filtered.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <MovieCard v-for="m in filtered" :key="m.id" :movie="m" />
      </div>

      <!-- Ничего не найдено -->
      <div v-else class="not-found">
        <div class="not-found__icon">
          <AppIcon name="search" :size="32" />
        </div>
        <div class="not-found__title">Ничего не найдено</div>
        <div class="not-found__sub">Попробуйте изменить фильтры или поисковый запрос</div>
        <button class="btn-ghost mt-4" @click="resetFilters">
          <AppIcon name="rotate-ccw" :size="14" />
          Сбросить фильтры
        </button>
      </div>

    </div>
  </section>
</template>

<style scoped>
.page-title {
  color: var(--text);
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 1.75rem;
}

/* ── Панель фильтров ── */
.filters-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-card);
}

/* Поиск */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-dim);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 0.65rem 2.5rem 0.65rem 2.5rem;
  border-radius: 0.65rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 180ms ease;
}
.search-input::placeholder { color: var(--text-fade); }
.search-input:focus { border-color: var(--amber); }
.search-clear {
  position: absolute;
  right: 0.75rem;
  color: var(--text-dim);
  background: transparent;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0.2rem;
  border-radius: 0.3rem;
}
.search-clear:hover { color: var(--text); }

/* Группы */
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.filter-group--inline {
  flex-direction: column;
  gap: 0.4rem;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}
.filter-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
}

/* Чипы фильтров */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.filter-chip {
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  border: 1px solid var(--line);
  background: var(--surface-soft);
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 160ms ease;
}
.filter-chip:hover {
  border-color: var(--line-strong);
  color: var(--text);
}
.filter-chip--active {
  background: rgba(245,158,11,0.15);
  border-color: rgba(245,158,11,0.5);
  color: var(--amber);
  font-weight: 600;
}

/* Сброс */
.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(239,68,68,0.3);
  color: #ef4444;
  background: rgba(239,68,68,0.06);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  height: fit-content;
  transition: background 150ms ease;
}
.reset-btn:hover { background: rgba(239,68,68,0.12); }

/* Счётчик */
.results-bar {
  margin-bottom: 1rem;
}
.results-count {
  font-size: 0.82rem;
  color: var(--text-dim);
}

/* Пусто */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
}
.not-found__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  color: var(--text-dim);
  margin-bottom: 1.25rem;
}
.not-found__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.4rem;
}
.not-found__sub {
  font-size: 0.85rem;
  color: var(--text-dim);
  max-width: 280px;
}
</style>
