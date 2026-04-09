"""
SQLite-хранилище через SQLAlchemy.
При старте создаёт таблицы и заполняет предустановленными данными.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import create_engine, Column, String, Integer, Boolean, Text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = "sqlite:///./calendar.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


# ── ORM-модели ────────────────────────────────────────────────────────────────

class OwnerRow(Base):
    __tablename__ = "owner"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    timezone = Column(String, nullable=False)
    # рабочие часы хранятся как JSON-строка
    working_hours_json = Column(Text, nullable=False)


class EventTypeRow(Base):
    __tablename__ = "event_types"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False, default="")
    duration_minutes = Column(Integer, nullable=False)
    created_at = Column(String, nullable=False)


class BookingRow(Base):
    __tablename__ = "bookings"
    id = Column(String, primary_key=True)
    event_type_id = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    guest_name = Column(String, nullable=False)
    guest_email = Column(String, nullable=False)
    guest_phone = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    status = Column(String, nullable=False, default="confirmed")
    created_at = Column(String, nullable=False)


# ── Вспомогательные функции ───────────────────────────────────────────────────

def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def get_db():
    """FastAPI dependency — yields DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Инициализация БД ──────────────────────────────────────────────────────────

_SEED_WORKING_HOURS = '{"monday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"tuesday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"wednesday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"thursday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"friday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"saturday":{"enabled":false,"startTime":"09:00","endTime":"18:00"},"sunday":{"enabled":false,"startTime":"09:00","endTime":"18:00"}}'


def init_db():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        if not session.get(OwnerRow, "550e8400-e29b-41d4-a716-446655440001"):
            session.add(OwnerRow(
                id="550e8400-e29b-41d4-a716-446655440001",
                name="Владелец",
                email="owner@calendar.app",
                timezone="Europe/Moscow",
                working_hours_json=_SEED_WORKING_HOURS,
            ))
        if not session.get(EventTypeRow, "evt-001"):
            session.add(EventTypeRow(
                id="evt-001",
                name="Встреча 15 минут",
                description="Короткий звонок для быстрого знакомства или обсуждения одного вопроса.",
                duration_minutes=15,
                created_at="2026-01-01T00:00:00.000Z",
            ))
        if not session.get(EventTypeRow, "evt-002"):
            session.add(EventTypeRow(
                id="evt-002",
                name="Встреча 30 минут",
                description="Полноценная встреча для детального обсуждения проекта или задачи.",
                duration_minutes=30,
                created_at="2026-01-01T00:00:00.000Z",
            ))
        session.commit()
