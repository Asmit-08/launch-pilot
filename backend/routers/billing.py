import json
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from dodopayments import DodoPayments
from standardwebhooks.webhooks import Webhook

from core.auth import get_current_user
from repositories.repository_manager import user_repository

router = APIRouter(prefix="/billing", tags=["Billing"])

DODO_PRODUCT_ID = "pdt_0NlLnWNb4mDIOmqJtVWfN"
ACTIVE = {"active"}
INACTIVE = {"on_hold", "paused", "failed", "expired"}

def get_dodo_client() -> DodoPayments:
    api_key = os.getenv("DODO_PAYMENTS_API_KEY")
    environment = os.getenv("DODO_PAYMENTS_ENVIRONMENT", "test_mode")
    if not api_key:
        raise RuntimeError("DODO_PAYMENTS_API_KEY is not configured.")
    return DodoPayments(bearer_token=api_key, environment=environment)

def is_future(value: str | None) -> bool:
    if not value:
        return False
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt > datetime.now(timezone.utc)
    except ValueError:
        return False

@router.post("/create-checkout")
def create_checkout(current_user=Depends(get_current_user)):
    frontend_url = os.getenv("FRONTEND_URL")
    if not frontend_url:
        raise HTTPException(500, "FRONTEND_URL is not configured.")

    email = current_user.get("email")
    name = current_user.get("name") or "Plavtora User"
    auth_user_id = current_user.get("auth_user_id")

    if not email or not auth_user_id:
        raise HTTPException(400, "Authenticated user is missing billing information.")

    if current_user.get("subscription") in {"premium", "super_premium"}:
        raise HTTPException(400, "User already has premium access.")

    try:
        session = get_dodo_client().checkout_sessions.create(
            product_cart=[{"product_id": DODO_PRODUCT_ID, "quantity": 1}],
            customer={"email": email, "name": name},
            metadata={"auth_user_id": auth_user_id, "plan": "premium"},
            return_url=f"{frontend_url}/billing?status=success",
            cancel_url=f"{frontend_url}/billing?status=cancelled",
        )
        return {"checkout_url": session.checkout_url, "session_id": session.session_id}
    except Exception as exc:
        print(f"Dodo checkout creation failed: {exc}")
        raise HTTPException(502, "Unable to create Dodo checkout session.")

@router.post("/webhooks/dodo")
async def dodo_webhook(request: Request):
    webhook_key = os.getenv("DODO_PAYMENTS_WEBHOOK_KEY")
    if not webhook_key:
        raise HTTPException(500, "DODO_PAYMENTS_WEBHOOK_KEY is not configured.")

    raw = await request.body()
    headers = {
        "webhook-id": request.headers.get("webhook-id", ""),
        "webhook-signature": request.headers.get("webhook-signature", ""),
        "webhook-timestamp": request.headers.get("webhook-timestamp", ""),
    }

    try:
        payload = Webhook(webhook_key).verify(raw.decode("utf-8"), headers)
    except Exception as exc:
        print(f"Dodo webhook signature verification failed: {exc}")
        raise HTTPException(401, "Invalid webhook signature.")

    event = json.loads(payload) if isinstance(payload, str) else payload
    event_type = event.get("type")
    data = event.get("data") or {}
    metadata = data.get("metadata") or {}
    auth_user_id = metadata.get("auth_user_id")

    if not auth_user_id:
        return {"received": True, "processed": False, "reason": "missing_auth_user_id"}

    if not event_type.startswith("subscription."):
        return {"received": True, "processed": False, "reason": "ignored_event"}

    product_id = data.get("product_id")
    if product_id and product_id != DODO_PRODUCT_ID:
        return {"received": True, "processed": False, "reason": "unrelated_product"}

    status_value = data.get("status")
    next_billing = data.get("next_billing_date")
    expires_at = data.get("expires_at")
    cancel_at_next = bool(data.get("cancel_at_next_billing_date"))
    dodo_sub_id = data.get("subscription_id")

    try:
        if event_type in {
            "subscription.active",
            "subscription.renewed",
            "subscription.plan_changed",
            "subscription.unpaused",
        }:
            user_repository.update_subscription(
                auth_user_id, "premium", next_billing, dodo_sub_id,
                cancel_at_next, status_value or "active"
            )

        elif event_type == "subscription.updated":
            if status_value in ACTIVE:
                user_repository.update_subscription(
                    auth_user_id, "premium", next_billing, dodo_sub_id,
                    cancel_at_next, status_value
                )
            elif status_value in INACTIVE:
                user_repository.update_subscription(
                    auth_user_id, "free", expires_at or next_billing,
                    dodo_sub_id, cancel_at_next, status_value
                )
            elif status_value == "cancelled":
                if cancel_at_next and is_future(next_billing):
                    user_repository.update_subscription(
                        auth_user_id, "premium", next_billing, dodo_sub_id,
                        True, "cancelled"
                    )
                else:
                    user_repository.update_subscription(
                        auth_user_id, "free", expires_at or next_billing,
                        dodo_sub_id, cancel_at_next, "cancelled"
                    )

        elif event_type == "subscription.cancelled":
            if cancel_at_next and is_future(next_billing):
                user_repository.update_subscription(
                    auth_user_id, "premium", next_billing, dodo_sub_id,
                    True, "cancelled"
                )
            else:
                user_repository.update_subscription(
                    auth_user_id, "free", expires_at or next_billing,
                    dodo_sub_id, cancel_at_next, status_value or "cancelled"
                )

        elif event_type in {
            "subscription.on_hold",
            "subscription.paused",
            "subscription.failed",
            "subscription.expired",
        }:
            user_repository.update_subscription(
                auth_user_id, "free", expires_at or next_billing,
                dodo_sub_id, cancel_at_next, status_value or event_type.split(".", 1)[1]
            )

        elif event_type == "subscription.update_payment_method":
            if status_value in ACTIVE:
                user_repository.update_subscription(
                    auth_user_id, "premium", next_billing, dodo_sub_id,
                    cancel_at_next, status_value
                )
    except Exception as exc:
        print(f"Failed processing Dodo webhook {event_type}: {exc}")
        raise HTTPException(500, "Failed to process webhook.")

    return {"received": True, "processed": True, "event_type": event_type}