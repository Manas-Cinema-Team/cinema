import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'cinema.theme'

const load = (): Theme => {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  return raw === 'light' ? 'light' : 'dark'
}

export const theme = ref<Theme>(load())

const apply = (t: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = t
  }
}

apply(theme.value)

watch(theme, (t) => {
  apply(t)
  try {
    localStorage.setItem(STORAGE_KEY, t)
  } catch {
    /* ignore */
  }
})

export const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
