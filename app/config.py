import os
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENVIRONMENT = os.getenv("NODE_ENV", "development")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            PROJECT_ROOT / ".env",
            PROJECT_ROOT / f".env.{ENVIRONMENT}.local",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    node_env: str = "development"
    host: str = "0.0.0.0"
    port: int = Field(default=3000, ge=1, le=65535)

    db_host: str
    db_port: int = Field(default=3306, ge=1, le=65535)
    db_user: str
    db_password: SecretStr
    db_name: str
    db_pool_min_size: int = Field(default=1, ge=0)
    db_pool_max_size: int = Field(default=10, ge=1)

    access_token_secret: SecretStr = Field(min_length=1)
    refresh_token_secret: SecretStr = Field(min_length=1)
    access_token_expire_minutes: int = Field(default=5, ge=1)
    refresh_token_expire_days: int = Field(default=7, ge=1)

    request_body_max_bytes: int = Field(default=100 * 1024, ge=1)
    upload_request_max_bytes: int = Field(default=6 * 1024 * 1024, ge=1)
    upload_max_bytes: int = Field(default=5 * 1024 * 1024, ge=1)
    public_directory_path: Path = Field(
        default=PROJECT_ROOT / "public",
        validation_alias="PUBLIC_DIRECTORY",
    )
    log_level: str = "INFO"

    @property
    def public_directory(self) -> Path:
        if self.public_directory_path.is_absolute():
            return self.public_directory_path
        return PROJECT_ROOT / self.public_directory_path

    @property
    def upload_directory(self) -> Path:
        return self.public_directory / "images"


settings = Settings()
