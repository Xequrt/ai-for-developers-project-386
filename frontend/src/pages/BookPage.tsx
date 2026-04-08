import { useEffect, useState } from 'react'
import {
  Avatar,
  Badge,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { getEventTypes, getOwnerProfile } from '../api/client'
import type { EventType, Owner } from '../types'

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}
const pageTransition = { duration: 0.3, ease: 'easeInOut' as const }

const cardHover = {
  scale: 1.02,
  boxShadow: '0 4px 12px rgba(0,122,255,0.15)',
  transition: { type: 'spring', stiffness: 300, damping: 20 },
}

export function BookPage() {
  const navigate = useNavigate()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEventTypes(), getOwnerProfile()]).then(([types, ownerData]) => {
      setEventTypes(types)
      setOwner(ownerData)
      setLoading(false)
    })
  }, [])

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
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Stack gap="xl">
          {/* Owner profile header */}
          {owner && (
            <Card padding="lg" radius="md" style={{ background: '#FFFFFF' }}>
              <Group gap="md">
                <Avatar
                  size={56}
                  radius="xl"
                  color="orange"
                  style={{ fontWeight: 700, fontSize: 22 }}
                >
                  {owner.name.charAt(0).toUpperCase()}
                </Avatar>
                <Stack gap={2}>
                  <Text fw={700} size="lg" style={{ color: '#1C1C1E' }}>
                    {owner.name}
                  </Text>
                  <Text size="sm" style={{ color: '#6C6C70' }}>
                    Host
                  </Text>
                </Stack>
              </Group>
            </Card>
          )}

          {/* Title */}
          <Stack gap="xs">
            <Text
              fw={700}
              style={{
                fontSize: 28,
                color: '#1C1C1E',
                letterSpacing: '-0.5px',
              }}
            >
              Выберите тип события
            </Text>
            <Text size="sm" style={{ color: '#6C6C70' }}>
              Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
            </Text>
          </Stack>

          {/* Event type cards grid */}
          <SimpleGrid cols={2} spacing="md">
            {eventTypes.map((et) => (
              <motion.div
                key={et.id}
                whileHover={cardHover}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/book/${et.id}`)}
              >
                <Card
                  padding="lg"
                  radius="md"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.06)',
                    height: '100%',
                  }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start">
                      <Text
                        fw={600}
                        size="md"
                        style={{ color: '#1C1C1E', flex: 1, paddingRight: 8 }}
                      >
                        {et.name}
                      </Text>
                      <Badge
                        size="sm"
                        variant="filled"
                        color="orange"
                        style={{ flexShrink: 0 }}
                      >
                        {et.durationMinutes} мин
                      </Badge>
                    </Group>
                    <Text size="sm" style={{ color: '#6C6C70', lineHeight: 1.5 }}>
                      {et.description}
                    </Text>
                  </Stack>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </Stack>
      </div>
    </motion.div>
  )
}
