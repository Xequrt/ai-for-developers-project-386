from datetime import datetime
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from models import (
    Booking, BookingStatus, CreateBookingRequest,
    DayAvailability, ErrorDetail, ErrorResponse, TimeSlot,
)
import database as db
from slots import generate_slots, get_booked_intervals

router = APIRouter(prefix="/api/v1", tags=["Public"])


def error_response(status_code: int, code: str, message: str, details: dict | None = None):
    body = ErrorResponse(error=ErrorDetail(code=code, message=message, details=details))
    return JSONResponse(status_code=status_code, content=body.model_dump())


@router.get("/event-types")
def list_event_types():
    return list(db.EVENT_TYPES.values())


@router.get("/available-slots", response_model=list[TimeSlot])
def get_available_slots(
    eventTypeId: str = Query(...),
    date: str = Query(...),
):
    event_type = db.EVENT_TYPES.get(eventTypeId)
    if not event_type:
        return error_response(404, "EVENT_TYPE_NOT_FOUND", "Тип события не найден.")

    booked = get_booked_intervals(db.BOOKINGS)
    return generate_slots(date, event_type.durationMinutes, db.OWNER.workingHours, booked,
                          db.OWNER.timezone)


@router.get("/available-slots/summary", response_model=list[DayAvailability])
def get_available_slots_summary(
    eventTypeId: str = Query(...),
    month: str = Query(...),
):
    event_type = db.EVENT_TYPES.get(eventTypeId)
    if not event_type:
        return error_response(404, "EVENT_TYPE_NOT_FOUND", "Тип события не найден.")

    year, mon = map(int, month.split("-"))
    from calendar import monthrange
    from datetime import date, timedelta
    _, days_in_month = monthrange(year, mon)

    today = date.today()
    window_end = today + timedelta(days=14)

    booked = get_booked_intervals(db.BOOKINGS)
    result = []
    for day in range(1, days_in_month + 1):
        date_str = f"{year}-{mon:02d}-{day:02d}"
        current_date = date(year, mon, day)
        # Дни за пределами окна 14 дней — нет доступных слотов
        if current_date < today or current_date > window_end:
            result.append(DayAvailability(date=date_str, availableCount=0))
            continue
        slots = generate_slots(date_str, event_type.durationMinutes, db.OWNER.workingHours, booked,
                               db.OWNER.timezone)
        result.append(DayAvailability(
            date=date_str,
            availableCount=sum(1 for s in slots if s.available),
        ))
    return result


@router.post("/bookings", status_code=201)
def create_booking(body: CreateBookingRequest):
    from datetime import timedelta

    event_type = db.EVENT_TYPES.get(body.eventTypeId)
    if not event_type:
        return error_response(404, "EVENT_TYPE_NOT_FOUND", "Тип события не найден.")

    try:
        start_dt = datetime.fromisoformat(body.startTime.replace("Z", ""))
    except ValueError:
        return error_response(400, "VALIDATION_ERROR", "Некорректный формат startTime.")

    if start_dt <= datetime.now():
        return error_response(400, "VALIDATION_ERROR", "Время начала не может быть в прошлом.")

    end_dt = start_dt + timedelta(minutes=event_type.durationMinutes)

    for b in db.BOOKINGS.values():
        if b.status != BookingStatus.confirmed:
            continue
        b_start = datetime.fromisoformat(b.startTime.replace("Z", ""))
        b_end = datetime.fromisoformat(b.endTime.replace("Z", ""))
        if start_dt < b_end and end_dt > b_start:
            return error_response(409, "SLOT_OCCUPIED",
                "Выбранное время уже занято. Пожалуйста, выберите другой слот.",
                {"conflictingBookingId": b.id})

    booking = Booking(
        id=db.new_id(),
        eventTypeId=body.eventTypeId,
        startTime=start_dt.strftime("%Y-%m-%dT%H:%M:%S"),
        endTime=end_dt.strftime("%Y-%m-%dT%H:%M:%S"),
        guestName=body.guestName,
        guestEmail=body.guestEmail,
        guestPhone=body.guestPhone,
        notes=body.notes,
        status=BookingStatus.confirmed,
        createdAt=db.now_iso(),
    )
    db.BOOKINGS[booking.id] = booking
    return booking
