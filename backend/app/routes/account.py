from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.account import AccountCreate, AccountResponse, AccountUpdate
from app.services.account_service import (
    create_account,
    get_account_by_id,
    get_accounts,
    update_account_state,
)

router = APIRouter(prefix="/accounts", tags=["Cuentas"])


@router.post(
    "",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_account_endpoint(
    account_data: AccountCreate,
    db: Session = Depends(get_db),
):
    cuenta = create_account(db, account_data)
    if cuenta is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No se pudo crear la cuenta: cliente inexistente, "
                "número de cuenta duplicado o estado inicial distinto de ACTIVA."
            ),
        )
    return cuenta


@router.get("", response_model=List[AccountResponse])
def list_accounts_endpoint(db: Session = Depends(get_db)):
    return get_accounts(db)


@router.get("/{account_id}", response_model=AccountResponse)
def get_account_endpoint(account_id: int, db: Session = Depends(get_db)):
    cuenta = get_account_by_id(db, account_id)
    if cuenta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta no encontrada.",
        )
    return cuenta


@router.put("/{account_id}", response_model=AccountResponse)
def update_account_state_endpoint(
    account_id: int,
    account_data: AccountUpdate,
    db: Session = Depends(get_db),
):
    cuenta = update_account_state(db, account_id, account_data)
    if cuenta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta no encontrada.",
        )
    return cuenta
