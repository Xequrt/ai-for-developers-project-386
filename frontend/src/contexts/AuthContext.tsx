/**
 * Контекст аутентификации — управление состоянием пользователя и JWT токеном.
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, AuthToken, LoginRequest, RegisterRequest } from '../types'

interface AuthContextType {
  /** Текущий пользователь или null если не авторизован */
  user: User | null
  /** JWT токен или null */
  token: string | null
  /** Флаг загрузки (проверка токена при старте) */
  isLoading: boolean
  /** Вход в систему */
  login: (data: LoginRequest) => Promise<void>
  /** Регистрация */
  register: (data: RegisterRequest) => Promise<void>
  /** Выход из системы */
  logout: () => void
  /** Обновление профиля пользователя */
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE = '/api/v1/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Проверка сохраненного токена при загрузке
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      // Валидируем токен и получаем пользователя
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  async function fetchUser(authToken: string) {
    try {
      const response = await fetch(`${API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      
      if (response.ok) {
        const userData: User = await response.json()
        setUser(userData)
      } else {
        // Токен невалиден — очищаем
        localStorage.removeItem('auth_token')
        setToken(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(data: LoginRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Ошибка входа' }))
      throw new Error(error.detail || 'Ошибка входа')
    }

    const authData: AuthToken = await response.json()
    setToken(authData.access_token)
    localStorage.setItem('auth_token', authData.access_token)
    
    // Получаем данные пользователя
    await fetchUser(authData.access_token)
  }

  async function register(data: RegisterRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Ошибка регистрации' }))
      throw new Error(error.detail || 'Ошибка регистрации')
    }

    // После регистрации сразу входим
    await login({ username: data.username, password: data.password })
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  async function refreshUser() {
    if (token) {
      await fetchUser(token)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
