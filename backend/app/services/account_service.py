from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Cliente, Cuenta
from app.schemas.account import AccountCreate, AccountResponse, AccountUpdate


def generate_account_number(db: Session) -> str:
    """
    Genera automáticamente un número de cuenta único de 10 dígitos.
    Base inicial: 1000000001.

    Busca el valor numérico más alto existente de 10 dígitos y calcula el siguiente,
    garantizando unicidad sin colisiones.
    """
    cuentas = db.query(Cuenta.numero_cuenta).filter(Cuenta.numero_cuenta.isnot(None)).all()
    numeros = []
    for (num,) in cuentas:
        if num and num.isdigit() and len(num) == 10:
            numeros.append(int(num))

    if numeros:
        siguiente = max(numeros) + 1
    else:
        siguiente = 1000000001

    candidato = str(siguiente)
    while db.query(Cuenta).filter(Cuenta.numero_cuenta == candidato).first() is not None:
        siguiente += 1
        candidato = str(siguiente)

    return candidato


def create_account(db: Session, data: AccountCreate) -> Optional[AccountResponse]:
    """
    Crea una cuenta bancaria nueva.

    Reglas de negocio:
    - La cuenta debe pertenecer a un cliente existente.
    - El número de cuenta debe ser único (si no se envía, se genera automáticamente).
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
        numero_cuenta = data.numero_cuenta
    else:
        numero_cuenta = generate_account_number(db)

    cuenta = Cuenta(
        id_cliente=data.id_cliente,
        numero_cuenta=numero_cuenta,
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


def get_accounts_by_client(db: Session, client_id: int) -> List[AccountResponse]:
    """Devuelve todas las cuentas de un cliente, ordenadas por id."""
    cuentas = (
        db.query(Cuenta)
        .filter(Cuenta.id_cliente == client_id)
        .order_by(Cuenta.id_cuenta)
        .all()
    )
    return [AccountResponse.model_validate(c) for c in cuentas]
