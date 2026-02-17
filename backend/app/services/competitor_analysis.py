"""
TheAltText — Competitor Analysis Service
Scan competitor websites for alt text gaps and generate comparative reports.
"""
import logging
import time
import re
from typing import Dict, List, Optional
from datetime import datetime, timezone
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class CompetitorAnalyzer:
    """Analyze competitor websites for alt text gaps and opportunities."""

    async def analyze_competitor(self, url: str, max_pages: int = 10) -> Dict:
        """Full competitor alt text analysis."""
        start_time = time.time()
        domain = urlparse(url).netloc

        pages_data = []
        visited = set()
        to_visit = [url]

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            while to_visit and len(visited) < max_pages:
                current_url = to_visit.pop(0)
                if current_url in visited:
                    continue
                visited.add(current_url)

                try:
                    response = await client.get(current_url, headers={
                        "User-Agent": "TheAltText Competitor Analyzer/1.0"
                    })
                    if response.status_code != 200:
                        continue

                    soup = BeautifulSoup(response.text, "html.parser")
                    page_data = self._analyze_page(soup, current_url)
                    pages_data.append(page_data)

                    # Discover more links on same domain
                    for link in soup.find_all("a", href=True):
                        href = link["href"]
                        if href.startswith("/"):
                            href = f"{urlparse(current_url).scheme}://{domain}{href}"
                        if domain in href and href not in visited and len(to_visit) < max_pages * 2:
                            to_visit.append(href)

                except Exception as e:
                    logger.warning(f"Failed to analyze {current_url}: {e}")

        # Aggregate results
        total_images = sum(p["total_images"] for p in pages_data)
        images_with_alt = sum(p["images_with_alt"] for p in pages_data)
        images_missing_alt = sum(p["images_missing_alt"] for p in pages_data)
        images_poor_alt = sum(p["images_poor_alt"] for p in pages_data)
        images_good_alt = sum(p["images_good_alt"] for p in pages_data)

        compliance_score = (images_with_alt / total_images * 100) if total_images > 0 else 100.0

        # Identify gaps and opportunities
        gaps = self._identify_gaps(pages_data)
        opportunities = self._identify_opportunities(pages_data, domain)

        processing_time = int((time.time() - start_time) * 1000)

        return {
            "competitor_url": url,
            "competitor_domain": domain,
            "pages_analyzed": len(pages_data),
            "total_images": total_images,
            "images_with_alt": images_with_alt,
            "images_missing_alt": images_missing_alt,
            "images_poor_alt": images_poor_alt,
            "images_good_alt": images_good_alt,
            "compliance_score": round(compliance_score, 1),
            "gaps": gaps,
            "opportunities": opportunities,
            "page_details": pages_data,
            "processing_time_ms": processing_time,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
        }

    def _analyze_page(self, soup: BeautifulSoup, url: str) -> Dict:
        """Analyze a single page for alt text quality."""
        images = soup.find_all("img")
        results = {
            "url": url,
            "total_images": len(images),
            "images_with_alt": 0,
            "images_missing_alt": 0,
            "images_poor_alt": 0,
            "images_good_alt": 0,
            "image_details": [],
        }

        for img in images:
            src = img.get("src", "")
            alt = img.get("alt")
            role = img.get("role", "")
            is_decorative = role in ("presentation", "none") or img.get("aria-hidden") == "true"

            detail = {
                "src": src[:200],
                "alt": alt,
                "is_decorative": is_decorative,
                "quality": "unknown",
                "issues": [],
            }

            if alt is None:
                results["images_missing_alt"] += 1
                detail["quality"] = "missing"
                detail["issues"].append("No alt attribute")
            elif alt == "":
                if is_decorative:
                    results["images_good_alt"] += 1
                    detail["quality"] = "decorative_correct"
                else:
                    results["images_poor_alt"] += 1
                    detail["quality"] = "empty"
                    detail["issues"].append("Empty alt on non-decorative image")
            else:
                results["images_with_alt"] += 1
                quality, issues = self._assess_alt_quality(alt, src)
                detail["quality"] = quality
                detail["issues"] = issues
                if quality == "good":
                    results["images_good_alt"] += 1
                else:
                    results["images_poor_alt"] += 1

            results["image_details"].append(detail)

        return results

    def _assess_alt_quality(self, alt: str, src: str) -> tuple:
        """Assess the quality of alt text."""
        issues = []

        # Check for filename
        if re.match(r"^[\w-]+\.(jpg|jpeg|png|gif|svg|webp)$", alt, re.IGNORECASE):
            issues.append("Alt text is a filename")
            return "poor", issues

        # Check for generic text
        generic = ["image", "photo", "picture", "icon", "logo", "graphic", "banner",
                    "placeholder", "untitled", "img", "pic"]
        if alt.lower().strip() in generic:
            issues.append("Generic/non-descriptive alt text")
            return "poor", issues

        # Check for redundant prefix
        if alt.lower().startswith(("image of", "picture of", "photo of")):
            issues.append("Redundant prefix")

        # Check length
        if len(alt) < 10:
            issues.append("Too short — may not be descriptive enough")
        if len(alt) > 250:
            issues.append("Very long — consider using longdesc")

        # Check for all caps
        if alt == alt.upper() and len(alt) > 5:
            issues.append("All uppercase")

        if not issues:
            return "good", []
        elif any("filename" in i or "Generic" in i for i in issues):
            return "poor", issues
        else:
            return "acceptable", issues

    def _identify_gaps(self, pages_data: List[Dict]) -> List[Dict]:
        """Identify specific alt text gaps in competitor's site."""
        gaps = []

        total_missing = sum(p["images_missing_alt"] for p in pages_data)
        total_poor = sum(p["images_poor_alt"] for p in pages_data)
        total_images = sum(p["total_images"] for p in pages_data)

        if total_missing > 0:
            gaps.append({
                "type": "missing_alt",
                "severity": "critical",
                "count": total_missing,
                "percentage": round(total_missing / max(total_images, 1) * 100, 1),
                "description": f"{total_missing} images have no alt text at all",
                "your_opportunity": "You can outrank them by having 100% alt text coverage",
            })

        if total_poor > 0:
            gaps.append({
                "type": "poor_quality",
                "severity": "major",
                "count": total_poor,
                "percentage": round(total_poor / max(total_images, 1) * 100, 1),
                "description": f"{total_poor} images have poor/generic alt text",
                "your_opportunity": "Use descriptive, keyword-rich alt text to gain SEO advantage",
            })

        # Check for pages with zero alt text
        zero_alt_pages = [p for p in pages_data if p["images_with_alt"] == 0 and p["total_images"] > 0]
        if zero_alt_pages:
            gaps.append({
                "type": "zero_coverage_pages",
                "severity": "critical",
                "count": len(zero_alt_pages),
                "description": f"{len(zero_alt_pages)} pages have zero alt text on any image",
                "pages": [p["url"] for p in zero_alt_pages[:5]],
                "your_opportunity": "These pages are completely invisible to image search — easy to outrank",
            })

        return gaps

    def _identify_opportunities(self, pages_data: List[Dict], domain: str) -> List[Dict]:
        """Identify SEO opportunities based on competitor weaknesses."""
        opportunities = []
        total_images = sum(p["total_images"] for p in pages_data)
        total_good = sum(p["images_good_alt"] for p in pages_data)

        good_ratio = total_good / max(total_images, 1) * 100

        if good_ratio < 50:
            opportunities.append({
                "type": "seo_advantage",
                "impact": "high",
                "description": f"Competitor {domain} has only {round(good_ratio, 1)}% good alt text — massive SEO opportunity",
                "action": "Ensure all your product images have keyword-rich, descriptive alt text",
            })

        if good_ratio < 80:
            opportunities.append({
                "type": "accessibility_leadership",
                "impact": "medium",
                "description": "Competitor lacks WCAG compliance — position yourself as the accessible choice",
                "action": "Achieve WCAG AAA compliance and promote it in marketing",
            })

        opportunities.append({
            "type": "image_search_ranking",
            "impact": "high",
            "description": "Well-optimized alt text directly improves Google Image Search rankings",
            "action": "Use TheAltText to generate SEO-optimized alt text for all product images",
        })

        return opportunities


