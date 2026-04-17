"""
Роутер аутентификации — регистрация, вход, профиль пользователя.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

import database as db
from database import get_db, UserRow
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


# ── Pydantic модели для запросов/ответов ────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    username: str  # Can be username or email
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    name: str
    timezone: str


# ── Хелперы ───────────────────────────────────────────────────────────────────

_DEFAULT_WORKING_HOURS = '{"monday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"tuesday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"wednesday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"thursday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"friday":{"enabled":true,"startTime":"09:00","endTime":"18:00"},"saturday":{"enabled":false,"startTime":"09:00","endTime":"18:00"},"sunday":{"enabled":false,"startTime":"09:00","endTime":"18:00"}}'


def user_to_profile(user: UserRow) -> UserProfile:
    return UserProfile(
        id=user.id,
        username=user.username,
        email=user.email,
        name=user.name,
        timezone=user.timezone,
    )


# ── Эндпоинты ───────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserProfile, status_code=201)
def register(request: RegisterRequest, session: Session = Depends(get_db)):
    """Регистрация нового пользователя."""
    # Проверка уникальности username
    if session.query(UserRow).filter_by(username=request.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Имя пользователя уже занято"
        )
    
    # Проверка уникальности email
    if session.query(UserRow).filter_by(email=request.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email уже зарегистрирован"
        )
    
    # Создание пользователя
    now = db.now_iso()
    user = UserRow(
        id=db.new_id(),
        username=request.username,
        email=request.email,
        password_hash=hash_password(request.password),
        name=request.name,
        timezone="Europe/Moscow",
        working_hours_json=_DEFAULT_WORKING_HOURS,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user_to_profile(user)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, session: Session = Depends(get_db)):
    """Вход в систему — возвращает JWT токен."""
    # Поиск по username или email
    user = session.query(UserRow).filter(
        (UserRow.username == request.username) | (UserRow.email == request.username)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учетные данные",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные учетные данные",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Пользователь неактивен"
        )
    
    access_token = create_access_token(user.id)
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserProfile)
def get_me(current_user: UserRow = Depends(get_current_user)):
    """Получение профиля текущего аутентифицированного пользователя."""
    return user_to_profile(current_user)


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    timezone: str | None = None


@router.put("/me", response_model=UserProfile)
def update_me(
    body: UpdateProfileRequest,
    current_user: UserRow = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    """Обновление профиля текущего пользователя."""
    if body.name is not None:
        current_user.name = body.name
    if body.timezone is not None:
        current_user.timezone = body.timezone
    
    current_user.updated_at = db.now_iso()
    session.commit()
    session.refresh(current_user)
    
    return user_to_profile(current_user)
