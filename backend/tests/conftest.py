"""
Общие фикстуры для тестов.
Каждый тест получает чистое состояние БД через reset_db().
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import datetime, timedelta, date


def future_iso(days: int = 1, hour: int = 10, minute: int = 0) -> str:
    """Возвращает ISO строку для будущей даты (naive, без timezone)."""
    target = date.today() + timedelta(days=days)
    while target.weekday() >= 5:
        target += timedelta(days=1)
    dt = datetime(target.year, target.month, target.day, hour, minute, 0)
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def future_date(days: int = 1) -> str:
    """Возвращает YYYY-MM-DD для ближайшего рабочего дня через N дней."""
    target = date.today() + timedelta(days=days)
    while target.weekday() >= 5:
        target += timedelta(days=1)
    return target.isoformat()


def reset_db():
    """Пересоздаёт таблицы и заполняет seed-данными."""
    from database import Base, engine, SessionLocal, OwnerRow, EventTypeRow, BookingRow
    from database import _SEED_WORKING_HOURS

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        session.add(OwnerRow(
            id="550e8400-e29b-41d4-a716-446655440001",
            name="Владелец",
            email="owner@calendar.app",
            timezone="Europe/Moscow",
            working_hours_json=_SEED_WORKING_HOURS,
        ))
        session.add(EventTypeRow(
            id="evt-001",
            name="Встреча 15 минут",
            description="Короткий звонок.",
            duration_minutes=15,
            created_at="2026-01-01T00:00:00.000Z",
        ))
        session.add(EventTypeRow(
            id="evt-002",
            name="Встреча 30 минут",
            description="Полноценная встреча.",
            duration_minutes=30,
            created_at="2026-01-01T00:00:00.000Z",
        ))
        session.commit()
