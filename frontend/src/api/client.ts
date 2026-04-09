import type {
  EventType,
  Owner,
  TimeSlot,
  DayAvailability,
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  PaginatedBookings,
} from '../types'

const BASE_URL = '/api/v1'

async function tryFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}

export async function getEventTypes(): Promise<EventType[]> {
  return tryFetch<EventType[]>(`${BASE_URL}/event-types`)
}

export async function getOwnerProfile(): Promise<Owner> {
  return tryFetch<Owner>(`${BASE_URL}/owner/profile`)
}

export async function getAvailableSlots(
  eventTypeId: string,
  date: string,
  _durationMinutes?: number,
): Promise<TimeSlot[]> {
  return tryFetch<TimeSlot[]>(
    `${BASE_URL}/available-slots?eventTypeId=${eventTypeId}&date=${date}`,
  )
}

export async function getAvailableSlotsSummary(
  eventTypeId: string,
  month: string,
  _durationMinutes?: number,
): Promise<DayAvailability[]> {
  return tryFetch<DayAvailability[]>(
    `${BASE_URL}/available-slots/summary?eventTypeId=${eventTypeId}&month=${month}`,
  )
}

export async function createBooking(request: CreateBookingRequest): Promise<Booking> {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Ошибка ${res.status}`)
  }
  return res.json() as Promise<Booking>
}

export async function getUpcomingBookings(limit = 100, offset = 0): Promise<PaginatedBookings> {
  return tryFetch<PaginatedBookings>(
    `${BASE_URL}/owner/bookings/upcoming?limit=${limit}&offset=${offset}`,
  )
}

export async function createEventType(request: CreateEventTypeRequest): Promise<EventType> {
  const res = await fetch(`${BASE_URL}/owner/event-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Ошибка ${res.status}`)
  }
  return res.json() as Promise<EventType>
}

export async function updateEventType(id: string, request: UpdateEventTypeRequest): Promise<EventType> {
  const res = await fetch(`${BASE_URL}/owner/event-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Ошибка ${res.status}`)
  }
  return res.json() as Promise<EventType>
}

export async function deleteEventType(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/owner/event-types/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Ошибка ${res.status}`)
  }
}
