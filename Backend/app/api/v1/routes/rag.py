from fastapi import APIRouter
from app.schemas.rag import RAGRequest, RAGResponse
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/query", response_model=RAGResponse, summary="RAG document retrieval + answer")
async def rag_query(request: RAGRequest) -> RAGResponse:
    return await ai_service.handle_rag_query(request)
