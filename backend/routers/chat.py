from fastapi import APIRouter, Depends

from core.auth import get_current_user
from schemas import ChatRequest

from ai.chat_agent import chat_agent
from services.usage_service import usage_service


router = APIRouter()


@router.post("/chat")
def chat(
    data: ChatRequest,
    current_user=Depends(get_current_user),
):
    # -----------------------------------
    # Check chat usage BEFORE AI call
    # -----------------------------------

    usage_service.check_limit(
        current_user,
        "chat_messages",
    )

    # -----------------------------------
    # Generate response
    # -----------------------------------

    result = chat_agent(
        data.message,
        data.audit_result,
        data.startup_data,
        data.chat_history,
    )

    # -----------------------------------
    # Consume only after successful
    # chat generation
    # -----------------------------------

    usage_service.consume(
        current_user,
        "chat_messages",
    )

    return result