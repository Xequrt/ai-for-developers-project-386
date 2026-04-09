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
| Бэкенд | Python 3.12, FastAPI, Pydantic v2 |
| Фронтенд | React 18, TypeScript, Vite, Mantine UI, Motion |
| API-контракт | TypeSpec → OpenAPI 3.0 |
| Хранилище | SQLite (SQLAlchemy 2.0) |
| Юнит-тесты | Python unittest (45 тестов) |
| E2E-тесты | Playwright (Chromium) |
| CI | GitHub Actions |

## Быстрый старт

### Установка зависимостей

```bash
make install
```

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

| Путь | Страница |
|------|----------|
| `/` | Лендинг |
| `/book` | Выбор типа события |
| `/book/:eventTypeId` | Календарь и слоты |
| `/confirm` | Форма бронирования |
| `/admin` | Панель владельца |

## API

Документация доступна после запуска бэкенда: [http://localhost:8000/docs](http://localhost:8000/docs)

Публичные эндпоинты — `/api/v1/`, эндпоинты владельца — `/api/v1/owner/`.

## CI

GitHub Actions запускает e2e тесты при каждом пуше в `develop` и `main`, а также при открытии PR в `main`. При падении тестов сохраняется Playwright-отчёт как артефакт.
