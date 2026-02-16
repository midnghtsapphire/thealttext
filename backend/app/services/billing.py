"""
TheAltText — Billing Service
Stripe integration for subscription management.
"""

import logging
from typing import Optional

import stripe

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_customer(email: str, name: Optional[str] = None) -> str:
    """Create a Stripe customer and return the customer ID."""
    try:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"app": "thealttext", "ecosystem": "glowstarlabs"},
        )
        return customer.id
    except stripe.error.StripeError as e:
        logger.error(f"Stripe customer creation failed: {str(e)}")
        raise


async def create_checkout_session(
    customer_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
) -> dict:
    """Create a Stripe Checkout session for subscription."""
    try:
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={"app": "thealttext"},
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe checkout creation failed: {str(e)}")
        raise


async def cancel_subscription(subscription_id: str) -> dict:
    """Cancel a Stripe subscription at period end."""
    try:
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True,
        )
        return {
            "status": subscription.status,
            "cancel_at_period_end": subscription.cancel_at_period_end,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe cancellation failed: {str(e)}")
        raise


async def get_subscription(subscription_id: str) -> dict:
    """Get subscription details from Stripe."""
    try:
        subscription = stripe.Subscription.retrieve(subscription_id)
        return {
            "id": subscription.id,
            "status": subscription.status,
            "plan": subscription.plan.id if subscription.plan else None,
            "current_period_end": subscription.current_period_end,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe subscription retrieval failed: {str(e)}")
        raise


def handle_webhook_event(payload: bytes, sig_header: str) -> dict:
    """Process a Stripe webhook event."""
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise ValueError("Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise ValueError("Invalid signature")

    return {"type": event.type, "data": event.data.object}
