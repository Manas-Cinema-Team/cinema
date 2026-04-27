// stores/cart.ts
// Глобальная корзина — выбранные места видны из любого компонента (в т.ч. футера)

import { computed, ref } from 'vue'

export interface CartItem {
  sessionId: string
  movieTitle: string
  hallName: string
  date: string
  time: string
  seats: string[]
  pricePerSeat: number
}

const cart = ref<CartItem | null>(null)

export const cartItem = computed(() => cart.value)
export const cartTotal = computed(() =>
  cart.value ? cart.value.seats.length * cart.value.pricePerSeat : 0,
)
export const cartCount = computed(() => cart.value?.seats.length ?? 0)
export const hasCart = computed(() => (cart.value?.seats.length ?? 0) > 0)

export const setCart = (item: CartItem) => {
  cart.value = item
}

export const clearCart = () => {
  cart.value = null
}