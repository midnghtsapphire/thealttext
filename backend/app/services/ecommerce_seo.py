"""
TheAltText — E-Commerce SEO Alt Text Optimization Service
Generates alt text optimized for search rankings on Shopify, Amazon, WooCommerce.
Not just accessibility — actual ranking boost through keyword-rich, contextual alt text.
"""
import logging
import re
import json
import time
from typing import Optional, Dict, List, Tuple
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

# SEO keyword patterns for common e-commerce categories
ECOMMERCE_KEYWORD_PATTERNS = {
    "fashion": ["style", "outfit", "wear", "clothing", "dress", "shirt", "pants", "shoes"],
    "electronics": ["device", "gadget", "tech", "smart", "wireless", "digital", "portable"],
    "home": ["decor", "furniture", "kitchen", "bedroom", "living room", "modern", "rustic"],
    "beauty": ["skincare", "makeup", "cosmetic", "organic", "natural", "anti-aging"],
    "food": ["organic", "fresh", "gourmet", "artisan", "handmade", "natural"],
    "jewelry": ["gold", "silver", "diamond", "handcrafted", "luxury", "sterling"],
    "sports": ["fitness", "workout", "athletic", "performance", "outdoor", "training"],
}

PLATFORM_ALT_TEXT_LIMITS = {
    "shopify": 512,
    "amazon": 1000,
    "woocommerce": 420,
    "etsy": 250,
    "ebay": 300,
    "generic": 300,
}


async def generate_seo_alt_text(
    image_url: Optional[str] = None,
    image_base64: Optional[str] = None,
    mime_type: str = "image/jpeg",
    product_name: Optional[str] = None,
    product_category: Optional[str] = None,
    target_keywords: Optional[List[str]] = None,
    brand_name: Optional[str] = None,
    platform: str = "generic",
    language: str = "en",
) -> Dict:
    """
    Generate SEO-optimized alt text for e-commerce product images.
    Returns alt text plus SEO analysis and keyword density metrics.
    """
    start_time = time.time()
    max_length = PLATFORM_ALT_TEXT_LIMITS.get(platform, 300)

    # Build SEO-aware prompt
    keyword_context = ""
    if target_keywords:
        keyword_context = f"Target SEO keywords to naturally incorporate: {', '.join(target_keywords)}. "
    if product_name:
        keyword_context += f"Product name: {product_name}. "
    if product_category:
        keyword_context += f"Category: {product_category}. "
    if brand_name:
        keyword_context += f"Brand: {brand_name}. "

    system_prompt = f"""You are an expert e-commerce SEO alt text generator. Your alt text must:
1. Be WCAG AAA compliant (descriptive, meaningful, no redundant prefixes)
2. Naturally incorporate target keywords for search engine ranking
3. Describe the product accurately for both screen readers and Google Image Search
4. Stay under {max_length} characters for {platform} platform compatibility
5. Include product attributes (color, material, size, style) when visible
6. Use natural language — no keyword stuffing
7. Front-load important keywords in the first 50 characters
8. Include brand name naturally if provided

{keyword_context}

Return ONLY the alt text, nothing else. No quotes, no prefixes like "Alt text:"."""

    # Build image content for API
    if image_url:
        image_content = {"type": "image_url", "image_url": {"url": image_url}}
    elif image_base64:
        image_content = {
            "type": "image_url",
            "image_url": {"url": f"data:{mime_type};base64,{image_base64}"},
        }
    else:
        raise ValueError("Either image_url or image_base64 must be provided")

    messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": [
                image_content,
                {"type": "text", "text": "Generate SEO-optimized alt text for this product image."},
            ],
        },
    ]

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.BRAND_URL,
        "X-Title": settings.APP_NAME,
    }

    free_models = [m.strip() for m in settings.VISION_MODELS_FREE.split(",") if m.strip()]
    paid_models = [m.strip() for m in settings.VISION_MODELS_PAID.split(",") if m.strip()]
    all_models = [(m, "free") for m in free_models] + [(m, "paid") for m in paid_models]

    alt_text = ""
    model_used = ""
    async with httpx.AsyncClient(timeout=60.0) as client:
        for model_name, tier in all_models:
            try:
                response = await client.post(
                    f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json={"model": model_name, "messages": messages, "max_tokens": 300, "temperature": 0.3},
                )
                if response.status_code == 200:
                    data = response.json()
                    alt_text = data["choices"][0]["message"]["content"].strip().strip('"').strip("'")
                    model_used = model_name
                    break
            except Exception as e:
                logger.warning(f"Model {model_name} failed: {e}")
                continue

    if not alt_text:
        # Fallback: generate from product metadata
        parts = []
        if brand_name:
            parts.append(brand_name)
        if product_name:
            parts.append(product_name)
        if product_category:
            parts.append(f"- {product_category}")
        alt_text = " ".join(parts) if parts else "Product image"
        model_used = "fallback"

    # Truncate to platform limit
    if len(alt_text) > max_length:
        alt_text = alt_text[:max_length - 3].rsplit(" ", 1)[0] + "..."

    processing_time = int((time.time() - start_time) * 1000)

    # SEO analysis
    seo_analysis = analyze_seo_quality(alt_text, target_keywords or [], platform)

    return {
        "alt_text": alt_text,
        "model_used": model_used,
        "platform": platform,
        "character_count": len(alt_text),
        "max_allowed": max_length,
        "processing_time_ms": processing_time,
        "seo_analysis": seo_analysis,
    }


