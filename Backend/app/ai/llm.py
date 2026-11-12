"""GenAI LLM client (OpenAI, Anthropic, Gemini, Ollama, vLLM)."""
import asyncio
from typing import AsyncGenerator
from app.core.config import settings
from app.schemas.chat import ChatMessage


class LLMClient:
    def __init__(self):
        self.model_name = settings.LLM_MODEL

    async def generate_response(self, messages: list[ChatMessage]) -> str:
        """Non-streaming generation."""
        user_message = messages[-1].content
        # Replace with actual API call (e.g. openai.chat.completions.create)
        return f"[AI ({self.model_name})]: Response to '{user_message}'. Inference completed successfully."

    async def stream_tokens(self, messages: list[ChatMessage]) -> AsyncGenerator[str, None]:
        """Real-time token streaming generator (SSE)."""
        prompt = messages[-1].content
        words = f"Echoing '{prompt}'. This is token-by-token streaming from your FastAPI AI server.".split(" ")
        for word in words:
            await asyncio.sleep(0.04)  # Simulates token generation
            yield f"data: {word} \n\n"
        yield "data: [DONE]\n\n"


llm_client = LLMClient()
