from decimal import Decimal
import secrets
from typing import Optional, Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Cliente, Cuenta, Usuario
from app.schemas.account import AccountResponse
from app.schemas.auth import LoginResponse, RegisterRequest, RegisterResponse
from app.schemas.client import ClientResponse
from app.schemas.user import UserResponse
from app.services.account_service import generate_account_number
from app.utils.security import hash_password, verify_password


def register_client(
    db: Session, data: RegisterRequest
) -> Tuple[Optional[RegisterResponse], Optional[str]]:
    """
    Ejecuta el flujo integral de registro de un nuevo cliente dentro de una
    única transacción atómica de base de datos:

    1. Verifica unicidad de correo y documento.
    2. Crea el Usuario con contraseña hasheada (rol CLIENTE, estado True).
    3. Crea el Cliente asociado al id_usuario recién generado.
    4. Genera automáticamente el número de cuenta único (10 dígitos).
    5. Crea la Cuenta bancaria (saldo 0.00, estado ACTIVA) asociada al id_cliente.
    6. Realiza un único COMMIT. Si cualquier paso falla, ejecuta ROLLBACK total.

    Retorna:
    - (RegisterResponse, None) si el registro fue exitoso.
    - (None, "EMAIL_EXISTS") si el correo ya está registrado.
    - (None, "DOCUMENT_EXISTS") si el documento ya está registrado.
    - (None, "DB_ERROR") ante cualquier fallo de base de datos.
    """
    # 1. Validaciones previas de unicidad
    if db.query(Usuario).filter(Usuario.correo == data.correo).first() is not None:
        return None, "EMAIL_EXISTS"

    if db.query(Cliente).filter(Cliente.documento == data.documento).first() is not None:
        return None, "DOCUMENT_EXISTS"

    # 2. Transacción atómica
    try:
        # Paso 1: Crear Usuario
        usuario = Usuario(
            correo=data.correo,
            contrasena_hash=hash_password(data.contrasena),
            rol="CLIENTE",
            estado=True,
        )
        db.add(usuario)
        db.flush()  # Obtiene usuario.id_usuario sin commit definitivo

        # Paso 2: Crear Cliente
        cliente = Cliente(
            id_usuario=usuario.id_usuario,
            nombres=data.nombres.strip(),
            apellidos=data.apellidos.strip(),
            documento=data.documento.strip(),
            telefono=data.telefono.strip() if data.telefono else None,
            direccion=data.direccion.strip() if data.direccion else None,
        )
        db.add(cliente)
        db.flush()  # Obtiene cliente.id_cliente

        # Paso 3: Generar número de cuenta y Crear Cuenta
        numero_cuenta = generate_account_number(db)
        cuenta = Cuenta(
            id_cliente=cliente.id_cliente,
            numero_cuenta=numero_cuenta,
            tipo=data.tipo_cuenta or "AHORROS",
            saldo=Decimal("0.00"),
            estado="ACTIVA",
        )
        db.add(cuenta)
        db.flush()  # Obtiene cuenta.id_cuenta

        # Paso 4: Confirmar transacción completa
        db.commit()

        # Refrescar instancias para respuesta
        db.refresh(usuario)
        db.refresh(cliente)
        db.refresh(cuenta)

        resultado = RegisterResponse(
            mensaje="Registro completado correctamente",
            usuario=UserResponse.model_validate(usuario),
            cliente=ClientResponse.model_validate(cliente),
            cuenta=AccountResponse.model_validate(cuenta),
        )
        return resultado, None

    except IntegrityError:
        db.rollback()
        return None, "DB_ERROR"
    except Exception:
        db.rollback()
        return None, "DB_ERROR"


def login_user(
    db: Session, correo: str, contrasena: str
) -> Tuple[Optional[LoginResponse], Optional[str]]:
    """
    Autentica a un usuario por correo y contraseña.

    Retorna:
    - (LoginResponse, None) si las credenciales son válidas.
    - (None, "INVALID_CREDENTIALS") si el correo no existe o la contraseña no coincide.
    - (None, "USER_DISABLED") si el usuario está inactivo.
    - (None, "DB_ERROR") ante cualquier fallo de base de datos.
    """
    try:
        usuario = (
            db.query(Usuario)
            .filter(Usuario.correo == correo.strip().lower())
            .first()
        )
        if usuario is None or not verify_password(contrasena, usuario.contrasena_hash):
            return None, "INVALID_CREDENTIALS"

        if not usuario.estado:
            return None, "USER_DISABLED"

        cliente = (
            db.query(Cliente).filter(Cliente.id_usuario == usuario.id_usuario).first()
        )
        cuenta = None
        if cliente is not None:
            cuenta = (
                db.query(Cuenta)
                .filter(Cuenta.id_cliente == cliente.id_cliente)
                .first()
            )

        resultado = LoginResponse(
            access_token=secrets.token_hex(32),
            usuario=UserResponse.model_validate(usuario),
            cliente=ClientResponse.model_validate(cliente) if cliente else None,
            cuenta=AccountResponse.model_validate(cuenta) if cuenta else None,
        )
        return resultado, None

    except Exception:
        return None, "DB_ERROR"

