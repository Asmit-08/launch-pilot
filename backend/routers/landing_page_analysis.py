from fastapi import APIRouter, Depends

from core.auth import get_current_user
from schemas import LandingPageRequest

from services.landing_page_service import LandingPageService
from services.usage_service import usage_service


router = APIRouter()


@router.post("/landing-page/analyze")
def analyze_landing_page(
    data: LandingPageRequest,
    current_user=Depends(get_current_user),
):
    # Check usage BEFORE performing the analysis.
    usage_service.check_limit(
        current_user,
        "landing_page_analyses",
    )

    # Perform the complete analysis.
    result = LandingPageService.analyze_landing_page(
        data,
        current_user,
    )

    # Consume only after successful analysis.
    usage_service.consume(
        current_user,
        "landing_page_analyses",
    )

    return result