import { locale } from '@/stores/i18n'

// ── Типы соответствуют сущностям из ТЗ (Movie, Hall, Session, BookingSeat) ──

export type SeatStatus = 'available' | 'held' | 'booked'

export interface SeatMeta {
  row: string
  number: number
  disabled?: boolean
}

// Hall.schema_metadata — JSON-структура зала, как в ТЗ §10
export interface HallSchema {
  rows: string[]
  seatsPerRow: number
  seats: SeatMeta[]
  disabledSeats: string[]
}

export interface Hall {
  id: string
  name: string
  rows: number
  seatsPerRow: number
  schema: HallSchema
}

export interface Movie {
  id: string
  title: string
  description: string
  genre: string[]
  duration: number
  ageRating: string
  posterUrl: string
  releaseDate: string
  isActive: boolean
}

export interface Session {
  id: string
  movieId: string
  hallId: string
  startDateTime: string
  durationMinutes: number
  isActive: boolean
  price: number
}

// ── Залы ─────────────────────────────────────────────────────────────────
const buildHall = (
  id: string,
  name: string,
  rows: string[],
  perRow: number,
  disabled: string[] = [],
): Hall => {
  const seats: SeatMeta[] = []
  for (const row of rows) {
    for (let n = 1; n <= perRow; n++) {
      seats.push({
        row,
        number: n,
        disabled: disabled.includes(`${row}${n}`),
      })
    }
  }
  return {
    id,
    name,
    rows: rows.length,
    seatsPerRow: perRow,
    schema: { rows, seatsPerRow: perRow, seats, disabledSeats: disabled },
  }
}

export const halls: Hall[] = [
  buildHall('hall-1', 'Зал 1 · Большой', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 12),
  buildHall('hall-2', 'Зал 2 · Комфорт', ['A', 'B', 'C', 'D', 'E', 'F'], 10),
  buildHall('hall-3', 'Зал 3 · Камерный', ['A', 'B', 'C', 'D'], 8),
]

export const findHall = (id: string | undefined) => halls.find((h) => h.id === id)

// ── Фильмы ───────────────────────────────────────────────────────────────
export const movies: Movie[] = [
  {
    id: 'midnight-arc',
    title: 'Полуночная дуга',
    description:
      'История о дирижёре, который возвращается в город после долгого молчания и находит старый кинотеатр, где каждый вечер идёт один и тот же загадочный фильм. Камерная драма о памяти, вине и музыке, которая звучит только ночью.',
    genre: ['драма', 'триллер'],
    duration: 128,
    ageRating: '16+',
    posterUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=800&q=85',
    releaseDate: '2026-04-10',
    isActive: true,
  },
  {
    id: 'golden-station',
    title: 'Золотой вокзал',
    description:
      'Ночной поезд прибывает на платформу, которой нет на карте. Пять пассажиров получают шанс изменить одну сцену из своего прошлого — но у каждой остановки своя цена.',
    genre: ['приключения', 'мистика'],
    duration: 114,
    ageRating: '12+',
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=85',
    releaseDate: '2026-03-28',
    isActive: true,
  },
  {
    id: 'velvet-sky',
    title: 'Бархатное небо',
    description:
      'Пианистка и оператор встречаются на ночной съёмке, где город становится декорацией для фильма, который ещё никто не написал. Тёплая история о случайных связях.',
    genre: ['мелодрама', 'музыка'],
    duration: 121,
    ageRating: '12+',
    posterUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=85',
    releaseDate: '2026-04-05',
    isActive: true,
  },
  {
    id: 'silent-code',
    title: 'Тихий код',
    description:
      'Криптограф в подмосковном НИИ ловит в радиоэфире сигнал, которого не должно существовать. Расследование приводит к открытию, которое лучше бы осталось в тишине.',
    genre: ['фантастика', 'триллер'],
    duration: 135,
    ageRating: '16+',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=85',
    releaseDate: '2026-04-12',
    isActive: true,
  },
  {
    id: 'paper-lantern',
    title: 'Бумажный фонарь',
    description:
      'Анимационная сказка о девочке, которая сшивает из обрывков писем фонарь — и тот находит дорогу к потерянному брату через семь миров.',
    genre: ['анимация', 'семейный'],
    duration: 96,
    ageRating: '6+',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=85',
    releaseDate: '2026-04-01',
    isActive: true,
  },
  {
    id: 'red-line',
    title: 'Красная линия',
    description:
      'В городе, разделённом на два сектора, обычный курьер случайно находит карту, которая открывает все двери. Динамичный триллер с погонями.',
    genre: ['боевик', 'триллер'],
    duration: 118,
    ageRating: '18+',
    posterUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=800&q=85',
    releaseDate: '2026-04-20',
    isActive: true,
  },
]

