from fastapi import APIRouter
from schemas import PersonaRequest
from services.persona_service import PersonaService

router = APIRouter()

@router.post("/persona")
def generate_persona(data: PersonaRequest):

    result = PersonaService.generate_persona(data)

    return result