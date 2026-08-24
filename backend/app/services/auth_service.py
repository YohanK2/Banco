from decimal import Decimal
from typing import List, Optional, Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Cliente, Cuenta, Usuario
from app.schemas.account import AccountResponse
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserMeResponse
from app.schemas.client import ClientResponse
from app.schemas.user import UserResponse
from app.services.account_service import generate_account_number
from app.utils.security import create_access_token, hash_password, verify_password


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


def authenticate_user(
    db: Session, data: LoginRequest
) -> Tuple[Optional[LoginResponse], Optional[str]]:
    """
    Valida las credenciales de un usuario y genera su token JWT:
    1. Busca el usuario por correo.
    2. Comprueba que el usuario esté activo.
    3. Valida la contraseña con bcrypt.
    4. Carga los datos de Cliente y Cuenta(s).
    5. Genera el JWT access_token.

    Retorna:
    - (LoginResponse, None) si el login es exitoso.
    - (None, "INVALID_CREDENTIALS") si usuario no existe o contraseña incorrecta.
    - (None, "USER_INACTIVE") si la cuenta está desactivada.
    """
    usuario = db.query(Usuario).filter(Usuario.correo == data.correo).first()
    if usuario is None or not verify_password(data.contrasena, usuario.contrasena_hash):
        return None, "INVALID_CREDENTIALS"

    if not usuario.estado:
        return None, "USER_INACTIVE"

    cliente = usuario.cliente
    cuenta_principal = None
    if cliente and cliente.cuentas:
        cuentas_activas = [c for c in cliente.cuentas if c.estado == "ACTIVA"]
        cuenta_principal = cuentas_activas[0] if cuentas_activas else cliente.cuentas[0]

    token_data = {
        "sub": str(usuario.id_usuario),
        "correo": usuario.correo,
        "rol": usuario.rol,
    }
    if cliente:
        token_data["id_cliente"] = cliente.id_cliente
        token_data["nombres"] = cliente.nombres
        token_data["apellidos"] = cliente.apellidos

    token = create_access_token(token_data)

    response = LoginResponse(
        access_token=token,
        token_type="bearer",
        mensaje="Inicio de sesión exitoso",
        usuario=UserResponse.model_validate(usuario),
        cliente=ClientResponse.model_validate(cliente) if cliente else None,
        cuenta=AccountResponse.model_validate(cuenta_principal) if cuenta_principal else None,
    )
    return response, None


def get_user_me(db: Session, user_id: int) -> Optional[UserMeResponse]:
    """
    Obtiene los datos completos del usuario autenticado, su cliente y sus cuentas.
    """
    usuario = db.get(Usuario, user_id)
    if usuario is None:
        return None

    cliente = usuario.cliente
    cuentas = []
    cuenta_principal = None
    if cliente and cliente.cuentas:
        cuentas = [AccountResponse.model_validate(c) for c in cliente.cuentas]
        cuentas_activas = [c for c in cliente.cuentas if c.estado == "ACTIVA"]
        cuenta_principal = AccountResponse.model_validate(cuentas_activas[0]) if cuentas_activas else cuentas[0]

    return UserMeResponse(
        usuario=UserResponse.model_validate(usuario),
        cliente=ClientResponse.model_validate(cliente) if cliente else None,
        cuentas=cuentas,
        cuenta_principal=cuenta_principal,
    )


