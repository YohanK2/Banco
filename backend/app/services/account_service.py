from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Cliente, Cuenta
from app.schemas.account import AccountCreate, AccountResponse, AccountUpdate


def create_account(db: Session, data: AccountCreate) -> Optional[AccountResponse]:
    """
    Crea una cuenta bancaria nueva.

    Reglas de negocio:
    - La cuenta debe pertenecer a un cliente existente.
    - El número de cuenta debe ser único.
    - El saldo inicial no puede ser negativo (validado por el schema).
    - El estado inicial siempre es ACTIVA.

    Devuelve None si el cliente no existe, el número de cuenta ya está
    registrado o el estado inicial enviado no es ACTIVA.
    """
    if db.get(Cliente, data.id_cliente) is None:
        return None

    if data.estado != "ACTIVA":
        return None

    if data.numero_cuenta is not None:
        cuenta_existente = (
            db.query(Cuenta)
            .filter(Cuenta.numero_cuenta == data.numero_cuenta)
            .first()
        )
        if cuenta_existente is not None:
            return None

    cuenta = Cuenta(
        id_cliente=data.id_cliente,
        numero_cuenta=data.numero_cuenta,
        tipo=data.tipo,
        saldo=data.saldo,
        estado="ACTIVA",
    )
    db.add(cuenta)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(cuenta)
    return AccountResponse.model_validate(cuenta)


def get_accounts(db: Session) -> List[AccountResponse]:
    """Devuelve todas las cuentas registradas, ordenadas por id."""
    cuentas = db.query(Cuenta).order_by(Cuenta.id_cuenta).all()
    return [AccountResponse.model_validate(c) for c in cuentas]


def get_account_by_id(db: Session, account_id: int) -> Optional[AccountResponse]:
    """Devuelve una cuenta por su id, o None si no existe."""
    cuenta = db.get(Cuenta, account_id)
    if cuenta is None:
        return None
    return AccountResponse.model_validate(cuenta)


def update_account_state(
    db: Session, account_id: int, data: AccountUpdate
) -> Optional[AccountResponse]:
    """
    Actualiza únicamente el estado de una cuenta existente.

    Las cuentas no se eliminan físicamente; se cambia su estado a
    ACTIVA, BLOQUEADA o CERRADA.

    Devuelve None si la cuenta no existe.
    """
    cuenta = db.get(Cuenta, account_id)
    if cuenta is None:
        return None

    cuenta.estado = data.estado
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(cuenta)
    return AccountResponse.model_validate(cuenta)
