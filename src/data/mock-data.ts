import type { Hall, Movie, Session } from './types.ts'

// Deprecated mock dataset. The app now uses the real backend API.
// Keep typed placeholders so legacy helper modules still compile.
export const halls: Hall[] = []
export const movies: Movie[] = []
export const sessions: Session[] = []
export const TODAY = new Date().toISOString().slice(0, 10)
