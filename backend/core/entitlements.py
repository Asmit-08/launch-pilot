from fastapi import HTTPException, status


PREMIUM_TIERS = {
    "premium",
    "super_premium",
}


def has_premium_access(user: dict) -> bool:
    return user.get("subscription") in PREMIUM_TIERS


def require_premium(user: dict):
    if not has_premium_access(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required.",
        )


def is_super_premium(user: dict) -> bool:
    return user.get("subscription") == "super_premium"