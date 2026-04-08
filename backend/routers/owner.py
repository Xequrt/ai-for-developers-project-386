from datetime import datetime
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from models import (
    Booking, BookingStatus, CreateEventTypeRequest,
    ErrorDetail, ErrorResponse, PaginatedBookings, PaginatedBookingsWithStatus,
    BookingWithStatus, UpdateEventTypeRequest,
)
import database as db


def error_response(status_code: int, code: str, message: str):
    body = ErrorResponse(error=ErrorDetail(code=code, message=message))
    return JSONResponse(status_code=status_code, content=body.model_dump())

router = APIRouter(prefix="/api/v1/owner", tags=["OwnerApi"])


@router.get("/profile")
def get_profile():
    return db.OWNER


# ── Типы событий ──────────────────────────────────────────────────────────────

@router.post("/event-types", status_code=201)
def create_event_type(body: CreateEventTypeRequest):
    if not body.id or len(body.id) > 100:
        return error_response(400, "VALIDATION_ERROR", "Некорректный id.")
    if body.id in db.EVENT_TYPES:
        return error_response(409, "DUPLICATE_ID", "Тип события с таким id уже существует.")
    if not body.name or len(body.name) > 100:
        return error_response(400, "VALIDATION_ERROR", "Некорректное название.")
    if body.durationMinutes <= 0:
        return error_response(400, "VALIDATION_ERROR", "durationMinutes должно быть > 0.")

    from models import EventType
    et = EventType(
        id=body.id,
        name=body.name,
        description=body.description,
        durationMinutes=body.durationMinutes,
        createdAt=db.now_iso(),
    )
    db.EVENT_TYPES[et.id] = et
    return et


@router.get("/event-types/{id}")
def get_event_type(id: str):
    et = db.EVENT_TYPES.get(id)
    if not et:
        return error_response(404, "EVENT_TYPE_NOT_FOUND", "Тип события не найден.")
    return et


@router.put("/event-types/{id}")
def update_event_type(id: str, body: UpdateEventTypeRequest):
    et = db.EVENT_TYPES.get(id)
    if not et:
        return error_response(404, "EVENT_TYPE_NOT_FOUND", "Тип события не найден.")

    data = et.model_dump()
    if body.name is not None:
        data["name"] = body.name
    if body.description is not None:
        data["description"] = body.description
    if body.durationMinutes is not None:
        if body.durationMinutes <= 0:
            return error_response(400, "VALIDATION_ERROR", "durationMinutes должно быть > 0.")
        data["durationMinutes"] = body.durationMinutes

    from models import EventType
    updated = EventType(**data)
    db.EVENT_TYPES[id] = updated
    return updated


@router.delete("/event-types/{id}", status_code=204)
def delete_event_type(id: str):
    if id not in db.EVENT_TYPES:
        return error_response(404, "EVENT_TYPE_NOT_FOUND", "Тип события не найден.")
    del db.EVENT_TYPES[id]


# ── Бронирования ──────────────────────────────────────────────────────────────

@router.get("/bookings/upcoming", response_model=PaginatedBookingsWithStatus)
def list_upcoming_bookings(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    now = datetime.now()
    upcoming = []
    for b in db.BOOKINGS.values():
        if b.status != BookingStatus.confirmed:
            continue
        start = datetime.fromisoformat(b.startTime.replace("Z", ""))
        end = datetime.fromisoformat(b.endTime.replace("Z", ""))
        # включаем и будущие, и те что идут прямо сейчас
        if end > now:
            is_ongoing = start <= now < end
            upcoming.append(BookingWithStatus(**b.model_dump(), isOngoing=is_ongoing))
    upcoming.sort(key=lambda b: b.startTime)
    total = len(upcoming)
    page = upcoming[offset: offset + limit]
    return PaginatedBookingsWithStatus(items=page, total=total, limit=limit, offset=offset)


@router.get("/bookings/{id}")
def get_booking(id: str):
    b = db.BOOKINGS.get(id)
    if not b:
        return error_response(404, "BOOKING_NOT_FOUND", "Бронирование не найдено.")
    return b


@router.delete("/bookings/{id}", status_code=204)
def cancel_booking(id: str):
    b = db.BOOKINGS.get(id)
    if not b:
        return error_response(404, "BOOKING_NOT_FOUND", "Бронирование не найдено.")
    data = b.model_dump()
    data["status"] = BookingStatus.cancelled
    from models import Booking
    db.BOOKINGS[id] = Booking(**data)
