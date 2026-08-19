from fastapi import APIRouter, Depends

from core.auth import get_current_user
from services.usage_service import usage_service


router = APIRouter()


@router.get("/usage")
def get_usage(
    current_user=Depends(get_current_user),
):
    return usage_service.get_usage_status(current_user)