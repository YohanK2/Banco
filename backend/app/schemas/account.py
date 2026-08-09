from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

AccountEstado = Literal["ACTIVA", "BLOQUEADA", "CERRADA"]
ESTADOS_CUENTA = ["ACTIVA", "BLOQUEADA", "CERRADA"]


class AccountCreate(BaseModel):
    id_cliente: int
    numero_cuenta: Optional[str] = Field(None, max_length=20)
    tipo: str = Field(default="AHORROS", max_length=20)
    saldo: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    estado: AccountEstado = Field(
        default="ACTIVA",
        description="Estado inicial de la cuenta; debe ser ACTIVA.",
    )


class AccountUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    estado: AccountEstado = Field(
        ...,
        description="Nuevo estado de la cuenta: ACTIVA, BLOQUEADA o CERRADA.",
    )


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_cuenta: int
    id_cliente: int
    numero_cuenta: Optional[str] = None
    tipo: Optional[str] = None
    saldo: Decimal
    estado: AccountEstado
    fecha_creacion: datetime
