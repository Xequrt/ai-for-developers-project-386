import { Group, Text, Anchor } from '@mantine/core'
import { Link, useLocation } from 'react-router-dom'

function CalendarLogo() {
  const today = new Date().getDate()

  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Тело календаря */}
      <rect x="2" y="6" width="32" height="28" rx="6" fill="#FF6B35" />
      {/* Шапка */}
      <rect x="2" y="6" width="32" height="10" rx="6" fill="#E85A20" />
      <rect x="2" y="12" width="32" height="4" fill="#E85A20" />
      {/* Крепления */}
      <rect x="10" y="2" width="4" height="8" rx="2" fill="#C44A10" />
      <rect x="22" y="2" width="4" height="8" rx="2" fill="#C44A10" />
      {/* Число */}
      <text
        x="18"
        y="30"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
      >
        {today}
      </text>
    </svg>
  )
}

export function Navbar() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: isLanding ? 'transparent' : 'rgba(255,255,255,0.85)',
        backdropFilter: isLanding ? 'none' : 'blur(20px)',
        borderBottom: isLanding ? 'none' : '1px solid rgba(0,0,0,0.06)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Group justify="space-between" style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Group gap="xs" align="center">
            <CalendarLogo />
            <Text
              fw={700}
              size="lg"
              style={{
                color: '#1C1C1E',
                letterSpacing: '-0.5px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              Calendar
            </Text>
          </Group>
        </Link>

        {/* Nav links */}
        <Group gap="xl">
          <Anchor
            component={Link}
            to="/book"
            style={{ color: '#FF6B35', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}
          >
            Записаться
          </Anchor>
          <Anchor
            component={Link}
            to="/admin"
            style={{ color: '#1C1C1E', fontWeight: 500, fontSize: 15, textDecoration: 'none' }}
          >
            Админка
          </Anchor>
        </Group>
      </Group>
    </header>
  )
}
