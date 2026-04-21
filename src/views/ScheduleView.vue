<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { formatDateLabel, formatTime, scheduleItems } from '@/data/cinema'

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
      <p class="eyebrow mb-2">Расписание</p>
      <h1
        class="display mb-8"
        style="color: #fff; font-size: clamp(2rem, 4vw, 3rem)"
      >
        Сеансы
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

      <div v-if="forDate.length === 0" class="surface p-10 text-center" style="color: #71717a">
        На эту дату сеансов нет.
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
            <div style="color: #fff; font-size: 0.95rem; font-weight: 600">
              {{ item.movie.title }}
            </div>
            <div style="color: #71717a; font-size: 0.78rem">
              {{ item.movie.genre.join(', ') }} · {{ item.movie.ageRating }}
            </div>
          </div>
          <div class="schedule-row__hall" style="color: #a1a1aa; font-size: 0.85rem">
            {{ item.hall.name }}
          </div>
          <div class="schedule-row__price">
            <div style="color: #f59e0b; font-weight: 700">
              от {{ item.session.priceStandard }} сом
            </div>
            <div style="color: #52525b; font-size: 0.72rem">
              VIP {{ item.session.priceVip }} сом
            </div>
          </div>
          <AppIcon name="chevron-right" :size="16" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.date-tab {
  flex-shrink: 0;
  padding: 0.65rem 1.1rem;
  border-radius: 0.65rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: #a1a1aa;
  font-size: 0.85rem;
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

.schedule-row {
  display: grid;
  grid-template-columns: 80px 1fr 180px 140px auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #14141c;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  color: #a1a1aa;
  transition: border-color 180ms ease;
}
.schedule-row:hover {
  border-color: rgba(245, 158, 11, 0.3);
}
.schedule-row__time {
  color: #fff;
  font-size: 1.3rem;
  letter-spacing: 0.04em;
}
.schedule-row__price {
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
