<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import {
  findHall,
  findMovie,
  findSession,
  formatDateLabel,
  formatPrice,
  formatTime,
} from '@/data/cinema'
import { clearCart } from '@/stores/cart'
import { t } from '@/stores/i18n'

const route = useRoute()
const router = useRouter()

const session = computed(() => findSession(route.query.session as string | undefined))
const movie   = computed(() => session.value ? findMovie(session.value.movieId) : undefined)
const hall    = computed(() => session.value ? findHall(session.value.hallId) : undefined)

const seats = computed(() => {
  const raw = route.query.seats
  const str = typeof raw === 'string' ? raw : ''
  return str ? str.split(',').filter(Boolean) : []
})
const total = computed(() => {
  const raw = route.query.total
  return typeof raw === 'string' ? Number(raw) : 0
})

// ── Форма оплаты ──────────────────────────────────────────────────────
const payMethod = ref<'card' | 'qr'>('card')

const cardNumber = ref('')
const cardName   = ref('')
const cardExpiry = ref('')
const cardCvv    = ref('')

const isProcessing = ref(false)
const errors = ref<Record<string, string>>({})

// Форматирование номера карты
const formatCard = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}
const onCardInput = (e: Event) => {
  cardNumber.value = formatCard((e.target as HTMLInputElement).value)
}

// Форматирование срока
const formatExpiry = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}
const onExpiryInput = (e: Event) => {
  cardExpiry.value = formatExpiry((e.target as HTMLInputElement).value)
}

