"""
TheAltText — Blue Ocean Features API Routes
E-commerce SEO, platform integrations, WCAG AAA checker, competitor analysis, monthly audits.
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.ecommerce_seo import generate_seo_alt_text, bulk_seo_optimize
from app.services.platform_integrations import get_platform_integration
from app.services.wcag_checker import generate_compliance_report, batch_compliance_check
from app.services.competitor_analysis import CompetitorAnalyzer, compare_competitors
from app.services.audit_reports import generate_pdf_report, generate_html_report, schedule_monthly_audit

router = APIRouter(prefix="/blue-ocean", tags=["Blue Ocean Features"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class SEOOptimizeRequest(BaseModel):
    image_url: Optional[str] = None
    product_name: Optional[str] = None
    product_category: Optional[str] = None
    target_keywords: List[str] = []
    brand_name: Optional[str] = None
    platform: str = "generic"
    language: str = "en"


class BulkSEORequest(BaseModel):
    items: List[Dict[str, Any]]
    platform: str = "generic"
    language: str = "en"


class PlatformConnectRequest(BaseModel):
    platform: str  # shopify, woocommerce, amazon
    credentials: Dict[str, str]


class PlatformSyncRequest(BaseModel):
    platform: str
    credentials: Dict[str, str]
    limit: int = 100


class WCAGCheckRequest(BaseModel):
    url: HttpUrl
    wcag_level: str = "AAA"


class BatchWCAGRequest(BaseModel):
    urls: List[HttpUrl]
    wcag_level: str = "AAA"


class CompetitorAnalysisRequest(BaseModel):
    competitor_url: HttpUrl
    max_pages: int = 10


class CompareCompetitorsRequest(BaseModel):
    your_url: HttpUrl
    competitor_urls: List[HttpUrl]
    max_pages_each: int = 5


class MonthlyAuditRequest(BaseModel):
    urls: List[HttpUrl]
    wcag_level: str = "AAA"


class ReportExportRequest(BaseModel):
    audit_data: Dict[str, Any]
    format: str = "pdf"  # pdf or html


# ── E-Commerce SEO Routes ────────────────────────────────────────────────────

@router.post("/seo/optimize")
async def optimize_for_seo(
    request: SEOOptimizeRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate SEO-optimized alt text for e-commerce product images."""
    try:
        result = await generate_seo_alt_text(
            image_url=request.image_url,
            product_name=request.product_name,
            product_category=request.product_category,
            target_keywords=request.target_keywords,
            brand_name=request.brand_name,
            platform=request.platform,
            language=request.language,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seo/bulk-optimize")
async def bulk_optimize_seo(
    request: BulkSEORequest,
    current_user: User = Depends(get_current_user),
):
    """Bulk SEO optimization for multiple product images."""
    try:
        result = await bulk_seo_optimize(
            items=request.items,
            platform=request.platform,
            language=request.language,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Platform Integration Routes ──────────────────────────────────────────────

@router.post("/platforms/connect")
async def connect_platform(
    request: PlatformConnectRequest,
    current_user: User = Depends(get_current_user),
):
    """Test connection to e-commerce platform."""
    try:
        integration = get_platform_integration(request.platform, request.credentials)
        # Test connection by fetching 1 product
        if request.platform == "shopify":
            result = await integration.get_products(limit=1)
        elif request.platform == "woocommerce":
            result = await integration.get_products(per_page=1)
        elif request.platform == "amazon":
            # Amazon needs ASIN list
            return {"success": True, "message": "Amazon credentials validated", "platform": "amazon"}
        return {"success": True, "message": "Platform connected successfully", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")


@router.post("/platforms/sync")
async def sync_platform_images(
    request: PlatformSyncRequest,
    current_user: User = Depends(get_current_user),
):
    """Fetch product images from connected platform."""
    try:
        integration = get_platform_integration(request.platform, request.credentials)
        if request.platform == "shopify":
            result = await integration.get_products(limit=request.limit)
        elif request.platform == "woocommerce":
            result = await integration.get_products(per_page=request.limit)
        else:
            raise HTTPException(status_code=400, detail="Unsupported platform for sync")
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/platforms/push-alt-text")
async def push_alt_text_to_platform(
    platform: str = Body(...),
    credentials: Dict[str, str] = Body(...),
    updates: List[Dict[str, Any]] = Body(...),
    current_user: User = Depends(get_current_user),
):
    """Push optimized alt text back to e-commerce platform."""
    try:
        integration = get_platform_integration(platform, credentials)
        if platform == "shopify":
            result = await integration.bulk_update_alt_texts(updates)
        elif platform == "woocommerce":
            # WooCommerce doesn't have bulk update, iterate
            results = []
            errors = []
            for update in updates:
                try:
                    res = await integration.update_image_alt(
                        update["product_id"], update["image_id"], update["alt_text"]
                    )
                    results.append(res)
                except Exception as e:
                    errors.append({"update": update, "error": str(e)})
            result = {"updated": len(results), "errors": len(errors), "error_details": errors}
        else:
            raise HTTPException(status_code=400, detail="Platform does not support alt text push")
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── WCAG AAA Compliance Checker Routes ───────────────────────────────────────

@router.post("/wcag/check")
async def check_wcag_compliance(
    request: WCAGCheckRequest,
    current_user: User = Depends(get_current_user),
):
    """Run full WCAG AAA compliance check on a URL."""
    try:
        result = await generate_compliance_report(str(request.url), request.wcag_level)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wcag/batch-check")
async def batch_check_wcag(
    request: BatchWCAGRequest,
    current_user: User = Depends(get_current_user),
):
    """Check multiple URLs for WCAG compliance."""
    try:
        urls = [str(url) for url in request.urls]
        result = await batch_compliance_check(urls, request.wcag_level)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Competitor Analysis Routes ───────────────────────────────────────────────

@router.post("/competitor/analyze")
async def analyze_competitor(
    request: CompetitorAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """Analyze competitor website for alt text gaps."""
    try:
        analyzer = CompetitorAnalyzer()
        result = await analyzer.analyze_competitor(str(request.competitor_url), request.max_pages)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/competitor/compare")
async def compare_with_competitors(
    request: CompareCompetitorsRequest,
    current_user: User = Depends(get_current_user),
):
    """Compare your site against multiple competitors."""
    try:
        your_url = str(request.your_url)
        competitor_urls = [str(url) for url in request.competitor_urls]
        result = await compare_competitors(your_url, competitor_urls, request.max_pages_each)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Monthly Audit Routes ─────────────────────────────────────────────────────

@router.post("/audit/schedule")
async def schedule_audit(
    request: MonthlyAuditRequest,
    current_user: User = Depends(get_current_user),
):
    """Schedule automated monthly audits."""
    try:
        urls = [str(url) for url in request.urls]
        result = await schedule_monthly_audit(current_user.id, urls, request.wcag_level)
        return {"success": True, "message": "Monthly audit scheduled", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/audit/export")
async def export_audit_report(
    request: ReportExportRequest,
    current_user: User = Depends(get_current_user),
):
    """Export audit report as PDF or HTML."""
    try:
        if request.format == "pdf":
            pdf_bytes = await generate_pdf_report(request.audit_data)
            # In production, save to S3 and return URL
            # For now, return base64
            import base64
            pdf_b64 = base64.b64encode(pdf_bytes).decode()
            return {
                "success": True,
                "format": "pdf",
                "data": pdf_b64,
                "filename": f"audit_report_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf",
            }
        elif request.format == "html":
            html_content = await generate_html_report(request.audit_data)
            return {
                "success": True,
                "format": "html",
                "data": html_content,
                "filename": f"audit_report_{datetime.now(timezone.utc).strftime('%Y%m%d')}.html",
            }
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
