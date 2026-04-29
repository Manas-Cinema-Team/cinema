<script setup lang="ts">
// ── Правая панель «Заказ» из SeatsView ───────────────────────────────────

import AppIcon from '@/components/AppIcon.vue'
import { t, tPlural } from '@/stores/i18n'
import { formatPrice } from '@/data/formatters'

defineProps<{
  selectedList: { row: string; col: number; key: string }[]
  total: number
  price: number
  maxSeats: number
}>()

const emit = defineEmits<{
  (e: 'remove', row: string, col: number): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <aside class="summary">
    <p class="eyebrow mb-1">{{ t('seats.orderEyebrow') }}</p>
    <h2 class="display mb-4" style="color: var(--text); font-size: 1.3rem">
      {{ selectedList.length }} {{ tPlural(selectedList.length, 'seats') }}
    </h2>

    <!-- Выбранные места -->
    <div v-if="selectedList.length > 0" class="flex flex-wrap gap-2 mb-5">
      <span v-for="s in selectedList" :key="s.key" class="seat-chip">
        {{ s.row }}{{ s.col }}
        <button :aria-label="t('common.remove')" @click="emit('remove', s.row, s.col)">
          <AppIcon name="close" :size="11" />
        </button>
      </span>
    </div>
    <div v-else class="summary-empty">
      {{ t('seats.empty') }}
    </div>

    <div class="divider" style="margin: 1rem 0" />

    <div class="flex justify-between mb-1" style="color: var(--text-muted); font-size: 0.85rem">
      <span>{{ t('seats.price') }}</span>
      <span>{{ formatPrice(price) }}</span>
    </div>
    <div class="flex justify-between mb-5" style="font-weight: 700">
      <span style="color: var(--text)">{{ t('seats.total') }}</span>
      <span class="display" style="color: var(--amber); font-size: 1.4rem">
        {{ formatPrice(total) }}
      </span>
    </div>

    <button
      class="btn-amber w-full"
      :disabled="selectedList.length === 0"
      @click="emit('confirm')"
    >
      <AppIcon name="ticket" :size="16" />
      {{ t('seats.confirm') }}
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
.summary-hint {
  margin-top: 0.5rem;
  text-align: center;
  color: var(--text-fade);
  font-size: 0.72rem;
}
.seat-chip {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.25rem 0.55rem; border-radius: 0.35rem;
  color: #18181b; font-size: 0.78rem; font-weight: 600;
  background: var(--amber); border: 1px solid var(--amber-dark);
}
.seat-chip button {
  background: transparent; border: none;
  color: inherit; cursor: pointer; opacity: 0.75; padding: 0;
}
.seat-chip button:hover { opacity: 1; }
</style>