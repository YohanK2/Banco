from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.schemas.account import AccountResponse
from app.schemas.client import ClientResponse
from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    correo: EmailStr
    rol: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    mensaje: str = "Inicio de sesión exitoso"
    usuario: UserResponse
    cliente: Optional[ClientResponse] = None
    cuenta: Optional[AccountResponse] = None


class UserMeResponse(BaseModel):
    usuario: UserResponse
    cliente: Optional[ClientResponse] = None
    cuentas: List[AccountResponse] = []
    cuenta_principal: Optional[AccountResponse] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str



class RegisterRequest(BaseModel):

    # Datos personales del cliente
    nombres: str = Field(..., min_length=2, max_length=100, description="Nombres del cliente")
    apellidos: str = Field(..., min_length=2, max_length=100, description="Apellidos del cliente")
    documento: str = Field(..., min_length=5, max_length=20, description="Número de documento de identidad")
    telefono: str = Field(..., min_length=7, max_length=20, description="Teléfono de contacto")
    direccion: str = Field(..., min_length=3, max_length=255, description="Dirección de residencia")

    # Datos de acceso del usuario
    correo: EmailStr = Field(..., description="Correo electrónico del usuario")
    contrasena: str = Field(..., min_length=8, description="Contraseña de acceso (mínimo 8 caracteres)")
    confirmar_contrasena: str = Field(..., min_length=8, description="Confirmación de la contraseña")
    tipo_cuenta: Optional[str] = Field(default="AHORROS", max_length=20)

    @model_validator(mode="after")
    def verify_passwords_match(self) -> "RegisterRequest":
        if self.contrasena != self.confirmar_contrasena:
            raise ValueError("Las contraseñas no coinciden.")
        return self


class RegisterResponse(BaseModel):
    mensaje: str = "Registro completado correctamente"
    usuario: UserResponse
    cliente: ClientResponse
    cuenta: AccountResponse


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UserResponse
    cliente: Optional[ClientResponse] = None
    cuenta: Optional[AccountResponse] = None


