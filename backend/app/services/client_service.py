from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Cliente, Usuario
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate


def create_client(db: Session, data: ClientCreate) -> Optional[ClientResponse]:
    """
    Crea un cliente nuevo.

    Devuelve None si el usuario referenciado no existe o si el documento
    ya está registrado. No lanza excepciones en estos casos.
    """
    if db.get(Usuario, data.id_usuario) is None:
        return None

    documento_existente = (
        db.query(Cliente).filter(Cliente.documento == data.documento).first()
    )
    if documento_existente is not None:
        return None

    cliente = Cliente(
        id_usuario=data.id_usuario,
        nombres=data.nombres,
        apellidos=data.apellidos,
        documento=data.documento,
        telefono=data.telefono,
        direccion=data.direccion,
    )
    db.add(cliente)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(cliente)
    return ClientResponse.model_validate(cliente)


def get_clients(db: Session) -> List[ClientResponse]:
    """Devuelve todos los clientes registrados, ordenados por id."""
    clientes = db.query(Cliente).order_by(Cliente.id_cliente).all()
    return [ClientResponse.model_validate(c) for c in clientes]


def get_client_by_id(db: Session, client_id: int) -> Optional[ClientResponse]:
    """Devuelve un cliente por su id, o None si no existe."""
    cliente = db.get(Cliente, client_id)
    if cliente is None:
        return None
    return ClientResponse.model_validate(cliente)


def update_client(
    db: Session, client_id: int, data: ClientUpdate
) -> Optional[ClientResponse]:
    """
    Actualiza los campos enviados de un cliente existente.

    Devuelve None si el cliente no existe.
    """
    cliente = db.get(Cliente, client_id)
    if cliente is None:
        return None

    if data.nombres is not None:
        cliente.nombres = data.nombres
    if data.apellidos is not None:
        cliente.apellidos = data.apellidos
    if data.telefono is not None:
        cliente.telefono = data.telefono
    if data.direccion is not None:
        cliente.direccion = data.direccion

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(cliente)
    return ClientResponse.model_validate(cliente)


def delete_client(db: Session, client_id: int) -> Optional[bool]:
    """
    Elimina un cliente existente.

    Devuelve True si se eliminó, None si no existe y False si no se
    pudo eliminar por tener datos relacionados (FK).
    """
    cliente = db.get(Cliente, client_id)
    if cliente is None:
        return None

    db.delete(cliente)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return False
    return True
