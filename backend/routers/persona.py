from fastapi import APIRouter, Depends

from core.auth import get_current_user
from schemas import PersonaRequest

from services.persona_service import PersonaService
from services.usage_service import usage_service


router = APIRouter()


@router.post("/persona")
def generate_persona(
    data: PersonaRequest,
    current_user=Depends(get_current_user),
):
    usage_service.check_limit(
        current_user,
        "personas",
    )

    result = PersonaService.generate_persona(
        data,
        current_user,
    )

    usage_service.consume(
        current_user,
        "personas",
    )

    return result