const validate = () => {
  const e: Record<string, string> = {}
  if (payMethod.value === 'card') {
    if (cardNumber.value.replace(/\s/g, '').length < 16) e.cardNumber = 'Введите 16 цифр карты'
    if (!cardName.value.trim()) e.cardName = 'Введите имя держателя'
    if (cardExpiry.value.length < 5) e.cardExpiry = 'Введите срок (ММ/ГГ)'
    if (cardCvv.value.length < 3) e.cardCvv = 'Введите CVV'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

const pay = async () => {
  if (!validate()) return
  isProcessing.value = true

  // Симуляция обработки платежа
  await new Promise((res) => setTimeout(res, 1800))

  isProcessing.value = false
  clearCart()

  router.push({
    name: 'booking-success',
    query: {
      session: route.query.session,
      seats: route.query.seats,
      total: route.query.total,
    },
  })
}

// Определяем тип карты по номеру
const cardType = computed(() => {
  const n = cardNumber.value.replace(/\s/g, '')
  if (n.startsWith('4')) return 'visa'
  if (n.startsWith('5') || n.startsWith('2')) return 'mastercard'
  if (n.startsWith('9')) return 'mir'
  return null
})
</script>

<template>
  <section class="stage" style="min-height: 100vh; padding-top: 96px">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Шапка -->
      <button class="back-btn" @click="router.back()">
        <AppIcon name="arrow-left" :size="15" />
        Назад к выбору мест
      </button>

      <h1 class="display page-title">Оплата билетов</h1>

      <div class="payment-layout">

        <!-- ── Левая: форма оплаты ── -->
        <div class="payment-form-col">

          <!-- Метод оплаты -->
          <div class="pay-section">
            <div class="pay-section__label">Способ оплаты</div>
            <div class="pay-methods">
              <button
                class="pay-method"
                :class="{ 'pay-method--active': payMethod === 'card' }"
                @click="payMethod = 'card'"
              >
                <AppIcon name="credit-card" :size="18" />
                Банковская карта
              </button>
              <button
                class="pay-method"
                :class="{ 'pay-method--active': payMethod === 'qr' }"
                @click="payMethod = 'qr'"
              >
                <AppIcon name="smartphone" :size="18" />
                QR / Мобильный
              </button>
            </div>
          </div>

          <!-- Форма карты -->
          <div v-if="payMethod === 'card'" class="pay-section">
            <div class="pay-section__label">Данные карты</div>

            <!-- Визуализация карты -->
            <div class="card-visual">
              <div class="card-visual__chip" />
              <div class="card-visual__number">
                {{ cardNumber || '•••• •••• •••• ••••' }}
              </div>
              <div class="card-visual__bottom">
                <div>
                  <div class="card-visual__field-label">Держатель</div>
                  <div class="card-visual__field-value">{{ cardName || 'FULL NAME' }}</div>
                </div>
                <div>
                  <div class="card-visual__field-label">Срок</div>
                  <div class="card-visual__field-value">{{ cardExpiry || 'MM/YY' }}</div>
                </div>
                <div class="card-visual__brand">
                  <span v-if="cardType === 'visa'" class="card-brand card-brand--visa">VISA</span>
                  <span v-else-if="cardType === 'mastercard'" class="card-brand card-brand--mc">MC</span>
                  <span v-else-if="cardType === 'mir'" class="card-brand card-brand--mir">МИР</span>
                </div>
              </div>
            </div>

            <!-- Поля -->
            <div class="form-fields">
              <div class="field-wrap field-wrap--full">
                <label class="field-label">Номер карты</label>
                <input
                  :value="cardNumber"
                  class="field-input"
                  :class="{ 'field-input--error': errors.cardNumber }"
                  placeholder="0000 0000 0000 0000"
                  inputmode="numeric"
                  maxlength="19"
                  @input="onCardInput"
                />
                <span v-if="errors.cardNumber" class="field-error">{{ errors.cardNumber }}</span>
              </div>

              <div class="field-wrap field-wrap--full">
                <label class="field-label">Имя держателя</label>
                <input
                  v-model="cardName"
                  class="field-input"
                  :class="{ 'field-input--error': errors.cardName }"
                  placeholder="IVAN IVANOV"
                  @input="cardName = (cardName).toUpperCase()"
                />
                <span v-if="errors.cardName" class="field-error">{{ errors.cardName }}</span>
              </div>

              <div class="field-wrap">
                <label class="field-label">Срок действия</label>
                <input
                  :value="cardExpiry"
                  class="field-input"
                  :class="{ 'field-input--error': errors.cardExpiry }"
                  placeholder="MM/YY"
                  inputmode="numeric"
                  maxlength="5"
                  @input="onExpiryInput"
                />
                <span v-if="errors.cardExpiry" class="field-error">{{ errors.cardExpiry }}</span>
              </div>

              <div class="field-wrap">
                <label class="field-label">CVV</label>
                <input
                  v-model="cardCvv"
                  class="field-input"
                  :class="{ 'field-input--error': errors.cardCvv }"
                  placeholder="•••"
                  inputmode="numeric"
                  maxlength="3"
                  type="password"
                />
                <span v-if="errors.cardCvv" class="field-error">{{ errors.cardCvv }}</span>
              </div>
            </div>
          </div>

          <!-- QR оплата -->
          <div v-else class="pay-section qr-pay">
            <div class="pay-section__label">Оплата по QR-коду</div>
            <div class="qr-pay__box">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CINEMA-PAYMENT-DEMO&bgcolor=1a1a2e&color=f59e0b&margin=10"
                alt="QR для оплаты"
                class="qr-pay__img"
              />
              <div class="qr-pay__info">
                <div class="qr-pay__title">Отсканируйте QR-код</div>
                <div class="qr-pay__sub">Откройте приложение банка и отсканируйте код для оплаты {{ formatPrice(total) }}</div>
                <div class="qr-pay__apps">
                  <span class="qr-app-chip">Mbank</span>
                  <span class="qr-app-chip">O!Деньги</span>
                  <span class="qr-app-chip">ЭлКарт</span>
                </div>
              </div>
            </div>
            <div class="qr-pay__note">
              <AppIcon name="info" :size="14" />
              После оплаты нажмите кнопку «Подтвердить оплату» ниже
            </div>
          </div>

          <!-- Безопасность -->
          <div class="security-note">
            <AppIcon name="shield" :size="14" />
            Платёж защищён 256-bit SSL шифрованием
          </div>
        </div>

        <!-- ── Правая: итог заказа ── -->
        <div class="order-summary">
          <div class="order-summary__title">Ваш заказ</div>

          <!-- Фильм -->
          <div class="order-movie">
            <div class="order-movie__info">
              <div class="order-movie__name">{{ movie?.title }}</div>
              <div class="order-movie__meta">
                <span v-if="hall"><AppIcon name="map-pin" :size="11" /> {{ hall.name }}</span>
                <span v-if="session">
                  <AppIcon name="calendar" :size="11" />
                  {{ formatDateLabel(session.startDateTime.slice(0, 10)) }}
                </span>
                <span v-if="session">
                  <AppIcon name="clock" :size="11" />
                  {{ formatTime(session.startDateTime) }}
                </span>
              </div>
            </div>
          </div>

          <div class="order-divider" />

          <!-- Места -->
          <div class="order-seats-label">Места ({{ seats.length }})</div>
          <div class="order-seats">
            <span v-for="seat in seats" :key="seat" class="order-seat-chip">{{ seat }}</span>
          </div>

          <div class="order-divider" />

          <!-- Итог -->
          <div class="order-row">
            <span>Билеты × {{ seats.length }}</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
          <div class="order-row order-row--service">
            <span>Сервисный сбор</span>
            <span>0 сом</span>
          </div>
          <div class="order-divider" />
          <div class="order-row order-row--total">
            <span>Итого</span>
            <span class="display">{{ formatPrice(total) }}</span>
          </div>

          <!-- Кнопка оплаты -->
          <button
            class="btn-pay"
            :disabled="isProcessing"
            @click="pay"
          >
            <span v-if="isProcessing" class="btn-pay__spinner" />
            <AppIcon v-else name="lock" :size="16" />
            {{ isProcessing ? 'Обработка...' : `Оплатить ${formatPrice(total)}` }}
          </button>

          <p class="order-terms">
            Нажимая «Оплатить», вы соглашаетесь с условиями использования сервиса
          </p>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
.back-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  margin-bottom: 1.5rem; color: var(--text-dim); font-size: 0.85rem;
  background: transparent; border: none; cursor: pointer; transition: color 150ms ease;
}
.back-btn:hover { color: var(--text); }

.page-title {
  color: var(--text);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin-bottom: 2rem;
}

/* Layout */
.payment-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 860px) {
  .payment-layout { grid-template-columns: 1fr; }
  .order-summary { order: -1; }
}

