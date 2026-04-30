import { apiJson, absoluteAssetUrl, ApiError } from './client'
import { authorizedApiJson, optionalAuthorizedApiJson } from '@/stores/auth'
import { t } from '@/stores/i18n'
import type {
  Booking,
  BookingSeat,
  Hall,
  HallRow,
  HallSchema,
  Movie,
  ScheduleItem,
  SeatCoordinate,
  SeatMapData,
  SeatState,
  Session,
} from '@/data/types'

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface BackendMovie {
  id: number
  title: string
  description: string
  genre: string
  duration: number
  age_rating: string
  poster_url: string
  release_date: string
  is_active: boolean
  sessions?: BackendSession[]
}

interface BackendSessionMovie {
  id: number
  title: string
  poster_url: string
  duration: number
  age_rating: string
}

interface BackendSessionHall {
  id: number
  name: string
  rows: number
  seats_per_row: number
}

interface BackendMoney {
  amount: number
  currency: string
}

interface BackendSession {
  id: number
  movie: BackendSessionMovie
  hall: BackendSessionHall
  start_datetime: string
  end_datetime: string
  price: BackendMoney | null
  is_active: boolean
  available_seats: number
}

interface BackendSchemaSeat {
  row: number
  number: number
  type: string
}

interface BackendSchemaRow {
  row: number
  seats: Array<{
    number: number
    type: string
  }>
}

interface BackendSeat {
  row: number
  number: number
  type: string
  status: SeatState['status']
  held_by_me: boolean
  expires_at: string | null
  price: BackendMoney | null
}

interface BackendSeatMap {
  hall_id: number
  hall_name: string
  schema: {
    rows: BackendSchemaRow[]
    seats: BackendSchemaSeat[]
    disabled_seats: SeatCoordinate[]
  }
  seats: BackendSeat[]
  polling_interval: number
  server_time: string
  available_seats: number
}

interface BackendBookingSeat {
  row: number
  number: number
  type: string
  price_at_booking: number
}

interface BackendBooking {
  id: number
  session: {
    id: number
    movie: {
      title: string
    }
    hall: {
      name: string
    }
    start_datetime: string
  }
  seats: BackendBookingSeat[]
  total_amount: number
  currency: string
  booking_status: Booking['bookingStatus']
  payment_status: Booking['paymentStatus']
  expires_at: string | null
  server_time: string
  confirmed_at: string | null
  created_at: string
}

const normalizeSeatSet = (seats: Array<SeatCoordinate | BookingSeat>) =>
  [...seats]
    .map((seat) => `${seat.row}:${seat.number}`)
    .sort()

const sameSeatSet = (left: Array<SeatCoordinate | BookingSeat>, right: Array<SeatCoordinate | BookingSeat>) => {
  const normalizedLeft = normalizeSeatSet(left)
  const normalizedRight = normalizeSeatSet(right)

  if (normalizedLeft.length !== normalizedRight.length) {
    return false
  }

  return normalizedLeft.every((value, index) => value === normalizedRight[index])
}

const GENRE_LABELS: Record<string, string> = {
  action: 'Action',
  comedy: 'Comedy',
  drama: 'Drama',
  fantasy: 'Fantasy',
  horror: 'Horror',
  sci_fi: 'Sci-Fi',
  thriller: 'Thriller',
  animation: 'Animation',
}

const mapGenre = (genre: string) => GENRE_LABELS[genre] || genre.replace(/_/g, ' ')

const mapMovie = (movie: BackendMovie): Movie => ({
  id: movie.id,
  title: movie.title,
  description: movie.description,
  genre: [mapGenre(movie.genre)],
  duration: movie.duration,
  ageRating: movie.age_rating,
  posterUrl: absoluteAssetUrl(movie.poster_url),
  releaseDate: movie.release_date,
  isActive: movie.is_active,
})

const mapHall = (hall: BackendSessionHall, schema?: HallSchema): Hall => ({
  id: hall.id,
  name: hall.name,
  rows: hall.rows,
  seatsPerRow: hall.seats_per_row,
  schema,
})

const mapSession = (session: BackendSession): ScheduleItem => {
  const movie: Movie = {
    id: session.movie.id,
    title: session.movie.title,
    description: '',
    genre: [],
    duration: session.movie.duration,
    ageRating: session.movie.age_rating,
    posterUrl: absoluteAssetUrl(session.movie.poster_url),
    releaseDate: '',
    isActive: session.is_active,
  }

  const hall = mapHall(session.hall)

  const mappedSession: Session = {
    id: session.id,
    movieId: movie.id,
    hallId: hall.id,
    startDateTime: session.start_datetime,
    endDateTime: session.end_datetime,
    isActive: session.is_active,
    price: session.price ? Number(session.price.amount) : 0,
    currency: session.price?.currency || 'KGS',
    availableSeats: session.available_seats,
  }

  return {
    session: mappedSession,
    movie,
    hall,
    date: mappedSession.startDateTime.slice(0, 10),
    time: mappedSession.startDateTime.slice(11, 16),
  }
}

