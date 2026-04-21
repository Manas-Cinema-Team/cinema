<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { formatDateLabel, formatPrice, formatTime, scheduleItems } from '@/data/cinema'
import { t } from '@/stores/i18n'

const router = useRouter()

const items = scheduleItems()
const dates = [...new Set(items.map((i) => i.date))]
const activeDate = ref(dates[0] ?? '')

const forDate = computed(() =>
  items.filter((i) => i.date === activeDate.value),
)

const openSeats = (sessionId: string) => {
  router.push(`/sessions/${sessionId}/seats`)
}
</script>

<template>
  <section class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p class="eyebrow mb-2">{{ t('schedule.eyebrow') }}</p>
      <h1 class="display page-title">
        {{ t('schedule.title') }}
      </h1>

      <div class="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          v-for="d in dates"
          :key="d"
          class="date-tab"
          :class="{ 'date-tab--active': activeDate === d }"
          @click="activeDate = d"
        >
          {{ formatDateLabel(d) }}
        </button>
      </div>

      <div v-if="forDate.length === 0" class="empty-box">
        {{ t('schedule.noSessions') }}
      </div>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="item in forDate"
          :key="item.session.id"
          class="schedule-row"
          @click="openSeats(item.session.id)"
        >
          <div class="schedule-row__time display">
            {{ formatTime(item.session.startDateTime) }}
          </div>
          <div class="schedule-row__movie">
            <div class="schedule-row__title">
              {{ item.movie.title }}
            </div>
            <div class="schedule-row__sub">
              {{ item.movie.genre.join(', ') }} · {{ item.movie.ageRating }}
            </div>
          </div>
          <div class="schedule-row__hall">
            {{ item.hall.name }}
          </div>
          <div class="schedule-row__price">
            {{ formatPrice(item.session.price) }}
          </div>
          <AppIcon name="chevron-right" :size="16" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-title {
  color: var(--text);
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 2rem;
}

.empty-box {
  padding: 2.5rem;
  border-radius: 0.75rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text-dim);
  text-align: center;
}

.date-tab {
  flex-shrink: 0;
  padding: 0.65rem 1.1rem;
  border-radius: 0.65rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text-muted);
  font-size: 0.85rem;
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

.schedule-row {
  display: grid;
  grid-template-columns: 80px 1fr 180px 120px auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  cursor: pointer;
  color: var(--text-muted);
  box-shadow: var(--shadow-card);
  transition: border-color 180ms ease;
}
.schedule-row:hover {
  border-color: var(--amber);
}
.schedule-row__time {
  color: var(--text);
  font-size: 1.3rem;
  letter-spacing: 0.04em;
}
.schedule-row__title {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 600;
}
.schedule-row__sub {
  color: var(--text-dim);
  font-size: 0.78rem;
}
.schedule-row__hall {
  color: var(--text-muted);
  font-size: 0.85rem;
}
.schedule-row__price {
  color: var(--amber);
  font-weight: 700;
  text-align: right;
}

@media (max-width: 860px) {
  .schedule-row {
    grid-template-columns: 70px 1fr auto;
    grid-template-areas:
      "time movie price"
      "time hall hall";
  }
  .schedule-row__time { grid-area: time; }
  .schedule-row__movie { grid-area: movie; }
  .schedule-row__hall { grid-area: hall; font-size: 0.78rem; }
  .schedule-row__price { grid-area: price; }
  .schedule-row svg:last-child { display: none; }
}
</style>
