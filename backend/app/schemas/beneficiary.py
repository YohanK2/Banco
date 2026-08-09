from typing import Optional
from pydantic import BaseModel, ConfigDict


class BeneficiaryCreate(BaseModel):
    id_cliente: int
    numero_cuenta_destino: str
    alias: str


class BeneficiaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_beneficiario: int
    id_cliente: int
    cuenta_destino: int
    alias: Optional[str] = None
