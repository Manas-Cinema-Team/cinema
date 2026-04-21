import { computed, ref } from 'vue'

// Моковая JWT-аутентификация для MVP.
// Реальные эндпоинты (/api/auth/login, /api/auth/register) подключит backend-команда.

const STORAGE_KEY = 'cinema.auth'

interface AuthState {
  token: string
  email: string
}

const load = (): AuthState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthState) : null
  } catch {
    return null
  }
}

const state = ref<AuthState | null>(load())

export const isAuthenticated = computed(() => state.value !== null)
export const currentUser = computed(() => state.value)

const persist = (next: AuthState | null) => {
  state.value = next
  if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  else localStorage.removeItem(STORAGE_KEY)
}

export const login = (email: string) => {
  persist({ token: `mock.${btoa(email)}.${Date.now()}`, email })
}

export const register = (email: string) => {
  persist({ token: `mock.${btoa(email)}.${Date.now()}`, email })
}

export const logout = () => persist(null)
