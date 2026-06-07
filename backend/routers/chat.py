from fastapi import APIRouter

from backend.schemas import ChatRequest
from backend.ai.chat_agent import chat_agent

router = APIRouter()

@router.post("/chat")
def chat(data: ChatRequest):

    return chat_agent(
        data.message,
        data.audit_result,
        data.startup_data,
        data.chat_history
    )