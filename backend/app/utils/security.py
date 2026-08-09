from passlib.context import CryptContext

# Contexto de hashing — bcrypt como algoritmo principal
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Genera el hash bcrypt de una contraseña en texto plano.
    Debe llamarse al registrar o actualizar la contraseña de un usuario.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica que una contraseña en texto plano coincide con su hash almacenado.
    Retorna True si coincide, False si no.
    """
    return pwd_context.verify(plain_password, hashed_password)
