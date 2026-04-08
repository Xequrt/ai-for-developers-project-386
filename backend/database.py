"""
In-memory хранилище данных.
Инициализируется предустановленными данными при старте.
"""
import uuid
from datetime import datetime, timezone
from models import EventType, Booking, BookingStatus, Owner, WorkingHours, DaySchedule

# ── Предустановленный владелец ────────────────────────────────────────────────

OWNER = Owner(
    id="550e8400-e29b-41d4-a716-446655440001",
    name="Владелец",
    email="owner@calendar.app",
    timezone="Europe/Moscow",
    workingHours=WorkingHours(
        monday=DaySchedule(enabled=True, startTime="09:00", endTime="18:00"),
        tuesday=DaySchedule(enabled=True, startTime="09:00", endTime="18:00"),
        wednesday=DaySchedule(enabled=True, startTime="09:00", endTime="18:00"),
        thursday=DaySchedule(enabled=True, startTime="09:00", endTime="18:00"),
        friday=DaySchedule(enabled=True, startTime="09:00", endTime="18:00"),
        saturday=DaySchedule(enabled=False, startTime="09:00", endTime="18:00"),
        sunday=DaySchedule(enabled=False, startTime="09:00", endTime="18:00"),
    ),
)

# ── Предустановленные типы событий ────────────────────────────────────────────

EVENT_TYPES: dict[str, EventType] = {
    "evt-001": EventType(
        id="evt-001",
        name="Встреча 15 минут",
        description="Короткий звонок для быстрого знакомства или обсуждения одного вопроса.",
        durationMinutes=15,
        createdAt="2026-01-01T00:00:00.000Z",
    ),
    "evt-002": EventType(
        id="evt-002",
        name="Встреча 30 минут",
        description="Полноценная встреча для детального обсуждения проекта или задачи.",
        durationMinutes=30,
        createdAt="2026-01-01T00:00:00.000Z",
    ),
}

# ── Бронирования ──────────────────────────────────────────────────────────────

BOOKINGS: dict[str, Booking] = {}


def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
