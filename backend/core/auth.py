from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase_auth.errors import AuthInvalidJwtError

from database.supabase_fetcher import supabase
from repositories.repository_manager import user_repository

security = HTTPBearer()

def verify_access_token(token: str):
    try:
        response = supabase.auth.get_claims(token)
        return response["claims"]

    except AuthInvalidJwtError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    claims = verify_access_token(token)

    auth_user_id = claims["sub"]

    user = user_repository.get_user_by_auth_id(auth_user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user
