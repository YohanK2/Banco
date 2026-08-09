from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.account import AccountResponse


class DepositRequest(BaseModel):
    numero_cuenta: str
    monto: Decimal = Field(..., gt=Decimal("0.00"), description="El monto debe ser mayor a 0")
    descripcion: Optional[str] = "Depósito en cuenta"


class WithdrawalRequest(BaseModel):
    numero_cuenta: str
    monto: Decimal = Field(..., gt=Decimal("0.00"), description="El monto debe ser mayor a 0")
    descripcion: Optional[str] = "Retiro de cuenta"


class TransferRequest(BaseModel):
    cuenta_origen: str
    cuenta_destino: str
    monto: Decimal = Field(..., gt=Decimal("0.00"), description="El monto debe ser mayor a 0")
    descripcion: Optional[str] = "Transferencia entre cuentas"


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_transaccion: int
    cuenta_origen: Optional[int] = None
    cuenta_destino: Optional[int] = None
    tipo: str
    monto: Decimal
    descripcion: Optional[str] = None
    fecha: datetime


class TransactionStatement(BaseModel):
    cuenta: AccountResponse
    saldo_actual: Decimal
    total_depositos: Decimal
    total_retiros: Decimal
    total_transferencias_enviadas: Decimal
    total_transferencias_recibidas: Decimal
    movimientos: List[TransactionResponse]
    fecha_inicio: datetime
    fecha_fin: datetime
