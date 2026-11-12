"""
AI Service — orchestrates LLMClient + VectorRetriever for chat queries.
"""

from __future__ import annotations
from datetime import datetime, timezone

from app.ai.llm import llm_client
from app.ai.rag import vector_retriever
from app.ai.prompt import CAREER_ASSISTANT_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT
from app.schemas.chat import ChatMessage, ChatResponse
from app.schemas.rag import RAGRequest, RAGResponse, RetrievedDocument


class AIService:
    async def handle_chat_query(
        self, messages: list[ChatMessage], session_id: str = ""
    ) -> ChatResponse:
        user_text = ""
        for m in reversed(messages):
            if m.role == "user":
                user_text = m.content
                break

        # Inject today's date so the LLM can compute "days until exam"
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        dated_messages = [
            {"role": "user", "content": f"[Today: {today}] {user_text}"}
        ]

        response_text = await llm_client.generate_response(
            messages=dated_messages,
            system_prompt=CAREER_ASSISTANT_SYSTEM_PROMPT,
        )

        return ChatResponse(
            response=response_text,
            session_id=session_id or "local",
            model=llm_client._call_openai_api.__name__ if llm_client.has_api else "rule-based",
            tokens_used=None,
        )

    async def handle_rag_query(self, request: RAGRequest) -> RAGResponse:
        context = vector_retriever.build_context(request.query, top_k=request.top_k)
        raw_docs = vector_retriever.query(request.query, top_k=request.top_k)

        rag_prompt = (
            f"{RAG_SYSTEM_PROMPT}\n\n"
            f"## Context\n{context}\n\n"
            f"## Question\n{request.query}"
        )

        answer = await llm_client.generate_response(
            messages=[{"role": "user", "content": request.query}],
            system_prompt=rag_prompt,
        )

        retrieved = [
            RetrievedDocument(
                id=d["id"],
                title=d["title"],
                content=d["content"],
                score=d["score"],
                metadata=d["metadata"],
            )
            for d in raw_docs
        ]

        return RAGResponse(
            answer=answer,
            retrieved_documents=retrieved,
            query=request.query,
        )


ai_service = AIService()
