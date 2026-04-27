// stores/bookings.ts
// Хранилище купленных билетов (localStorage, фронтенд-only MVP)

import { computed, ref } from 'vue'

export interface SavedTicket {
  id: string           // уникальный id билета
  bookingCode: string  // CNM-XXXXX
  movieId: string
  movieTitle: string
  moviePoster?: string
  sessionId: string
  hallName: string
  date: string         // ISO date YYYY-MM-DD
  time: string         // HH:MM
  seats: string[]
  total: number
  purchasedAt: string  // ISO datetime
}

const STORAGE_KEY = 'cinema.bookings'

const load = (): SavedTicket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedTicket[]) : []
  } catch {
    return []
  }
}

const tickets = ref<SavedTicket[]>(load())

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets.value))
}

export const allTickets = computed(() => [...tickets.value].reverse()) // новые сначала

export const ticketCount = computed(() => tickets.value.length)

export const saveTicket = (ticket: Omit<SavedTicket, 'id' | 'purchasedAt'>) => {
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
  tickets.value = []
  localStorage.removeItem(STORAGE_KEY)
}