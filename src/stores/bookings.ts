// stores/bookings.ts
// Хранилище купленных билетов (localStorage, фронтенд-only MVP)

import { computed, ref, watch } from 'vue'

import { currentUser } from '@/stores/auth'

export interface SavedTicket {
  id: string           // уникальный id билета
  bookingId: number
  bookingCode: string  // CNM-XXXXX
  movieId: number
  movieTitle: string
  moviePoster?: string
  sessionId: number
  hallName: string
  date: string         // ISO date YYYY-MM-DD
  time: string         // HH:MM
  seats: string[]
  total: number
  currency: string
  purchasedAt: string  // ISO datetime
}

const STORAGE_KEY_PREFIX = 'cinema.bookings.user'

const getStorageKey = () => {
  const userId = currentUser.value?.id
  return userId ? `${STORAGE_KEY_PREFIX}.${userId}` : null
}

const load = (storageKey: string | null): SavedTicket[] => {
  if (!storageKey) return []

  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as SavedTicket[]) : []
  } catch {
    return []
  }
}

const tickets = ref<SavedTicket[]>([])

watch(
  () => currentUser.value?.id ?? null,
  () => {
    tickets.value = load(getStorageKey())
  },
  { immediate: true },
)

const persist = () => {
  const storageKey = getStorageKey()
  if (!storageKey) return

  localStorage.setItem(storageKey, JSON.stringify(tickets.value))
}

export const allTickets = computed(() => [...tickets.value].reverse()) // новые сначала

export const ticketCount = computed(() => tickets.value.length)

export const saveTicket = (ticket: Omit<SavedTicket, 'id' | 'purchasedAt'>) => {
  if (!currentUser.value) {
    return null
  }

  const existing = tickets.value.find((item) => item.bookingId === ticket.bookingId)
  if (existing) {
    return existing
  }

  const newTicket: SavedTicket = {
    ...ticket,
    id: crypto.randomUUID(),
    purchasedAt: new Date().toISOString(),
  }
  tickets.value.push(newTicket)
  persist()
  return newTicket
}

export const removeTicket = (id: string) => {
  tickets.value = tickets.value.filter((t) => t.id !== id)
  persist()
}

export const clearTickets = () => {
  const storageKey = getStorageKey()
  tickets.value = []
  if (storageKey) {
    localStorage.removeItem(storageKey)
  }
}
