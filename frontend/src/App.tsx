import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { AnimatePresence } from 'motion/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AdminPage } from './pages/AdminPage'
import { Navbar } from './components/layout/Navbar'
import { BookPage } from './pages/BookPage'
import { BookingPage } from './pages/BookingPage'
import { ConfirmPage } from './pages/ConfirmPage'
import { LandingPage } from './pages/LandingPage'
import { businessAppleTheme } from './theme'

export function App() {
  const location = useLocation()

  return (
    <MantineProvider theme={businessAppleTheme}>
      <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/book/:eventTypeId" element={<BookingPage />} />
            <Route path="/confirm" element={<ConfirmPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </MantineProvider>
  )
}
