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
import { BookingStatus } from '../types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EVENT_TYPES: EventType[] = [
  {
    id: 'evt-001',
    name: 'Встреча 15 минут',
    description: 'Короткий звонок для быстрого знакомства или обсуждения одного вопроса.',
    durationMinutes: 15,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'evt-002',
    name: 'Встреча 30 минут',
    description: 'Полноценная встреча для детального обсуждения проекта или задачи.',
    durationMinutes: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

const MOCK_OWNER: Owner = {
  id: 'owner-001',
  name: 'Владелец',
  email: 'owner@calendar.app',
  timezone: 'Europe/Moscow',
  workingHours: {
    monday:    { enabled: true,  startTime: '09:00', endTime: '18:00' },
    tuesday:   { enabled: true,  startTime: '09:00', endTime: '18:00' },
    wednesday: { enabled: true,  startTime: '09:00', endTime: '18:00' },
    thursday:  { enabled: true,  startTime: '09:00', endTime: '18:00' },
    friday:    { enabled: true,  startTime: '09:00', endTime: '18:00' },
    saturday:  { enabled: false, startTime: '09:00', endTime: '18:00' },
    sunday:    { enabled: false, startTime: '09:00', endTime: '18:00' },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlotsForDate(date: string, durationMinutes: number): TimeSlot[] {
  const slots: TimeSlot[] = []
  const d = new Date(date)
  const dayOfWeek = d.getDay()

  if (dayOfWeek === 0 || dayOfWeek === 6) return slots

  let current = new Date(d)
  current.setHours(9, 0, 0, 0)
  const dayEnd = new Date(d)
  dayEnd.setHours(18, 0, 0, 0)

  while (current < dayEnd) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60_000)
    if (slotEnd > dayEnd) break
    slots.push({
      startTime: current.toISOString(),
      endTime: slotEnd.toISOString(),
      available: true,
    })
    current = new Date(current.getTime() + durationMinutes * 60_000)
  }

  return slots
}

function getDaysInMonth(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const days: string[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return days
}

// ─── API functions ────────────────────────────────────────────────────────────

const BASE_URL = '/api/v1'

async function tryFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

export async function getEventTypes(): Promise<EventType[]> {
  return tryFetch<EventType[]>(`${BASE_URL}/event-types`, MOCK_EVENT_TYPES)
}

export async function getOwnerProfile(): Promise<Owner> {
  return tryFetch<Owner>(`${BASE_URL}/owner/profile`, MOCK_OWNER)
}

export async function getAvailableSlots(
  eventTypeId: string,
  date: string,
  durationMinutes?: number,
): Promise<TimeSlot[]> {
  const duration = durationMinutes ?? MOCK_EVENT_TYPES.find((e) => e.id === eventTypeId)?.durationMinutes ?? 30
  return tryFetch<TimeSlot[]>(
    `${BASE_URL}/available-slots?eventTypeId=${eventTypeId}&date=${date}`,
    generateSlotsForDate(date, duration),
  )
}

export async function getAvailableSlotsSummary(
  eventTypeId: string,
  month: string,
  durationMinutes?: number,
): Promise<DayAvailability[]> {
  const duration = durationMinutes ?? MOCK_EVENT_TYPES.find((e) => e.id === eventTypeId)?.durationMinutes ?? 30

  const mockSummary: DayAvailability[] = getDaysInMonth(month).map((date) => {
    const slots = generateSlotsForDate(date, duration)
    return { date, availableCount: slots.length }
  })

  return tryFetch<DayAvailability[]>(
    `${BASE_URL}/available-slots/summary?eventTypeId=${eventTypeId}&month=${month}`,
    mockSummary,
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
    const message = body?.error?.message ?? `Ошибка ${res.status}`
    throw new Error(message)
  }
  return res.json() as Promise<Booking>
}

export async function getUpcomingBookings(limit = 100, offset = 0): Promise<PaginatedBookings> {
  return tryFetch<PaginatedBookings>(
    `${BASE_URL}/owner/bookings/upcoming?limit=${limit}&offset=${offset}`,
    { items: [], total: 0, limit, offset },
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
    const message = body?.error?.message ?? `Ошибка ${res.status}`
    throw new Error(message)
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
    const message = body?.error?.message ?? `Ошибка ${res.status}`
    throw new Error(message)
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
