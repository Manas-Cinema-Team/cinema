import type { Hall, Movie, Session, SeatMeta } from './types.ts'

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
      seats.push({ row, number: n, disabled: disabled.includes(`${row}${n}`) })
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
  buildHall('hall-1', 'Зал 1 · Большой',   ['A','B','C','D','E','F','G','H'], 12),
  buildHall('hall-2', 'Зал 2 · Комфорт',   ['A','B','C','D','E','F'], 10),
  buildHall('hall-3', 'Зал 3 · Камерный',  ['A','B','C','D'], 8),
]

// ── Фильмы ───────────────────────────────────────────────────────────────

export const movies: Movie[] = [
  {
    id: 'midnight-arc',
    title: 'Полуночная дуга',
    description:
      'История о дирижёре, который возвращается в город после долгого молчания и находит старый кинотеатр, где каждый вечер идёт один и тот же загадочный фильм.',
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
      'Ночной поезд прибывает на платформу, которой нет на карте. Пять пассажиров получают шанс изменить одну сцену из своего прошлого.',
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
      'Пианистка и оператор встречаются на ночной съёмке, где город становится декорацией для фильма, который ещё никто не написал.',
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
      'Криптограф в подмосковном НИИ ловит в радиоэфире сигнал, которого не должно существовать.',
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
      'Анимационная сказка о девочке, которая сшивает из обрывков писем фонарь.',
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
      'В городе, разделённом на два сектора, обычный курьер случайно находит карту, которая открывает все двери.',
    genre: ['боевик', 'триллер'],
    duration: 118,
    ageRating: '18+',
    posterUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=800&q=85',
    releaseDate: '2026-04-20',
    isActive: true,
  },
]

// ── Сеансы ───────────────────────────────────────────────────────────────

export const TODAY = '2026-04-19'

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
  buildSession('ses-101', 'midnight-arc',   'hall-1', TODAY,        '12:00', 128, 450),
  buildSession('ses-102', 'golden-station', 'hall-2', TODAY,        '14:30', 114, 400),
  buildSession('ses-103', 'velvet-sky',     'hall-2', TODAY,        '17:00', 121, 400),
  buildSession('ses-104', 'midnight-arc',   'hall-1', TODAY,        '19:30', 128, 500),
  buildSession('ses-105', 'silent-code',    'hall-3', TODAY,        '21:00', 135, 550),
  buildSession('ses-106', 'paper-lantern',  'hall-2', TODAY,        '10:30',  96, 350),
  // 20 апреля
  buildSession('ses-201', 'red-line',       'hall-1', '2026-04-20', '13:00', 118, 450),
  buildSession('ses-202', 'golden-station', 'hall-2', '2026-04-20', '15:30', 114, 400),
  buildSession('ses-203', 'midnight-arc',   'hall-1', '2026-04-20', '18:00', 128, 500),
  buildSession('ses-204', 'silent-code',    'hall-3', '2026-04-20', '20:30', 135, 550),
  // 21 апреля
  buildSession('ses-301', 'velvet-sky',     'hall-1', '2026-04-21', '14:00', 121, 450),
  buildSession('ses-302', 'paper-lantern',  'hall-2', '2026-04-21', '11:00',  96, 350),
  buildSession('ses-303', 'red-line',       'hall-1', '2026-04-21', '21:00', 118, 500),
]