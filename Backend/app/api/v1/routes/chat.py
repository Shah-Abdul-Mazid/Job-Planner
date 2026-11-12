from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("", response_model=ChatResponse, summary="AI career assistant chat")
async def chat(request: ChatRequest) -> ChatResponse:
    return await ai_service.handle_chat_query(
        messages=request.messages,
        session_id=request.session_id,
    )
