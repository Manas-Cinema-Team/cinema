<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { cartItem, cartTotal, cartCount, hasCart } from '@/stores/cart'
import { t } from '@/stores/i18n'

const router = useRouter()

const goToPayment = () => {
  const item = cartItem.value
  if (!item) return
  router.push({
    name: 'payment',
    query: {
      session: item.sessionId,
      seats: item.seats.join(','),
      total: String(cartTotal.value),
    },
  })
}
</script>

<template>
  <!-- ── Плавающая корзина (появляется когда выбраны места) ── -->
  <transition name="cart-slide">
    <div v-if="hasCart" class="floating-cart">
      <div class="floating-cart__inner max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Инфо о заказе -->
        <div class="floating-cart__info">
          <div class="floating-cart__icon">
            <AppIcon name="ticket" :size="18" />
            <span class="floating-cart__badge">{{ cartCount }}</span>
          </div>
          <div class="floating-cart__details">
            <div class="floating-cart__movie">{{ cartItem?.movieTitle }}</div>
            <div class="floating-cart__meta">
              {{ cartItem?.date }} · {{ cartItem?.time }} · {{ cartItem?.hallName }}
            </div>
          </div>
          <div class="floating-cart__seats">
            <span
              v-for="seat in cartItem?.seats.slice(0, 5)"
              :key="seat"
              class="floating-cart__seat"
            >{{ seat }}</span>
            <span
              v-if="(cartItem?.seats.length ?? 0) > 5"
              class="floating-cart__seat floating-cart__seat--more"
            >+{{ (cartItem?.seats.length ?? 0) - 5 }}</span>
          </div>
        </div>

        <!-- Итог и кнопка -->
        <div class="floating-cart__action">
          <div class="floating-cart__total">
            <div class="floating-cart__total-label">Итого</div>
            <div class="floating-cart__total-value">
              {{ cartTotal.toLocaleString('ru-RU') }} сом
            </div>
          </div>
          <button class="floating-cart__btn" @click="goToPayment">
            <AppIcon name="credit-card" :size="16" />
            Оплатить
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- ── Обычный футер ── -->
  <footer class="app-footer" :class="{ 'app-footer--with-cart': hasCart }">
    <div
      class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <span class="display footer-brand">
          <span class="footer-brand__accent">CINE</span><span class="footer-brand__plain">MA</span>
        </span>
        <span class="footer-year">· 2026</span>
      </div>

      <nav class="flex items-center gap-5">
        <RouterLink to="/" class="footer-link">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/movies" class="footer-link">{{ t('nav.afisha') }}</RouterLink>
        <RouterLink to="/schedule" class="footer-link">{{ t('nav.schedule') }}</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
/* ── Плавающая корзина ── */
.floating-cart {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--bg-elev) 95%, transparent);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(245,158,11,0.3);
  box-shadow: 0 -8px 32px rgba(0,0,0,0.25), 0 -1px 0 rgba(245,158,11,0.15);
}

.floating-cart__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
}

.floating-cart__info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

/* Иконка с бейджем */
.floating-cart__icon {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 0.6rem;
  background: rgba(245,158,11,0.15);
  border: 1px solid rgba(245,158,11,0.3);
  color: var(--amber);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.floating-cart__badge {
  position: absolute;
  top: -6px; right: -6px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--amber);
  color: #18181b;
  font-size: 0.65rem;
  font-weight: 800;
  display: grid;
  place-items: center;
  border: 2px solid var(--bg);
}

/* Детали */
.floating-cart__details { min-width: 0; }
.floating-cart__movie {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.floating-cart__meta {
  font-size: 0.72rem;
  color: var(--text-dim);
  margin-top: 1px;
}

/* Места */
.floating-cart__seats {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.floating-cart__seat {
  padding: 0.15rem 0.45rem;
  border-radius: 0.3rem;
  background: rgba(245,158,11,0.13);
  border: 1px solid rgba(245,158,11,0.3);
  color: var(--amber);
  font-size: 0.72rem;
  font-weight: 700;
}
.floating-cart__seat--more {
  background: var(--surface-soft);
  border-color: var(--line);
  color: var(--text-dim);
}

@media (max-width: 600px) {
  .floating-cart__seats { display: none; }
}

/* Итог и кнопка */
.floating-cart__action {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}
.floating-cart__total-label {
  font-size: 0.65rem;
  color: var(--text-dim);
  text-align: right;
}
.floating-cart__total-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--amber);
  white-space: nowrap;
}
.floating-cart__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 0.65rem;
  background: linear-gradient(135deg, var(--amber), var(--amber-dark));
  color: #18181b;
  font-size: 0.9rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 160ms ease, transform 150ms ease;
  box-shadow: 0 4px 14px rgba(245,158,11,0.35);
}
.floating-cart__btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Анимация появления корзины */
.cart-slide-enter-active,
.cart-slide-leave-active {
  transition: transform 300ms ease, opacity 300ms ease;
}
.cart-slide-enter-from,
.cart-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ── Обычный футер ── */
.app-footer {
  background: var(--bg);
  border-top: 1px solid var(--line);
  margin-top: auto;
  transition: padding-bottom 300ms ease;
}
/* Когда корзина открыта — добавляем отступ снизу чтобы футер не перекрывался */
.app-footer--with-cart {
  padding-bottom: 72px;
}

.footer-brand { font-size: 1rem; letter-spacing: 0.14em; }
.footer-brand__accent { color: var(--amber); }
.footer-brand__plain { color: var(--text); }
.footer-year { color: var(--text-fade); font-size: 0.8rem; }

.footer-link {
  color: var(--text-dim);
  font-size: 0.8rem;
  transition: color 180ms ease;
}
.footer-link:hover { color: var(--amber); }
</style>