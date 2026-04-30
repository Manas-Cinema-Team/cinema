export type SeatStatus = 'available' | 'held' | 'booked' | 'disabled'

export interface SeatCoordinate {
  row: number
  number: number
}

export interface HallSeatMeta extends SeatCoordinate {
  type: string
  disabled?: boolean
}

export interface HallRow {
  row: number
  seats: Array<{
    number: number
    type: string
  }>
}

export interface HallSchema {
  rows: HallRow[]
  seats: HallSeatMeta[]
  disabledSeats: SeatCoordinate[]
}

export interface Hall {
  id: number
  name: string
  rows: number
  seatsPerRow: number
  schema?: HallSchema
}

export interface Movie {
  id: number
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
  id: number
  movieId: number
  hallId: number
  startDateTime: string
  endDateTime: string
  isActive: boolean
  price: number
  currency: string
  availableSeats: number
}

export interface ScheduleItem {
  session: Session
  movie: Movie
  hall: Hall
  date: string
  time: string
}

export interface SeatState extends SeatCoordinate {
  type: string
  status: SeatStatus
  heldByMe: boolean
  expiresAt: string | null
  price: number | null
  currency: string | null
}

export interface SeatMapData {
  hallId: number
  hallName: string
  schema: HallSchema
  seats: SeatState[]
  pollingInterval: number
  serverTime: string
  availableSeats: number
}

export interface BookingSeat extends SeatCoordinate {
  type: string
  priceAtBooking: number
}

export interface Booking {
  id: number
  sessionId: number
  movieTitle: string
  hallName: string
  startDateTime: string
  seats: BookingSeat[]
  totalAmount: number
  currency: string
  bookingStatus: 'draft' | 'confirmed' | 'cancelled' | 'expired'
  paymentStatus: 'pending' | 'paid' | 'cancelled' | 'failed'
  expiresAt: string | null
  serverTime: string
  confirmedAt: string | null
  createdAt: string
}