const mapSeatMap = (payload: BackendSeatMap): SeatMapData => {
  const schema: HallSchema = {
    rows: payload.schema.rows.map(
      (row): HallRow => ({
        row: row.row,
        seats: row.seats.map((seat) => ({
          number: seat.number,
          type: seat.type,
        })),
      }),
    ),
    seats: payload.schema.seats.map((seat) => ({
      row: seat.row,
      number: seat.number,
      type: seat.type,
      disabled: payload.schema.disabled_seats.some(
        (disabledSeat) => disabledSeat.row === seat.row && disabledSeat.number === seat.number,
      ),
    })),
    disabledSeats: payload.schema.disabled_seats,
  }

  return {
    hallId: payload.hall_id,
    hallName: payload.hall_name,
    schema,
    seats: payload.seats.map((seat) => ({
      row: seat.row,
      number: seat.number,
      type: seat.type,
      status: seat.status,
      heldByMe: seat.held_by_me,
      expiresAt: seat.expires_at,
      price: seat.price ? Number(seat.price.amount) : null,
      currency: seat.price?.currency || null,
    })),
    pollingInterval: payload.polling_interval,
    serverTime: payload.server_time,
    availableSeats: payload.available_seats,
  }
}

const mapBookingSeat = (seat: BackendBookingSeat): BookingSeat => ({
  row: seat.row,
  number: seat.number,
  type: seat.type,
  priceAtBooking: Number(seat.price_at_booking),
})

const mapBooking = (booking: BackendBooking): Booking => ({
  id: booking.id,
  sessionId: booking.session.id,
  movieTitle: booking.session.movie.title,
  hallName: booking.session.hall.name,
  startDateTime: booking.session.start_datetime,
  seats: booking.seats.map(mapBookingSeat),
  totalAmount: Number(booking.total_amount),
  currency: booking.currency,
  bookingStatus: booking.booking_status,
  paymentStatus: booking.payment_status,
  expiresAt: booking.expires_at,
  serverTime: booking.server_time,
  confirmedAt: booking.confirmed_at,
  createdAt: booking.created_at,
})

export const getApiErrorMessage = (error: unknown, fallback = t('auth.requestFailed')) => {
  if (error instanceof ApiError) {
    return error.message || fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const isApiError = (error: unknown, code: string) => {
  return error instanceof ApiError && error.code === code
}

export async function fetchMovies() {
  const response = await apiJson<PaginatedResponse<BackendMovie>>('/movies/?page=1&page_size=100')
  return response.results.map(mapMovie)
}

export async function fetchMovieDetail(movieId: number) {
  const payload = await apiJson<BackendMovie>(`/movies/${movieId}/`)
  const movie = mapMovie(payload)
  const sessions = (payload.sessions || []).map(mapSession).map((item) => ({
    ...item,
    movie: {
      ...movie,
      duration: item.movie.duration,
      ageRating: item.movie.ageRating,
      posterUrl: item.movie.posterUrl,
    },
  }))

  return {
    movie,
    sessions,
  }
}

export async function fetchSessions(params: { date?: string; movieId?: number; hallId?: number } = {}) {
  const query = new URLSearchParams({
    page: '1',
    page_size: '100',
  })

  if (params.date) query.set('date', params.date)
  if (params.movieId) query.set('movie_id', String(params.movieId))
  if (params.hallId) query.set('hall_id', String(params.hallId))

  const response = await apiJson<PaginatedResponse<BackendSession>>(`/sessions/?${query.toString()}`)
  return response.results.map(mapSession)
}

export async function fetchSessionDetail(sessionId: number) {
  const payload = await apiJson<BackendSession>(`/sessions/${sessionId}/`)
  return mapSession(payload)
}

export async function fetchSeatMap(sessionId: number) {
  const payload = await optionalAuthorizedApiJson<BackendSeatMap>(`/sessions/${sessionId}/seats/`)
  return mapSeatMap(payload)
}

export async function createBookingHold(sessionId: number, seats: SeatCoordinate[]) {
  const payload = await authorizedApiJson<BackendBooking>('/bookings/', {
    method: 'POST',
    body: {
      session_id: sessionId,
      seats,
    },
  })

  return mapBooking(payload)
}

export async function fetchBooking(bookingId: number) {
  const payload = await authorizedApiJson<BackendBooking>(`/bookings/${bookingId}/`)
  return mapBooking(payload)
}

export async function createOrReuseBookingHold(sessionId: number, seats: SeatCoordinate[]) {
  try {
    return await createBookingHold(sessionId, seats)
  } catch (error) {
    if (error instanceof ApiError && error.code === 'ACTIVE_HOLD_EXISTS') {
      const bookingId = Number((error.details as { booking_id?: number } | undefined)?.booking_id)
      if (bookingId > 0) {
        const existingBooking = await fetchBooking(bookingId)

        if (sameSeatSet(existingBooking.seats, seats)) {
          return existingBooking
        }

        await cancelBooking(existingBooking.id)
        return createBookingHold(sessionId, seats)
      }
    }

    throw error
  }
}

export async function confirmBooking(bookingId: number) {
  const payload = await authorizedApiJson<BackendBooking>(`/bookings/${bookingId}/confirm/`, {
    method: 'POST',
    body: { payment_mock: true },
  })

  return mapBooking(payload)
}

export async function cancelBooking(bookingId: number) {
  return authorizedApiJson<{ message: string }>(`/bookings/${bookingId}/`, {
    method: 'DELETE',
  })
}
