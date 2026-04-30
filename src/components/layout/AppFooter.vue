<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { createOrReuseBookingHold, getApiErrorMessage } from '@/api/cinema'
import AppIcon from '@/components/AppIcon.vue'
import { formatPrice } from '@/data/formatters'
import { cartCount, cartItem, cartTotal, clearCart, hasCart } from '@/stores/cart'
import { t } from '@/stores/i18n'

const router = useRouter()
const isProcessing = ref(false)
const error = ref('')

const goToPayment = async () => {
  const item = cartItem.value
  if (!item) return

  isProcessing.value = true
  error.value = ''

  try {
    const booking = await createOrReuseBookingHold(
      item.sessionId,
      item.seats.map((seat) => ({
        row: seat.row,
        number: seat.number,
      })),
    )

    clearCart()
    await router.push({
      name: 'payment',
      query: {
        booking: String(booking.id),
      },
    })
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, t('payment.loadErrorTitle'))
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <transition name="cart-slide">
    <div
      v-if="hasCart"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-brand/30 bg-[color:color-mix(in_srgb,var(--bg-elev)_95%,transparent)] shadow-[0_-8px_32px_rgba(0,0,0,0.25),0_-1px_0_rgba(245,158,11,0.15)] backdrop-blur-xl"
    >
      <div class="mx-auto max-w-6xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div v-if="error" class="mb-3 rounded-xl border border-danger/20 bg-danger/10 px-4 py-2 text-[0.78rem] text-danger">
          {{ error }}
        </div>

        <div class="flex items-center justify-between gap-4">
          <div class="flex min-w-0 flex-1 items-center gap-4">
            <div class="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/30 bg-brand/15 text-brand">
              <AppIcon name="ticket" :size="18" />
              <span class="absolute -right-1.5 -top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-canvas bg-brand text-[0.65rem] font-extrabold text-zinc-900">{{ cartCount }}</span>
            </div>
            <div class="min-w-0">
              <div class="truncate text-[0.88rem] font-bold text-copy">{{ cartItem?.movieTitle }}</div>
              <div class="mt-px text-[0.72rem] text-dim">
                {{ cartItem?.date }} · {{ cartItem?.time }} · {{ cartItem?.hallName }}
              </div>
            </div>
            <div class="hidden shrink-0 flex-wrap gap-1.5 sm:flex">
              <span
                v-for="seat in cartItem?.seats.slice(0, 5)"
                :key="seat.label"
                class="rounded-[0.3rem] border border-brand/30 bg-brand/15 px-[0.45rem] py-[0.15rem] text-[0.72rem] font-bold text-brand"
              >{{ seat.label }}</span>
              <span
                v-if="(cartItem?.seats.length ?? 0) > 5"
                class="rounded-[0.3rem] border border-line bg-surface-soft px-[0.45rem] py-[0.15rem] text-[0.72rem] font-bold text-dim"
              >+{{ (cartItem?.seats.length ?? 0) - 5 }}</span>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-4">
            <div>
              <div class="text-right text-[0.65rem] text-dim">{{ t('footer.total') }}</div>
              <div class="whitespace-nowrap text-base font-extrabold text-brand">
                {{ formatPrice(cartTotal, cartItem?.currency) }}
              </div>
            </div>
            <button class="btn-amber px-5 py-2.5 text-[0.9rem]" :disabled="isProcessing" @click="goToPayment">
              <AppIcon name="lock" :size="16" />
              {{ isProcessing ? t('footer.creatingBooking') : t('footer.pay') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <footer class="mt-auto border-t border-line bg-canvas transition-[padding] duration-300" :class="{ 'pb-[72px]': hasCart }">
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <span class="display text-base tracking-[0.14em]">
          <span class="text-brand">CINE</span><span class="text-copy">MA</span>
        </span>
        <span class="text-sm text-fade">· 2026</span>
      </div>

      <nav class="flex items-center gap-5">
        <RouterLink to="/" class="text-[0.8rem] text-dim transition hover:text-brand">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/movies" class="text-[0.8rem] text-dim transition hover:text-brand">{{ t('nav.afisha') }}</RouterLink>
        <RouterLink to="/schedule" class="text-[0.8rem] text-dim transition hover:text-brand">{{ t('nav.schedule') }}</RouterLink>
      </nav>
    </div>
  </footer>
</template>
