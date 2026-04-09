import { Avatar, Badge, Divider, Group, Stack, Text } from '@mantine/core'
import { motion, AnimatePresence } from 'motion/react'
import type { EventType, Owner, TimeSlot } from '../../types'

interface EventDetailsProps {
  eventType: EventType
  owner: Owner | null
  selectedDate: string | null
  selectedSlot: TimeSlot | null
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function EventDetails({
  eventType,
  owner,
  selectedDate,
  selectedSlot,
}: EventDetailsProps) {
  const timeLabel = selectedSlot
    ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}`
    : null

  return (
    <Stack gap="lg">
      {/* Owner */}
      {owner && (
        <Group gap="sm">
          <Avatar size={40} radius="xl" color="orange">
            {owner.name.charAt(0).toUpperCase()}
          </Avatar>
          <Stack gap={0}>
            <Text fw={600} size="sm" style={{ color: '#1C1C1E' }}>
              {owner.name}
            </Text>
            <Text size="xs" style={{ color: '#8E8E93' }}>
              Host
            </Text>
          </Stack>
        </Group>
      )}

      <Divider />

      {/* Event type info */}
      <Stack gap="xs">
        <Group gap="xs" align="center">
          <Text fw={700} size="lg" style={{ color: '#1C1C1E', letterSpacing: '-0.3px' }}>
            {eventType.name}
          </Text>
          <Badge size="sm" variant="filled" color="orange">
            {eventType.durationMinutes} мин
          </Badge>
        </Group>
        <Text size="sm" style={{ color: '#6C6C70', lineHeight: 1.6 }}>
          {eventType.description}
        </Text>
      </Stack>

      <Divider />

      {/* Selected date */}
      <Stack gap="xs">
        <Text size="xs" fw={600} style={{ color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Выбранная дата
        </Text>
        <AnimatePresence mode="wait">
          {selectedDate ? (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Text
                size="sm"
                fw={500}
                style={{
                  color: '#1C1C1E',
                  background: 'rgba(255,107,53,0.08)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,107,53,0.2)',
                }}
              >
                {formatDate(selectedDate)}
              </Text>
            </motion.div>
          ) : (
            <motion.div
              key="empty-date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Text
                size="sm"
                style={{
                  color: '#C7C7CC',
                  background: '#F2F2F7',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontStyle: 'italic',
                }}
              >
                Не выбрана
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>

      {/* Selected time */}
      <Stack gap="xs">
        <Text size="xs" fw={600} style={{ color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Выбранное время
        </Text>
        <AnimatePresence mode="wait">
          {timeLabel ? (
            <motion.div
              key={timeLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Text
                size="sm"
                fw={500}
                style={{
                  color: '#1C1C1E',
                  background: 'rgba(255,107,53,0.08)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,107,53,0.2)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {timeLabel}
              </Text>
            </motion.div>
          ) : (
            <motion.div
              key="empty-time"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Text
                size="sm"
                style={{
                  color: '#C7C7CC',
                  background: '#F2F2F7',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontStyle: 'italic',
                }}
              >
                Не выбрано
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </Stack>
  )
}
