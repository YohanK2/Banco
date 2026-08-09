from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ClientCreate(BaseModel):
    id_usuario: int
    nombres: str = Field(..., max_length=100)
    apellidos: str = Field(..., max_length=100)
    documento: str = Field(..., max_length=20)
    telefono: Optional[str] = Field(None, max_length=20)
    direccion: Optional[str] = None


class ClientUpdate(BaseModel):
    nombres: Optional[str] = Field(None, max_length=100)
    apellidos: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    direccion: Optional[str] = None


class ClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_cliente: int
    id_usuario: int
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    documento: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
