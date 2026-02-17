"""
TheAltText — Platform Integration Service
Bulk processing API for Shopify, Amazon, WooCommerce stores.
Connects to store APIs to pull product images and push optimized alt text.
"""
import logging
import json
import time
import hashlib
import hmac
from typing import Optional, Dict, List
from datetime import datetime, timezone
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class ShopifyIntegration:
    """Shopify store integration for bulk alt text processing."""

    def __init__(self, shop_domain: str, access_token: str):
        self.shop_domain = shop_domain.rstrip("/")
        if not self.shop_domain.startswith("https://"):
            self.shop_domain = f"https://{self.shop_domain}"
        self.access_token = access_token
        self.headers = {
            "X-Shopify-Access-Token": access_token,
            "Content-Type": "application/json",
        }

    async def get_products(self, limit: int = 250, page_info: Optional[str] = None) -> Dict:
        """Fetch products from Shopify store."""
        url = f"{self.shop_domain}/admin/api/2024-01/products.json"
        params = {"limit": min(limit, 250)}
        if page_info:
            params["page_info"] = page_info

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()

        products = data.get("products", [])
        images = []
        for product in products:
            for img in product.get("images", []):
                images.append({
                    "image_url": img.get("src"),
                    "image_id": img.get("id"),
                    "product_id": product.get("id"),
                    "product_name": product.get("title"),
                    "product_category": product.get("product_type", ""),
                    "existing_alt": img.get("alt") or "",
                    "position": img.get("position", 1),
                })

        return {
            "platform": "shopify",
            "shop": self.shop_domain,
            "total_products": len(products),
            "total_images": len(images),
            "images": images,
        }

    async def update_image_alt(self, product_id: int, image_id: int, alt_text: str) -> Dict:
        """Update alt text for a specific product image on Shopify."""
        url = f"{self.shop_domain}/admin/api/2024-01/products/{product_id}/images/{image_id}.json"
        payload = {"image": {"id": image_id, "alt": alt_text}}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(url, headers=self.headers, json=payload)
            response.raise_for_status()

        return {"success": True, "product_id": product_id, "image_id": image_id, "alt_text": alt_text}

    async def bulk_update_alt_texts(self, updates: List[Dict]) -> Dict:
        """Bulk update alt texts for multiple images."""
        results = []
        errors = []
        for update in updates:
            try:
                result = await self.update_image_alt(
                    update["product_id"], update["image_id"], update["alt_text"]
                )
                results.append(result)
            except Exception as e:
                errors.append({
                    "product_id": update.get("product_id"),
                    "image_id": update.get("image_id"),
                    "error": str(e),
                })
        return {"updated": len(results), "errors": len(errors), "error_details": errors}


class WooCommerceIntegration:
    """WooCommerce store integration for bulk alt text processing."""

    def __init__(self, store_url: str, consumer_key: str, consumer_secret: str):
        self.store_url = store_url.rstrip("/")
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret

    async def get_products(self, per_page: int = 100, page: int = 1) -> Dict:
        """Fetch products from WooCommerce store."""
        url = f"{self.store_url}/wp-json/wc/v3/products"
        params = {
            "consumer_key": self.consumer_key,
            "consumer_secret": self.consumer_secret,
            "per_page": min(per_page, 100),
            "page": page,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            products = response.json()

        images = []
        for product in products:
            for img in product.get("images", []):
                images.append({
                    "image_url": img.get("src"),
                    "image_id": img.get("id"),
                    "product_id": product.get("id"),
                    "product_name": product.get("name"),
                    "product_category": ", ".join(c.get("name", "") for c in product.get("categories", [])),
                    "existing_alt": img.get("alt") or "",
                })

        return {
            "platform": "woocommerce",
            "shop": self.store_url,
            "total_products": len(products),
            "total_images": len(images),
            "images": images,
        }

    async def update_image_alt(self, product_id: int, image_id: int, alt_text: str) -> Dict:
        """Update alt text for a product image on WooCommerce."""
        url = f"{self.store_url}/wp-json/wc/v3/products/{product_id}"
        params = {
            "consumer_key": self.consumer_key,
            "consumer_secret": self.consumer_secret,
        }
        # WooCommerce requires sending the full images array with updated alt
        async with httpx.AsyncClient(timeout=30.0) as client:
            # First get current product
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            product = resp.json()

            # Update the specific image alt
            for img in product.get("images", []):
                if img["id"] == image_id:
                    img["alt"] = alt_text

            # Push update
            response = await client.put(
                url, params=params, json={"images": product.get("images", [])}
            )
            response.raise_for_status()

        return {"success": True, "product_id": product_id, "image_id": image_id, "alt_text": alt_text}


class AmazonIntegration:
    """Amazon SP-API integration for product image alt text."""

    def __init__(self, refresh_token: str, client_id: str, client_secret: str, marketplace_id: str = "ATVPDKIKX0DER"):
        self.refresh_token = refresh_token
        self.client_id = client_id
        self.client_secret = client_secret
        self.marketplace_id = marketplace_id
        self.access_token = None

    async def authenticate(self) -> str:
        """Get access token from Amazon."""
        url = "https://api.amazon.com/auth/o2/token"
        payload = {
            "grant_type": "refresh_token",
            "refresh_token": self.refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, data=payload)
            response.raise_for_status()
            data = response.json()
            self.access_token = data["access_token"]
            return self.access_token

    async def get_catalog_items(self, asin_list: List[str]) -> Dict:
        """Fetch catalog items from Amazon SP-API."""
        if not self.access_token:
            await self.authenticate()

        images = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for asin in asin_list:
                url = f"https://sellingpartnerapi-na.amazon.com/catalog/2022-04-01/items/{asin}"
                headers = {
                    "x-amz-access-token": self.access_token,
                    "Content-Type": "application/json",
                }
                params = {
                    "marketplaceIds": self.marketplace_id,
                    "includedData": "images,summaries",
                }
                try:
                    response = await client.get(url, headers=headers, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        item_images = data.get("images", [])
                        summaries = data.get("summaries", [{}])
                        title = summaries[0].get("itemName", "") if summaries else ""
                        for img_set in item_images:
                            for img in img_set.get("images", []):
                                images.append({
                                    "image_url": img.get("link"),
                                    "asin": asin,
                                    "product_name": title,
                                    "variant": img.get("variant", "MAIN"),
                                    "existing_alt": "",  # Amazon doesn't expose alt text via API
                                })
                except Exception as e:
                    logger.warning(f"Failed to fetch ASIN {asin}: {e}")

        return {
            "platform": "amazon",
            "total_asins": len(asin_list),
            "total_images": len(images),
            "images": images,
        }


def get_platform_integration(platform: str, credentials: Dict):
    """Factory function to create the right platform integration."""
    if platform == "shopify":
        return ShopifyIntegration(
            shop_domain=credentials["shop_domain"],
            access_token=credentials["access_token"],
        )
    elif platform == "woocommerce":
        return WooCommerceIntegration(
            store_url=credentials["store_url"],
            consumer_key=credentials["consumer_key"],
            consumer_secret=credentials["consumer_secret"],
        )
    elif platform == "amazon":
        return AmazonIntegration(
            refresh_token=credentials["refresh_token"],
            client_id=credentials["client_id"],
            client_secret=credentials["client_secret"],
            marketplace_id=credentials.get("marketplace_id", "ATVPDKIKX0DER"),
        )
    else:
        raise ValueError(f"Unsupported platform: {platform}")
