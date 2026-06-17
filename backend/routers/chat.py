from fastapi import APIRouter

from schemas import ChatRequest
from ai.chat_agent import chat_agent

router = APIRouter()

@router.post("/chat")
def chat(data: ChatRequest):

    return chat_agent(
        data.message,
        data.audit_result,
        data.startup_data,
        data.chat_history
    )