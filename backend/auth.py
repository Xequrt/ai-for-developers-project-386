"""
Аутентификация и авторизация — JWT, хеширование паролей, зависимости FastAPI.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt as _bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db, UserRow
from config import settings

# Security configuration
ALGORITHM = "HS256"

# HTTP Bearer for token extraction
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Хеширование пароля с использованием bcrypt."""
    return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля против хеша."""
    try:
        return _bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Создание JWT токена доступа."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.jwt_expire_days)
    
    to_encode = {"sub": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[str]:
    """Декодирование JWT токена, возвращает user_id или None."""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_db)
) -> UserRow:
    """
    FastAPI dependency — извлекает текущего пользователя из JWT токена.
    
    Использование:
        @router.get("/protected")
        def protected_route(current_user: UserRow = Depends(get_current_user)):
            return {"user": current_user.username}
    """
    token = credentials.credentials
    user_id = decode_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен аутентификации",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = session.get(UserRow, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Пользователь неактивен",
        )
    
    return user


async def get_current_active_user(current_user: UserRow = Depends(get_current_user)) -> UserRow:
    """Дополнительная проверка что пользователь активен."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Неактивный пользователь")
    return current_user
