"""
Async LLM client for CareerTrack BD.
Uses deterministic rule-based responses (no external API key required).
Plug in any OpenAI-compatible endpoint by setting OPENAI_API_KEY in .env.
"""

from __future__ import annotations
import asyncio
import json
from datetime import datetime, timezone
from typing import AsyncGenerator

from app.core.config import settings
from app.ai.prompt import CAREER_ASSISTANT_SYSTEM_PROMPT


class LLMClient:
    """
    Thin async wrapper around an LLM backend.
    Falls back to deterministic responses when no API key is configured.
    """

    def __init__(self) -> None:
        self.has_api = bool(settings.OPENAI_API_KEY)
        self._rules: list[tuple[list[str], str]] = [
            (
                ["exam", "tomorrow", "today", "when", "schedule", "date", "time"],
                "📅 **Bangladesh Bank Senior Officer Exam**\n"
                "- **Date:** 13 November 2026 (Thursday)\n"
                "- **Time:** 3:00 PM – 4:00 PM (1 hour)\n"
                "- **Report by:** 2:00 PM\n"
                "- **Center:** Shamsul Hoque Khan School & College, Matuail, Demra, Jatrabari\n\n"
                "Source: BSCS Notice No. 357/2026",
            ),
            (
                ["roll", "116683", "center", "seat"],
                "🪑 **Seat Plan — Roll 116683**\n"
                "- **Center #3:** Shamsul Hoque Khan School & College\n"
                "- **Address:** Matuail, Demra Road, Jatrabari, Dhaka\n"
                "- **Roll Range:** 112001 – 118000 (approx.)\n\n"
                "Arrive by **2:00 PM** on 13 Nov 2026.",
            ),
            (
                ["admit card", "admit", "roll number"],
                "📋 Your **Bangladesh Bank Senior Officer** admit card has been issued.\n"
                "- Roll: **116683**\n"
                "- Exam: 13 Nov 2026, 3:00 PM\n\n"
                "For other applications (Sonali Bank, Combined 8/10 Banks), admit cards are **not yet available**.",
            ),
            (
                ["sonali", "26109"],
                "🏦 **Sonali Bank PLC — Asst. Database Administrator (Grade 9)**\n"
                "- Job ID: 26109 | Tracking: 2052062-838456\n"
                "- Status: Application Submitted\n"
                "- Admit card: Not yet issued\n"
                "- Next step: Monitor https://sonalibank.com.bd for exam notice.",
            ),
            (
                ["status", "application", "applied", "submitted"],
                "📊 **Your Application Status Summary:**\n"
                "1. ✅ BB Senior Officer (26101) — Admit Card Issued, Exam Tomorrow\n"
                "2. 📝 Sonali Bank Asst. DBA (26109) — Submitted\n"
                "3. 📝 Combined 10 Banks IT/MIS (26105) — Submitted\n"
                "4. 📝 Combined 8 Banks Sr. IT (26104) — Submitted",
            ),
            (
                ["prepare", "preparation", "study", "tips", "mcq", "syllabus"],
                "📚 **Bank Job Exam Preparation Tips:**\n"
                "- **Math:** Percentage, Profit/Loss, Time-Work, Ratio (Class 9-10 level)\n"
                "- **English:** Grammar, Fill-in-the-blank, Vocabulary, Comprehension\n"
                "- **General Knowledge:** Bangladesh history, Constitution, Current affairs\n"
                "- **Computer/IT (for IT posts):** Database, Networking, Programming basics\n\n"
                "Recommended books: MP3 by Khairul's Basic Math, Professor's BCS Digest.",
            ),
        ]

    async def generate_response(
        self,
        messages: list[dict],
        system_prompt: str = CAREER_ASSISTANT_SYSTEM_PROMPT,
        max_tokens: int = 512,
    ) -> str:
        """Generate a full response string."""
        user_text = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_text = msg.get("content", "").lower()
                break

        if self.has_api:
            return await self._call_openai_api(messages, system_prompt, max_tokens)

        return self._rule_based_response(user_text)

    async def stream_tokens(
        self,
        messages: list[dict],
        system_prompt: str = CAREER_ASSISTANT_SYSTEM_PROMPT,
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens one by one (simulated for deterministic mode)."""
        response = await self.generate_response(messages, system_prompt)
        words = response.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0.02)

    def _rule_based_response(self, user_text: str) -> str:
        """Return a deterministic response based on keyword matching."""
        for keywords, response in self._rules:
            if any(kw in user_text for kw in keywords):
                return response

        now = datetime.now(timezone.utc)
        return (
            f"👋 I'm CareerTrack BD Assistant. I can help you with:\n"
            f"- Exam schedules and admit cards\n"
            f"- Application status updates\n"
            f"- Seat plan lookup by roll number\n"
            f"- Exam preparation tips\n\n"
            f"Try asking: *'When is my next exam?'* or *'What is my seat plan for roll 116683?'*\n\n"
            f"_(Current time: {now.strftime('%Y-%m-%d %H:%M UTC')})_"
        )

    async def _call_openai_api(
        self,
        messages: list[dict],
        system_prompt: str,
        max_tokens: int,
    ) -> str:
        """Call OpenAI-compatible API when key is available."""
        try:
            import httpx

            payload = {
                "model": settings.LLM_MODEL,
                "messages": [{"role": "system", "content": system_prompt}] + messages,
                "max_tokens": max_tokens,
                "temperature": 0.7,
            }
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{settings.OPENAI_API_BASE}/chat/completions",
                    json=payload,
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except Exception as exc:
            return f"⚠️ LLM API error: {exc}. Using fallback mode."


# Singleton
llm_client = LLMClient()
