from fastapi import APIRouter, Depends

from core.auth import get_current_user
from schemas import LandingPageRequest
from services.landing_page_service import LandingPageService


router = APIRouter()


@router.post("/landing-page/analyze")
def analyze_landing_page(
    data: LandingPageRequest,
    current_user=Depends(get_current_user),
):
    return LandingPageService.analyze_landing_page(
        data,
        current_user,
    )