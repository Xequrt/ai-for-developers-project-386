import { useState } from 'react'
import {
  Button, Card, Divider, Group, Loader,
  Stack, Text, TextInput, Textarea,
} from '@mantine/core'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createBooking } from '../api/client'
import type { EventType, TimeSlot } from '../types'

interface LocationState {
  eventType: EventType
  slot: TimeSlot
}

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}
const pageTransition = { duration: 0.3, ease: 'easeInOut' as const }

function formatSlot(slot: TimeSlot): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(slot.startTime).toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  return `${date}, ${fmt(slot.startTime)} – ${fmt(slot.endTime)}`
}

export function ConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!state?.eventType || !state?.slot) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack align="center" gap="md">
          <Text style={{ color: '#8E8E93' }}>Слот не выбран.</Text>
          <Button color="orange" onClick={() => navigate('/book')}>Выбрать событие</Button>
        </Stack>
      </div>
    )
  }

  const { eventType, slot } = state

  if (success) {
    return (
      <motion.div
        variants={pageVariants} initial="initial" animate="animate" exit="exit"
        transition={pageTransition}
        style={{ minHeight: 'calc(100vh - 56px)', background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}
      >
        <Card padding="xl" radius="lg" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <Stack gap="lg" align="center">
            <Text style={{ fontSize: 48 }}>✅</Text>
            <Text fw={700} style={{ fontSize: 22, color: '#1C1C1E' }}>Бронирование подтверждено</Text>
            <Text size="sm" style={{ color: '#6C6C70' }}>{formatSlot(slot)}</Text>
            <Text size="sm" style={{ color: '#6C6C70' }}>{eventType.name} · {eventType.durationMinutes} мин</Text>
            <Button color="orange" onClick={() => navigate('/')}>На главную</Button>
          </Stack>
        </Card>
      </motion.div>
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Введите имя'); return }
    if (!email.trim() || !email.includes('@')) { setError('Введите корректный email'); return }
    setError(null)
    setLoading(true)
    try {
      await createBooking({
        eventTypeId: eventType.id,
        startTime: slot.startTime,
        guestName: name.trim(),
        guestEmail: email.trim(),
        notes: notes.trim() || undefined,
      })
      setSuccess(true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка при бронировании'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      transition={pageTransition}
      style={{ minHeight: 'calc(100vh - 56px)', background: '#F5F5F7', padding: '40px 24px' }}
    >
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <Stack gap="lg">
          <Text fw={700} style={{ fontSize: 24, color: '#1C1C1E', letterSpacing: '-0.5px' }}>
            Подтверждение бронирования
          </Text>

          {/* Slot summary */}
          <Card padding="lg" radius="md" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Stack gap="xs">
              <Text fw={600} size="sm" style={{ color: '#1C1C1E' }}>{eventType.name}</Text>
              <Text size="sm" style={{ color: '#6C6C70' }}>{formatSlot(slot)}</Text>
              <Text size="xs" style={{ color: '#FF6B35' }}>{eventType.durationMinutes} мин</Text>
            </Stack>
          </Card>

          <Divider />

          {/* Form */}
          <Card padding="lg" radius="md" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Stack gap="md">
              <TextInput
                label="Имя"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
                radius="md"
              />
              <TextInput
                label="Email"
                placeholder="ivan@example.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                radius="md"
              />
              <Textarea
                label="Заметки (необязательно)"
                placeholder="Тема встречи, вопросы..."
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
                radius="md"
                rows={3}
              />
              {error && (
                <Text size="sm" style={{ color: '#FF3B30' }}>{error}</Text>
              )}
            </Stack>
          </Card>

          <Group gap="sm">
            <Button
              variant="default" radius="md" style={{ flex: 1 }}
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Назад
            </Button>
            <Button
              color="orange" radius="md" style={{ flex: 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader size="xs" color="white" /> : 'Забронировать'}
            </Button>
          </Group>
        </Stack>
      </div>
    </motion.div>
  )
}
