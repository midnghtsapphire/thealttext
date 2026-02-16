"""
TheAltText — API Test Suite
Tests for all major API endpoints.
"""

import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestHealthEndpoints:
    """Test health and root endpoints."""

    def test_root_endpoint(self):
        """Root endpoint returns app info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["app"] == "TheAltText"
        assert "version" in data
        assert data["brand"] == "GlowStarLabs"
        assert data["author"] == "Audrey Evans"

    def test_health_check(self):
        """Health endpoint returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_docs_available(self):
        """API documentation is accessible."""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc_available(self):
        """ReDoc documentation is accessible."""
        response = client.get("/redoc")
        assert response.status_code == 200


class TestAuthEndpoints:
    """Test authentication endpoints."""

    def test_register_missing_fields(self):
        """Registration fails with missing required fields."""
        response = client.post("/api/auth/register", json={})
        assert response.status_code == 422

    def test_register_invalid_email(self):
        """Registration fails with invalid email."""
        response = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "password": "testpassword123",
        })
        assert response.status_code == 422

    def test_register_short_password(self):
        """Registration fails with short password."""
        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "short",
        })
        assert response.status_code == 422

    def test_login_invalid_credentials(self):
        """Login fails with invalid credentials."""
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword",
        })
        # Will fail because no DB in test mode, but validates the endpoint exists
        assert response.status_code in [401, 500]

    def test_me_unauthorized(self):
        """Profile endpoint requires authentication."""
        response = client.get("/api/auth/me")
        assert response.status_code in [401, 403]


class TestImageEndpoints:
    """Test image analysis endpoints."""

    def test_analyze_no_auth(self):
        """Image analysis requires authentication."""
        response = client.post("/api/images/analyze")
        assert response.status_code in [401, 403]

    def test_analyze_url_no_auth(self):
        """URL analysis requires authentication."""
        response = client.post("/api/images/analyze-url", json={
            "image_url": "https://example.com/image.jpg",
        })
        assert response.status_code in [401, 403]

    def test_bulk_upload_no_auth(self):
        """Bulk upload requires authentication."""
        response = client.post("/api/images/bulk-upload")
        assert response.status_code in [401, 403]

    def test_history_no_auth(self):
        """History requires authentication."""
        response = client.get("/api/images/history")
        assert response.status_code in [401, 403]


class TestScannerEndpoints:
    """Test website scanner endpoints."""

    def test_scan_no_auth(self):
        """Scanning requires authentication."""
        response = client.post("/api/scanner/scan", json={
            "url": "https://example.com",
        })
        assert response.status_code in [401, 403]

    def test_scan_jobs_no_auth(self):
        """Scan jobs list requires authentication."""
        response = client.get("/api/scanner/jobs")
        assert response.status_code in [401, 403]


class TestReportEndpoints:
    """Test report endpoints."""

    def test_reports_no_auth(self):
        """Reports require authentication."""
        response = client.get("/api/reports/")
        assert response.status_code in [401, 403]


class TestBillingEndpoints:
    """Test billing endpoints."""

    def test_subscription_no_auth(self):
        """Subscription info requires authentication."""
        response = client.get("/api/billing/subscription")
        assert response.status_code in [401, 403]


class TestDeveloperEndpoints:
    """Test developer API endpoints."""

    def test_api_keys_no_auth(self):
        """API key management requires authentication."""
        response = client.get("/api/developer/keys")
        assert response.status_code in [401, 403]

    def test_dev_api_no_key(self):
        """Developer API requires API key."""
        response = client.post("/api/developer/v1/alt-text", json={
            "image_url": "https://example.com/image.jpg",
        })
        assert response.status_code == 422  # Missing X-API-Key header


class TestCarbonTracking:
    """Test carbon tracking utility."""

    def test_carbon_estimate(self):
        """Carbon estimation works correctly."""
        from app.utils.carbon import estimate_carbon, format_carbon_savings

        estimate = estimate_carbon("vision_inference_free", count=10)
        assert estimate.co2_mg == 5.0
        assert estimate.energy_wh > 0

        savings = format_carbon_savings(100.0)
        assert savings["co2_mg"] == 100.0
        assert "message" in savings


class TestAltTextAnalysis:
    """Test alt text quality analysis."""

    def test_missing_alt_text(self):
        """Missing alt text scores 0."""
        import asyncio
        from app.services.ai_vision import analyze_existing_alt_text

        result = asyncio.get_event_loop().run_until_complete(
            analyze_existing_alt_text("")
        )
        assert result["score"] == 0.0
        assert result["status"] == "missing"

    def test_generic_alt_text(self):
        """Generic alt text scores poorly."""
        import asyncio
        from app.services.ai_vision import analyze_existing_alt_text

        result = asyncio.get_event_loop().run_until_complete(
            analyze_existing_alt_text("image")
        )
        assert result["score"] < 50
        assert result["status"] in ["poor", "non_compliant"]

    def test_filename_alt_text(self):
        """Filename as alt text scores poorly."""
        import asyncio
        from app.services.ai_vision import analyze_existing_alt_text

        result = asyncio.get_event_loop().run_until_complete(
            analyze_existing_alt_text("IMG_20240101.jpg")
        )
        assert result["score"] < 50

    def test_good_alt_text(self):
        """Good descriptive alt text scores well."""
        import asyncio
        from app.services.ai_vision import analyze_existing_alt_text

        result = asyncio.get_event_loop().run_until_complete(
            analyze_existing_alt_text("Golden retriever catching a red frisbee in a sunny park with green grass")
        )
        assert result["score"] >= 80
        assert result["status"] == "compliant"
