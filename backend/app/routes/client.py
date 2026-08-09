from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate
from app.services.client_service import (
    create_client,
    delete_client,
    get_client_by_id,
    get_clients,
    update_client,
)

router = APIRouter(prefix="/clients", tags=["Clientes"])


@router.post(
    "",
    response_model=ClientResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_client_endpoint(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
):
    cliente = create_client(db, client_data)
    if cliente is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear el cliente: usuario inexistente o documento duplicado.",
        )
    return cliente


@router.get("", response_model=List[ClientResponse])
def list_clients_endpoint(db: Session = Depends(get_db)):
    return get_clients(db)


@router.get("/{client_id}", response_model=ClientResponse)
def get_client_endpoint(client_id: int, db: Session = Depends(get_db)):
    cliente = get_client_by_id(db, client_id)
    if cliente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado.",
        )
    return cliente


@router.put("/{client_id}", response_model=ClientResponse)
def update_client_endpoint(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
):
    cliente = update_client(db, client_id, client_data)
    if cliente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado.",
        )
    return cliente


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client_endpoint(client_id: int, db: Session = Depends(get_db)):
    resultado = delete_client(db, client_id)
    if resultado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado.",
        )
    if resultado is False:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo eliminar el cliente: tiene cuentas o beneficiarios relacionados.",
        )
    return None
