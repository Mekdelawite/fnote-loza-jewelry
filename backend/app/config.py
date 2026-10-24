from pathlib import Path

from pydantic import SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    PROJECT_NAME: str = "Fnote Loza Jewelry API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    DATABASE_URL: str
    SECRET_KEY: SecretStr
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    ADMIN_EMAIL: str | None = None
    ADMIN_PASSWORD: str | None = None

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(
            PROJECT_ROOT / "backend" / ".env",
            PROJECT_ROOT / ".env",
        ),
        extra="ignore",
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def require_database_url(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("DATABASE_URL must be configured")
        return value

    @field_validator("ADMIN_EMAIL", mode="before")
    @classmethod
    def normalize_admin_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None

    @field_validator("ADMIN_PASSWORD", mode="before")
    @classmethod
    def empty_admin_password_is_unset(cls, value: str | None) -> str | None:
        return None if value == "" else value

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value().encode("utf-8")) < 32:
            raise ValueError("SECRET_KEY must contain at least 32 UTF-8 bytes")
        return value

    @model_validator(mode="after")
    def validate_admin_credentials(self):
        if bool(self.ADMIN_EMAIL) != bool(self.ADMIN_PASSWORD):
            raise ValueError("ADMIN_EMAIL and ADMIN_PASSWORD must both be set to seed an administrator")
        if self.ADMIN_PASSWORD and len(self.ADMIN_PASSWORD.encode("utf-8")) > 72:
            raise ValueError("ADMIN_PASSWORD must not exceed 72 UTF-8 bytes")
        return self


settings = Settings()
