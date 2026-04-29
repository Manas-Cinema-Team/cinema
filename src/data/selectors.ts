import type { ScheduleItem } from './types.ts'
import { halls, movies, sessions } from './mock-data'
import { formatTime } from './formatters'

// ── Поиск по id ───────────────────────────────────────────────────────────

export const findHall = (id: string | undefined) =>
  halls.find((h) => h.id === id)

export const findMovie = (id: string | string[] | undefined) => {
  const key = Array.isArray(id) ? id[0] : id
  return movies.find((m) => m.id === key)
}

export const findSession = (id: string | string[] | undefined) => {
  const key = Array.isArray(id) ? id[0] : id
  return sessions.find((s) => s.id === key)
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

export const sessionsForMovie = (movieId: string): ScheduleItem[] =>
  scheduleItems().filter((x) => x.movie.id === movieId)