from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.database.connection import check_connection
from app.routes.account import router as accounts_router
from app.routes.client import router as clients_router
from app.routes.transaction import router as transactions_router
from app.routes.user import router as users_router

app = FastAPI(
    title="Banco Digital API",
    description="API REST del Banco Digital",
    version="1.0.0",
)

app.include_router(clients_router)
app.include_router(accounts_router)
app.include_router(transactions_router)
app.include_router(users_router)


@app.get("/")
def root():
    return {"message": "Banco Digital API funcionando"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/db")
def health_db():
    if check_connection():
        return {"status": "ok", "database": "connected"}
    return JSONResponse(
        status_code=503,
        content={"status": "error", "database": "disconnected"},
    )
