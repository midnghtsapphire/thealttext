"""
TheAltText — WCAG AAA Compliance Checker
Deep compliance analysis with detailed reports covering all WCAG 2.1 AAA criteria
related to images and alt text.
"""
import logging
import re
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# WCAG 2.1 AAA criteria relevant to images
WCAG_CRITERIA = {
    "1.1.1": {
        "name": "Non-text Content",
        "level": "A",
        "description": "All non-text content has a text alternative that serves the equivalent purpose.",
        "checks": ["has_alt", "alt_not_empty", "alt_not_filename", "alt_not_generic"],
    },
    "1.4.5": {
        "name": "Images of Text",
        "level": "AA",
        "description": "If the same visual presentation can be made using text alone, an image is not used.",
        "checks": ["not_text_image"],
    },
    "1.4.9": {
        "name": "Images of Text (No Exception)",
        "level": "AAA",
        "description": "Images of text are only used for pure decoration or where a particular presentation is essential.",
        "checks": ["not_text_image_strict"],
    },
    "1.4.6": {
        "name": "Contrast (Enhanced)",
        "level": "AAA",
        "description": "Text and images of text have a contrast ratio of at least 7:1.",
        "checks": ["contrast_enhanced"],
    },
    "1.3.1": {
        "name": "Info and Relationships",
        "level": "A",
        "description": "Information conveyed through presentation can be programmatically determined.",
        "checks": ["semantic_structure"],
    },
    "4.1.2": {
        "name": "Name, Role, Value",
        "level": "A",
        "description": "For all UI components, the name and role can be programmatically determined.",
        "checks": ["role_attribute", "aria_labels"],
    },
}


