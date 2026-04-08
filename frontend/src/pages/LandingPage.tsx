import { Badge, Button, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}
const pageTransition = { duration: 0.3, ease: 'easeInOut' as const }

const features = [
  {
    icon: '🤝',
    title: 'Встречи',
    desc: 'Выберите удобный формат и запишитесь на встречу.',
  },
  {
    icon: '⚡',
    title: 'Мгновенное бронирование',
    desc: 'Найдите свободный слот и подтвердите запись за несколько секунд.',
  },
  {
    icon: '📋',
    title: 'Без регистрации',
    desc: 'Просто выберите время и оставьте контакт — никаких аккаунтов.',
  },
]

// Логотип с сегодняшним числом — крупная версия для лендинга
function HeroCalendarIcon() {
  const today = new Date().getDate()
  const month = new Date().toLocaleString('ru-RU', { month: 'short' }).replace('.', '')

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="18" width="108" height="96" rx="18" fill="#FF6B35" />
      <rect x="6" y="18" width="108" height="34" rx="18" fill="#E85A20" />
      <rect x="6" y="38" width="108" height="14" fill="#E85A20" />
      <rect x="32" y="6" width="14" height="26" rx="7" fill="#C44A10" />
      <rect x="74" y="6" width="14" height="26" rx="7" fill="#C44A10" />
      {/* Месяц */}
      <text x="60" y="44" textAnchor="middle" fontSize="13" fontWeight="600" fill="rgba(255,255,255,0.75)"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        textTransform="uppercase">
        {month}
      </text>
      {/* Число */}
      <text x="60" y="98" textAnchor="middle" fontSize="52" fontWeight="700" fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif">
        {today}
      </text>
    </svg>
  )
}

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{
        minHeight: 'calc(100vh - 56px)',
        background: 'linear-gradient(135deg, #E8F0FF 0%, #FFE8E0 100%)',
        display: 'flex',
        alignItems: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            alignItems: 'center',
          }}
        >
          {/* Left — Hero */}
          <Stack gap="xl">
            <Badge
              size="sm"
              variant="filled"
              color="orange"
              style={{
                alignSelf: 'flex-start',
                letterSpacing: '0.08em',
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              БЫСТРАЯ ЗАПИСЬ НА ВСТРЕЧУ
            </Badge>

            <Stack gap="md">
              <Group gap="lg" align="center">
                <HeroCalendarIcon />
                <Text
                  style={{
                    fontSize: 64,
                    fontWeight: 700,
                    lineHeight: 1.05,
                    letterSpacing: '-2px',
                    color: '#1C1C1E',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  }}
                >
                  Calendar
                </Text>
              </Group>
              <Text
                size="xl"
                style={{ color: '#3C3C43', lineHeight: 1.5, maxWidth: 420 }}
              >
                Запишитесь на встречу в удобное время. Выберите формат, найдите свободный слот и подтвердите бронирование за несколько секунд.
              </Text>
            </Stack>

            <Button
              size="lg"
              color="orange"
              onClick={() => navigate('/book')}
              style={{ alignSelf: 'flex-start', fontWeight: 600 }}
              rightSection={<span>→</span>}
            >
              Записаться
            </Button>
          </Stack>

          {/* Right — Features card */}
          <Card
            padding="xl"
            radius="lg"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            <Stack gap="lg">
              <Text fw={700} size="xl" style={{ color: '#1C1C1E', letterSpacing: '-0.3px' }}>
                Как это работает
              </Text>

              {features.map((f) => (
                <Group key={f.title} gap="md" align="flex-start">
                  <ThemeIcon size={40} radius="md" variant="light" color="orange" style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: 18 }}>{f.icon}</span>
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fw={600} size="sm" style={{ color: '#1C1C1E' }}>{f.title}</Text>
                    <Text size="sm" style={{ color: '#6C6C70' }}>{f.desc}</Text>
                  </Stack>
                </Group>
              ))}
            </Stack>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
