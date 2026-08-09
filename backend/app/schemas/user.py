from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    correo: EmailStr
    contrasena: str
    rol: str = Field(default="CLIENTE", max_length=20)


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rol: Optional[str] = Field(None, max_length=20)
    estado: Optional[bool] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_usuario: int
    correo: EmailStr
    rol: Optional[str] = None
    estado: bool
    fecha_creacion: datetime
