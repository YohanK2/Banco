from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.services.auth_service import login_user, register_client

router = APIRouter(prefix="/auth", tags=["Autenticación y Registro"])


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Inicio de sesión",
    description=(
        "Valida las credenciales del usuario y devuelve el token de sesión "
        "junto con los datos del usuario, cliente y cuenta bancaria."
    ),
)
def login_endpoint(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    resultado, error = login_user(db, credentials.correo, credentials.contrasena)

    if error == "INVALID_CREDENTIALS":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    if error == "USER_DISABLED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo.",
        )

    if error == "DB_ERROR" or resultado is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error interno al iniciar sesión.",
        )

    return resultado



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
