// ── Вся логика выбора мест, таймера и поллинга ───────────────────────────
// Раньше жила прямо в SeatsView.vue (script setup).
// Теперь SeatsView только импортирует этот composable.

import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'


export type DisplayStatus = 'available' | 'held' | 'booked' | 'selected' | 'disabled'

const MAX_SEATS = 8
const HOLD_SECONDS = 10 * 60

export function useSeatSelection(
  session: () => Session | undefined,
  hall: () => Hall | undefined,
  sessionId: () => string | undefined,
) {
  const router = useRouter()

  // ── Статусы с сервера (поллинг / seed) ───────────────────────────────
  const remoteStatus = reactive<Record<string, 'booked' | 'held'>>({})
  const selected = ref<Set<string>>(new Set())

  const seedTaken = (row: string, col: number, rowIdx: number): 'booked' | 'held' | null => {
    const seed = (rowIdx * 31 + col * 17 + (sessionId() ?? '').length * 11) % 100
    if (seed < 10) return 'booked'
    if (seed < 16) return 'held'
    return null
  }

  const buildRemote = () => {
    const h = hall()
    if (!h) return

      for (let col = 1; col <= h.schema.seatsPerRow; col++) {
        const key = `${row}${col}`
        const status = seedTaken(row, col, rowIdx)
        if (status) remoteStatus[key] = status
      }
    })
  }

  const pollTick = () => {
    const h = hall()
    if (!h) return
    const free: string[] = []

      if (s.disabled) return
      const key = `${s.row}${s.number}`
      if (!remoteStatus[key] && !selected.value.has(key)) free.push(key)
    })
    if (free.length === 0) return
    const pick = free[Math.floor(Math.random() * free.length)]
    if (!pick) return
    remoteStatus[pick] = Math.random() < 0.5 ? 'held' : 'booked'
  }

  // ── Hold-таймер ──────────────────────────────────────────────────────
  const secondsLeft = ref(HOLD_SECONDS)

  const timerLabel = computed(() => {
    const m = Math.floor(secondsLeft.value / 60)
    const s = secondsLeft.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  // ── Статус конкретного места ─────────────────────────────────────────
  const seatStatus = (row: string, col: number): DisplayStatus => {
    const key = `${row}${col}`

    if (seat?.disabled) return 'disabled'
    if (selected.value.has(key)) return 'selected'
    return remoteStatus[key] ?? 'available'
  }

  // ── Клик по месту ────────────────────────────────────────────────────
  const toggle = (row: string, col: number) => {
    const key = `${row}${col}`
    const status = seatStatus(row, col)
    if (status === 'held' || status === 'booked' || status === 'disabled') return
    const next = new Set(selected.value)
    if (next.has(key)) {
      next.delete(key)
    } else {
      if (next.size >= MAX_SEATS) return
      next.add(key)
    }
    selected.value = next
  }

  // ── Производные ─────────────────────────────────────────────────────
  const selectedList = computed(() =>
    [...selected.value]
      .map((k) => ({ row: k.charAt(0), col: Number(k.slice(1)), key: k }))
      .sort((a, b) => a.key.localeCompare(b.key)),
  )

  const total = computed(() => selectedList.value.length * (session()?.price ?? 0))

  // ── Подтверждение → переход на success ───────────────────────────────
  const confirm = () => {
    const s = session()
    if (selectedList.value.length === 0 || !s) return
    router.push({

      query: {
        session: s.id,
        seats: [...selected.value].join(','),
        total: String(total.value),
      },
    })
  }

  // ── Lifecycle ────────────────────────────────────────────────────────
  let holdTimer: ReturnType<typeof setInterval> | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    buildRemote()
    holdTimer = setInterval(() => {
      if (secondsLeft.value > 0) {
        secondsLeft.value -= 1
      } else {
        if (holdTimer) clearInterval(holdTimer)
        selected.value.clear()
      }
    }, 1000)
    pollTimer = setInterval(pollTick, 7000)
  })

  onUnmounted(() => {
    if (holdTimer) clearInterval(holdTimer)
    if (pollTimer) clearInterval(pollTimer)
  })

  return {
    MAX_SEATS,
    secondsLeft,
    timerLabel,
    remoteStatus,
    selected,
    selectedList,
    total,
    seatStatus,
    toggle,
    confirm,
  }

