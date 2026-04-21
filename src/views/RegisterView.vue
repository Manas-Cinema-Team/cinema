<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { register } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')

const submit = (e: Event) => {
  e.preventDefault()
  error.value = ''
  if (password.value.length < 6) {
    error.value = 'Пароль должен быть не короче 6 символов.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Пароли не совпадают.'
    return
  }
  register(email.value)
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.push(redirect)
}
</script>

<template>
  <section class="stage flex items-center justify-center" style="min-height: 100vh; padding: 120px 1rem 4rem">
    <div class="auth-card">
      <p class="eyebrow mb-2">Регистрация</p>
      <h1 class="display mb-6" style="color: #fff; font-size: 1.8rem">
        Создайте аккаунт
      </h1>

      <form class="flex flex-col gap-4" @submit="submit">
        <label class="field">
          <span class="field__label">Email</span>
          <div class="field__control">
            <AppIcon name="mail" :size="16" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="name@example.com"
              autocomplete="email"
            />
          </div>
        </label>

        <label class="field">
          <span class="field__label">Пароль</span>
          <div class="field__control">
            <AppIcon name="lock" :size="16" />
            <input
              v-model="password"
              type="password"
              required
              placeholder="Минимум 6 символов"
              autocomplete="new-password"
            />
          </div>
        </label>

        <label class="field">
          <span class="field__label">Повторите пароль</span>
          <div class="field__control">
            <AppIcon name="lock" :size="16" />
            <input
              v-model="confirm"
              type="password"
              required
              placeholder="Повторите пароль"
              autocomplete="new-password"
            />
          </div>
        </label>

        <p v-if="error" style="color: #ef4444; font-size: 0.82rem">{{ error }}</p>

        <button class="btn-amber w-full mt-2" type="submit">
          <AppIcon name="ticket" :size="16" />
          Создать аккаунт
        </button>
      </form>

      <p class="mt-6 text-center" style="color: #71717a; font-size: 0.85rem">
        Уже есть аккаунт?
        <RouterLink to="/login" style="color: #f59e0b; font-weight: 600">Войти</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #14141c;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field__label {
  color: #a1a1aa;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.field__control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #71717a;
  transition: border-color 180ms ease, background 180ms ease;
}
.field__control:focus-within {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.04);
}
.field__control input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 0.95rem;
}
.field__control input::placeholder { color: #52525b; }
</style>
