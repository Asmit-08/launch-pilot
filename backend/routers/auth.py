from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials

from core.auth import security, verify_access_token
from services.auth_service import AuthService
from core.auth import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

auth_service = AuthService()


@router.post("/sync")
def sync_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    claims = verify_access_token(
        credentials.credentials
    )

    user_metadata = claims.get("user_metadata") or {}

    email = claims.get("email") or ""

    name = (
        user_metadata.get("full_name")
        or user_metadata.get("name")
        or email.split("@")[0]
        or "User"
    )

    user_data = {
        "auth_user_id": claims["sub"],
        "email": email,
        "name": name,
        "avatar_url": user_metadata.get("avatar_url"),
    }

    return auth_service.sync_user(user_data)


@router.get("/me")
def me(
    current_user=Depends(get_current_user),
):
    return current_user