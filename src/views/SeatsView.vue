<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import {
  findHall,
  findMovie,
  findSession,
  formatDateLabel,
  formatTime,
  type SeatKind,
} from '@/data/cinema'

const route = useRoute()
const router = useRouter()

const sessionId = computed(() =>
  Array.isArray(route.params.sessionId)
    ? route.params.sessionId[0]
    : route.params.sessionId,
)
const session = computed(() => findSession(sessionId.value))
const movie = computed(() => (session.value ? findMovie(session.value.movieId) : undefined))
const hall = computed(() => (session.value ? findHall(session.value.hallId) : undefined))

// ── Моковое серверное состояние мест ──
// ТЗ: polling 5-10 сек синхронизирует available / held / booked.
const seedTaken = (row: string, col: number, rowIdx: number): 'booked' | 'held' | null => {
  const seed = (rowIdx * 31 + col * 17 + (sessionId.value ?? '').length * 11) % 100
  if (seed < 10) return 'booked'
  if (seed < 16) return 'held'
  return null
}

const remoteStatus = reactive<Record<string, 'booked' | 'held'>>({})
const selected = ref<Set<string>>(new Set())

const buildRemote = () => {
  if (!hall.value) return
  const schema = hall.value.schema
  schema.rows.forEach((row, rowIdx) => {
    for (let col = 1; col <= schema.seatsPerRow; col++) {
      const key = `${row}${col}`
      const status = seedTaken(row, col, rowIdx)
      if (status) remoteStatus[key] = status
    }
  })
}

// ТЗ 6.6: «HTTP-поллинг 5-10 сек». Симуляция — случайное "бронирование" со стороны других.
let pollTimer: ReturnType<typeof setInterval> | null = null

const pollTick = () => {
  if (!hall.value) return
  const schema = hall.value.schema
  // один случайный свободный слот становится "held" или "booked"
  const free: string[] = []
  schema.seats.forEach((s) => {
    if (s.disabled) return
    const key = `${s.row}${s.number}`
    if (!remoteStatus[key] && !selected.value.has(key)) free.push(key)
  })
  if (free.length === 0) return
  const pick = free[Math.floor(Math.random() * free.length)]
  if (!pick) return
  remoteStatus[pick] = Math.random() < 0.5 ? 'held' : 'booked'
}

// ── 10-минутный таймер брони (ТЗ 6.5) ──
const HOLD_SECONDS = 10 * 60
const secondsLeft = ref(HOLD_SECONDS)
let holdTimer: ReturnType<typeof setInterval> | null = null

const timerLabel = computed(() => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = secondsLeft.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

onMounted(() => {
  buildRemote()
  holdTimer = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value -= 1
    else if (holdTimer) {
      clearInterval(holdTimer)
      selected.value.clear()
    }
  }, 1000)
  pollTimer = setInterval(pollTick, 7000)
})

onUnmounted(() => {
  if (holdTimer) clearInterval(holdTimer)
  if (pollTimer) clearInterval(pollTimer)
})

// ── Взаимодействие ──
const MAX_SEATS = 8

type DisplayStatus = 'available' | 'held' | 'booked' | 'selected' | 'disabled'

const seatStatus = (row: string, col: number): DisplayStatus => {
  const key = `${row}${col}`
  const seat = hall.value?.schema.seats.find((s) => s.row === row && s.number === col)
  if (seat?.disabled) return 'disabled'
  if (selected.value.has(key)) return 'selected'
  return remoteStatus[key] ?? 'available'
}

const toggle = (row: string, col: number) => {
  const key = `${row}${col}`
  const status = seatStatus(row, col)
  if (status === 'held' || status === 'booked' || status === 'disabled') return
  const next = new Set(selected.value)
  if (next.has(key)) next.delete(key)
  else {
    if (next.size >= MAX_SEATS) return
    next.add(key)
  }
  selected.value = next
}

const kindOf = (row: string, col: number): SeatKind => {
  const seat = hall.value?.schema.seats.find((s) => s.row === row && s.number === col)
  return seat?.kind ?? 'standard'
}

