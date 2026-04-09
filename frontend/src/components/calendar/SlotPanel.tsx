import { Button, Group, Loader, ScrollArea, Stack, Text } from '@mantine/core'
import { motion } from 'motion/react'
import type { TimeSlot } from '../../types'

interface SlotPanelProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  loading: boolean
  selectedDate: string | null
  onSlotSelect: (slot: TimeSlot) => void
  onBack: () => void
  onContinue: () => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function SlotPanel({
  slots,
  selectedSlot,
  loading,
  selectedDate,
  onSlotSelect,
  onBack,
  onContinue,
}: SlotPanelProps) {
  return (
    <Stack gap="md" style={{ height: '100%' }}>
      <Text fw={700} size="lg" style={{ color: '#1C1C1E', letterSpacing: '-0.3px' }}>
        Статус слотов
      </Text>

      {!selectedDate && (
        <Text size="sm" style={{ color: '#8E8E93' }}>
          Выберите дату в календаре, чтобы увидеть доступные слоты.
        </Text>
      )}

      {selectedDate && loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Loader color="orange" size="sm" />
        </div>
      )}

      {selectedDate && !loading && slots.length === 0 && (
        <Text size="sm" style={{ color: '#8E8E93' }}>
          На выбранную дату нет доступных слотов.
        </Text>
      )}

      {selectedDate && !loading && slots.length > 0 && (
        <ScrollArea style={{ flex: 1, overflow: 'hidden' }} offsetScrollbars>
          <Stack gap={6} style={{ padding: '2px 4px' }}>
            {slots.map((slot) => {
              const isSelected =
                selectedSlot?.startTime === slot.startTime
              const label = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`

              return (
                <motion.button
                  key={slot.startTime}
                  whileHover={
                    slot.available
                      ? {
                          scale: 1.02,
                          boxShadow: '0 4px 12px rgba(0,122,255,0.15)',
                          transition: { type: 'spring', stiffness: 300, damping: 20 },
                        }
                      : {}
                  }
                  onClick={() => slot.available && onSlotSelect(slot)}
                  disabled={!slot.available}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 44,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: isSelected
                      ? '2px solid #FF6B35'
                      : '2px solid transparent',
                    background: isSelected
                      ? 'rgba(255,107,53,0.08)'
                      : slot.available
                      ? '#FFFFFF'
                      : '#F2F2F7',
                    cursor: slot.available ? 'pointer' : 'default',
                    width: '100%',
                    boxShadow: slot.available && !isSelected
                      ? '0 1px 3px rgba(0,0,0,0.06)'
                      : 'none',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  aria-label={`${label} — ${slot.available ? 'Свободно' : 'Занято'}`}
                  aria-pressed={isSelected}
                >
                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      color: slot.available ? '#1C1C1E' : '#8E8E93',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {label}
                  </Text>
                  <Text
                    size="xs"
                    fw={600}
                    style={{
                      color: slot.available
                        ? isSelected
                          ? '#FF6B35'
                          : '#34C759'
                        : '#8E8E93',
                    }}
                  >
                    {slot.available ? 'Свободно' : 'Занято'}
                  </Text>
                </motion.button>
              )
            })}
          </Stack>
        </ScrollArea>
      )}

      {/* Action buttons */}
      <Group gap="sm" mt="auto">
        <Button
          variant="default"
          onClick={onBack}
          style={{ flex: 1 }}
          radius="md"
        >
          Назад
        </Button>
        <Button
          color="orange"
          onClick={onContinue}
          disabled={!selectedSlot}
          style={{ flex: 1 }}
          radius="md"
        >
          Продолжить
        </Button>
      </Group>
    </Stack>
  )
}
