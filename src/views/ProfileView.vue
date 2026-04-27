<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { currentUser, isAuthenticated, logout } from '@/stores/auth'
import { allTickets, removeTicket, ticketCount } from '@/stores/bookings'
import { t } from '@/stores/i18n'

const router = useRouter()

if (!isAuthenticated.value) router.push('/login')

const userInitials = computed(() => {
  const email = currentUser.value?.email
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
})

const memberSince = computed(() => {
  const token = currentUser.value?.token
  if (!token) return '—'
  const parts = token.split('.')
  const ts = Number(parts[2])
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
})

const onLogout = () => {
  logout()
  router.push('/')
}

const activeTab = ref<'info' | 'tickets'>('info')

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

const confirmRemove = (id: string) => {
  if (confirm('Удалить этот билет из истории?')) removeTicket(id)
}

const uniqueMovies = computed(() => new Set(allTickets.value.map(tk => tk.movieId)).size)
</script>

<template>
  <div class="stage profile-page" style="min-height: 100vh; padding-top: 96px">
    <div class="profile-bg-glow" />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <button class="back-btn" @click="router.back()">
        <AppIcon name="arrow-left" :size="15" />
        Назад
      </button>

      <!-- Карточка профиля -->
      <div class="profile-card">
        <div class="profile-card__left">
          <div class="profile-avatar-xl">
            <span>{{ userInitials }}</span>
            <div class="profile-avatar-xl__ring" />
          </div>
          <div>
            <h1 class="profile-card__email">{{ currentUser?.email }}</h1>
            <span class="profile-card__status">
              <span class="status-dot" /> Авторизован
            </span>
          </div>
        </div>
        <button class="profile-logout-btn" @click="onLogout">
          <AppIcon name="log-out" :size="16" />
          Выйти
        </button>
      </div>

      <!-- Статистика -->
      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat__icon"><AppIcon name="calendar" :size="18" /></div>
          <div>
            <div class="profile-stat__label">Дата регистрации</div>
            <div class="profile-stat__value">{{ memberSince }}</div>
          </div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat__icon"><AppIcon name="ticket" :size="18" /></div>
          <div>
            <div class="profile-stat__label">Билетов куплено</div>
            <div class="profile-stat__value">{{ ticketCount }}</div>
          </div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat__icon"><AppIcon name="film" :size="18" /></div>
          <div>
            <div class="profile-stat__label">Фильмов просмотрено</div>
            <div class="profile-stat__value">{{ uniqueMovies }}</div>
          </div>
        </div>
      </div>

      <!-- Табы -->
      <div class="profile-tabs">
        <button
          class="profile-tab"
          :class="{ 'profile-tab--active': activeTab === 'info' }"
          @click="activeTab = 'info'"
        >
          <AppIcon name="user" :size="15" />
          Данные профиля
        </button>
        <button
          class="profile-tab"
          :class="{ 'profile-tab--active': activeTab === 'tickets' }"
          @click="activeTab = 'tickets'"
        >
          <AppIcon name="ticket" :size="15" />
          Мои билеты
          <span v-if="ticketCount > 0" class="tab-badge">{{ ticketCount }}</span>
        </button>
      </div>

      <transition name="tab-fade" mode="out-in">

        <!-- Данные профиля -->
        <div v-if="activeTab === 'info'" key="info" class="profile-section">
          <div class="profile-info-grid">
            <div class="profile-info-item">
              <div class="profile-info-item__label">Email</div>
              <div class="profile-info-item__value">{{ currentUser?.email }}</div>
            </div>
            <div class="profile-info-item">
              <div class="profile-info-item__label">Роль</div>
              <div class="profile-info-item__value">Пользователь</div>
            </div>
            <div class="profile-info-item">
              <div class="profile-info-item__label">Токен сессии</div>
              <div class="profile-info-item__value profile-info-item__value--mono">
                {{ currentUser?.token?.slice(0, 28) }}…
              </div>
            </div>
          </div>
          <div class="profile-note">
            <AppIcon name="info" :size="15" />
            Редактирование профиля будет доступно после подключения backend API.
          </div>
        </div>

        <!-- Мои билеты -->
        <div v-else key="tickets" class="profile-section">

          <div v-if="allTickets.length > 0" class="tickets-list">
            <div v-for="ticket in allTickets" :key="ticket.id" class="ticket-card">

              <!-- Постер -->
              <div class="ticket-card__poster">
                <img
                  v-if="ticket.moviePoster"
                  :src="ticket.moviePoster"
                  :alt="ticket.movieTitle"
                  class="ticket-card__poster-img"
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
                <div v-else class="ticket-card__poster-fallback">
                  <AppIcon name="film" :size="20" fill="rgba(245,158,11,0.5)" />
                </div>
              </div>

              <!-- Инфо -->
              <div class="ticket-card__info">
                <div class="ticket-card__code">{{ ticket.bookingCode }}</div>
                <div class="ticket-card__title">{{ ticket.movieTitle }}</div>
                <div class="ticket-card__meta">
                  <span><AppIcon name="calendar" :size="12" /> {{ formatDate(ticket.date) }}</span>
                  <span><AppIcon name="clock" :size="12" /> {{ ticket.time }}</span>
                  <span><AppIcon name="map-pin" :size="12" /> {{ ticket.hallName }}</span>
                </div>
                <div class="ticket-card__seats">
                  <span v-for="seat in ticket.seats" :key="seat" class="ticket-card__seat">
                    {{ seat }}
                  </span>
                </div>
              </div>

              <!-- Цена + действия -->
              <div class="ticket-card__right">
                <div class="ticket-card__total">{{ ticket.total.toLocaleString('ru-RU') }} сом</div>
                <RouterLink
                  :to="{ name: 'booking-success', query: { session: ticket.sessionId, seats: ticket.seats.join(','), total: String(ticket.total) } }"
                  class="ticket-card__view-btn"
                >
                  <AppIcon name="eye" :size="13" />
                  Просмотр
                </RouterLink>
                <button class="ticket-card__del-btn" @click="confirmRemove(ticket.id)">
                  <AppIcon name="trash-2" :size="13" />
                </button>
              </div>
            </div>
          </div>

          <!-- Пусто -->
          <div v-else class="profile-empty">
            <div class="profile-empty__icon">
              <AppIcon name="ticket" :size="36" />
            </div>
            <div class="profile-empty__title">Билетов пока нет</div>
            <div class="profile-empty__sub">Выберите фильм и забронируйте место прямо сейчас</div>
            <RouterLink to="/movies" class="btn-amber mt-4">
              <AppIcon name="film" :size="16" />
              Смотреть афишу
            </RouterLink>
          </div>

        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.profile-page { position: relative; }
