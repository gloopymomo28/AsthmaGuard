from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "asthma_predict"
    MODEL_PATH: str = "finetuned_model.pth"
    RESEND_API_KEY: str = ""
    JWT_SECRET: str = "super-secret-jwt-key"
    AUTHORIZED_EMAILS: str = ""  # Comma separated emails

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
