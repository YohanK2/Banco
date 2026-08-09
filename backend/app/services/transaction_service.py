from decimal import Decimal
from datetime import datetime
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import Cuenta, Transaccion
from app.schemas.account import AccountResponse
from app.schemas.transaction import (
    DepositRequest,
    TransactionResponse,
    TransactionStatement,
    TransferRequest,
    WithdrawalRequest,
)


def deposit(db: Session, data: DepositRequest) -> Optional[TransactionResponse]:
    """
    Realiza un depósito en una cuenta bancaria.

    Reglas de negocio:
    - La cuenta debe existir.
    - La cuenta debe estar en estado ACTIVA.
    - El monto debe ser mayor que 0.
    - El saldo de la cuenta aumenta en el monto depositado.
    - Se registra una transacción de tipo DEPOSITO en la tabla
      transacciones (cuenta_destino = cuenta, cuenta_origen = NULL).
    - La operación se ejecuta dentro de una transacción de base de datos;
      ante cualquier error se realiza rollback y no queda ningún cambio.

    Devuelve None si la cuenta no existe, no está activa o el monto no es
    válido. No lanza excepciones en estos casos.
    """
    cuenta = (
        db.query(Cuenta)
        .filter(Cuenta.numero_cuenta == data.numero_cuenta)
        .with_for_update()
        .first()
    )
    if cuenta is None:
        return None

    if cuenta.estado != "ACTIVA":
        return None

    if data.monto <= Decimal("0.00"):
        return None

    try:
        cuenta.saldo += data.monto

        transaccion = Transaccion(
            cuenta_origen=None,
            cuenta_destino=cuenta.id_cuenta,
            tipo="DEPOSITO",
            monto=data.monto,
            descripcion=data.descripcion,
        )
        db.add(transaccion)
        db.commit()
    except Exception:
        db.rollback()
        return None

    db.refresh(transaccion)
    return TransactionResponse.model_validate(transaccion)


def transfer(db: Session, data: TransferRequest) -> Optional[TransactionResponse]:
    """
    Realiza una transferencia entre dos cuentas bancarias.

    Reglas de negocio:
    - La cuenta origen y la cuenta destino deben existir.
    - Ambas cuentas deben estar en estado ACTIVA.
    - El monto debe ser mayor que 0.
    - La cuenta origen debe tener saldo suficiente.
    - No se puede transferir a la misma cuenta.
    - El saldo de la cuenta origen disminuye y el de la cuenta destino
      aumenta en el monto transferido.
    - Se registra una transacción de tipo TRANSFERENCIA con los ids de
      ambas cuentas (cuenta_origen y cuenta_destino).
    - La operación se ejecuta dentro de una transacción de base de datos;
      ante cualquier error se realiza rollback y no queda ningún cambio.

    Devuelve None si las cuentas no existen, alguna no está activa, el
    monto no es válido, es la misma cuenta o el saldo es insuficiente.
    No lanza excepciones en estos casos.
    """
    if data.cuenta_origen == data.cuenta_destino:
        return None

    origen = (
        db.query(Cuenta)
        .filter(Cuenta.numero_cuenta == data.cuenta_origen)
        .with_for_update()
        .first()
    )
    destino = (
        db.query(Cuenta)
        .filter(Cuenta.numero_cuenta == data.cuenta_destino)
        .with_for_update()
        .first()
    )
    if origen is None or destino is None:
        return None

    if origen.estado != "ACTIVA" or destino.estado != "ACTIVA":
        return None

    if data.monto <= Decimal("0.00"):
        return None

    if origen.saldo < data.monto:
        return None

    try:
        origen.saldo -= data.monto
        destino.saldo += data.monto

        transaccion = Transaccion(
            cuenta_origen=origen.id_cuenta,
            cuenta_destino=destino.id_cuenta,
            tipo="TRANSFERENCIA",
            monto=data.monto,
            descripcion=data.descripcion,
        )
        db.add(transaccion)
        db.commit()
    except Exception:
        db.rollback()
        return None

    db.refresh(transaccion)
    return TransactionResponse.model_validate(transaccion)