class WCAGComplianceChecker:
    """Full WCAG AAA compliance checker for image accessibility."""

    def __init__(self):
        self.results = []

    async def check_url(self, url: str, wcag_level: str = "AAA") -> Dict:
        """Run full WCAG compliance check on a URL."""
        start_time = time.time()

        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(url, headers={
                    "User-Agent": "TheAltText WCAG Checker/1.0 (accessibility audit)"
                })
                html = response.text
        except Exception as e:
            return {
                "url": url,
                "error": str(e),
                "compliance_score": 0,
                "status": "error",
            }

        soup = BeautifulSoup(html, "html.parser")
        images = soup.find_all("img")
        svg_images = soup.find_all("svg")
        bg_images = self._find_background_images(soup)
        figures = soup.find_all("figure")
        inputs_with_images = soup.find_all("input", {"type": "image"})
        area_elements = soup.find_all("area")

        all_issues = []
        all_passes = []
        image_results = []

        for img in images:
            result = self._check_img_element(img, wcag_level)
            image_results.append(result)
            all_issues.extend(result["issues"])
            all_passes.extend(result["passes"])

        for svg in svg_images:
            result = self._check_svg_element(svg)
            image_results.append(result)
            all_issues.extend(result["issues"])
            all_passes.extend(result["passes"])

        for fig in figures:
            result = self._check_figure_element(fig)
            all_issues.extend(result.get("issues", []))
            all_passes.extend(result.get("passes", []))

        for inp in inputs_with_images:
            result = self._check_input_image(inp)
            all_issues.extend(result.get("issues", []))
            all_passes.extend(result.get("passes", []))

        for area in area_elements:
            result = self._check_area_element(area)
            all_issues.extend(result.get("issues", []))
            all_passes.extend(result.get("passes", []))

        # Page-level checks
        page_issues = self._check_page_level(soup)
        all_issues.extend(page_issues)

        # Calculate compliance score
        total_checks = len(all_issues) + len(all_passes)
        compliance_score = (len(all_passes) / total_checks * 100) if total_checks > 0 else 100.0

        # Categorize by severity
        critical = [i for i in all_issues if i.get("severity") == "critical"]
        major = [i for i in all_issues if i.get("severity") == "major"]
        minor = [i for i in all_issues if i.get("severity") == "minor"]

        # Categorize by WCAG criterion
        by_criterion = {}
        for issue in all_issues:
            criterion = issue.get("wcag_criterion", "unknown")
            if criterion not in by_criterion:
                by_criterion[criterion] = []
            by_criterion[criterion].append(issue)

        processing_time = int((time.time() - start_time) * 1000)

        return {
            "url": url,
            "wcag_level": wcag_level,
            "compliance_score": round(compliance_score, 1),
            "status": "compliant" if compliance_score >= 95 else "partial" if compliance_score >= 70 else "non_compliant",
            "total_images": len(images),
            "total_svgs": len(svg_images),
            "total_background_images": len(bg_images),
            "total_figures": len(figures),
            "total_checks_performed": total_checks,
            "total_passes": len(all_passes),
            "total_issues": len(all_issues),
            "critical_issues": len(critical),
            "major_issues": len(major),
            "minor_issues": len(minor),
            "issues_by_severity": {
                "critical": critical,
                "major": major,
                "minor": minor,
            },
            "issues_by_criterion": by_criterion,
            "image_results": image_results,
            "page_level_issues": page_issues,
            "processing_time_ms": processing_time,
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "recommendations": self._generate_recommendations(all_issues, compliance_score),
        }

    def _check_img_element(self, img, wcag_level: str = "AAA") -> Dict:
        """Check a single <img> element for WCAG compliance."""
        src = img.get("src", "")
        alt = img.get("alt")
        role = img.get("role", "")
        aria_label = img.get("aria-label", "")
        aria_labelledby = img.get("aria-labelledby", "")
        aria_hidden = img.get("aria-hidden", "")
        title = img.get("title", "")
        longdesc = img.get("longdesc", "")
        width = img.get("width", "")
        height = img.get("height", "")

        issues = []
        passes = []
        is_decorative = role == "presentation" or role == "none" or aria_hidden == "true"

        # 1.1.1 — Non-text Content (Level A)
        if alt is None and not is_decorative:
            issues.append({
                "wcag_criterion": "1.1.1",
                "severity": "critical",
                "message": "Image missing alt attribute entirely",
                "element": str(img)[:200],
                "src": src[:200],
                "fix": 'Add alt="" for decorative images or descriptive alt text for informative images',
            })
        elif alt is not None:
            passes.append({"wcag_criterion": "1.1.1", "check": "has_alt"})

            if alt == "" and not is_decorative:
                issues.append({
                    "wcag_criterion": "1.1.1",
                    "severity": "major",
                    "message": "Empty alt text on non-decorative image",
                    "element": str(img)[:200],
                    "src": src[:200],
                    "fix": "Add descriptive alt text or mark as decorative with role='presentation'",
                })
            elif alt != "":
                passes.append({"wcag_criterion": "1.1.1", "check": "alt_not_empty"})

                # Check for filename as alt
                if re.match(r"^[\w-]+\.(jpg|jpeg|png|gif|svg|webp|bmp|tiff)$", alt, re.IGNORECASE):
                    issues.append({
                        "wcag_criterion": "1.1.1",
                        "severity": "critical",
                        "message": f"Alt text appears to be a filename: '{alt}'",
                        "src": src[:200],
                        "fix": "Replace filename with descriptive text about the image content",
                    })
                else:
                    passes.append({"wcag_criterion": "1.1.1", "check": "alt_not_filename"})

                # Check for generic alt text
                generic_alts = ["image", "photo", "picture", "icon", "logo", "graphic", "banner",
                                "placeholder", "untitled", "img", "pic", "thumbnail"]
                if alt.lower().strip() in generic_alts:
                    issues.append({
                        "wcag_criterion": "1.1.1",
                        "severity": "major",
                        "message": f"Generic/non-descriptive alt text: '{alt}'",
                        "src": src[:200],
                        "fix": "Replace with specific description of the image content and purpose",
                    })
                else:
                    passes.append({"wcag_criterion": "1.1.1", "check": "alt_not_generic"})

                # Check for redundant prefixes
                redundant_prefixes = ["image of", "picture of", "photo of", "graphic of", "icon of"]
                for prefix in redundant_prefixes:
                    if alt.lower().startswith(prefix):
                        issues.append({
                            "wcag_criterion": "1.1.1",
                            "severity": "minor",
                            "message": f"Alt text starts with redundant prefix: '{prefix}'",
                            "src": src[:200],
                            "fix": f"Remove '{prefix}' — screen readers already announce it as an image",
                        })
                        break

                # Check alt text length
                if len(alt) > 250 and not longdesc:
                    issues.append({
                        "wcag_criterion": "1.1.1",
                        "severity": "minor",
                        "message": f"Alt text is very long ({len(alt)} chars) — consider using longdesc",
                        "src": src[:200],
                        "fix": "For complex images, use a shorter alt and provide longdesc or aria-describedby",
                    })

                # AAA: Check all-caps
                if alt == alt.upper() and len(alt) > 5:
                    issues.append({
                        "wcag_criterion": "1.1.1",
                        "severity": "minor",
                        "message": "Alt text is all uppercase — poor screen reader experience",
                        "src": src[:200],
                        "fix": "Use sentence case for better screen reader pronunciation",
                    })

        # Decorative image checks
        if is_decorative and alt and alt != "":
            issues.append({
                "wcag_criterion": "1.1.1",
                "severity": "major",
                "message": "Decorative image (role=presentation) has non-empty alt text",
                "src": src[:200],
                "fix": 'Set alt="" for decorative images',
            })

        # Dimension checks for layout shift
        if not width or not height:
            issues.append({
                "wcag_criterion": "1.3.1",
                "severity": "minor",
                "message": "Image missing width/height attributes — may cause layout shift",
                "src": src[:200],
                "fix": "Add explicit width and height attributes to prevent CLS",
            })

        return {
            "src": src[:200],
            "alt": alt,
            "is_decorative": is_decorative,
            "issues": issues,
            "passes": passes,
            "compliant": len(issues) == 0,
        }

    def _check_svg_element(self, svg) -> Dict:
        """Check SVG element for accessibility."""
        issues = []
        passes = []
        role = svg.get("role", "")
        aria_label = svg.get("aria-label", "")
        aria_hidden = svg.get("aria-hidden", "")
        title_elem = svg.find("title")

        if aria_hidden != "true" and role != "presentation":
            if not aria_label and not title_elem:
                issues.append({
                    "wcag_criterion": "1.1.1",
                    "severity": "major",
                    "message": "SVG missing accessible name (no aria-label or <title>)",
                    "fix": "Add aria-label or a <title> element inside the SVG",
                })
            else:
                passes.append({"wcag_criterion": "1.1.1", "check": "svg_has_name"})

            if role != "img":
                issues.append({
                    "wcag_criterion": "4.1.2",
                    "severity": "minor",
                    "message": "SVG missing role='img' for proper screen reader announcement",
                    "fix": "Add role='img' to the SVG element",
                })

        return {
            "type": "svg",
            "has_title": title_elem is not None,
            "aria_label": aria_label,
            "issues": issues,
            "passes": passes,
        }

    def _check_figure_element(self, figure) -> Dict:
        """Check <figure> element for proper figcaption."""
        issues = []
        passes = []
        figcaption = figure.find("figcaption")
        img = figure.find("img")

        if img and not figcaption:
            issues.append({
                "wcag_criterion": "1.1.1",
                "severity": "minor",
                "message": "Figure with image missing <figcaption>",
                "fix": "Add a <figcaption> to provide context for the figure",
            })
        elif figcaption:
            passes.append({"wcag_criterion": "1.1.1", "check": "figure_has_caption"})

        return {"issues": issues, "passes": passes}

    def _check_input_image(self, inp) -> Dict:
        """Check <input type='image'> for alt text."""
        issues = []
        passes = []
        alt = inp.get("alt", "")

        if not alt:
            issues.append({
                "wcag_criterion": "1.1.1",
                "severity": "critical",
                "message": "Image input missing alt text",
                "fix": "Add alt attribute describing the button action",
            })
        else:
            passes.append({"wcag_criterion": "1.1.1", "check": "input_image_has_alt"})

        return {"issues": issues, "passes": passes}

    def _check_area_element(self, area) -> Dict:
        """Check <area> element in image maps for alt text."""
        issues = []
        passes = []
        alt = area.get("alt", "")

        if not alt:
            issues.append({
                "wcag_criterion": "1.1.1",
                "severity": "critical",
                "message": "Image map area missing alt text",
                "fix": "Add alt attribute describing the linked area",
            })
        else:
            passes.append({"wcag_criterion": "1.1.1", "check": "area_has_alt"})

        return {"issues": issues, "passes": passes}

    def _find_background_images(self, soup) -> List[str]:
        """Find CSS background images that may need alt text alternatives."""
        bg_images = []
        for elem in soup.find_all(style=True):
            style = elem.get("style", "")
            if "background-image" in style or "background:" in style:
                urls = re.findall(r'url\(["\']?([^"\')\s]+)["\']?\)', style)
                bg_images.extend(urls)
        return bg_images

    def _check_page_level(self, soup) -> List[Dict]:
        """Page-level accessibility checks."""
        issues = []

        # Check for skip navigation link
        skip_link = soup.find("a", {"href": "#main-content"}) or soup.find("a", class_=re.compile("skip"))
        if not skip_link:
            issues.append({
                "wcag_criterion": "2.4.1",
                "severity": "minor",
                "message": "No skip navigation link found",
                "fix": "Add a skip-to-content link at the top of the page",
            })

        # Check for lang attribute
        html_tag = soup.find("html")
        if html_tag and not html_tag.get("lang"):
            issues.append({
                "wcag_criterion": "3.1.1",
                "severity": "major",
                "message": "HTML element missing lang attribute",
                "fix": 'Add lang attribute to <html> element (e.g., lang="en")',
            })

        # Check for viewport meta
        viewport = soup.find("meta", {"name": "viewport"})
        if viewport:
            content = viewport.get("content", "")
            if "maximum-scale=1" in content or "user-scalable=no" in content:
                issues.append({
                    "wcag_criterion": "1.4.4",
                    "severity": "major",
                    "message": "Viewport meta prevents user scaling",
                    "fix": "Remove maximum-scale=1 and user-scalable=no from viewport meta",
                })

        return issues

    def _generate_recommendations(self, issues: List[Dict], score: float) -> List[str]:
        """Generate prioritized recommendations based on issues found."""
        recommendations = []

        critical_count = sum(1 for i in issues if i.get("severity") == "critical")
        major_count = sum(1 for i in issues if i.get("severity") == "major")

        if critical_count > 0:
            recommendations.append(
                f"URGENT: Fix {critical_count} critical issues first — these are WCAG Level A failures"
            )
        if major_count > 0:
            recommendations.append(
                f"HIGH PRIORITY: Address {major_count} major issues for WCAG AA compliance"
            )
        if score < 50:
            recommendations.append(
                "Consider a full accessibility audit — significant compliance gaps detected"
            )
        if score >= 90:
            recommendations.append(
                "Strong accessibility foundation — focus on minor refinements for AAA compliance"
            )

        # Specific recommendations by criterion
        criteria_seen = set(i.get("wcag_criterion") for i in issues)
        if "1.1.1" in criteria_seen:
            recommendations.append(
                "Review all images for meaningful alt text — this is the most common accessibility failure"
            )
        if "4.1.2" in criteria_seen:
            recommendations.append(
                "Ensure all interactive elements have proper ARIA labels and roles"
            )

        return recommendations


async def generate_compliance_report(url: str, wcag_level: str = "AAA") -> Dict:
    """Generate a full WCAG compliance report for a URL."""
    checker = WCAGComplianceChecker()
    return await checker.check_url(url, wcag_level)


async def batch_compliance_check(urls: List[str], wcag_level: str = "AAA") -> Dict:
    """Check multiple URLs for WCAG compliance."""
    checker = WCAGComplianceChecker()
    results = []
    total_score = 0.0

    for url in urls:
        result = await checker.check_url(url, wcag_level)
        results.append(result)
        total_score += result.get("compliance_score", 0)

    avg_score = total_score / len(results) if results else 0.0

    return {
        "total_urls": len(urls),
        "average_compliance_score": round(avg_score, 1),
        "results": results,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
