"""
Конфигурация приложения через pydantic-settings.
Поддерживает .env файл и переменные окружения.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Путь к .env относительно этого файла, а не рабочей директории
_ENV_FILE = Path(__file__).parent / ".env"


class Settings(BaseSettings):
    """Настройки приложения с загрузкой из .env файла."""
    
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",  # Игнорировать лишние переменные в .env
    )
    
    # JWT Configuration
    jwt_secret_key: str
    jwt_expire_days: int = 7
    
    # Database
    database_url: str = "sqlite:///./calendar.db"
    
    # CORS
    cors_origins: str = "http://localhost:5173"


# Singleton экземпляр настроек
settings = Settings()
