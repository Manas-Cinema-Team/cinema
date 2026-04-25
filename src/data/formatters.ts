import { locale } from '@/stores/i18n'
import { TODAY } from './mock-data'

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

export const formatPrice = (amount: number): string => {
  const currency = locale.value === 'en' ? 'som' : 'сом'
  return `${amount} ${currency}`
}

// ── Форматирование даты ──────────────────────────────────────────────────

const WEEKDAYS: Record<'ru' | 'en' | 'ky', string[]> = {
  ru: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ky: ['жк', 'дш', 'шш', 'шр', 'бш', 'жм', 'иш'],
}
const MONTHS: Record<'ru' | 'en' | 'ky', string[]> = {
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ky: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
}
const TODAY_LABEL: Record<'ru' | 'en' | 'ky', string> = {
  ru: 'Сегодня',
  en: 'Today',
  ky: 'Бүгүн',
}

export const formatDateLabel = (isoDate: string): string => {
  const l = locale.value
  if (isoDate === TODAY) return TODAY_LABEL[l]
  const d = new Date(isoDate + 'T00:00:00')
  const wd = WEEKDAYS[l][d.getDay()]
  const mo = MONTHS[l][d.getMonth()]
  const day = d.getDate()
  if (l === 'en') return `${wd}, ${mo} ${day}`
  return `${wd}, ${day} ${mo}`
}

export const formatTime = (iso: string): string => iso.slice(11, 16)