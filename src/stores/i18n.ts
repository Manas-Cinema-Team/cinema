import { computed, ref, watch } from 'vue'
import ru from '@/messages/ru'
import en from '@/messages/en'
import ky from '@/messages/ky'
import type { Dict } from '@/messages/types'

export type Locale = 'ru' | 'en' | 'ky'

export const LOCALES: Locale[] = ['ru', 'en', 'ky']

const STORAGE_KEY = 'cinema.locale'

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  ky: 'KG',
}

// ── Словари теперь живут в src/messages/ ─────────────────────────────────
const dict: Record<Locale, Dict> = { ru, en, ky }

const plurals: Record<Locale, Record<string, string[]>> = {
  ru: { seats: ['место', 'места', 'мест'] },
  en: { seats: ['seat', 'seats'] },
  ky: { seats: ['орун'] },
}

// ── State ─────────────────────────────────────────────────────────────────

const load = (): Locale => {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : 'ru'
}

export const locale = ref<Locale>(load())

export const localeLabel = computed(() => LOCALE_LABELS[locale.value])

const apply = (l: Locale) => {
  if (typeof document !== 'undefined') document.documentElement.lang = l
}
apply(locale.value)

watch(locale, (l) => {
  apply(l)
  try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
})

// ── Функции перевода ──────────────────────────────────────────────────────

export const t = (key: string, params?: Record<string, string | number>): string => {
  const table = dict[locale.value] ?? dict.ru
  let text = table[key] ?? dict.ru[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v))
    }
  }
  return text
}

export const tPlural = (n: number, key: string): string => {
  const forms = plurals[locale.value]?.[key]
  if (!forms || forms.length === 0) return key
  if (locale.value === 'ru') {
    const n10 = n % 10
    const n100 = n % 100
    if (n10 === 1 && n100 !== 11) return forms[0]!
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1] ?? forms[0]!
    return forms[2] ?? forms[0]!
  }
  if (locale.value === 'en') {
    return n === 1 ? forms[0]! : (forms[1] ?? forms[0]!)
  }
  return forms[0]!
}

export const cycleLocale = () => {
  const idx = LOCALES.indexOf(locale.value)
  locale.value = LOCALES[(idx + 1) % LOCALES.length]!
}

export const setLocale = (l: Locale) => { locale.value = l }