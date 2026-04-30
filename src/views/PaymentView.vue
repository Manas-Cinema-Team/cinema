<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { cancelBooking, confirmBooking, fetchBooking, fetchSessionDetail, getApiErrorMessage, isApiError } from '@/api/cinema'
import AppIcon from '@/components/AppIcon.vue'
import { formatDateLabel, formatPrice, formatSeatLabel, formatTime, type Booking, type ScheduleItem } from '@/data/cinema'
import { clearCart } from '@/stores/cart'
import { t } from '@/stores/i18n'

const route = useRoute()
const router = useRouter()

const bookingId = computed(() => {
  const raw = Array.isArray(route.query.booking) ? route.query.booking[0] : route.query.booking
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
})

const booking = ref<Booking | null>(null)
const sessionItem = ref<ScheduleItem | null>(null)
const loading = ref(true)
const loadError = ref('')
const submitError = ref('')
const isProcessing = ref(false)
const isCancelling = ref(false)
const now = ref(Date.now())

const payMethod = ref<'card' | 'qr'>('card')
const cardNumber = ref('')
const cardName = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const errors = ref<Record<string, string>>({})

const countdownTimer = setInterval(() => {
  now.value = Date.now()
}, 1000)

const expiresAt = computed(() => booking.value?.expiresAt || null)
const secondsLeft = computed(() => {
  if (!expiresAt.value) return 0
  return Math.max(0, Math.floor((new Date(expiresAt.value).getTime() - now.value) / 1000))
})
const timerLabel = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60)
  const seconds = secondsLeft.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const seatItems = computed(() =>
  (booking.value?.seats || []).map((seat) => ({
    ...seat,
    label: formatSeatLabel(seat.row, seat.number),
  })),
)

const currency = computed(() => booking.value?.currency || 'KGS')
const isPaid = computed(() => booking.value?.bookingStatus === 'confirmed' || booking.value?.paymentStatus === 'paid')
const isExpired = computed(() => booking.value?.bookingStatus === 'expired' || (booking.value?.bookingStatus === 'draft' && secondsLeft.value === 0))
const isCancelled = computed(() => booking.value?.bookingStatus === 'cancelled')
const isPayable = computed(() =>
  !!booking.value
  && booking.value.bookingStatus === 'draft'
  && booking.value.paymentStatus === 'pending'
  && secondsLeft.value > 0,
)

const statusLabel = computed(() => {
  if (isPaid.value) return t('payment.statusPaid')
  if (isCancelled.value) return t('payment.statusCancelled')
  if (isExpired.value) return t('payment.statusExpired')
  return t('payment.statusHold', { time: timerLabel.value })
})

const statusClass = computed(() => {
  if (isPaid.value) return 'border-success/25 bg-success/10 text-success'
  if (isCancelled.value || isExpired.value) return 'border-danger/25 bg-danger/10 text-danger'
  return 'border-brand/25 bg-brand/10 text-brand'
})

const formatCard = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

const onCardInput = (event: Event) => {
  cardNumber.value = formatCard((event.target as HTMLInputElement).value)
}

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

const onExpiryInput = (event: Event) => {
  cardExpiry.value = formatExpiry((event.target as HTMLInputElement).value)
}

