import { currentIntlLocale, locale, t } from '@/stores/i18n'

// ── Форматирование длительности ──────────────────────────────────────────

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const mm = String(m).padStart(2, '0')
  if (locale.value === 'en') return `${h}h ${mm}m`
  if (locale.value === 'ky') return `${h} с ${mm} мүн`
  return `${h} ч ${mm} мин`
}

// ── Форматирование цены ──────────────────────────────────────────────────

export const formatPrice = (amount: number, currency = 'KGS'): string => {
  const value = Number.isFinite(amount) ? amount : 0
  const formatted = new Intl.NumberFormat(currentIntlLocale.value, {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)

  const currencyLabel = currency === 'KGS'
    ? (locale.value === 'en' ? 'som' : 'сом')
    : currency

  return `${formatted} ${currencyLabel}`
}

// ── Форматирование даты ──────────────────────────────────────────────────

export const formatDateLabel = (isoDate: string): string => {
  const normalizedDate = isoDate.slice(0, 10)
  const today = new Date()
  const todayIso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  if (normalizedDate === todayIso) return t('date.today')

  const d = new Date(`${normalizedDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return normalizedDate

  const options = locale.value === 'en'
    ? { weekday: 'short', month: 'short', day: 'numeric' } as const
    : { weekday: 'short', day: 'numeric', month: 'short' } as const

  return new Intl.DateTimeFormat(currentIntlLocale.value, options).format(d)
}

export const formatTime = (iso: string): string => iso.slice(11, 16)

export const formatSeatLabel = (row: number, number: number) => `${row}-${number}`

export const formatLongDate = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat(currentIntlLocale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}
