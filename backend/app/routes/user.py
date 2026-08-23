from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import RegisterRequest, RegisterResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth_service import register_client
from app.services.user_service import (
    get_user_by_id,
    get_users,
    update_user,
)

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.post(
    "",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario y cuenta integral",
    description=(
        "Crea de forma atómica el usuario, el cliente asociado y su cuenta "
        "bancaria activa con saldo inicial 0.00 y número generado automáticamente."
    ),
)
def create_user_endpoint(
    user_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    resultado, error = register_client(db, user_data)

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



@router.get("", response_model=List[UserResponse])
def list_users_endpoint(db: Session = Depends(get_db)):
    return get_users(db)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    usuario = get_user_by_id(db, user_id)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return usuario


@router.put("/{user_id}", response_model=UserResponse)
def update_user_endpoint(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
):
    usuario = update_user(db, user_id, user_data)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return usuario
