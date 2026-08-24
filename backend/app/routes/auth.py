from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserMeResponse
from app.services.auth_service import authenticate_user, get_user_me, register_client
from app.utils.security import decode_access_token

router = APIRouter(prefix="/auth", tags=["Autenticación y Registro"])
security_scheme = HTTPBearer(auto_error=False)


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> int:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación no proporcionado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return int(payload["sub"])


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


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Inicio de sesión y obtención de JWT",
    description="Autentica las credenciales del usuario y retorna el JWT token con los datos de cuenta.",
)
def login_endpoint(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    resultado, error = authenticate_user(db, login_data)

    if error == "INVALID_CREDENTIALS":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    if error == "USER_INACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario se encuentra desactivada.",
        )

    if resultado is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al procesar la autenticación.",
        )

    return resultado


@router.get(
    "/me",
    response_model=UserMeResponse,
    summary="Obtener información del usuario autenticado",
    description="Retorna el perfil completo del usuario, su cliente y sus cuentas activas.",
)
def get_me_endpoint(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    me = get_user_me(db, user_id)
    if me is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return me