def withdraw(db: Session, data: WithdrawalRequest):
    """
    Realiza un retiro de una cuenta bancaria.

    Reglas de negocio:
    - La cuenta debe existir.
    - La cuenta debe estar en estado ACTIVA.
    - El monto debe ser mayor que 0.
    - La cuenta debe tener saldo suficiente.
    - El saldo de la cuenta disminuye en el monto retirado.
    - Se registra una transacción de tipo RETIRO en la tabla
      transacciones (cuenta_origen = cuenta, cuenta_destino = NULL).
    - La operación se ejecuta dentro de una transacción de base de datos;
      ante cualquier error se realiza rollback y no queda ningún cambio.

    Devuelve None si la cuenta no existe, no está activa, el monto no es
    válido o el saldo es insuficiente. No lanza excepciones en estos casos.
    """
    cuenta = (
        db.query(Cuenta)
        .filter(Cuenta.numero_cuenta == data.numero_cuenta)
        .with_for_update()
        .first()
    )
    if cuenta is None:
        return None

    if cuenta.estado != "ACTIVA":
        return None

    if data.monto <= Decimal("0.00"):
        return None

    if cuenta.saldo < data.monto:
        return None

    try:
        cuenta.saldo -= data.monto

        transaccion = Transaccion(
            cuenta_origen=cuenta.id_cuenta,
            cuenta_destino=None,
            tipo="RETIRO",
            monto=data.monto,
            descripcion=data.descripcion,
        )
        db.add(transaccion)
        db.commit()
    except Exception:
        db.rollback()
        return None

    db.refresh(transaccion)
    return TransactionResponse.model_validate(transaccion)


def get_transactions(db: Session) -> List[TransactionResponse]:
    """Devuelve todas las transacciones del sistema, ordenadas por fecha descendente."""
    transacciones = db.query(Transaccion).order_by(Transaccion.fecha.desc()).all()
    return [TransactionResponse.model_validate(t) for t in transacciones]


def get_transaction_by_id(
    db: Session, transaction_id: int
) -> Optional[TransactionResponse]:
    """Devuelve una transacción por su id, o None si no existe."""
    transaccion = db.get(Transaccion, transaction_id)
    if transaccion is None:
        return None
    return TransactionResponse.model_validate(transaccion)


def get_account_transactions(
    db: Session, account_id: int
) -> Optional[List[TransactionResponse]]:
    """
    Devuelve el historial completo de movimientos de una cuenta
    (origen o destino), ordenado por fecha descendente.

    Devuelve None si la cuenta no existe.
    """
    if db.get(Cuenta, account_id) is None:
        return None

    transacciones = (
        db.query(Transaccion)
        .filter(
            or_(
                Transaccion.cuenta_origen == account_id,
                Transaccion.cuenta_destino == account_id,
            )
        )
        .order_by(Transaccion.fecha.desc())
        .all()
    )
    return [TransactionResponse.model_validate(t) for t in transacciones]


def get_account_statement(
    db: Session, account_id: int
) -> Optional[TransactionStatement]:
    """
    Genera el estado de cuenta de una cuenta.

    Incluye la información de la cuenta, su saldo actual, los totales de
    depósitos, retiros, transferencias enviadas y recibidas, el listado
    cronológico de movimientos (fecha descendente) y las fechas inicial y
    final del reporte.

    Las transacciones son inmutables: esta función nunca las modifica.

    Devuelve None si la cuenta no existe.
    """
    cuenta = db.get(Cuenta, account_id)
    if cuenta is None:
        return None

    movimientos = get_account_transactions(db, account_id)

    total_depositos = Decimal("0.00")
    total_retiros = Decimal("0.00")
    total_enviadas = Decimal("0.00")
    total_recibidas = Decimal("0.00")

    for movimiento in movimientos:
        if movimiento.tipo == "DEPOSITO":
            total_depositos += movimiento.monto
        elif movimiento.tipo == "RETIRO":
            total_retiros += movimiento.monto
        elif movimiento.tipo == "TRANSFERENCIA":
            if movimiento.cuenta_origen == account_id:
                total_enviadas += movimiento.monto
            elif movimiento.cuenta_destino == account_id:
                total_recibidas += movimiento.monto

    if movimientos:
        fecha_inicio = movimientos[-1].fecha
        fecha_fin = movimientos[0].fecha
    else:
        fecha_inicio = datetime.utcnow()
        fecha_fin = fecha_inicio

    return TransactionStatement(
        cuenta=AccountResponse.model_validate(cuenta),
        saldo_actual=cuenta.saldo,
        total_depositos=total_depositos,
        total_retiros=total_retiros,
        total_transferencias_enviadas=total_enviadas,
        total_transferencias_recibidas=total_recibidas,
        movimientos=movimientos,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
    )
