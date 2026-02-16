"""
TheAltText — Configuration
Core application settings loaded from environment variables.
Part of the GlowStarLabs / Audrey Evans ecosystem.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Application
    APP_NAME: str = "TheAltText"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-Powered Alt Text Generator for ADA Compliance"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://thealttext:thealttext@db:5432/thealttext"
    DATABASE_URL_SYNC: str = "postgresql://thealttext:thealttext@db:5432/thealttext"

    # Auth / JWT
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # OpenRouter AI
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    # Free-first model stack: try free models first, escalate to paid
    VISION_MODELS_FREE: str = "google/gemini-2.0-flash-exp:free,meta-llama/llama-4-maverick:free"
    VISION_MODELS_PAID: str = "google/gemini-2.5-flash,openai/gpt-4.1-mini"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_FREE_PRICE_ID: str = ""
    STRIPE_PRO_PRICE_ID: str = ""

    # Rate Limits
    FREE_TIER_MONTHLY_LIMIT: int = 50
    PRO_TIER_MONTHLY_LIMIT: int = -1  # unlimited

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff"

    # Redis (for Celery task queue)
    REDIS_URL: str = "redis://redis:6379/0"

    # Carbon Tracking
    CARBON_TRACKING_ENABLED: bool = True

    # Branding
    BRAND_NAME: str = "GlowStarLabs"
    BRAND_URL: str = "https://meetaudreyevans.com"
    BRAND_AUTHOR: str = "Audrey Evans"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
