### Hexlet tests and linter status:
[![Actions Status](https://github.com/Xequrt/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Xequrt/ai-for-developers-project-386/actions)

### Приложение:
https://calendar-booking-app-9g9h.onrender.com

---

# Calendar — сервис записи на встречи

Веб-приложение для быстрой записи на встречи. Гость выбирает тип события, находит свободный слот в календаре и подтверждает бронирование. Владелец управляет типами событий и видит предстоящие встречи.

## Стек

| Слой | Технологии |
|------|-----------|
| Бэкенд | Python 3.12, FastAPI, Pydantic v2, JWT |
| Фронтенд | React 18, TypeScript, Vite, Mantine UI, Motion |
| API-контракт | TypeSpec → OpenAPI 3.0 |
| Хранилище | SQLite (SQLAlchemy 2.0) |
| Аутентификация | JWT + BCrypt |
| Юнит-тесты | Python unittest (45 тестов) |
| E2E-тесты | Playwright (Chromium) |
| CI | GitHub Actions |

## Быстрый старт

### Установка зависимостей

```bash
make install
```

### Настройка окружения

1. Скопируйте шаблон конфигурации:
```bash
cp backend/.env.example backend/.env
```

2. Отредактируйте `backend/.env` и установите секретный ключ:
```bash
# Обязательно измените JWT_SECRET_KEY в production!
JWT_SECRET_KEY=your-secret-key-min-32-chars-long
```

### Конфигурация через .env файл

| Переменная | Описание | Обязательная | По умолчанию |
|------------|----------|--------------|--------------|
| `JWT_SECRET_KEY` | Секретный ключ для JWT токенов | Да | — |
| `JWT_EXPIRE_DAYS` | Срок действия токена в днях | Нет | 7 |
| `DATABASE_URL` | URL базы данных | Нет | `sqlite:///./calendar.db` |
| `CORS_ORIGINS` | Разрешенные CORS origins | Нет | `http://localhost:5173` |

### Запуск

Бэкенд и фронтенд одновременно:

```bash
make dev
```

Или по отдельности:

```bash
make dev-backend    # FastAPI на http://localhost:8000
make dev-frontend   # Vite на http://localhost:5173
```

### Тесты

```bash
make test             # юнит-тесты бэкенда (45 тестов)
make test-verbose     # с подробным выводом
make test-owner       # тесты владельца
make test-guest       # тесты гостя
make test-occupancy   # тесты правила занятости
make test-e2e         # e2e тесты (Playwright, нужен запущенный dev-сервер)
```

E2E тесты покрывают:
- полный путь бронирования (гость)
- создание типа события (владелец)
- правило занятости слота (409 при повторном бронировании)

### TypeSpec → OpenAPI

```bash
make typespec-compile
```

## Маршруты фронтенда

### Публичные маршруты
| Путь | Страница | Описание |
|------|----------|----------|
| `/` | Лендинг | Главная страница |
| `/book` | Выбор типа события | Список доступных типов встреч |
| `/book/:eventTypeId` | Календарь и слоты | Выбор даты и времени |
| `/confirm` | Форма бронирования | Подтверждение записи |
| `/login` | Вход | Авторизация пользователя |
| `/register` | Регистрация | Создание нового аккаунта |

### Защищенные маршруты (требуют авторизации)
| Путь | Страница | Описание |
|------|----------|----------|
| `/admin` | Панель владельца | Управление типами событий и бронированиями |

## API

Документация доступна после запуска бэкенда: [http://localhost:8000/docs](http://localhost:8000/docs)

### Публичные эндпоинты (без авторизации)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/v1/event-types` | GET | Список типов событий |
| `/api/v1/available-slots` | GET | Доступные слоты |
| `/api/v1/bookings` | POST | Создание бронирования |
| `/api/v1/auth/register` | POST | Регистрация |
| `/api/v1/auth/login` | POST | Вход (возвращает JWT) |

### Защищенные эндпоинты (требуют JWT)

Все запросы должны содержать заголовок:
```
Authorization: Bearer <jwt_token>
```

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/v1/auth/me` | GET | Профиль текущего пользователя |
| `/api/v1/owner/profile` | GET | Профиль владельца |
| `/api/v1/owner/event-types` | POST/PUT/DELETE | CRUD типов событий |
| `/api/v1/owner/bookings/*` | GET/DELETE | Управление бронированиями |

### Первый вход

Для миграции существующего владельца:
- Username: `owner`
- Email: `owner@calendar.app`
- Пароль: любой (будет установлен при первом входе)

## CI

GitHub Actions запускает e2e тесты при каждом пуше в `develop` и `main`, а также при открытии PR в `main`. При падении тестов сохраняется Playwright-отчёт как артефакт.
