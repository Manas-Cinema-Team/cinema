<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
import { saveTicket } from '@/stores/bookings'
import { t } from '@/stores/i18n'

const route = useRoute()

const session = computed(() => findSession(route.query.session as string | undefined))
const movie = computed(() => session.value ? findMovie(session.value.movieId) : undefined)
const hall = computed(() => session.value ? findHall(session.value.hallId) : undefined)

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
const qrDataUrl = ref<string>('')
const saved = ref(false)

// Генерация QR через публичный API (без зависимостей)
const generateQR = async () => {
  const text = encodeURIComponent(`CINEMA:${bookingCode}:${session.value?.id ?? ''}:${seats.value.join(',')}`)
  qrDataUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${text}&bgcolor=18181b&color=f59e0b&margin=10`
}

// Сохраняем билет в store один раз при монтировании
onMounted(async () => {
  await generateQR()
  if (!saved.value && session.value && movie.value && hall.value) {
    saveTicket({
      bookingCode,
      movieId: movie.value.id,
      movieTitle: movie.value.title,
      moviePoster: movie.value.posterUrl,
      sessionId: session.value.id,
      hallName: hall.value.name,
      date: session.value.startDateTime.slice(0, 10),
      time: formatTime(session.value.startDateTime),
      seats: seats.value,
      total: total.value,
    })
    saved.value = true
  }
})

const printTicket = () => window.print()
</script>

<template>
  <section class="stage no-print-bg" style="min-height: 100vh; padding-top: 120px">
    <div class="max-w-xl mx-auto px-4 pb-16">

      <!-- Шапка успеха -->
      <div class="text-center mb-8 print-hidden">
        <div class="success-mark">
          <AppIcon name="check" :size="30" fill="#18181b" />
        </div>
        <p class="eyebrow mt-6 mb-2">{{ t('success.eyebrow') }}</p>
        <h1 class="display page-title">{{ t('success.title') }}</h1>
      </div>

      <!-- Билет -->
      <div class="ticket" id="print-ticket">

        <!-- Перфорация верх -->
        <div class="ticket__perforation ticket__perforation--top" />

        <!-- Шапка билета -->
        <div class="ticket__header">
          <div>
            <div class="ticket__brand">🎬 CINEMA</div>
            <div class="ticket__code-label">BOOKING CODE</div>
            <div class="display ticket__code-value">{{ bookingCode }}</div>
          </div>
          <!-- QR -->
          <div class="ticket__qr">
            <img
              v-if="qrDataUrl"
              :src="qrDataUrl"
              alt="QR-код билета"
              class="ticket__qr-img"
            />
            <div v-else class="ticket__qr-placeholder">
              <AppIcon name="loader" :size="24" />
            </div>
          </div>
        </div>

        <!-- Основной контент -->
        <div class="ticket__body">
          <h2 class="display ticket__title">
            {{ movie?.title ?? t('success.session') }}
          </h2>
          <p v-if="hall" class="ticket__hall">
            <AppIcon name="map-pin" :size="13" />
            {{ hall.name }}
          </p>

          <dl class="ticket__grid">
            <div class="ticket__grid-item">
              <dt>{{ t('success.date') }}</dt>
              <dd>{{ session ? formatDateLabel(session.startDateTime.slice(0, 10)) : '—' }}</dd>
            </div>
            <div class="ticket__grid-item">
              <dt>{{ t('success.time') }}</dt>
              <dd class="ticket__time">{{ session ? formatTime(session.startDateTime) : '—' }}</dd>
            </div>
            <div class="ticket__grid-item ticket__grid-item--wide">
              <dt>{{ t('success.seats') }}</dt>
              <dd>
                <div class="ticket__seats">
                  <span v-for="seat in seats" :key="seat" class="ticket__seat-chip">
                    {{ seat }}
                  </span>
                </div>
              </dd>
            </div>
            <div class="ticket__grid-item ticket__grid-item--wide">
              <dt>{{ t('success.sum') }}</dt>
              <dd class="ticket__total display">{{ formatPrice(total) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Перфорация низ -->
        <div class="ticket__perforation ticket__perforation--bottom" />

        <!-- Подвал -->
        <div class="ticket__footer">
          <span class="ticket__footer-text">Предъявите QR-код на входе</span>
          <span class="ticket__footer-valid">Действителен только на дату сеанса</span>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="ticket-actions print-hidden">
        <button class="btn-ghost" @click="printTicket">
          <AppIcon name="printer" :size="16" />
          Распечатать
        </button>
        <RouterLink to="/profile" class="btn-ghost">
          <AppIcon name="ticket" :size="16" />
          Мои билеты
        </RouterLink>
        <RouterLink to="/" class="btn-amber">
          <AppIcon name="film" :size="16" />
          {{ t('common.home') }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-title {
  color: var(--text);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

/* ── Билет ── */
.ticket {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 1.2rem;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(245,158,11,0.1);
  position: relative;
}

/* Перфорация (пунктир с кружками) */
.ticket__perforation {
  height: 1px;
  background: repeating-linear-gradient(
    90deg,
    var(--line-strong) 0,
    var(--line-strong) 8px,
    transparent 8px,
    transparent 14px
  );
  position: relative;
  margin: 0 1.5rem;
}
.ticket__perforation--top { margin-top: 0; }
.ticket__perforation--bottom { margin-top: 0; }
.ticket__perforation::before,
.ticket__perforation::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg);
  border: 1px solid var(--line);
}
.ticket__perforation::before { left: -2rem; }
.ticket__perforation::after  { right: -2rem; }

/* Шапка билета */
.ticket__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 60%);
}
.ticket__brand {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: var(--amber);
  margin-bottom: 0.5rem;
}
.ticket__code-label {
  color: var(--text-fade);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  margin-bottom: 0.2rem;
}
.ticket__code-value {
  color: var(--amber);
  font-size: 1.4rem;
  letter-spacing: 0.15em;
}

/* QR */
.ticket__qr {
  flex-shrink: 0;
}
.ticket__qr-img {
  width: 90px;
  height: 90px;
  border-radius: 0.5rem;
  border: 2px solid rgba(245,158,11,0.3);
}
.ticket__qr-placeholder {
  width: 90px;
  height: 90px;
  border-radius: 0.5rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  color: var(--text-dim);
}

/* Тело */
.ticket__body {
  padding: 1.25rem 1.75rem 1.5rem;
}
.ticket__title {
  color: var(--text);
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
}
.ticket__hall {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-dim);
  font-size: 0.82rem;
  margin-bottom: 1.25rem;
}

.ticket__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
}
.ticket__grid-item dt {
  color: var(--text-fade);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}
.ticket__grid-item dd {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 600;
}
.ticket__grid-item--wide {
  grid-column: 1 / -1;
}
.ticket__time {
  font-size: 1.5rem !important;
  font-family: var(--font-display);
}
.ticket__total {
  font-size: 1.6rem !important;
  color: var(--amber) !important;
}

/* Места */
.ticket__seats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.1rem;
}
.ticket__seat-chip {
  padding: 0.2rem 0.6rem;
  border-radius: 0.35rem;
  background: rgba(245,158,11,0.15);
  border: 1px solid rgba(245,158,11,0.35);
  color: var(--amber);
  font-size: 0.82rem;
  font-weight: 700;
}

/* Подвал */
.ticket__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.75rem;
  background: var(--surface-soft);
  border-top: 1px solid var(--line);
}
.ticket__footer-text {
  font-size: 0.72rem;
  color: var(--text-dim);
}
.ticket__footer-valid {
  font-size: 0.68rem;
  color: var(--text-fade);
}

/* Кнопки под билетом */
.ticket-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}
.ticket-actions > * {
  flex: 1;
  justify-content: center;
  min-width: 120px;
}

/* ── Печать ── */
@media print {
  .print-hidden { display: none !important; }

  .ticket {
    border: 2px solid #000;
    box-shadow: none;
    border-radius: 0;
    color: #000 !important;
    background: #fff !important;
  }
  .ticket__code-value,
  .ticket__total { color: #000 !important; }
  .ticket__seat-chip {
    border: 1px solid #000;
    color: #000 !important;
    background: #eee !important;
  }
  .ticket__qr-img { border: 1px solid #000; }
}
</style>
