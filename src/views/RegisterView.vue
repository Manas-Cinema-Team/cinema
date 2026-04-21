<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import { register } from '@/stores/auth'
import { t } from '@/stores/i18n'

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
    error.value = t('auth.errorShort')
    return
  }
  if (password.value !== confirm.value) {
    error.value = t('auth.errorMismatch')
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
      <p class="eyebrow mb-2">{{ t('auth.register') }}</p>
      <h1 class="display auth-card__title">
        {{ t('auth.signUpTitle') }}
      </h1>

      <form class="flex flex-col gap-4" @submit="submit">
        <label class="field">
          <span class="field__label">{{ t('auth.email') }}</span>
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
          <span class="field__label">{{ t('auth.password') }}</span>
          <div class="field__control">
            <AppIcon name="lock" :size="16" />
            <input
              v-model="password"
              type="password"
              required
              :placeholder="t('auth.passwordMin')"
              autocomplete="new-password"
            />
          </div>
        </label>

        <label class="field">
          <span class="field__label">{{ t('auth.passwordConfirm') }}</span>
          <div class="field__control">
            <AppIcon name="lock" :size="16" />
            <input
              v-model="confirm"
              type="password"
              required
              :placeholder="t('auth.passwordConfirm')"
              autocomplete="new-password"
            />
          </div>
        </label>

        <p v-if="error" class="auth-card__error">{{ error }}</p>

        <button class="btn-amber w-full mt-2" type="submit">
          <AppIcon name="ticket" :size="16" />
          {{ t('auth.signUpSubmit') }}
        </button>
      </form>

      <p class="auth-card__switch">
        {{ t('auth.hasAccount') }}
        <RouterLink to="/login" class="auth-card__link">{{ t('auth.goLogin') }}</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-card);
}
.auth-card__title {
  color: var(--text);
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}
.auth-card__switch {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.85rem;
}
.auth-card__link {
  color: var(--amber);
  font-weight: 600;
}
.auth-card__error {
  color: var(--red);
  font-size: 0.82rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field__label {
  color: var(--text-dim);
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
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text-dim);
  transition: border-color 180ms ease, background 180ms ease;
}
.field__control:focus-within {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.05);
}
.field__control input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.95rem;
}
.field__control input::placeholder { color: var(--text-fade); }
</style>