def analyze_seo_quality(alt_text: str, target_keywords: List[str], platform: str) -> Dict:
    """Analyze the SEO quality of generated alt text."""
    score = 100.0
    issues = []
    strengths = []

    text_lower = alt_text.lower()

    # Check keyword inclusion
    keywords_found = []
    keywords_missing = []
    for kw in target_keywords:
        if kw.lower() in text_lower:
            keywords_found.append(kw)
        else:
            keywords_missing.append(kw)

    if target_keywords:
        keyword_ratio = len(keywords_found) / len(target_keywords)
        if keyword_ratio >= 0.7:
            strengths.append(f"Good keyword coverage: {len(keywords_found)}/{len(target_keywords)} keywords included")
        elif keyword_ratio >= 0.4:
            score -= 15
            issues.append(f"Moderate keyword coverage: {len(keywords_found)}/{len(target_keywords)} keywords")
        else:
            score -= 30
            issues.append(f"Low keyword coverage: only {len(keywords_found)}/{len(target_keywords)} keywords found")

    # Check length optimization
    max_length = PLATFORM_ALT_TEXT_LIMITS.get(platform, 300)
    if len(alt_text) < 30:
        score -= 20
        issues.append("Alt text too short for SEO impact — aim for 50-150 characters")
    elif len(alt_text) > max_length:
        score -= 15
        issues.append(f"Exceeds {platform} character limit ({len(alt_text)}/{max_length})")
    elif 50 <= len(alt_text) <= 150:
        strengths.append("Optimal length for SEO (50-150 characters)")

    # Check for keyword stuffing
    words = text_lower.split()
    if len(words) > 0:
        word_freq = {}
        for w in words:
            word_freq[w] = word_freq.get(w, 0) + 1
        max_freq = max(word_freq.values())
        if max_freq > 3 and len(words) < 20:
            score -= 20
            issues.append("Potential keyword stuffing detected")

    # Check for redundant prefixes
    bad_prefixes = ["image of", "picture of", "photo of", "img of"]
    for prefix in bad_prefixes:
        if text_lower.startswith(prefix):
            score -= 10
            issues.append(f"Starts with redundant prefix '{prefix}' — bad for SEO")

    # Check for descriptive quality
    if len(words) >= 5:
        strengths.append("Descriptive and detailed")
    if any(c.isupper() for c in alt_text.split()[0]) and not alt_text.isupper():
        strengths.append("Proper capitalization")

    # Front-loading check
    if target_keywords:
        first_50 = text_lower[:50]
        front_loaded = any(kw.lower() in first_50 for kw in target_keywords)
        if front_loaded:
            strengths.append("Primary keyword front-loaded in first 50 characters")
        else:
            score -= 10
            issues.append("Consider front-loading primary keyword in first 50 characters")

    score = max(0.0, min(100.0, score))

    return {
        "seo_score": round(score, 1),
        "keywords_found": keywords_found,
        "keywords_missing": keywords_missing,
        "keyword_density": round(len(keywords_found) / max(len(target_keywords), 1) * 100, 1),
        "issues": issues,
        "strengths": strengths,
        "platform_optimized": len(alt_text) <= max_length,
        "recommendation": (
            "Excellent SEO optimization" if score >= 85
            else "Good but could be improved" if score >= 65
            else "Needs significant SEO improvement"
        ),
    }


async def bulk_seo_optimize(
    items: List[Dict],
    platform: str = "generic",
    language: str = "en",
) -> Dict:
    """
    Bulk process multiple product images for SEO-optimized alt text.
    Each item should have: image_url, product_name, product_category, target_keywords, brand_name
    """
    results = []
    total_seo_score = 0.0
    errors = []

    for i, item in enumerate(items):
        try:
            result = await generate_seo_alt_text(
                image_url=item.get("image_url"),
                image_base64=item.get("image_base64"),
                mime_type=item.get("mime_type", "image/jpeg"),
                product_name=item.get("product_name"),
                product_category=item.get("product_category"),
                target_keywords=item.get("target_keywords", []),
                brand_name=item.get("brand_name"),
                platform=platform,
                language=language,
            )
            total_seo_score += result["seo_analysis"]["seo_score"]
            results.append({"index": i, "success": True, **result})
        except Exception as e:
            errors.append({"index": i, "error": str(e)})
            logger.error(f"Bulk SEO item {i} failed: {e}")

    avg_seo_score = total_seo_score / len(results) if results else 0.0

    return {
        "total_items": len(items),
        "processed": len(results),
        "errors": len(errors),
        "average_seo_score": round(avg_seo_score, 1),
        "platform": platform,
        "results": results,
        "error_details": errors,
    }
