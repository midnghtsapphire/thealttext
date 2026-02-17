"""
TheAltText — Main Application
AI-Powered Alt Text Generator for ADA Compliance
Part of the GlowStarLabs / Audrey Evans ecosystem.

https://meetaudreyevans.com
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import auth, images, scanner, reports, billing, dashboard, developer, blue_ocean

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    await init_db()
    logger.info("Database initialized")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    description=f"""
## {settings.APP_NAME} — {settings.APP_DESCRIPTION}

Generate WCAG AAA compliant alt text for images using AI vision models.
Part of the **{settings.BRAND_NAME}** ecosystem by **{settings.BRAND_AUTHOR}**.

### Features
- **Single Image Analysis** — Upload or provide URL for instant alt text
- **Bulk Processing** — Process hundreds of images at once
- **Website Scanner** — Crawl websites to audit alt text compliance
- **Multi-language** — Generate alt text in 14+ languages
- **Tone Customization** — Formal, casual, technical, or simple
- **Developer API** — Integrate into your own apps with API keys
- **Compliance Reports** — Export detailed WCAG compliance reports
- **Carbon Tracking** — Monitor your environmental impact

### Pricing
- **Free**: {settings.FREE_TIER_MONTHLY_LIMIT} images/month
- **Pro**: Unlimited images, priority models, PDF reports

[Visit GlowStarLabs]({settings.BRAND_URL})
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": settings.BRAND_AUTHOR,
        "url": settings.BRAND_URL,
    },
    license_info={
        "name": "Proprietary",
        "url": settings.BRAND_URL,
    },
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(scanner.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(developer.router, prefix="/api")
app.include_router(blue_ocean.router, prefix="/api")


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint — application info."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": settings.APP_DESCRIPTION,
        "docs": "/docs",
        "brand": settings.BRAND_NAME,
        "author": settings.BRAND_AUTHOR,
        "hub": settings.BRAND_URL,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "carbon_tracking": settings.CARBON_TRACKING_ENABLED,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal error occurred. Please try again later.",
            "support": settings.BRAND_URL,
        },
    )
