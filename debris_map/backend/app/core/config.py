from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    cors_origins: list[str] = ["http://localhost:5173"]
    celestrak_group: str = "active"

settings = Settings()