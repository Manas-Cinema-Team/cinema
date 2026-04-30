<script setup lang="ts">
import { formatSeatLabel, type HallSchema } from '@/data/cinema'
import type { DisplayStatus } from './useSeatSelection'
import { t } from '@/stores/i18n'

const props = defineProps<{
  schema?: HallSchema | null
  seatStatus: (row: number, number: number) => DisplayStatus
}>()

const emit = defineEmits<{
  (e: 'toggle', row: number, col: number): void
}>()

const isLockedStatus = (status: DisplayStatus) =>
  ['held', 'held-self', 'booked', 'disabled'].includes(status)
</script>

<template>
  <div v-if="props.schema" class="seat-map">
    <div v-for="row in props.schema.rows" :key="row.row" class="seat-row">
      <span class="seat-rowlabel">{{ row.row }}</span>
      <div class="seat-cells">
        <template v-for="(seat, seatIndex) in row.seats" :key="`${row.row}-${seat.number}`">
          <button
            type="button"
            class="seat"
            :class="[
              `seat--${seatStatus(row.row, seat.number)}`,
              seat.type === 'vip' ? 'seat--vip' : '',
            ]"
            :disabled="isLockedStatus(seatStatus(row.row, seat.number))"
            :aria-label="t('seats.seatLabel', { seat: formatSeatLabel(row.row, seat.number) })"
            @click="emit('toggle', row.row, seat.number)"
          >
            {{ seat.number }}
          </button>
          <span
            v-if="seatIndex + 1 === Math.ceil(row.seats.length / 2)"
            class="seat-aisle"
          />
        </template>
      </div>
      <span class="seat-rowlabel">{{ row.row }}</span>
    </div>
  </div>
  <div v-else class="seat-map seat-map--empty">
    {{ t('seats.schemaUnavailable') }}
  </div>

  <div class="legend">
    <div class="legend-item">
      <span class="seat seat-demo seat--available" />
      <span>{{ t('seats.legendAvailable') }}</span>
    </div>
    <div class="legend-item">
      <span class="seat seat-demo seat--available seat--vip" />
      <span>{{ t('seats.legendVip') }}</span>
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
      <span class="seat seat-demo seat--held-self" />
      <span>{{ t('seats.legendHeldSelf') }}</span>
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
.seat-map--empty {
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  min-height: 220px;
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

.seat--vip::before {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--amber);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.45);
}

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

.seat--held-self {
  background: rgba(59,130,246,.18);
  border-color: rgba(59,130,246,.5);
  color: #bfdbfe;
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