const priceFor = (kind: SeatKind) =>
  kind === 'vip' ? session.value?.priceVip ?? 0 : session.value?.priceStandard ?? 0

const selectedList = computed(() =>
  [...selected.value]
    .map((k) => {
      const row = k.charAt(0)
      const col = Number(k.slice(1))
      return { row, col, kind: kindOf(row, col), key: k }
    })
    .sort((a, b) => a.key.localeCompare(b.key)),
)

const total = computed(() =>
  selectedList.value.reduce((sum, s) => sum + priceFor(s.kind), 0),
)

const confirm = () => {
  if (selectedList.value.length === 0 || !session.value) return
  router.push({
    name: 'booking-success',
    query: {
      session: session.value.id,
      seats: [...selected.value].join(','),
      total: String(total.value),
    },
  })
}
</script>

<template>
  <div v-if="!session || !movie || !hall" class="stage flex items-center justify-center" style="min-height: 100vh">
    <div class="text-center" style="color: #71717a">
      Сеанс не найден.
      <button class="btn-amber mt-6" @click="router.push('/schedule')">К расписанию</button>
    </div>
  </div>

  <section v-else class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header row -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <button
            class="flex items-center gap-2 mb-3"
            style="color: #a1a1aa; font-size: 0.85rem"
            @click="router.back()"
          >
            <AppIcon name="chevron-left" :size="16" />
            Назад
          </button>
          <h1 class="display" style="color: #fff; font-size: clamp(1.5rem, 3vw, 2rem)">
            {{ movie.title }}
          </h1>
          <div class="flex flex-wrap gap-3 mt-1" style="color: #a1a1aa; font-size: 0.85rem">
            <span class="flex items-center gap-1">
              <AppIcon name="calendar" :size="12" />
              {{ formatDateLabel(session.startDateTime.slice(0, 10)) }}
            </span>
            <span class="flex items-center gap-1">
              <AppIcon name="clock" :size="12" />
              {{ formatTime(session.startDateTime) }}
            </span>
            <span>{{ hall.name }}</span>
          </div>
        </div>

        <div class="hold-timer" :class="{ 'hold-timer--low': secondsLeft < 60 }">
          <AppIcon name="clock" :size="14" />
          <span>Бронь истекает через {{ timerLabel }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div class="xl:col-span-3">
          <!-- Screen -->
          <div class="text-center mb-8">
            <div class="screen-bar mx-auto" style="max-width: 560px" />
            <p
              class="mt-2"
              style="color: #52525b; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase"
            >
              Экран
            </p>
          </div>

          <!-- Seat map -->
          <div class="seat-map">
            <div
              v-for="(row, rIdx) in hall.schema.rows"
              :key="row"
              class="seat-row"
            >
              <span class="seat-rowlabel">{{ row }}</span>
              <div class="seat-cells">
                <template v-for="col in hall.schema.seatsPerRow" :key="`${row}-${col}`">
                  <span
                    v-if="col === Math.ceil(hall.schema.seatsPerRow / 2) + 1"
                    class="seat-aisle"
                  />
                  <button
                    type="button"
                    class="seat"
                    :class="[
                      `seat--${seatStatus(row, col)}`,
                      `seat--${kindOf(row, col)}`,
                    ]"
                    :disabled="['held', 'booked', 'disabled'].includes(seatStatus(row, col))"
                    :aria-label="`Место ${row}${col}`"
                    @click="toggle(row, col)"
                    v-show="rIdx >= 0"
                  >
                    {{ col }}
                  </button>
                </template>
              </div>
              <span class="seat-rowlabel">{{ row }}</span>
            </div>
          </div>

          <!-- Legend -->
          <div class="legend">
            <div class="legend-item">
              <span class="seat seat-demo seat--available seat--standard" />
              <span>Свободно</span>
            </div>
            <div class="legend-item">
              <span class="seat seat-demo seat--available seat--vip" />
              <span>VIP</span>
            </div>
            <div class="legend-item">
              <span class="seat seat-demo seat--selected seat--standard" />
              <span>Выбрано</span>
            </div>
            <div class="legend-item">
              <span class="seat seat-demo seat--held seat--standard" />
              <span>Забронировано</span>
            </div>
            <div class="legend-item">
              <span class="seat seat-demo seat--booked seat--standard" />
              <span>Куплено</span>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <aside class="summary">
          <p class="eyebrow mb-1">Заказ</p>
          <h2 class="display mb-4" style="color: #fff; font-size: 1.3rem">
            {{ selectedList.length }} {{ selectedList.length === 1 ? 'место' : 'места' }}
          </h2>

          <div v-if="selectedList.length > 0" class="flex flex-wrap gap-2 mb-5">
            <span
              v-for="s in selectedList"
              :key="s.key"
              class="seat-chip"
              :class="`seat-chip--${s.kind}`"
            >
              {{ s.row }}{{ s.col }}
              <button aria-label="Убрать" @click="toggle(s.row, s.col)">
                <AppIcon name="close" :size="11" />
              </button>
            </span>
          </div>
          <div v-else class="summary-empty">
            Выберите места на схеме
          </div>

          <div class="divider" style="margin: 1rem 0" />

          <div class="flex justify-between mb-5" style="font-weight: 700">
            <span style="color: #e4e4e7">Итого</span>
            <span class="display" style="color: #f59e0b; font-size: 1.4rem">
              {{ total }} сом
            </span>
          </div>

          <button
            class="btn-amber w-full"
            :disabled="selectedList.length === 0"
            @click="confirm"
          >
            <AppIcon name="ticket" :size="16" />
            Подтвердить
          </button>
          <p class="mt-2 text-center" style="color: #52525b; font-size: 0.72rem">
            Максимум {{ MAX_SEATS }} мест
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hold-timer {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.hold-timer--low {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: #ef4444;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 8px;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  overflow-x: auto;
}
.seat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  min-width: 480px;
}
.seat-rowlabel {
  width: 18px;
  color: #52525b;
  font-size: 0.72rem;
  font-weight: 600;
  text-align: center;
}
.seat-cells {
  display: flex;
  align-items: center;
  gap: 4px;
}
.seat-aisle {
  width: 16px;
}

