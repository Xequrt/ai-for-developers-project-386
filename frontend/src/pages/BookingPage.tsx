import { useEffect, useState } from 'react'
import { Card, Loader, Stack, Text } from '@mantine/core'
import { motion } from 'motion/react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getAvailableSlots,
  getAvailableSlotsSummary,
  getEventTypes,
  getOwnerProfile,
} from '../api/client'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { SlotPanel } from '../components/calendar/SlotPanel'
import { EventDetails } from '../components/booking/EventDetails'
import type { DayAvailability, EventType, Owner, TimeSlot } from '../types'

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}
const pageTransition = { duration: 0.3, ease: 'easeInOut' as const }

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth)
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  // Load event type and owner
  useEffect(() => {
    if (!eventTypeId) return
    Promise.all([getEventTypes(), getOwnerProfile()]).then(([types, ownerData]) => {
      const et = types.find((t) => t.id === eventTypeId) ?? null
      setEventType(et)
      setOwner(ownerData)
      setLoading(false)
    })
  }, [eventTypeId])

  // Load availability summary when month changes
  useEffect(() => {
    if (!eventTypeId || !eventType) return
    setAvailabilityLoading(true)
    getAvailableSlotsSummary(eventTypeId, currentMonth, eventType.durationMinutes).then((data) => {
      setAvailability(data)
      setAvailabilityLoading(false)
    })
  }, [eventTypeId, currentMonth, eventType])

  // Load slots when date is selected
  useEffect(() => {
    if (!eventTypeId || !selectedDate || !eventType) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    getAvailableSlots(eventTypeId, selectedDate, eventType.durationMinutes).then((data) => {
      setSlots(data)
      setSlotsLoading(false)
    })
  }, [eventTypeId, selectedDate, eventType])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month)
    setSelectedDate(null)
    setSelectedSlot(null)
    setSlots([])
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 56px)',
          background: '#F5F5F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader color="orange" size="lg" />
      </div>
    )
  }

  if (!eventType) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 56px)',
          background: '#F5F5F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#8E8E93' }}>Тип события не найден.</Text>
      </div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{
        minHeight: 'calc(100vh - 56px)',
        background: '#F5F5F7',
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Stack gap="lg">
          {/* Page title */}
          <Text
            fw={700}
            style={{
              fontSize: 24,
              color: '#1C1C1E',
              letterSpacing: '-0.5px',
            }}
          >
            {eventType.name}
          </Text>

          {/* Three-column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr 280px',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {/* Left — Event details */}
            <Card
              padding="lg"
              radius="md"
              style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <EventDetails
                eventType={eventType}
                owner={owner}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
              />
            </Card>

            {/* Center — Calendar */}
            <Card
              padding="lg"
              radius="md"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.06)',
                opacity: availabilityLoading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <CalendarGrid
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                availability={availability}
                onMonthChange={handleMonthChange}
                onDateSelect={handleDateSelect}
              />
            </Card>

            {/* Right — Slot panel */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                height: 560,
                display: 'flex',
                flexDirection: 'column',
                padding: 16,
              }}
            >
              <SlotPanel
                slots={slots}
                selectedSlot={selectedSlot}
                loading={slotsLoading}
                selectedDate={selectedDate}
                onSlotSelect={setSelectedSlot}
                onBack={() => navigate('/book')}
                onContinue={() => {
                  if (selectedSlot && eventType) {
                    navigate('/confirm', {
                      state: { eventType, slot: selectedSlot },
                    })
                  }
                }}
              />
            </div>
          </div>
        </Stack>
      </div>
    </motion.div>
  )
}
