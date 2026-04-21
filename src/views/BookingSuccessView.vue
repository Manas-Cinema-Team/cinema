<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import {
  findHall,
  findMovie,
  findSession,
  formatDateLabel,
  formatTime,
} from '@/data/cinema'

const route = useRoute()

const session = computed(() => findSession(route.query.session as string | undefined))
const movie = computed(() =>
  session.value ? findMovie(session.value.movieId) : undefined,
)
const hall = computed(() =>
  session.value ? findHall(session.value.hallId) : undefined,
)

const seats = computed(() => {
  const raw = route.query.seats
  const str = typeof raw === 'string' ? raw : ''
  return str ? str.split(',').filter(Boolean) : []
})
const total = computed(() =>
  typeof route.query.total === 'string' ? route.query.total : '0',
)

const bookingCode = `CNM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
</script>

<template>
  <section class="stage" style="min-height: 100vh; padding-top: 120px">
    <div class="max-w-xl mx-auto px-4 pb-16">
      <div class="text-center mb-8">
        <div class="success-mark">
          <AppIcon name="check" :size="30" fill="#18181b" />
        </div>
        <p class="eyebrow mt-6 mb-2">Бронирование подтверждено</p>
        <h1 class="display" style="color: #fff; font-size: clamp(1.75rem, 4vw, 2.5rem)">
          Места забронированы
        </h1>
      </div>

      <div class="ticket">
        <div class="ticket__code">
          <span style="color: #52525b; font-size: 0.65rem; letter-spacing: 0.2em">BOOKING</span>
          <span class="display" style="color: #f59e0b; font-size: 1.3rem; letter-spacing: 0.15em">
            {{ bookingCode }}
          </span>
        </div>

        <h2 class="display mb-1" style="color: #fff; font-size: 1.4rem">
          {{ movie?.title ?? 'Сеанс' }}
        </h2>
        <p v-if="hall" style="color: #a1a1aa; font-size: 0.85rem">{{ hall.name }}</p>

        <dl class="ticket__grid">
          <div>
            <dt>Дата</dt>
            <dd>{{ session ? formatDateLabel(session.startDateTime.slice(0, 10)) : '—' }}</dd>
          </div>
          <div>
            <dt>Время</dt>
            <dd>{{ session ? formatTime(session.startDateTime) : '—' }}</dd>
          </div>
          <div>
            <dt>Места</dt>
            <dd>{{ seats.length ? seats.join(', ') : '—' }}</dd>
          </div>
          <div>
            <dt>Сумма</dt>
            <dd style="color: #f59e0b; font-weight: 700">{{ total }} сом</dd>
          </div>
        </dl>

        <RouterLink to="/" class="btn-amber w-full justify-center mt-6">
          <AppIcon name="film" :size="16" />
          На главную
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.success-mark {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.4);
}

.ticket {
  background: #14141c;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  padding: 1.75rem;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
}
.ticket__code {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
}

.ticket__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
  margin-top: 1.25rem;
}
.ticket__grid dt {
  color: #71717a;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}
.ticket__grid dd {
  color: #f5f5f5;
  font-size: 0.95rem;
  font-weight: 600;
}
</style>
