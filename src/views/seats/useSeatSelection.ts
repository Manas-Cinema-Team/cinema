import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { createOrReuseBookingHold, fetchSeatMap, fetchSessionDetail, getApiErrorMessage, isApiError } from '@/api/cinema'
import { formatDateLabel, formatSeatLabel, type Hall, type Movie, type ScheduleItem, type SeatMapData } from '@/data/cinema'
import { clearCart, setCart } from '@/stores/cart'
import { t } from '@/stores/i18n'

export type DisplayStatus = 'available' | 'held' | 'held-self' | 'booked' | 'selected' | 'disabled'

const MAX_SEATS = 8

const seatKey = (row: number, number: number) => `${row}:${number}`

const parseSeatKey = (value: string): { row: number; number: number } => {
  const [rawRow = '0', rawNumber = '0'] = value.split(':')
  return {
    row: Number(rawRow),
    number: Number(rawNumber),
  }
}

export function useSeatSelection(sessionId: () => string | undefined) {
  const router = useRouter()

  const sessionItem = ref<ScheduleItem | null>(null)
  const seatMap = ref<SeatMapData | null>(null)
  const selectedKeys = ref<Set<string>>(new Set())
  const loading = ref(true)
  const loadError = ref('')
  const actionError = ref('')
  const isSubmitting = ref(false)
  const now = ref(Date.now())

  let pollTimer: ReturnType<typeof setInterval> | null = null
  const countdownTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  const movie = computed<Movie | null>(() => sessionItem.value?.movie || null)
  const hall = computed<Hall | null>(() => {
    if (!sessionItem.value) return null
    return {
      ...sessionItem.value.hall,
      schema: seatMap.value?.schema,
    }
  })
  const pollingInterval = computed(() => seatMap.value?.pollingInterval ?? 5)
  const currency = computed(() => sessionItem.value?.session.currency || 'KGS')

  const seatLookup = computed(() => {
    const map = new Map<string, SeatMapData['seats'][number]>()
    for (const seat of seatMap.value?.seats || []) {
      map.set(seatKey(seat.row, seat.number), seat)
    }
    return map
  })

  const selectedList = computed(() =>
    [...selectedKeys.value]
      .map((key) => {
        const { row, number } = parseSeatKey(key)
        const seat = seatLookup.value.get(key)
        return {
          row,
          number,
          key,
          label: formatSeatLabel(row, number),
          type: seat?.type ?? 'standard',
          price: seat?.price ?? sessionItem.value?.session.price ?? 0,
        }
      })
      .sort((left, right) => (left.row - right.row) || (left.number - right.number)),
  )

  const total = computed(() => selectedList.value.reduce((sum, seat) => sum + seat.price, 0))

  const heldByMeSeats = computed(() =>
    (seatMap.value?.seats || [])
      .filter((seat) => seat.status === 'held' && seat.heldByMe && seat.expiresAt)
      .sort((left, right) => (left.expiresAt || '').localeCompare(right.expiresAt || '')),
  )

  const expiresAt = computed(() => heldByMeSeats.value[0]?.expiresAt || null)
  const secondsLeft = computed(() => {
    if (!expiresAt.value) return 0
    return Math.max(0, Math.floor((new Date(expiresAt.value).getTime() - now.value) / 1000))
  })
  const timerLabel = computed(() => {
    const minutes = Math.floor(secondsLeft.value / 60)
    const seconds = secondsLeft.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const syncCart = () => {
    if (!sessionItem.value || selectedList.value.length === 0) {
      clearCart()
      return
    }

    setCart({
      sessionId: sessionItem.value.session.id,
      movieTitle: sessionItem.value.movie.title,
      hallName: sessionItem.value.hall.name,
      date: formatDateLabel(sessionItem.value.date),
      time: sessionItem.value.time,
      currency: currency.value,
      seats: selectedList.value.map((seat) => ({
        row: seat.row,
        number: seat.number,
        label: seat.label,
        price: seat.price,
      })),
    })
  }

  const pruneSelection = () => {
    const next = new Set<string>()
    for (const key of selectedKeys.value) {
      const seat = seatLookup.value.get(key)
      if (seat?.status === 'available') {
        next.add(key)
      }
    }
    selectedKeys.value = next
  }

  const refreshSeatMapOnly = async () => {
    if (!sessionItem.value) return

    try {
      seatMap.value = await fetchSeatMap(sessionItem.value.session.id)
      pruneSelection()
      syncCart()
    } catch (err) {
      loadError.value = getApiErrorMessage(err, t('auth.requestFailed'))
    }
  }

  const restartPolling = () => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = setInterval(() => {
      void refreshSeatMapOnly()
    }, pollingInterval.value * 1000)
  }

  const loadSeatPage = async (rawSessionId: string) => {
    loading.value = true
    loadError.value = ''
    actionError.value = ''
    selectedKeys.value = new Set()
    now.value = Date.now()
    clearCart()

    try {
      const numericSessionId = Number(rawSessionId)
      const [session, map] = await Promise.all([
        fetchSessionDetail(numericSessionId),
        fetchSeatMap(numericSessionId),
      ])
      sessionItem.value = session
      seatMap.value = map
      syncCart()
      restartPolling()
    } catch (err) {
      sessionItem.value = null
      seatMap.value = null
      loadError.value = getApiErrorMessage(err, t('auth.requestFailed'))
    } finally {
      loading.value = false
    }
  }

  watch(
    () => sessionId(),
    (value) => {
      if (!value) {
        sessionItem.value = null
        seatMap.value = null
        loadError.value = t('seats.notFound')
        loading.value = false
        clearCart()
        return
      }

      void loadSeatPage(value)
    },
    { immediate: true },
  )

  watch(
    () => pollingInterval.value,
    () => {
      if (sessionItem.value) {
        restartPolling()
      }
    },
  )

  watch(
    () => selectedList.value.map((seat) => seat.key).join(','),
    () => {
      syncCart()
    },
  )

  onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
    clearInterval(countdownTimer)
    clearCart()
  })

  const reload = async () => {
    const value = sessionId()
    if (!value) {
      loadError.value = t('seats.notFound')
      return
    }

    await loadSeatPage(value)
  }

  const seatStatus = (row: number, number: number): DisplayStatus => {
    const key = seatKey(row, number)
    const seat = seatLookup.value.get(key)

    if (!seat) return 'disabled'
    if (selectedKeys.value.has(key)) return 'selected'
    if (seat.status === 'held' && seat.heldByMe) return 'held-self'
    return seat.status
  }

  const toggle = (row: number, number: number) => {
    actionError.value = ''
    const status = seatStatus(row, number)

    if (status === 'held' || status === 'held-self' || status === 'booked' || status === 'disabled') {
      return
    }

    const key = seatKey(row, number)
    const next = new Set(selectedKeys.value)

    if (next.has(key)) {
      next.delete(key)
    } else {
      if (next.size >= MAX_SEATS) return
      next.add(key)
    }

    selectedKeys.value = next
  }

  const confirm = async () => {
    if (!sessionItem.value || selectedList.value.length === 0) return

    isSubmitting.value = true
    actionError.value = ''

    try {
      const booking = await createOrReuseBookingHold(
        sessionItem.value.session.id,
        selectedList.value.map((seat) => ({
          row: seat.row,
          number: seat.number,
        })),
      )
      clearCart()
      router.push({
        name: 'payment',
        query: {
          booking: String(booking.id),
        },
      })
    } catch (err) {
      actionError.value = getApiErrorMessage(err, t('auth.requestFailed'))

      if (isApiError(err, 'SEAT_HELD') || isApiError(err, 'HOLD_EXPIRED')) {
        await refreshSeatMapOnly()
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    MAX_SEATS,
    loading,
    loadError,
    actionError,
    isSubmitting,
    movie,
    hall,
    session: computed(() => sessionItem.value?.session || null),
    pollingInterval,
    availableSeats: computed(() => seatMap.value?.availableSeats ?? 0),
    expiresAt,
    secondsLeft,
    timerLabel,
    selectedList,
    total,
    currency,
    reload,
    seatStatus,
    toggle,
    confirm,
  }
}
