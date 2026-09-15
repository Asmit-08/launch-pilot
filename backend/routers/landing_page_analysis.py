from fastapi import APIRouter, Depends, Request

from core.auth import optional_current_user
from schemas import LandingPageRequest

from services.landing_page_service import LandingPageService
from services.usage_service import usage_service
from services.anonymous_usage_service import anonymous_usage_service


router = APIRouter()


@router.post("/landing-page/analyze")
def analyze_landing_page(
    data: LandingPageRequest,
    request: Request,
    current_user=Depends(optional_current_user),
):
    # ---------------------------------------------------------
    # Usage limit
    # ---------------------------------------------------------
    #
    # Authenticated users continue using the existing
    # account-based usage system.
    #
    # Anonymous users use the separate anonymous usage system.
    # ---------------------------------------------------------

    if current_user:
        usage_service.check_limit(
            current_user,
            "landing_page_analyses",
        )
    else:
        anonymous_usage_service.check_limit(
            request,
            "landing_page_analyses",
        )

    # ---------------------------------------------------------
    # Analysis
    # ---------------------------------------------------------

    result = LandingPageService.analyze_landing_page(
        data,
        current_user,
    )

    # ---------------------------------------------------------
    # Consume usage
    # ---------------------------------------------------------

    if current_user:
        usage_service.consume(
            current_user,
            "landing_page_analyses",
        )
    else:
        anonymous_usage_service.consume(
            request,
            "landing_page_analyses",
        )

    return result