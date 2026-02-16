"""
TheAltText — Pydantic Schemas
Request/response models for all API endpoints.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = None
    organization: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    organization: Optional[str]
    tier: str
    monthly_usage: int
    preferred_language: str
    preferred_tone: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    preferred_language: Optional[str] = None
    preferred_tone: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Alt Text Generation ──────────────────────────────────────────────────────

class AltTextRequest(BaseModel):
    image_url: Optional[str] = None
    language: str = Field(default="en", description="ISO 639-1 language code")
    tone: str = Field(default="formal", description="Tone: formal, casual, technical, simple")
    wcag_level: str = Field(default="AAA", description="Target WCAG level: A, AA, AAA")
    context: Optional[str] = Field(default=None, description="Additional context about the image")


class AltTextResponse(BaseModel):
    id: int
    image_id: int
    generated_text: str
    language: str
    tone: str
    model_used: Optional[str]
    confidence_score: Optional[float]
    wcag_level: str
    character_count: Optional[int]
    carbon_cost_mg: Optional[float]
    processing_time_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class BulkUploadResponse(BaseModel):
    job_id: str
    total_images: int
    status: str
    message: str


# ── URL Scanning ─────────────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    url: str = Field(description="URL to scan for images and alt text compliance")
    scan_depth: int = Field(default=1, ge=1, le=5, description="Crawl depth (1-5 pages deep)")
    generate_alt: bool = Field(default=False, description="Auto-generate alt text for missing images")
    language: str = Field(default="en")
    tone: str = Field(default="formal")


class ScanJobResponse(BaseModel):
    id: int
    target_url: str
    status: str
    scan_depth: int
    pages_scanned: int
    images_found: int
    images_missing_alt: int
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ScanResultItem(BaseModel):
    image_url: str
    page_url: str
    existing_alt: Optional[str]
    has_alt: bool
    generated_alt: Optional[str]
    compliance_status: str  # compliant, missing, poor


# ── Reports ──────────────────────────────────────────────────────────────────

class ReportResponse(BaseModel):
    id: int
    title: str
    report_type: str
    target_url: Optional[str]
    total_images: int
    images_with_alt: int
    images_without_alt: int
    images_with_poor_alt: int
    compliance_score: float
    wcag_level: str
    summary: Optional[str]
    carbon_total_mg: float
    created_at: datetime

    class Config:
        from_attributes = True


class ReportExportRequest(BaseModel):
    report_id: int
    format: str = Field(default="json", description="Export format: json, csv, pdf")


# ── API Keys ─────────────────────────────────────────────────────────────────

class APIKeyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class APIKeyResponse(BaseModel):
    id: int
    key_prefix: str
    name: str
    is_active: bool
    requests_count: int
    last_used_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class APIKeyCreatedResponse(APIKeyResponse):
    full_key: str  # Only returned on creation


# ── Subscription ─────────────────────────────────────────────────────────────

class SubscriptionResponse(BaseModel):
    id: int
    plan: str
    status: str
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    plan: str = Field(description="Plan to subscribe to: pro, enterprise")
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


# ── Dashboard / Stats ────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_images_processed: int
    total_alt_texts_generated: int
    total_scans: int
    monthly_usage: int
    monthly_limit: int
    compliance_score_avg: float
    carbon_saved_mg: float
    tier: str


# ── Health ───────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    carbon_tracking: bool


# ── Developer API ────────────────────────────────────────────────────────────

class DevAPIRequest(BaseModel):
    image_url: str = Field(description="Public URL of the image to analyze")
    language: str = Field(default="en")
    tone: str = Field(default="formal")
    wcag_level: str = Field(default="AAA")
    context: Optional[str] = None


class DevAPIResponse(BaseModel):
    alt_text: str
    language: str
    tone: str
    wcag_level: str
    confidence: Optional[float]
    model: Optional[str]
    carbon_cost_mg: Optional[float]
    processing_time_ms: Optional[int]
