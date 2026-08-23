from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import RegisterRequest, RegisterResponse
from app.services.auth_service import register_client

router = APIRouter(prefix="/auth", tags=["Autenticación y Registro"])



@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registro integral de nuevo cliente",
    description=(
        "Crea de forma atómica el usuario, el cliente asociado y "
        "su cuenta bancaria con número generado automáticamente, "
        "saldo inicial 0.00 y estado ACTIVA."
    ),
)
def register_endpoint(
    register_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    resultado, error = register_client(db, register_data)

    if error == "EMAIL_EXISTS":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo ya se encuentra registrado.",
        )

    if error == "DOCUMENT_EXISTS":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El documento de identidad ya se encuentra registrado.",
        )

    if error == "DB_ERROR" or resultado is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error interno al procesar el registro integral.",
        )

    return resultado
