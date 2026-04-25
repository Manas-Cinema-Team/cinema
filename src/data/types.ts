// ── Все типы проекта (Movie, Hall, Session и т.д.) ──────────────────────

export type SeatStatus = 'available' | 'held' | 'booked'

export interface SeatMeta {
  row: string
  number: number
  disabled?: boolean
}

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

export interface ScheduleItem {
  session: Session
  movie: Movie
  hall: Hall
  date: string
  time: string
}