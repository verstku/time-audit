from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env, resolved from this file so the working directory does not matter.
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

# Shared part of the default database URLs. With the database name appended in an f-string, the
# lines below stay under the line length limit even for long project names, so ruff format
# leaves them as they are.
DEFAULT_DB_SERVER = "postgresql+psycopg://postgres:postgres@localhost:5433"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    database_url: str = f"{DEFAULT_DB_SERVER}/time_audit"
    test_database_url: str = f"{DEFAULT_DB_SERVER}/time_audit_test"
    use_test_database: bool = False

    @property
    def effective_database_url(self) -> str:
        """The only place that decides which database the app and Alembic use."""
        if self.use_test_database:
            return self.test_database_url
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
