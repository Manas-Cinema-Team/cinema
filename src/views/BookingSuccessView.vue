<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import {
  findHall,
  findMovie,
  findSession,
  formatDateLabel,
  formatPrice,
  formatTime,
} from '@/data/cinema'
import { t } from '@/stores/i18n'

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
const total = computed(() => {
  const raw = route.query.total
  return typeof raw === 'string' ? Number(raw) : 0
})

const bookingCode = `CNM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
</script>

<template>
  <section class="stage" style="min-height: 100vh; padding-top: 120px">
    <div class="max-w-xl mx-auto px-4 pb-16">
      <div class="text-center mb-8">
        <div class="success-mark">
          <AppIcon name="check" :size="30" fill="#18181b" />
        </div>
        <p class="eyebrow mt-6 mb-2">{{ t('success.eyebrow') }}</p>
        <h1 class="display page-title">
          {{ t('success.title') }}
        </h1>
      </div>

      <div class="ticket">
        <div class="ticket__code">
          <span class="ticket__code-label">BOOKING</span>
          <span class="display ticket__code-value">
            {{ bookingCode }}
          </span>
        </div>

        <h2 class="display ticket__title">
          {{ movie?.title ?? t('success.session') }}
        </h2>
        <p v-if="hall" class="ticket__hall">{{ hall.name }}</p>

        <dl class="ticket__grid">
          <div>
            <dt>{{ t('success.date') }}</dt>
            <dd>{{ session ? formatDateLabel(session.startDateTime.slice(0, 10)) : '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('success.time') }}</dt>
            <dd>{{ session ? formatTime(session.startDateTime) : '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('success.seats') }}</dt>
            <dd>{{ seats.length ? seats.join(', ') : '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('success.sum') }}</dt>
            <dd class="ticket__total">{{ formatPrice(total) }}</dd>
          </div>
        </dl>

        <RouterLink to="/" class="btn-amber w-full justify-center mt-6">
          <AppIcon name="film" :size="16" />
          {{ t('common.home') }}
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
  background: linear-gradient(135deg, var(--amber), var(--amber-dark));
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.4);
}

.page-title {
  color: var(--text);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

.ticket {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 1.75rem;
  box-shadow: var(--shadow-card);
}
.ticket__code {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px dashed var(--line-strong);
}
.ticket__code-label {
  color: var(--text-fade);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
}
.ticket__code-value {
  color: var(--amber);
  font-size: 1.3rem;
  letter-spacing: 0.15em;
}
.ticket__title {
  color: var(--text);
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}
.ticket__hall {
  color: var(--text-dim);
  font-size: 0.85rem;
}
.ticket__total {
  color: var(--amber);
  font-weight: 700;
}

.ticket__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
  margin-top: 1.25rem;
}
.ticket__grid dt {
  color: var(--text-fade);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}
.ticket__grid dd {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 600;
}
</style>
