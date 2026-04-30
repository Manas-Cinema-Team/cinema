const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const detectDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8000/api/v1'
  }

  const host = window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost'
  return `http://${host}:8000/api/v1`
}

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || detectDefaultApiBaseUrl(),
)

export const API_ORIGIN = new URL(API_BASE_URL).origin

export interface ApiErrorPayload {
  error?: string
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  status: number
  code: string
  details: unknown

  constructor(status: number, payload: ApiErrorPayload = {}) {
    super(payload.message || `API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = payload.error || 'API_ERROR'
    this.details = payload.details
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null
  token?: string | null
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !(value instanceof FormData) && !(value instanceof URLSearchParams)
}

const buildHeaders = (headers: HeadersInit | undefined, token: string | null | undefined, body: RequestOptions['body']) => {
  const nextHeaders = new Headers(headers)

  if (token) {
    nextHeaders.set('Authorization', `Bearer ${token}`)
  }

  if (isPlainObject(body) && !nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json')
  }

  return nextHeaders
}

const buildBody = (body: RequestOptions['body']) => {
  if (isPlainObject(body)) {
    return JSON.stringify(body)
  }

  return body ?? undefined
}

const parseJsonSafely = async (response: Response) => {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export const absoluteAssetUrl = (value: string | null | undefined) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return new URL(value, API_ORIGIN).toString()
}

export async function apiJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, body, credentials = 'include', ...rest } = options

  const response = await fetch(apiUrl(path), {
    ...rest,
    credentials,
    headers: buildHeaders(headers, token, body),
    body: buildBody(body),
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof payload === 'object' && payload !== null ? (payload as ApiErrorPayload) : {},
    )
  }

  return payload as T
}
