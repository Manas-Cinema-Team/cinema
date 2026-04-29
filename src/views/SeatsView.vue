<script setup lang="ts">
// ── SeatsView теперь только собирает экран ────────────────────────────────
// Логика → useSeatSelection.ts
// Схема зала → SeatMap.vue
// Панель заказа → BookingSummary.vue

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import SeatMap from './seats/SeatMap.vue'
import BookingSummary from './seats/BookingSummary.vue'
import { useSeatSelection } from './seats/useSeatSelection'

import { findHall, findMovie, findSession } from '@/data/selectors'
import { formatDateLabel, formatTime } from '@/data/formatters'
import { t } from '@/stores/i18n'

const route = useRoute()
const router = useRouter()

const sessionId = computed(() =>
  Array.isArray(route.params.sessionId)
    ? route.params.sessionId[0]
    : route.params.sessionId,
)

const session = computed(() => findSession(sessionId.value))
const movie   = computed(() => session.value ? findMovie(session.value.movieId) : undefined)
const hall    = computed(() => session.value ? findHall(session.value.hallId) : undefined)

const {
  MAX_SEATS,
  secondsLeft,
  timerLabel,
  selectedList,
  total,
  seatStatus,
  toggle,
  confirm,
} = useSeatSelection(
  () => session.value,
  () => hall.value,
  () => sessionId.value,
)

      {{ t('seats.notFound') }}
      <button class="btn-amber mt-6" @click="router.push('/schedule')">
        {{ t('seats.toSchedule') }}
      </button>
    </div>
  </div>

  <section v-else class="stage min-h-screen pt-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Шапка -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>

            <AppIcon name="chevron-left" :size="16" />
            {{ t('common.back') }}
          </button>
          <h1 class="display text-[clamp(1.5rem,3vw,2rem)] text-copy">
            {{ movie.title }}
          </h1>
          <div class="mt-1 flex flex-wrap gap-3 text-[0.85rem] text-muted">
            <span class="flex items-center gap-1">
              <AppIcon name="calendar" :size="12" />
              {{ formatDateLabel(session.startDateTime.slice(0, 10)) }}
            </span>
            <span class="flex items-center gap-1">
              <AppIcon name="clock" :size="12" />
              {{ formatTime(session.startDateTime) }}
            </span>
            <span>{{ hall.name }}</span>
          </div>
        </div>


          <AppIcon name="clock" :size="14" />
          <span>{{ t('seats.holdTimer', { time: timerLabel }) }}</span>
        </div>
      </div>

      <!-- Основная сетка -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">

        <!-- Зал -->
        <div class="xl:col-span-3">
          <div class="text-center mb-8">
            <div class="mx-auto h-2 max-w-[560px] rounded-full bg-[linear-gradient(to_right,transparent,rgba(245,158,11,0.7),transparent)] shadow-[0_0_20px_rgba(245,158,11,0.35),0_0_60px_rgba(245,158,11,0.12)]" />
            <p class="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-fade">{{ t('seats.screen') }}</p>
          </div>


      </div>
    </div>
  </section>
</template>