const validate = () => {
  const nextErrors: Record<string, string> = {}

  if (payMethod.value === 'card') {
    if (cardNumber.value.replace(/\s/g, '').length < 16) nextErrors.cardNumber = t('payment.cardErrorNumber')
    if (!cardName.value.trim()) nextErrors.cardName = t('payment.cardErrorName')
    if (cardExpiry.value.length < 5) nextErrors.cardExpiry = t('payment.cardErrorExpiry')
    if (cardCvv.value.replace(/\D/g, '').length < 3) nextErrors.cardCvv = t('payment.cardErrorCvv')
  }

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

const loadPaymentPage = async () => {
  if (!bookingId.value) {
    booking.value = null
    sessionItem.value = null
    loadError.value = t('payment.missingBookingId')
    loading.value = false
    return
  }

  loading.value = true
  loadError.value = ''
  submitError.value = ''
  now.value = Date.now()

  try {
    const bookingData = await fetchBooking(bookingId.value)
    booking.value = bookingData
    clearCart()

    try {
      sessionItem.value = await fetchSessionDetail(bookingData.sessionId)
    } catch {
      sessionItem.value = null
    }
  } catch (error) {
    booking.value = null
    sessionItem.value = null
    loadError.value = getApiErrorMessage(error, t('auth.requestFailed'))
  } finally {
    loading.value = false
  }
}

watch(() => bookingId.value, () => {
  void loadPaymentPage()
}, { immediate: true })

const pay = async () => {
  if (!booking.value || !isPayable.value || !validate()) {
    return
  }

  isProcessing.value = true
  submitError.value = ''

  try {
    const confirmedBooking = await confirmBooking(booking.value.id)
    booking.value = confirmedBooking
    clearCart()
    await router.push({
      name: 'booking-success',
      query: {
        booking: String(confirmedBooking.id),
      },
    })
  } catch (error) {
    submitError.value = getApiErrorMessage(error, t('auth.requestFailed'))

    if (isApiError(error, 'HOLD_EXPIRED') || isApiError(error, 'BOOKING_NOT_ACTIVE')) {
      await loadPaymentPage()
    }
  } finally {
    isProcessing.value = false
  }
}

const goToSeats = () => {
  if (booking.value) {
    router.push({ name: 'seats', params: { sessionId: String(booking.value.sessionId) } })
    return
  }

  router.push('/schedule')
}

const cancelCurrentBooking = async () => {
  if (!booking.value) return

  isCancelling.value = true
  submitError.value = ''

  try {
    await cancelBooking(booking.value.id)
    clearCart()
    goToSeats()
  } catch (error) {
    submitError.value = getApiErrorMessage(error, t('auth.requestFailed'))
  } finally {
    isCancelling.value = false
  }
}

const panelClass = 'rounded-2xl border border-line bg-panel px-6 py-5'
const panelLabelClass = 'mb-4 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-dim'
const inputBaseClass = 'w-full rounded-xl border bg-surface-soft px-4 py-2.5 text-[0.9rem] text-copy outline-none transition placeholder:text-fade'

const fieldClass = (name: string) => [
  inputBaseClass,
  errors.value[name] ? 'border-danger' : 'border-line focus:border-brand',
]

const payMethodClass = (active: boolean) =>
  active
    ? 'border-brand/50 bg-brand/15 text-brand'
    : 'border-line bg-surface-soft text-muted hover:border-line-strong hover:text-copy'

onUnmounted(() => {
  clearInterval(countdownTimer)
})
</script>

<template>
  <section class="stage min-h-screen pt-24">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button class="mb-6 inline-flex items-center gap-2 bg-transparent text-[0.85rem] text-dim transition hover:text-copy" @click="goToSeats">
        <AppIcon name="arrow-left" :size="15" />
        {{ t('common.backToSeats') }}
      </button>

      <div v-if="loading" class="rounded-2xl border border-line bg-panel p-8 text-sm text-dim">
        {{ t('payment.loading') }}
      </div>

      <div v-else-if="loadError || !booking" class="rounded-2xl border border-danger/20 bg-danger/10 p-8">
        <div class="mb-3 text-lg font-bold text-danger">{{ t('payment.loadErrorTitle') }}</div>
        <p class="mb-5 text-sm text-danger/90">{{ loadError || t('payment.unavailable') }}</p>
        <div class="flex flex-wrap gap-3">
          <button class="btn-ghost" @click="loadPaymentPage">{{ t('common.retry') }}</button>
          <button class="btn-amber" @click="router.push('/schedule')">{{ t('seats.toSchedule') }}</button>
        </div>
      </div>

      <template v-else>
        <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 class="display text-[clamp(1.75rem,4vw,2.5rem)] text-copy">{{ t('payment.title') }}</h1>
          <div class="rounded-full border px-3 py-1.5 text-sm font-semibold" :class="statusClass">
            {{ statusLabel }}
          </div>
        </div>

        <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div
              v-if="isPaid"
              class="mb-4 rounded-2xl border border-success/20 bg-success/10 px-5 py-4 text-sm text-success"
            >
              {{ t('payment.paidNotice') }}
            </div>
            <div
              v-else-if="isExpired || isCancelled"
              class="mb-4 rounded-2xl border border-danger/20 bg-danger/10 px-5 py-4 text-sm text-danger"
            >
              {{ t('payment.inactiveNotice') }}
            </div>
            <div
              v-else
              class="mb-4 rounded-2xl border border-brand/20 bg-brand/10 px-5 py-4 text-sm text-dim"
            >
              {{ t('payment.holdNotice', { time: timerLabel }) }}
            </div>

            <div :class="panelClass" class="mb-4">
              <div :class="panelLabelClass">{{ t('payment.methodLabel') }}</div>
              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  class="rounded-xl border px-4 py-3 text-left text-[0.85rem] font-medium transition"
                  :class="payMethodClass(payMethod === 'card')"
                  :disabled="!isPayable"
                  @click="payMethod = 'card'"
                >
                  <div class="mb-1 font-semibold text-copy">{{ t('payment.methodCardTitle') }}</div>
                  <div class="text-[0.75rem] text-dim">{{ t('payment.methodCardDesc') }}</div>
                </button>
                <button
                  class="rounded-xl border px-4 py-3 text-left text-[0.85rem] font-medium transition"
                  :class="payMethodClass(payMethod === 'qr')"
                  :disabled="!isPayable"
                  @click="payMethod = 'qr'"
                >
                  <div class="mb-1 font-semibold text-copy">{{ t('payment.methodQrTitle') }}</div>
                  <div class="text-[0.75rem] text-dim">{{ t('payment.methodQrDesc') }}</div>
                </button>
              </div>
            </div>

            <div v-if="payMethod === 'card'" :class="panelClass" class="mb-4">
              <div :class="panelLabelClass">{{ t('payment.cardDetails') }}</div>
              <div class="relative mb-5 flex min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl border border-brand/20 bg-[linear-gradient(135deg,#1e293b_0%,#0f172a_100%)] px-6 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div class="absolute -right-[30px] -top-[30px] h-[130px] w-[130px] rounded-full bg-brand/10" />
                <div class="h-7 w-[38px] rounded-[5px] border border-white/20 bg-[linear-gradient(135deg,#d4a017,#f5c542)]" />
                <div class="my-3 font-mono text-[1.25rem] tracking-[0.2em] text-white/90">
                  {{ cardNumber || '•••• •••• •••• ••••' }}
                </div>
                <div class="flex items-end gap-8">
                  <div>
                    <div class="mb-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-white/45">{{ t('payment.cardPreviewHolder') }}</div>
                    <div class="text-[0.85rem] font-medium tracking-[0.05em] text-white/90">{{ cardName || t('payment.cardPreviewName') }}</div>
                  </div>
                  <div>
                    <div class="mb-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-white/45">{{ t('payment.cardPreviewExpiry') }}</div>
                    <div class="text-[0.85rem] font-medium tracking-[0.05em] text-white/90">{{ cardExpiry || 'MM/YY' }}</div>
                  </div>
                </div>
              </div>

              <div class="grid gap-3.5 sm:grid-cols-2">
                <div class="flex flex-col gap-1.5 sm:col-span-2">
                  <label class="text-[0.72rem] font-semibold tracking-[0.05em] text-dim">{{ t('payment.cardNumberLabel') }}</label>
                  <input
                    :value="cardNumber"
                    :class="fieldClass('cardNumber')"
                    :placeholder="t('payment.cardNumberPlaceholder')"
                    inputmode="numeric"
                    maxlength="19"
                    :disabled="!isPayable"
                    @input="onCardInput"
                  />
                  <span v-if="errors.cardNumber" class="text-[0.72rem] text-danger">{{ errors.cardNumber }}</span>
                </div>

                <div class="flex flex-col gap-1.5 sm:col-span-2">
                  <label class="text-[0.72rem] font-semibold tracking-[0.05em] text-dim">{{ t('payment.cardNameLabel') }}</label>
                  <input
                    v-model="cardName"
                    :class="fieldClass('cardName')"
                    :placeholder="t('payment.cardNamePlaceholder')"
                    :disabled="!isPayable"
                    @input="cardName = cardName.toUpperCase()"
                  />
                  <span v-if="errors.cardName" class="text-[0.72rem] text-danger">{{ errors.cardName }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-[0.72rem] font-semibold tracking-[0.05em] text-dim">{{ t('payment.cardExpiryLabel') }}</label>
                  <input
                    :value="cardExpiry"
                    :class="fieldClass('cardExpiry')"
                    :placeholder="t('payment.cardExpiryPlaceholder')"
                    inputmode="numeric"
                    maxlength="5"
                    :disabled="!isPayable"
                    @input="onExpiryInput"
                  />
                  <span v-if="errors.cardExpiry" class="text-[0.72rem] text-danger">{{ errors.cardExpiry }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-[0.72rem] font-semibold tracking-[0.05em] text-dim">{{ t('payment.cardCvvLabel') }}</label>
                  <input
                    v-model="cardCvv"
                    :class="fieldClass('cardCvv')"
                    placeholder="•••"
                    inputmode="numeric"
                    maxlength="3"
                    type="password"
                    :disabled="!isPayable"
                  />
                  <span v-if="errors.cardCvv" class="text-[0.72rem] text-danger">{{ errors.cardCvv }}</span>
                </div>
              </div>
            </div>

            <div v-else :class="panelClass" class="mb-4">
              <div :class="panelLabelClass">{{ t('payment.qrLabel') }}</div>
              <div class="mb-4 flex flex-col items-start gap-5 sm:flex-row">
                <div class="qr-demo">
                  <div class="qr-demo__grid" />
                </div>
                <div>
                  <div class="mb-1.5 text-[0.95rem] font-bold text-copy">{{ t('payment.qrTitle') }}</div>
                  <div class="mb-3 text-[0.82rem] leading-[1.5] text-dim">
                    {{ t('payment.qrText') }}
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <span class="rounded-full border border-line bg-surface-soft px-2.5 py-1 text-[0.72rem] font-semibold text-muted">Mbank</span>
                    <span class="rounded-full border border-line bg-surface-soft px-2.5 py-1 text-[0.72rem] font-semibold text-muted">O!Деньги</span>
                    <span class="rounded-full border border-line bg-surface-soft px-2.5 py-1 text-[0.72rem] font-semibold text-muted">ЭлКарт</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 py-2 text-[0.75rem] text-fade">
              <AppIcon name="lock" :size="14" />
              {{ t('payment.devHint') }}
            </div>

            <div v-if="submitError" class="mt-4 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-[0.8rem] text-danger">
              {{ submitError }}
            </div>

            <div class="mt-5 flex flex-wrap gap-3">
              <button
                v-if="isPayable"
                class="btn-amber"
                :disabled="isProcessing"
                @click="pay"
              >
                <span v-if="isProcessing" class="h-[18px] w-[18px] rounded-full border-2 border-zinc-900/30 border-t-zinc-900 [animation:spin_0.7s_linear_infinite]" />
                <AppIcon v-else name="lock" :size="16" />
                {{ isProcessing ? t('payment.processing') : t('payment.payAction', { amount: formatPrice(booking.totalAmount, currency) }) }}
              </button>
              <button
                v-if="isPayable"
                class="btn-ghost"
                :disabled="isCancelling"
                @click="cancelCurrentBooking"
              >
                {{ isCancelling ? t('payment.cancelling') : t('payment.cancelAction') }}
              </button>
              <button
                v-else-if="isPaid"
                class="btn-amber"
                @click="router.push({ name: 'booking-success', query: { booking: String(booking.id) } })"
              >
                <AppIcon name="ticket" :size="16" />
                {{ t('payment.openTicket') }}
              </button>
              <button
                v-else
                class="btn-amber"
                @click="goToSeats"
              >
                {{ t('payment.reseat') }}
              </button>
            </div>
          </div>

          <div class="sticky top-24 h-fit rounded-[1.2rem] border border-line bg-panel p-6 shadow-[var(--shadow-card)]">
            <div class="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-dim">{{ t('payment.orderTitle') }}</div>

            <div class="mb-3 flex gap-4">
              <div class="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-soft">
                <img
                  v-if="sessionItem?.movie.posterUrl"
                  :src="sessionItem.movie.posterUrl"
                  :alt="sessionItem.movie.title"
                  class="h-full w-full object-cover"
                />
                <div v-else class="grid h-full w-full place-items-center">
                  <AppIcon name="film" :size="20" fill="rgba(245,158,11,0.5)" />
                </div>
              </div>
              <div class="min-w-0">
                <div class="text-base font-bold text-copy">{{ sessionItem?.movie.title || booking.movieTitle }}</div>
                <div class="mt-1 flex flex-wrap gap-2 text-[0.72rem] text-dim">
                  <span class="inline-flex items-center gap-1"><AppIcon name="map-pin" :size="11" /> {{ booking.hallName }}</span>
                  <span class="inline-flex items-center gap-1">
                    <AppIcon name="calendar" :size="11" />
                    {{ formatDateLabel(booking.startDateTime.slice(0, 10)) }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <AppIcon name="clock" :size="11" />
                    {{ formatTime(booking.startDateTime) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="my-3.5 h-px bg-line" />

            <div class="mb-2 text-[0.72rem] text-dim">{{ t('payment.orderSeats', { count: seatItems.length }) }}</div>
            <div class="flex flex-col gap-2">
              <div
                v-for="seat in seatItems"
                :key="seat.label"
                class="flex items-center justify-between rounded-lg border border-line bg-surface-soft px-3 py-2"
              >
                <div>
                  <div class="text-[0.82rem] font-semibold text-copy">{{ seat.label }}</div>
                  <div class="text-[0.7rem] text-dim">{{ seat.type === 'vip' ? 'VIP' : t('payment.seatTypeStandard') }}</div>
                </div>
                <div class="text-[0.78rem] font-bold text-brand">
                  {{ formatPrice(seat.priceAtBooking, currency) }}
                </div>
              </div>
            </div>

            <div class="my-3.5 h-px bg-line" />

            <div class="mb-1.5 flex items-center justify-between text-[0.85rem] text-muted">
              <span>{{ t('payment.orderTickets', { count: seatItems.length }) }}</span>
              <span>{{ formatPrice(booking.totalAmount, currency) }}</span>
            </div>
            <div class="mb-1.5 flex items-center justify-between text-[0.8rem] text-fade">
              <span>{{ t('payment.orderServiceFee') }}</span>
              <span>{{ formatPrice(0, currency) }}</span>
            </div>
            <div class="my-3.5 h-px bg-line" />
            <div class="flex items-center justify-between text-base font-bold text-copy">
              <span>{{ t('seats.total') }}</span>
              <span class="display text-[1.5rem] text-brand">{{ formatPrice(booking.totalAmount, currency) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.qr-demo {
  display: grid;
  place-items: center;
  width: 110px;
  height: 110px;
  border-radius: 0.75rem;
  border: 2px solid rgba(245, 158, 11, 0.3);
  background:
    linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02)),
    var(--surface-soft);
}

.qr-demo__grid {
  width: 78px;
  height: 78px;
  border-radius: 0.35rem;
  background:
    linear-gradient(90deg, currentColor 14%, transparent 14% 28%, currentColor 28% 42%, transparent 42% 56%, currentColor 56% 70%, transparent 70% 84%, currentColor 84%),
    linear-gradient(currentColor 14%, transparent 14% 28%, currentColor 28% 42%, transparent 42% 56%, currentColor 56% 70%, transparent 70% 84%, currentColor 84%);
  color: rgba(245, 158, 11, 0.85);
  mask:
    radial-gradient(circle at 18% 18%, #000 0 18px, transparent 18px),
    radial-gradient(circle at 82% 18%, #000 0 18px, transparent 18px),
    radial-gradient(circle at 18% 82%, #000 0 18px, transparent 18px),
    linear-gradient(#000, #000);
}
</style>
