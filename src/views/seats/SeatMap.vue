<script setup lang="ts">
// ── Рендерит схему зала (только отображение) ─────────────────────────────
// Вся логика статусов живёт в useSeatSelection и передаётся сюда.

import type { Hall } from '@/data/types'
import type { DisplayStatus } from './useSeatSelection'
import { t } from '@/stores/i18n'

defineProps<{
  hall: Hall
  seatStatus: (row: string, col: number) => DisplayStatus
}>()

const emit = defineEmits<{
  (e: 'toggle', row: string, col: number): void
}>()
</script>

<template>
  <div class="seat-map">
    <div v-for="row in hall.schema.rows" :key="row" class="seat-row">
      <span class="seat-rowlabel">{{ row }}</span>
      <div class="seat-cells">
        <template v-for="col in hall.schema.seatsPerRow" :key="`${row}-${col}`">
          <span
            v-if="col === Math.ceil(hall.schema.seatsPerRow / 2) + 1"
            class="seat-aisle"
          />
          <button
            type="button"
            class="seat"
            :class="`seat--${seatStatus(row, col)}`"
            :disabled="['held', 'booked', 'disabled'].includes(seatStatus(row, col))"
            :aria-label="t('seats.seatLabel', { seat: `${row}${col}` })"
            @click="emit('toggle', row, col)"
          >
            {{ col }}
          </button>
        </template>
      </div>
      <span class="seat-rowlabel">{{ row }}</span>
    </div>
  </div>

  <!-- Легенда -->
  <div class="legend">
    <div class="legend-item">
      <span class="seat seat-demo seat--available" />
      <span>{{ t('seats.legendAvailable') }}</span>
    </div>
    <div class="legend-item">
      <span class="seat seat-demo seat--selected" />
      <span>{{ t('seats.legendSelected') }}</span>
    </div>
    <div class="legend-item">
      <span class="seat seat-demo seat--held" />
      <span>{{ t('seats.legendHeld') }}</span>
    </div>
    <div class="legend-item">
      <span class="seat seat-demo seat--booked" />
      <span>{{ t('seats.legendBooked') }}</span>
    </div>
  </div>
</template>

<style scoped>
.seat-map {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 8px;
  border-radius: 0.75rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  overflow-x: auto;
}
.seat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  min-width: 480px;
}
.seat-rowlabel {
  width: 18px;
  color: var(--text-fade);
  font-size: 0.72rem;
  font-weight: 600;
  text-align: center;
}
.seat-cells { display: flex; align-items: center; gap: 4px; }
.seat-aisle { width: 16px; }

.seat {
  position: relative;
  width: 28px; height: 28px;
  border-radius: 5px 5px 8px 8px;
  font-size: 0.6rem; font-weight: 600;
  color: transparent;
  border: 1px solid transparent;
  background: var(--bg-elev);
  cursor: pointer;
  transition: all 120ms ease;
}
.seat:hover:not(:disabled) { transform: translateY(-1px); color: var(--text-muted); }
.seat:disabled { cursor: not-allowed; }

.seat--available { background: var(--bg-elev); border-color: var(--line-strong); }
.seat--available:hover { border-color: var(--green); }

.seat--selected {
  background: var(--amber); border-color: var(--amber-dark);
  color: #18181b;
  box-shadow: 0 0 10px rgba(245,158,11,.5);
}
.seat--selected:hover { color: #18181b; }

.seat--held {
  background: rgba(245,158,11,.18);
  border-color: rgba(245,158,11,.45);
  opacity: 0.75;
}

.seat--booked {
  background: rgba(239,68,68,.18);
  border-color: rgba(239,68,68,.5);
  color: transparent;
}
.seat--booked::after {
  content: '';
  position: absolute; inset: 0;
  background:
    linear-gradient(135deg, transparent calc(50% - 1px), var(--red) calc(50% - 1px), var(--red) calc(50% + 1px), transparent calc(50% + 1px)),
    linear-gradient(45deg,  transparent calc(50% - 1px), var(--red) calc(50% - 1px), var(--red) calc(50% + 1px), transparent calc(50% + 1px));
  border-radius: inherit;
  opacity: 0.85;
  pointer-events: none;
}

.seat--disabled {
  background: transparent !important;
  border-color: transparent !important;
  cursor: default; opacity: 0.15;
}
.seat-demo { width: 18px; height: 18px; cursor: default; }

.legend {
  margin-top: 1.5rem;
  display: flex; flex-wrap: wrap; gap: 1.25rem;
  justify-content: center;
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
}
.legend-item {
  display: flex; align-items: center; gap: 0.5rem;
  color: var(--text-muted); font-size: 0.78rem;
}
</style>