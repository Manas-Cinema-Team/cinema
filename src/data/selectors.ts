import type { ScheduleItem } from './types.ts'
import { halls, movies, sessions } from './mock-data'
import { formatTime } from './formatters'

const normalizeNumericId = (id: number | string | string[] | undefined) => {
  const raw = Array.isArray(id) ? id[0] : id
  const parsed = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export const findHall = (id: number | string | undefined) => {
  const key = normalizeNumericId(id)
  return key === null ? undefined : halls.find((hall) => hall.id === key)
}

export const findMovie = (id: number | string | string[] | undefined) => {
  const key = normalizeNumericId(id)
  return key === null ? undefined : movies.find((movie) => movie.id === key)
}

export const findSession = (id: number | string | string[] | undefined) => {
  const key = normalizeNumericId(id)
  return key === null ? undefined : sessions.find((session) => session.id === key)
}

// ── Производные выборки ───────────────────────────────────────────────────

export const scheduleItems = (): ScheduleItem[] =>
  sessions
    .filter((s) => s.isActive)
    .map((s) => {
      const movie = findMovie(s.movieId)
      const hall  = findHall(s.hallId)
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

export const sessionsForMovie = (movieId: number): ScheduleItem[] =>
  scheduleItems().filter((x) => x.movie.id === movieId)
