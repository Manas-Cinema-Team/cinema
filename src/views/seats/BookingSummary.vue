<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { formatPrice } from '@/data/formatters'
import { t, tPlural } from '@/stores/i18n'

defineProps<{
  selectedList: Array<{
    row: number
    number: number
    key: string
    label: string
    type: string
    price: number
  }>
  total: number
  currency: string
  maxSeats: number
  actionError: string
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', row: number, col: number): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <aside class="summary">
    <p class="eyebrow mb-1">{{ t('seats.orderEyebrow') }}</p>
    <h2 class="display mb-4" style="color: var(--text); font-size: 1.3rem">
      {{ selectedList.length }} {{ tPlural(selectedList.length, 'seats') }}
    </h2>

    <div v-if="selectedList.length > 0" class="mb-5 flex flex-col gap-2">
      <div v-for="s in selectedList" :key="s.key" class="seat-row">
        <div class="min-w-0">
          <div class="seat-row__title">
            <span class="seat-chip">{{ s.label }}</span>
            <span v-if="s.type === 'vip'" class="seat-type">VIP</span>
          </div>
          <div class="seat-row__meta">{{ t('seats.rowSeat', { row: s.row, seat: s.number }) }}</div>
        </div>
        <div class="seat-row__actions">
          <span class="seat-row__price">{{ formatPrice(s.price, currency) }}</span>
          <button :aria-label="t('common.remove')" @click="emit('remove', s.row, s.number)">
            <AppIcon name="close" :size="11" />
          </button>
        </div>
      </div>
    </div>
    <div v-else class="summary-empty">
      {{ t('seats.empty') }}
    </div>

    <div class="divider" style="margin: 1rem 0" />

    <div class="flex justify-between mb-1" style="color: var(--text-muted); font-size: 0.85rem">
      <span>{{ t('seats.items') }}</span>
      <span>{{ selectedList.length }}</span>
    </div>
    <div class="flex justify-between mb-5" style="font-weight: 700">
      <span style="color: var(--text)">{{ t('seats.total') }}</span>
      <span class="display" style="color: var(--amber); font-size: 1.4rem">
        {{ formatPrice(total, currency) }}
      </span>
    </div>

    <div v-if="actionError" class="summary-error">
      {{ actionError }}
    </div>

    <button
      class="btn-amber w-full"
      :disabled="selectedList.length === 0 || isSubmitting"
      @click="emit('confirm')"
    >
      <AppIcon name="ticket" :size="16" />
      {{ isSubmitting ? t('seats.creatingBooking') : t('seats.confirm') }}
    </button>
    <p class="summary-hint">{{ t('seats.max', { n: maxSeats }) }}</p>
  </aside>
</template>

<style scoped>
.summary {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 96px;
  box-shadow: var(--shadow-card);
}
.summary-empty {
  padding: 0.9rem;
  border-radius: 0.6rem;
  background: var(--surface-soft);
  border: 1px dashed var(--line-strong);
  color: var(--text-dim);
  font-size: 0.82rem;
  text-align: center;
}
.summary-error {
  margin-bottom: 0.9rem;
  padding: 0.75rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: var(--red);
  font-size: 0.78rem;
}
.summary-hint {
  margin-top: 0.5rem;
  text-align: center;
  color: var(--text-fade);
  font-size: 0.72rem;
}
.seat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border-radius: 0.75rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
}
.seat-row__title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.15rem;
}
.seat-row__meta {
  font-size: 0.75rem;
  color: var(--text-dim);
}
.seat-row__actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.seat-row__price {
  white-space: nowrap;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text);
}
.seat-chip {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.25rem 0.55rem; border-radius: 0.35rem;
  color: #18181b; font-size: 0.78rem; font-weight: 600;
  background: var(--amber); border: 1px solid var(--amber-dark);
}
.seat-row button {
  background: transparent; border: none;
  color: inherit; cursor: pointer; opacity: 0.75; padding: 0;
}
.seat-row button:hover { opacity: 1; }
.seat-type {
  display: inline-flex;
  align-items: center;
  padding: 0.16rem 0.45rem;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: var(--amber);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
</style>
