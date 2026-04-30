import { computed, ref } from 'vue'

import { apiJson, ApiError } from '@/api/client'
import { t } from '@/stores/i18n'

const STORAGE_KEY = 'cinema.auth'

interface PersistedUser {
  id: number
  email: string
  createdAt?: string | null
}

interface AuthPayload {
  user: {
    id: number
    email: string
    created_at?: string
  }
  access_token: string
  refresh_token: string
}

interface RefreshPayload {
  access_token: string
  refresh_token: string
}

interface StoredAuthState {
  user: PersistedUser | null
  sessionStartedAt: string | null
}

const readPersistedState = (): StoredAuthState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { user: null, sessionStartedAt: null }
    }

    const parsed = JSON.parse(raw) as StoredAuthState
    return {
      user: parsed.user || null,
      sessionStartedAt: parsed.sessionStartedAt || null,
    }
  } catch {
    return { user: null, sessionStartedAt: null }
  }
}

const persisted = readPersistedState()

const accessToken = ref<string | null>(null)
const user = ref<PersistedUser | null>(persisted.user)
const sessionStartedAt = ref<string | null>(persisted.sessionStartedAt)
const authReady = ref(false)
const authBusy = ref(false)
const authError = ref<string | null>(null)

let initializePromise: Promise<void> | null = null
let refreshPromise: Promise<string | null> | null = null

const persist = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: user.value,
      sessionStartedAt: sessionStartedAt.value,
    }),
  )
}

const clearPersistedState = () => {
  localStorage.removeItem(STORAGE_KEY)
}

const setSession = (payload: { token: string; userData?: PersistedUser | null }) => {
  accessToken.value = payload.token

  if (payload.userData) {
    user.value = payload.userData
  }

  if (!sessionStartedAt.value) {
    sessionStartedAt.value = new Date().toISOString()
  }

  authError.value = null
  persist()
}

const clearSession = () => {
  accessToken.value = null
  user.value = null
  sessionStartedAt.value = null
  authError.value = null
  clearPersistedState()
}

const normalizeUser = (payload: AuthPayload['user']): PersistedUser => ({
  id: payload.id,
  email: payload.email,
  createdAt: payload.created_at || user.value?.createdAt || null,
})

const refreshSession = async (force = false) => {
  if (refreshPromise && !force) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const payload = await apiJson<RefreshPayload>('/auth/refresh', {
        method: 'POST',
        body: {},
      })
      setSession({
        token: payload.access_token,
        userData: user.value,
      })
      return payload.access_token
    } catch (error) {
      if (force || error instanceof ApiError) {
        clearSession()
      }
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export const currentUser = computed(() => user.value)
export const currentAccessToken = computed(() => accessToken.value)
export const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))
export const isAuthReady = computed(() => authReady.value)
export const isAuthBusy = computed(() => authBusy.value)
export const currentAuthError = computed(() => authError.value)
export const currentSessionStartedAt = computed(() => sessionStartedAt.value)

export const initializeAuth = async () => {
  if (initializePromise) {
    return initializePromise
  }

  initializePromise = (async () => {
    authBusy.value = true
    try {
      await refreshSession()
    } finally {
      authBusy.value = false
      authReady.value = true
      initializePromise = null
    }
  })()

  return initializePromise
}

export const ensureAuthReady = async () => {
  if (authReady.value) return
  await initializeAuth()
}

export const login = async (email: string, password: string) => {
  authBusy.value = true
  try {
    const payload = await apiJson<AuthPayload>('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })
    setSession({
      token: payload.access_token,
      userData: normalizeUser(payload.user),
    })
  } finally {
    authBusy.value = false
    authReady.value = true
  }
}

export const register = async (email: string, password: string, passwordConfirm: string) => {
  authBusy.value = true
  try {
    const payload = await apiJson<AuthPayload>('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        password_confirm: passwordConfirm,
      },
    })
    setSession({
      token: payload.access_token,
      userData: normalizeUser(payload.user),
    })
  } finally {
    authBusy.value = false
    authReady.value = true
  }
}

export const logout = async () => {
  const token = accessToken.value
  try {
    if (token) {
      await apiJson<{ message: string }>('/auth/logout', {
        method: 'POST',
        token,
        body: {},
      })
    }
  } catch {
    // Local cleanup is enough if the backend is unreachable or token is already invalid.
  } finally {
    clearSession()
    authReady.value = true
  }
}

export const ensureAccessToken = async () => {
  if (accessToken.value) {
    return accessToken.value
  }

  await ensureAuthReady()

  if (accessToken.value) {
    return accessToken.value
  }

  return refreshSession(true)
}

export async function authorizedApiJson<T>(path: string, options: Omit<Parameters<typeof apiJson<T>>[1], 'token'> = {}) {
  const token = await ensureAccessToken()
  if (!token) {
    throw new ApiError(401, {
      error: 'UNAUTHORIZED',
      message: t('auth.required'),
    })
  }

  try {
    return await apiJson<T>(path, {
      ...options,
      token,
    })
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error
    }

    const refreshedToken = await refreshSession(true)
    if (!refreshedToken) {
      throw error
    }

    return apiJson<T>(path, {
      ...options,
      token: refreshedToken,
    })
  }
}

export async function optionalAuthorizedApiJson<T>(path: string, options: Omit<Parameters<typeof apiJson<T>>[1], 'token'> = {}) {
  const token = accessToken.value

  if (!token) {
    return apiJson<T>(path, options)
  }

  try {
    return await apiJson<T>(path, {
      ...options,
      token,
    })
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error
    }

    const refreshedToken = await refreshSession(true)
    if (!refreshedToken) {
      return apiJson<T>(path, options)
    }

    return apiJson<T>(path, {
      ...options,
      token: refreshedToken,
    })
  }
}
