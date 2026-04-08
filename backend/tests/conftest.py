"""
Общие фикстуры для тестов.
Каждый тест получает чистое состояние БД через reset_db().
"""
import sys
import os

# Добавляем backend/ в путь, чтобы импорты работали без установки пакета
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import datetime, timedelta, timezone


def future_iso(days: int = 1, hour: int = 10, minute: int = 0) -> str:
    """Возвращает ISO строку для будущей даты (naive, без timezone)."""
    from datetime import date
    target = date.today() + timedelta(days=days)
    while target.weekday() >= 5:
        target += timedelta(days=1)
    dt = datetime(target.year, target.month, target.day, hour, minute, 0)
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def future_date(days: int = 1) -> str:
    """Возвращает YYYY-MM-DD для ближайшего рабочего дня через N дней."""
    from datetime import date
    target = date.today() + timedelta(days=days)
    while target.weekday() >= 5:
        target += timedelta(days=1)
    return target.isoformat()


def reset_db():
    """Сбрасывает in-memory БД к начальному состоянию."""
    import database as db
    from models import EventType, BookingStatus

    db.EVENT_TYPES.clear()
    db.EVENT_TYPES["evt-001"] = EventType(
        id="evt-001",
        name="Встреча 15 минут",
        description="Короткий звонок.",
        durationMinutes=15,
        createdAt="2026-01-01T00:00:00.000Z",
    )
    db.EVENT_TYPES["evt-002"] = EventType(
        id="evt-002",
        name="Встреча 30 минут",
        description="Полноценная встреча.",
        durationMinutes=30,
        createdAt="2026-01-01T00:00:00.000Z",
    )
    db.BOOKINGS.clear()