async def compare_competitors(your_url: str, competitor_urls: List[str], max_pages_each: int = 5) -> Dict:
    """Compare your site against multiple competitors."""
    analyzer = CompetitorAnalyzer()

    your_result = await analyzer.analyze_competitor(your_url, max_pages_each)
    competitor_results = []

    for comp_url in competitor_urls:
        try:
            result = await analyzer.analyze_competitor(comp_url, max_pages_each)
            competitor_results.append(result)
        except Exception as e:
            competitor_results.append({
                "competitor_url": comp_url,
                "error": str(e),
                "compliance_score": 0,
            })

    # Generate comparison
    comparison = {
        "your_site": {
            "url": your_url,
            "compliance_score": your_result["compliance_score"],
            "total_images": your_result["total_images"],
            "images_with_alt": your_result["images_with_alt"],
        },
        "competitors": [
            {
                "url": r.get("competitor_url", ""),
                "compliance_score": r.get("compliance_score", 0),
                "total_images": r.get("total_images", 0),
                "images_with_alt": r.get("images_with_alt", 0),
            }
            for r in competitor_results
        ],
        "your_rank": 1,  # Will be calculated
        "advantage_areas": [],
        "improvement_areas": [],
    }

    # Calculate rank
    all_scores = [your_result["compliance_score"]] + [r.get("compliance_score", 0) for r in competitor_results]
    all_scores.sort(reverse=True)
    comparison["your_rank"] = all_scores.index(your_result["compliance_score"]) + 1

    # Identify advantages and improvements
    for comp in competitor_results:
        comp_score = comp.get("compliance_score", 0)
        if your_result["compliance_score"] > comp_score:
            comparison["advantage_areas"].append(
                f"You outperform {comp.get('competitor_domain', comp.get('competitor_url', ''))} by {round(your_result['compliance_score'] - comp_score, 1)} points"
            )
        elif comp_score > your_result["compliance_score"]:
            comparison["improvement_areas"].append(
                f"{comp.get('competitor_domain', comp.get('competitor_url', ''))} leads by {round(comp_score - your_result['compliance_score'], 1)} points — focus on improving alt text quality"
            )

    return {
        "comparison": comparison,
        "your_detailed_results": your_result,
        "competitor_detailed_results": competitor_results,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }
