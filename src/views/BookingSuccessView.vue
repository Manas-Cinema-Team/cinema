<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { fetchBooking, fetchSessionDetail, getApiErrorMessage } from '@/api/cinema'
import AppIcon from '@/components/AppIcon.vue'
import { formatDateLabel, formatPrice, formatSeatLabel, formatTime, type Booking, type ScheduleItem } from '@/data/cinema'
import { saveTicket } from '@/stores/bookings'
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
const error = ref('')
const saved = ref(false)

const bookingCode = computed(() =>
  booking.value ? `CNM-${String(booking.value.id).padStart(6, '0')}` : 'CNM-000000',
)
const perforationClass = "relative mx-6 h-px bg-[repeating-linear-gradient(90deg,var(--line-strong)_0,var(--line-strong)_8px,transparent_8px,transparent_14px)] before:absolute before:-left-8 before:top-1/2 before:h-5 before:w-5 before:-translate-y-1/2 before:rounded-full before:border before:border-line before:bg-canvas before:content-[''] after:absolute after:-right-8 after:top-1/2 after:h-5 after:w-5 after:-translate-y-1/2 after:rounded-full after:border after:border-line after:bg-canvas after:content-['']"

const isPaid = computed(() => booking.value?.bookingStatus === 'confirmed' || booking.value?.paymentStatus === 'paid')
const seatLabels = computed(() =>
  (booking.value?.seats || []).map((seat) => formatSeatLabel(seat.row, seat.number)),
)

