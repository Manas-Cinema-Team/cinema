import { computed, ref } from 'vue'

import type { SeatCoordinate } from '@/data/types'

export interface CartSeat extends SeatCoordinate {
  label: string
  price: number
}

export interface CartItem {
  sessionId: number
  movieTitle: string
  hallName: string
  date: string
  time: string
  currency: string
  seats: CartSeat[]
}

const cart = ref<CartItem | null>(null)

export const cartItem = computed(() => cart.value)
export const cartTotal = computed(() =>
  cart.value ? cart.value.seats.reduce((sum, seat) => sum + seat.price, 0) : 0,
)
export const cartCount = computed(() => cart.value?.seats.length ?? 0)
export const hasCart = computed(() => (cart.value?.seats.length ?? 0) > 0)

export const setCart = (item: CartItem | null) => {
  cart.value = item
}

export const clearCart = () => {
  cart.value = null
}
