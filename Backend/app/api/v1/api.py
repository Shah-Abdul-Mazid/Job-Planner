"""
Central API router — aggregates all v1 routes.
"""

from fastapi import APIRouter

from app.api.v1.routes import health, chat, rag, predict, users, items, documents, notifications

api_router = APIRouter()

api_router.include_router(health.router,         prefix="/health",        tags=["Health"])
api_router.include_router(items.router,          prefix="/items",         tags=["Applications"])
api_router.include_router(documents.router,      prefix="/documents",     tags=["Documents"])
api_router.include_router(notifications.router,  prefix="/notifications", tags=["Notifications"])
api_router.include_router(chat.router,           prefix="/chat",          tags=["AI Chat"])
api_router.include_router(rag.router,            prefix="/rag",           tags=["RAG"])
api_router.include_router(predict.router,        prefix="/predict",       tags=["ML Predict"])
api_router.include_router(users.router,          prefix="/users",         tags=["Users"])