.profile-bg-glow {
  position: fixed; top: 0; left: 50%; transform: translateX(-50%);
  width: 600px; height: 300px;
  background: radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.12), transparent 70%);
  pointer-events: none; z-index: 0;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;
  color: var(--text-dim); font-size: 0.85rem;
  background: transparent; border: none; cursor: pointer; transition: color 150ms ease;
}
.back-btn:hover { color: var(--text); }

.profile-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1.5rem; padding: 1.5rem; border-radius: 1.2rem;
  background: var(--bg-elev); border: 1px solid var(--line);
  box-shadow: 0 4px 24px rgba(0,0,0,0.12); margin-bottom: 1.5rem;
  position: relative; overflow: hidden;
}
.profile-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%);
  pointer-events: none;
}
.profile-card__left { display: flex; align-items: center; gap: 1.25rem; }
.profile-avatar-xl {
  position: relative; width: 68px; height: 68px; border-radius: 50%;
  background: linear-gradient(135deg, var(--amber), var(--amber-dark));
  display: grid; place-items: center;
  font-size: 1.8rem; font-weight: 800; color: #18181b; flex-shrink: 0;
}
.profile-avatar-xl__ring {
  position: absolute; inset: -4px; border-radius: 50%;
  border: 2px solid rgba(245,158,11,0.4); border-top-color: var(--amber);
  animation: ring-spin 6s linear infinite;
}
@keyframes ring-spin { to { transform: rotate(360deg); } }
.profile-card__email { font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
.profile-card__status { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #22c55e; font-weight: 500; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
.profile-logout-btn {
  display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
  border-radius: 0.6rem; border: 1px solid rgba(239,68,68,0.3); color: #ef4444;
  font-size: 0.85rem; font-weight: 500; background: rgba(239,68,68,0.06); cursor: pointer;
  transition: background 150ms ease;
}
.profile-logout-btn:hover { background: rgba(239,68,68,0.14); }

.profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
@media (max-width: 600px) { .profile-stats { grid-template-columns: 1fr; } }
.profile-stat {
  display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem;
  border-radius: 0.9rem; background: var(--surface-soft); border: 1px solid var(--line);
}
.profile-stat__icon {
  width: 38px; height: 38px; border-radius: 0.6rem;
  background: rgba(245,158,11,0.12); color: var(--amber);
  display: grid; place-items: center; flex-shrink: 0;
}
.profile-stat__label { font-size: 0.72rem; color: var(--text-dim); margin-bottom: 2px; }
.profile-stat__value { font-size: 0.95rem; font-weight: 700; color: var(--text); }

.profile-tabs {
  display: flex; gap: 0.5rem; margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--line); padding-bottom: 0;
}
.profile-tab {
  display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.6rem 1rem;
  font-size: 0.85rem; font-weight: 600; color: var(--text-dim);
  background: transparent; border: none; border-bottom: 2px solid transparent;
  cursor: pointer; margin-bottom: -1px; transition: color 150ms ease, border-color 150ms ease;
}
.profile-tab:hover { color: var(--text); }
.profile-tab--active { color: var(--amber); border-bottom-color: var(--amber); }
.tab-badge {
  padding: 0.1rem 0.45rem; border-radius: 2rem;
  background: var(--amber); color: #18181b; font-size: 0.68rem; font-weight: 700;
}

.profile-section { padding: 1.5rem 0; }

/* Список билетов */
.tickets-list { display: flex; flex-direction: column; gap: 1rem; }
.ticket-card {
  display: grid; grid-template-columns: 64px 1fr auto;
  gap: 1rem; padding: 1rem 1.25rem; border-radius: 0.9rem;
  background: var(--bg-elev); border: 1px solid var(--line);
  box-shadow: var(--shadow-card); transition: border-color 180ms ease; align-items: center;
}
.ticket-card:hover { border-color: rgba(245,158,11,0.35); }
.ticket-card__poster {
  width: 56px; height: 80px; border-radius: 0.5rem; overflow: hidden;
  background: var(--surface-soft); border: 1px solid var(--line);
  flex-shrink: 0; display: grid; place-items: center;
}
.ticket-card__poster-img { width: 100%; height: 100%; object-fit: cover; }
.ticket-card__code { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; color: var(--amber); margin-bottom: 0.25rem; }
.ticket-card__title { font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 0.35rem; }
.ticket-card__meta { display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.72rem; color: var(--text-dim); margin-bottom: 0.5rem; }
.ticket-card__meta span { display: inline-flex; align-items: center; gap: 0.25rem; }
.ticket-card__seats { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.ticket-card__seat {
  padding: 0.15rem 0.45rem; border-radius: 0.3rem;
  background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
  color: var(--amber); font-size: 0.72rem; font-weight: 700;
}
.ticket-card__right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
.ticket-card__total { font-size: 0.95rem; font-weight: 700; color: var(--amber); white-space: nowrap; }
.ticket-card__view-btn {
  display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.65rem;
  border-radius: 0.4rem; background: var(--surface-soft); border: 1px solid var(--line);
  color: var(--text-muted); font-size: 0.75rem; text-decoration: none;
  transition: border-color 150ms ease, color 150ms ease;
}
.ticket-card__view-btn:hover { border-color: var(--amber); color: var(--amber); }
.ticket-card__del-btn {
  padding: 0.3rem 0.5rem; border-radius: 0.4rem;
  background: transparent; border: 1px solid rgba(239,68,68,0.2);
  color: rgba(239,68,68,0.5); cursor: pointer; transition: all 150ms ease;
}
.ticket-card__del-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.5); color: #ef4444; }

@media (max-width: 540px) {
  .ticket-card { grid-template-columns: 48px 1fr; }
  .ticket-card__right { grid-column: 1 / -1; flex-direction: row; justify-content: space-between; align-items: center; }
}

.profile-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 3rem 1rem;
}
.profile-empty__icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--surface-soft); border: 1px solid var(--line);
  display: grid; place-items: center; color: var(--text-dim); margin-bottom: 1.25rem;
}
.profile-empty__title { font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 0.4rem; }
.profile-empty__sub { font-size: 0.85rem; color: var(--text-dim); max-width: 280px; }

.profile-info-grid {
  display: flex; flex-direction: column; border-radius: 0.9rem;
  border: 1px solid var(--line); overflow: hidden; margin-bottom: 1rem;
}
.profile-info-item {
  display: grid; grid-template-columns: 160px 1fr;
  gap: 1rem; padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--line);
}
.profile-info-item:last-child { border-bottom: none; }
.profile-info-item__label { font-size: 0.8rem; color: var(--text-dim); font-weight: 500; }
.profile-info-item__value { font-size: 0.88rem; color: var(--text); word-break: break-all; }
.profile-info-item__value--mono { font-family: monospace; font-size: 0.78rem; color: var(--text-muted); }

.profile-note {
  display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.8rem 1rem;
  border-radius: 0.7rem; background: rgba(245,158,11,0.07);
  border: 1px solid rgba(245,158,11,0.2); font-size: 0.8rem; color: var(--text-dim);
}

.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; transform: translateY(6px); }
</style>