.seat {
  width: 28px;
  height: 28px;
  border-radius: 5px 5px 8px 8px;
  font-size: 0.6rem;
  font-weight: 600;
  color: transparent;
  border: 1px solid transparent;
  background: #16161e;
  cursor: pointer;
  transition: all 120ms ease;
}
.seat:hover:not(:disabled) {
  transform: translateY(-1px);
  color: rgba(255, 255, 255, 0.6);
}
.seat:disabled { cursor: not-allowed; }

.seat--available.seat--standard {
  background: #1a1a24;
  border-color: rgba(255, 255, 255, 0.1);
}
.seat--available.seat--standard:hover {
  border-color: rgba(34, 197, 94, 0.5);
}
.seat--available.seat--vip {
  background: #1f1709;
  border-color: rgba(245, 158, 11, 0.3);
}
.seat--available.seat--vip:hover {
  border-color: rgba(245, 158, 11, 0.6);
}

.seat--selected.seat--standard {
  background: #166534;
  border-color: #22c55e;
  color: #fff;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
}
.seat--selected.seat--vip {
  background: #854d0e;
  border-color: #f59e0b;
  color: #fff;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.seat--held {
  background: #3f2a0a !important;
  border-color: rgba(245, 158, 11, 0.2) !important;
  opacity: 0.7;
}
.seat--booked {
  background: #1c1c22 !important;
  border-color: transparent !important;
  opacity: 0.35;
}
.seat--disabled {
  background: transparent !important;
  border-color: transparent !important;
  cursor: default;
  opacity: 0.2;
}

.seat-demo {
  width: 18px;
  height: 18px;
  cursor: default;
}

.legend {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: center;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a1a1aa;
  font-size: 0.78rem;
}

.summary {
  background: #14141c;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 96px;
}

.summary-empty {
  padding: 0.9rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  color: #71717a;
  font-size: 0.82rem;
  text-align: center;
}

.seat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 0.35rem;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
}
.seat-chip button {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  padding: 0;
}
.seat-chip button:hover { opacity: 1; }
.seat-chip--standard {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
}
.seat-chip--vip {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
}
</style>