export const findMovie = (id: string | string[] | undefined) => {
  const key = Array.isArray(id) ? id[0] : id
  return movies.find((m) => m.id === key)
}

// ── Сеансы ───────────────────────────────────────────────────────────────
export const TODAY = '2026-04-19' // для воспроизводимости в MVP

const buildSession = (
  id: string,
  movieId: string,
  hallId: string,
  date: string,
  time: string,
  duration: number,
  price: number,
): Session => ({
  id,
  movieId,
  hallId,
  startDateTime: `${date}T${time}:00`,
  durationMinutes: duration,
  isActive: true,
  price,
})

export const sessions: Session[] = [
  // 19 апреля
  buildSession('ses-101', 'midnight-arc',   'hall-1', TODAY, '12:00', 128, 450),
  buildSession('ses-102', 'golden-station', 'hall-2', TODAY, '14:30', 114, 400),
  buildSession('ses-103', 'velvet-sky',     'hall-2', TODAY, '17:00', 121, 400),
  buildSession('ses-104', 'midnight-arc',   'hall-1', TODAY, '19:30', 128, 500),
  buildSession('ses-105', 'silent-code',    'hall-3', TODAY, '21:00', 135, 550),
  buildSession('ses-106', 'paper-lantern',  'hall-2', TODAY, '10:30', 96,  350),
  // 20 апреля
  buildSession('ses-201', 'red-line',       'hall-1', '2026-04-20', '13:00', 118, 450),
  buildSession('ses-202', 'golden-station', 'hall-2', '2026-04-20', '15:30', 114, 400),
  buildSession('ses-203', 'midnight-arc',   'hall-1', '2026-04-20', '18:00', 128, 500),
  buildSession('ses-204', 'silent-code',    'hall-3', '2026-04-20', '20:30', 135, 550),
  // 21 апреля
  buildSession('ses-301', 'velvet-sky',     'hall-1', '2026-04-21', '14:00', 121, 450),
  buildSession('ses-302', 'paper-lantern',  'hall-2', '2026-04-21', '11:00', 96,  350),
  buildSession('ses-303', 'red-line',       'hall-1', '2026-04-21', '21:00', 118, 500),
]

export const findSession = (id: string | string[] | undefined) => {
  const key = Array.isArray(id) ? id[0] : id
  return sessions.find((s) => s.id === key)
}

// ── Хелперы ──────────────────────────────────────────────────────────────
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const mm = String(m).padStart(2, '0')
  if (locale.value === 'en') return `${h}h ${mm}m`
  if (locale.value === 'ky') return `${h} с ${mm} мүн`
  return `${h} ч ${mm} мин`
}

export const formatPrice = (amount: number): string => {
  const currency = locale.value === 'en' ? 'som' : 'сом'
  return `${amount} ${currency}`
}

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
  const m = MONTHS[l][d.getMonth()]
  const day = d.getDate()
  if (l === 'en') return `${wd}, ${m} ${day}`
  return `${wd}, ${day} ${m}`
}

export const formatTime = (iso: string): string => iso.slice(11, 16)

export interface ScheduleItem {
  session: Session
  movie: Movie
  hall: Hall
  date: string
  time: string
}

export const scheduleItems = (): ScheduleItem[] =>
  sessions
    .filter((s) => s.isActive)
    .map((s) => {
      const movie = findMovie(s.movieId)
      const hall = findHall(s.hallId)
      if (!movie || !hall) return null
      return {
        session: s,
        movie,
        hall,
        date: s.startDateTime.slice(0, 10),
        time: formatTime(s.startDateTime),
      }
    })
    .filter((x): x is ScheduleItem => x !== null)
    .sort((a, b) => a.session.startDateTime.localeCompare(b.session.startDateTime))

export const upcomingSessions = (limit = 6): ScheduleItem[] =>
  scheduleItems().slice(0, limit)

export const sessionsForMovie = (movieId: string): ScheduleItem[] =>
  scheduleItems().filter((x) => x.movie.id === movieId)
