"""Routers de la API REST del Banco Digital."""

from app.routes.auth import router as auth_router
from app.routes.client import router as client_router
from app.routes.account import router as account_router
from app.routes.transaction import router as transaction_router
from app.routes.user import router as user_router

__all__ = [
    "auth_router",
    "client_router",
    "account_router",
    "transaction_router",
    "user_router",
]

