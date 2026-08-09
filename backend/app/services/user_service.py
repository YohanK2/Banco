from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Usuario
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.utils.security import hash_password


def create_user(db: Session, data: UserCreate) -> Optional[UserResponse]:
    """
    Crea un usuario nuevo.

    Reglas de negocio:
    - El correo debe ser único; si ya existe, no se crea.
    - La contraseña se almacena únicamente como hash (nunca en texto plano).
    - El rol por defecto es CLIENTE.
    - El estado por defecto es activo (True).

    Devuelve None si el correo ya está registrado. No lanza excepciones.
    """
    correo_existente = db.query(Usuario).filter(Usuario.correo == data.correo).first()
    if correo_existente is not None:
        return None

    usuario = Usuario(
        correo=data.correo,
        contrasena_hash=hash_password(data.contrasena),
        rol=data.rol or "CLIENTE",
        estado=True,
    )
    db.add(usuario)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(usuario)
    return UserResponse.model_validate(usuario)


def get_users(db: Session) -> List[UserResponse]:
    """Devuelve todos los usuarios registrados, ordenados por id."""
    usuarios = db.query(Usuario).order_by(Usuario.id_usuario).all()
    return [UserResponse.model_validate(u) for u in usuarios]


def get_user_by_id(db: Session, user_id: int) -> Optional[UserResponse]:
    """Devuelve un usuario por su id, o None si no existe."""
    usuario = db.get(Usuario, user_id)
    if usuario is None:
        return None
    return UserResponse.model_validate(usuario)


def update_user(
    db: Session, user_id: int, data: UserUpdate
) -> Optional[UserResponse]:
    """
    Actualiza únicamente el rol y el estado de un usuario existente.

    El correo y la contraseña no se pueden modificar mediante este
    endpoint (el schema UserUpdate lo prohíbe explícitamente).

    Devuelve None si el usuario no existe.
    """
    usuario = db.get(Usuario, user_id)
    if usuario is None:
        return None

    if data.rol is not None:
        usuario.rol = data.rol
    if data.estado is not None:
        usuario.estado = data.estado

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(usuario)
    return UserResponse.model_validate(usuario)
