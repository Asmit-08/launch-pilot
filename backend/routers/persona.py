from fastapi import APIRouter, Depends, Request

from core.auth import optional_current_user
from schemas import PersonaRequest

from services.persona_service import PersonaService
from services.usage_service import usage_service
from services.anonymous_usage_service import anonymous_usage_service


router = APIRouter()


@router.post("/persona")
def generate_persona(
    data: PersonaRequest,
    request: Request,
    current_user=Depends(optional_current_user),
):
    # ---------------------------------------------------------
    # 1. Check usage limit
    # ---------------------------------------------------------

    if current_user:
        usage_service.check_limit(
            current_user,
            "personas",
        )
    else:
        anonymous_usage_service.check_limit(
            request,
            "personas",
        )

    # ---------------------------------------------------------
    # 2. Generate persona
    # ---------------------------------------------------------

    result = PersonaService.generate_persona(
        data,
        current_user,
    )

    # ---------------------------------------------------------
    # 3. Consume usage only after successful generation
    # ---------------------------------------------------------

    if current_user:
        usage_service.consume(
            current_user,
            "personas",
        )
    else:
        anonymous_usage_service.consume(
            request,
            "personas",
        )

    return result