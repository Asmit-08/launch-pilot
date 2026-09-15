from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase_auth.errors import AuthInvalidJwtError

from database.supabase_fetcher import supabase
from repositories.repository_manager import user_repository


security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


def verify_access_token(token: str):
    try:
        response = supabase.auth.get_claims(token)

        if response is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token",
            )

        return response["claims"]

    except AuthInvalidJwtError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )


def _get_auth_user_id(claims) -> str:
    auth_user_id = claims.get("sub")

    if not auth_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    return auth_user_id


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    claims = verify_access_token(token)
    auth_user_id = _get_auth_user_id(claims)

    user = user_repository.get_user_by_auth_id(auth_user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


def optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        optional_security
    ),
):
    """
    Return the authenticated user when a valid bearer token is supplied.

    Anonymous requests return None.

    Invalid bearer tokens still fail authentication, and valid tokens
    belonging to a missing database user still return 404.
    """
    if credentials is None:
        return None

    token = credentials.credentials
    claims = verify_access_token(token)
    auth_user_id = _get_auth_user_id(claims)

    user = user_repository.get_user_by_auth_id(auth_user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user