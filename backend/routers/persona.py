from fastapi import APIRouter, Depends
from core.auth import get_current_user
from schemas import PersonaRequest
from services.persona_service import PersonaService

router = APIRouter()


@router.post("/persona")
def generate_persona(
    data: PersonaRequest,
    current_user=Depends(get_current_user),
):
    return PersonaService.generate_persona(data, current_user)