/* Секции формы */
.pay-section {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
}
.pay-section__label {
  font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-dim); margin-bottom: 1rem;
}

/* Методы оплаты */
.pay-methods { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.pay-method {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.75rem 1rem; border-radius: 0.7rem;
  background: var(--surface-soft); border: 1px solid var(--line);
  color: var(--text-muted); font-size: 0.85rem; font-weight: 500;
  cursor: pointer; transition: all 160ms ease;
}
.pay-method:hover { border-color: var(--line-strong); color: var(--text); }
.pay-method--active {
  background: rgba(245,158,11,0.12);
  border-color: rgba(245,158,11,0.5);
  color: var(--amber);
}

/* Визуализация карты */
.card-visual {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 0.9rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(245,158,11,0.2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.card-visual::before {
  content: '';
  position: absolute; top: -30px; right: -30px;
  width: 130px; height: 130px; border-radius: 50%;
  background: rgba(245,158,11,0.08);
}
.card-visual__chip {
  width: 38px; height: 28px; border-radius: 5px;
  background: linear-gradient(135deg, #d4a017, #f5c542);
  border: 1px solid rgba(255,255,255,0.2);
}
.card-visual__number {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem; letter-spacing: 0.2em;
  color: rgba(255,255,255,0.9); margin: 0.75rem 0;
}
.card-visual__bottom {
  display: flex; align-items: flex-end; gap: 2rem;
}
.card-visual__field-label {
  font-size: 0.6rem; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 2px;
}
.card-visual__field-value {
  font-size: 0.85rem; color: rgba(255,255,255,0.9);
  font-weight: 500; letter-spacing: 0.05em;
}
.card-visual__brand { margin-left: auto; }
.card-brand { font-weight: 900; letter-spacing: 0.05em; font-size: 1rem; }
.card-brand--visa { color: #1a73e8; font-style: italic; }
.card-brand--mc { color: #eb001b; }
.card-brand--mir { color: #00a651; }

/* Поля формы */
.form-fields {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;
}
.field-wrap { display: flex; flex-direction: column; gap: 0.35rem; }
.field-wrap--full { grid-column: 1 / -1; }
.field-label {
  font-size: 0.72rem; font-weight: 600;
  color: var(--text-dim); letter-spacing: 0.05em;
}
.field-input {
  padding: 0.65rem 0.9rem;
  border-radius: 0.6rem;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text); font-size: 0.9rem; outline: none;
  transition: border-color 160ms ease;
}
.field-input:focus { border-color: var(--amber); }
.field-input--error { border-color: #ef4444; }
.field-input::placeholder { color: var(--text-fade); }
.field-error { font-size: 0.72rem; color: #ef4444; }

/* QR оплата */
.qr-pay__box {
  display: flex; gap: 1.25rem; align-items: flex-start;
  margin-bottom: 1rem;
}
.qr-pay__img {
  width: 110px; height: 110px; border-radius: 0.6rem;
  border: 2px solid rgba(245,158,11,0.3); flex-shrink: 0;
}
.qr-pay__title { font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 0.4rem; }
.qr-pay__sub { font-size: 0.82rem; color: var(--text-dim); line-height: 1.5; margin-bottom: 0.75rem; }
.qr-pay__apps { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.qr-app-chip {
  padding: 0.2rem 0.55rem; border-radius: 2rem;
  background: var(--surface-soft); border: 1px solid var(--line);
  color: var(--text-muted); font-size: 0.72rem; font-weight: 600;
}
.qr-pay__note {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.65rem 0.9rem; border-radius: 0.6rem;
  background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2);
  font-size: 0.78rem; color: var(--text-dim);
}

/* Безопасность */
.security-note {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.75rem; color: var(--text-fade); padding: 0.5rem 0;
}

/* ── Итог заказа ── */
.order-summary {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 1.2rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
  position: sticky;
  top: 96px;
}
.order-summary__title {
  font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-dim); margin-bottom: 1rem;
}

.order-movie { margin-bottom: 0.75rem; }
.order-movie__name { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 0.4rem; }
.order-movie__meta {
  display: flex; flex-wrap: wrap; gap: 0.5rem;
  font-size: 0.72rem; color: var(--text-dim);
}
.order-movie__meta span { display: inline-flex; align-items: center; gap: 0.25rem; }

.order-divider { height: 1px; background: var(--line); margin: 0.85rem 0; }

.order-seats-label { font-size: 0.72rem; color: var(--text-dim); margin-bottom: 0.5rem; }
.order-seats { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem; }
.order-seat-chip {
  padding: 0.2rem 0.5rem; border-radius: 0.3rem;
  background: rgba(245,158,11,0.13); border: 1px solid rgba(245,158,11,0.3);
  color: var(--amber); font-size: 0.78rem; font-weight: 700;
}

.order-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;
}
.order-row--service { color: var(--text-fade); font-size: 0.8rem; }
.order-row--total {
  font-size: 1rem; color: var(--text); font-weight: 700; margin-bottom: 0;
}
.order-row--total .display { color: var(--amber); font-size: 1.5rem; }

/* Кнопка оплаты */
.btn-pay {
  width: 100%; margin-top: 1.25rem;
  display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 0.9rem 1.5rem; border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--amber), var(--amber-dark));
  color: #18181b; font-size: 1rem; font-weight: 700;
  border: none; cursor: pointer;
  transition: opacity 200ms ease, transform 150ms ease;
  box-shadow: 0 4px 16px rgba(245,158,11,0.35);
}
.btn-pay:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.95; }
.btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-pay__spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid rgba(24,24,27,0.3);
  border-top-color: #18181b;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.order-terms {
  margin-top: 0.75rem; font-size: 0.68rem;
  color: var(--text-fade); text-align: center; line-height: 1.5;
}
</style>