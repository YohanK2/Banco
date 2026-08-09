from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.transaction import (
    DepositRequest,
    TransactionResponse,
    TransactionStatement,
    TransferRequest,
    WithdrawalRequest,
)
from app.services.transaction_service import (
    deposit,
    get_account_statement,
    get_account_transactions,
    get_transaction_by_id,
    get_transactions,
    transfer,
    withdraw,
)

router = APIRouter(prefix="/transactions", tags=["Transacciones"])


@router.get("", response_model=List[TransactionResponse])
def list_transactions_endpoint(db: Session = Depends(get_db)):
    return get_transactions(db)


@router.get("/account/{account_id}/statement", response_model=TransactionStatement)
def account_statement_endpoint(account_id: int, db: Session = Depends(get_db)):
    estado = get_account_statement(db, account_id)
    if estado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta no encontrada.",
        )
    return estado


@router.get("/account/{account_id}", response_model=List[TransactionResponse])
def account_history_endpoint(account_id: int, db: Session = Depends(get_db)):
    movimientos = get_account_transactions(db, account_id)
    if movimientos is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta no encontrada.",
        )
    return movimientos


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_endpoint(transaction_id: int, db: Session = Depends(get_db)):
    transaccion = get_transaction_by_id(db, transaction_id)
    if transaccion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transacción no encontrada.",
        )
    return transaccion


@router.post(
    "/deposit",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def deposit_endpoint(
    data: DepositRequest,
    db: Session = Depends(get_db),
):
    transaccion = deposit(db, data)
    if transaccion is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo realizar el depósito: cuenta inexistente o no está activa.",
        )
    return transaccion


@router.post(
    "/withdraw",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def withdraw_endpoint(
    data: WithdrawalRequest,
    db: Session = Depends(get_db),
):
    transaccion = withdraw(db, data)
    if transaccion is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No se pudo realizar el retiro: cuenta inexistente, "
                "no está activa o saldo insuficiente."
            ),
        )
    return transaccion


@router.post(
    "/transfer",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def transfer_endpoint(
    data: TransferRequest,
    db: Session = Depends(get_db),
):
    transaccion = transfer(db, data)
    if transaccion is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No se pudo realizar la transferencia: cuentas inexistentes, "
                "no activas, misma cuenta o saldo insuficiente."
            ),
        )
    return transaccion