const createTicketCodeImage = (code: string) => {
  const bits = Array.from(code)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('')
    .slice(0, 144)

  let rects = ''
  for (let index = 0; index < bits.length; index += 1) {
    if (bits[index] !== '1') continue
    const x = (index % 12) * 8
    const y = Math.floor(index / 12) * 8
    rects += `<rect x="${x}" y="${y}" width="6" height="6" rx="1" fill="#f59e0b" />`
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="10" fill="#18181b" />
      <rect x="8" y="8" width="20" height="20" rx="4" fill="#f59e0b" />
      <rect x="68" y="8" width="20" height="20" rx="4" fill="#f59e0b" />
      <rect x="8" y="68" width="20" height="20" rx="4" fill="#f59e0b" />
      <g transform="translate(0, 0)">${rects}</g>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const codeImage = computed(() => createTicketCodeImage(bookingCode.value))

const saveCurrentTicket = () => {
  if (saved.value || !booking.value || !sessionItem.value || !isPaid.value) {
    return
  }

  saveTicket({
    bookingId: booking.value.id,
    bookingCode: bookingCode.value,
    movieId: sessionItem.value.movie.id,
    movieTitle: booking.value.movieTitle,
    moviePoster: sessionItem.value.movie.posterUrl,
    sessionId: booking.value.sessionId,
    hallName: booking.value.hallName,
    date: booking.value.startDateTime.slice(0, 10),
    time: formatTime(booking.value.startDateTime),
    seats: seatLabels.value,
    total: booking.value.totalAmount,
    currency: booking.value.currency,
  })
  saved.value = true
}

const loadSuccessPage = async () => {
  if (!bookingId.value) {
    booking.value = null
    sessionItem.value = null
    error.value = t('payment.missingBookingId')
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  saved.value = false

  try {
    const bookingData = await fetchBooking(bookingId.value)
    booking.value = bookingData

    try {
      sessionItem.value = await fetchSessionDetail(bookingData.sessionId)
    } catch {
      sessionItem.value = null
    }

    saveCurrentTicket()
  } catch (loadErr) {
    booking.value = null
    sessionItem.value = null
    error.value = getApiErrorMessage(loadErr, t('auth.requestFailed'))
  } finally {
    loading.value = false
  }
}

watch(() => bookingId.value, () => {
  void loadSuccessPage()
}, { immediate: true })

const printTicket = () => window.print()
</script>

<template>
  <section class="stage no-print-bg min-h-screen pt-[120px]">
    <div class="max-w-xl mx-auto px-4 pb-16">
      <div v-if="loading" class="rounded-2xl border border-line bg-panel p-8 text-sm text-dim">
        {{ t('success.loading') }}
      </div>

      <div v-else-if="error || !booking" class="rounded-2xl border border-danger/20 bg-danger/10 p-8">
        <div class="mb-3 text-lg font-bold text-danger">{{ t('success.unavailableTitle') }}</div>
        <p class="mb-5 text-sm text-danger/90">{{ error || t('success.unavailableText') }}</p>
        <div class="flex flex-wrap gap-3">
          <button class="btn-ghost" @click="loadSuccessPage">{{ t('common.retry') }}</button>
          <button class="btn-amber" @click="router.push('/profile')">{{ t('success.toProfile') }}</button>
        </div>
      </div>

      <template v-else>
        <div class="text-center mb-8 print-hidden">
          <div class="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full bg-brand shadow-[0_0_0_10px_rgba(245,158,11,0.12)]">
            <AppIcon :name="isPaid ? 'check' : 'clock'" :size="30" fill="#18181b" />
          </div>
          <p class="eyebrow mt-6 mb-2">{{ isPaid ? t('success.eyebrow') : t('success.status') }}</p>
          <h1 class="display text-[clamp(1.75rem,4vw,2.5rem)] text-copy">
            {{ isPaid ? t('success.title') : t('success.awaitingTitle') }}
          </h1>
          <p class="mt-3 text-sm text-dim">
            {{ isPaid ? t('success.paidHint') : t('success.pendingHint') }}
          </p>
        </div>

        <div
          id="print-ticket"
          class="relative overflow-hidden rounded-[1.2rem] border border-line bg-panel shadow-[0_8px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(245,158,11,0.1)] print:rounded-none print:border-2 print:border-black print:bg-white print:shadow-none"
        >
          <div :class="perforationClass" />

          <div class="flex items-start justify-between gap-4 bg-[linear-gradient(135deg,rgba(245,158,11,0.08)_0%,transparent_60%)] px-7 py-6 pb-5 print:bg-white">
            <div>
              <div class="mb-2 text-[0.75rem] font-extrabold tracking-[0.2em] text-brand print:text-black">CINEMA</div>
              <div class="mb-1 text-[0.6rem] tracking-[0.2em] text-fade print:text-black">{{ t('success.bookingCodeLabel') }}</div>
              <div class="display text-[1.4rem] tracking-[0.15em] text-brand print:text-black">{{ bookingCode }}</div>
            </div>
            <img
              :src="codeImage"
              :alt="t('success.codeAlt')"
              class="h-[90px] w-[90px] rounded-lg border-2 border-brand/30 print:border-black"
            />
          </div>

          <div class="px-7 py-5 pb-6">
            <h2 class="display mb-1 text-[1.5rem] text-copy print:text-black">
              {{ sessionItem?.movie.title || booking.movieTitle || t('success.session') }}
            </h2>
            <p class="mb-5 flex items-center gap-1.5 text-[0.82rem] text-dim print:text-black">
              <AppIcon name="map-pin" :size="13" />
              {{ booking.hallName }}
            </p>

            <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt class="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-fade print:text-black">{{ t('success.date') }}</dt>
                <dd class="text-[0.95rem] font-semibold text-copy print:text-black">{{ formatDateLabel(booking.startDateTime.slice(0, 10)) }}</dd>
              </div>
              <div>
                <dt class="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-fade print:text-black">{{ t('success.time') }}</dt>
                <dd class="display text-[1.5rem] text-copy print:text-black">{{ formatTime(booking.startDateTime) }}</dd>
              </div>
              <div class="col-span-2">
                <dt class="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-fade print:text-black">{{ t('success.seats') }}</dt>
                <dd>
                  <div class="mt-0.5 flex flex-wrap gap-1.5">
                    <span
                      v-for="seat in seatLabels"
                      :key="seat"
                      class="rounded-md border border-brand/35 bg-brand/15 px-2.5 py-1 text-[0.82rem] font-bold text-brand print:border-black print:bg-zinc-100 print:text-black"
                    >
                      {{ seat }}
                    </span>
                  </div>
                </dd>
              </div>
              <div class="col-span-2">
                <dt class="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-fade print:text-black">{{ t('success.sum') }}</dt>
                <dd class="display text-[1.6rem] text-brand print:text-black">{{ formatPrice(booking.totalAmount, booking.currency) }}</dd>
              </div>
            </dl>
          </div>

          <div :class="perforationClass" />

          <div class="flex items-center justify-between border-t border-line bg-surface-soft px-7 py-3 print:border-black print:bg-white">
            <span class="text-[0.72rem] text-dim print:text-black">
              {{ isPaid ? t('success.footerPaid') : t('success.footerPending') }}
            </span>
            <span class="text-[0.68rem] text-fade print:text-black">{{ t('success.validForDate') }}</span>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-3 print-hidden">
          <button v-if="isPaid" class="btn-ghost" @click="printTicket">
            <AppIcon name="download" :size="16" />
            {{ t('common.print') }}
          </button>
          <RouterLink to="/profile" class="btn-ghost">
            <AppIcon name="ticket" :size="16" />
            {{ t('profile.tabTickets') }}
          </RouterLink>
          <RouterLink
            v-if="!isPaid"
            :to="{ name: 'payment', query: { booking: String(booking.id) } }"
            class="btn-amber"
          >
            <AppIcon name="lock" :size="16" />
            {{ t('success.toPayment') }}
          </RouterLink>
          <RouterLink v-else to="/" class="btn-amber">
            <AppIcon name="film" :size="16" />
            {{ t('common.home') }}
          </RouterLink>
        </div>
      </template>
    </div>
  </section>
</template>
