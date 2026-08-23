import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.models import Usuario, Cliente, Cuenta
import app.services.auth_service as auth_service_module


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_successful_auth_registration(client, db):
    email = "juan.registro.auth@banchoco.com"
    doc = "7778889999"

    # Limpieza previa por si existe
    u_prev = db.query(Usuario).filter(Usuario.correo == email).first()
    if u_prev:
        if u_prev.cliente:
            for acc in u_prev.cliente.cuentas:
                db.delete(acc)
            db.delete(u_prev.cliente)
        db.delete(u_prev)
        db.commit()

    payload = {
        "nombres": "Juan de Jesús",
        "apellidos": "Pérez Gómez",
        "documento": doc,
        "telefono": "3001234567",
        "direccion": "Quibdó, Chocó",
        "correo": email,
        "contrasena": "Password123",
        "confirmar_contrasena": "Password123",
        "tipo_cuenta": "AHORROS",
    }

    try:
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 201
        data = response.json()

        assert data["mensaje"] == "Registro completado correctamente"

        # Validar usuario
        assert data["usuario"]["correo"] == email
        assert data["usuario"]["rol"] == "CLIENTE"
        assert data["usuario"]["estado"] is True
        assert "contrasena" not in data["usuario"]
        assert "contrasena_hash" not in data["usuario"]

        user_id = data["usuario"]["id_usuario"]
        client_id = data["cliente"]["id_cliente"]
        account_id = data["cuenta"]["id_cuenta"]

        # Validar cliente
        assert data["cliente"]["id_usuario"] == user_id
        assert data["cliente"]["nombres"] == "Juan de Jesús"
        assert data["cliente"]["apellidos"] == "Pérez Gómez"
        assert data["cliente"]["documento"] == doc
        assert data["cliente"]["telefono"] == "3001234567"
        assert data["cliente"]["direccion"] == "Quibdó, Chocó"

        # Validar cuenta
        assert data["cuenta"]["id_cliente"] == client_id
        assert len(data["cuenta"]["numero_cuenta"]) == 10
        assert data["cuenta"]["numero_cuenta"].isdigit()
        assert Decimal(str(data["cuenta"]["saldo"])) == Decimal("0.00")
        assert data["cuenta"]["estado"] == "ACTIVA"

        # Comprobar directamente en PostgreSQL
        db_user = db.get(Usuario, user_id)
        assert db_user is not None
        assert db_user.correo == email

        db_client = db.get(Cliente, client_id)
        assert db_client is not None
        assert db_client.id_usuario == user_id
        assert db_client.documento == doc

        db_account = db.get(Cuenta, account_id)
        assert db_account is not None
        assert db_account.id_cliente == client_id
        assert db_account.numero_cuenta == data["cuenta"]["numero_cuenta"]
        assert db_account.saldo == Decimal("0.00")
        assert db_account.estado == "ACTIVA"

    finally:
        # Cleanup
        u = db.query(Usuario).filter(Usuario.correo == email).first()
        if u:
            if u.cliente:
                for acc in u.cliente.cuentas:
                    db.delete(acc)
                db.delete(u.cliente)
            db.delete(u)
            db.commit()


def test_successful_users_endpoint_registration(client, db):
    email = "juan.users.endpoint@banchoco.com"
    doc = "8889991112"

    payload = {
        "nombres": "Pedro",
        "apellidos": "Gómez",
        "documento": doc,
        "telefono": "3105557788",
        "direccion": "Calle Central 10",
        "correo": email,
        "contrasena": "Password123",
        "confirmar_contrasena": "Password123",
    }

    try:
        response = client.post("/users", json=payload)
        assert response.status_code == 201
        data = response.json()

        assert data["mensaje"] == "Registro completado correctamente"
        assert data["usuario"]["correo"] == email
        assert data["cliente"]["documento"] == doc
        assert len(data["cuenta"]["numero_cuenta"]) == 10
        assert data["cuenta"]["estado"] == "ACTIVA"

        # Verificar en base de datos
        db_user = db.query(Usuario).filter(Usuario.correo == email).first()
        assert db_user is not None
        assert db_user.cliente is not None
        assert len(db_user.cliente.cuentas) == 1
    finally:
        u = db.query(Usuario).filter(Usuario.correo == email).first()
        if u:
            if u.cliente:
                for acc in u.cliente.cuentas:
                    db.delete(acc)
                db.delete(u.cliente)
            db.delete(u)
            db.commit()



def test_password_mismatch(client):
    payload = {
        "nombres": "Juan",
        "apellidos": "Pérez",
        "documento": "12345678",
        "telefono": "3001234567",
        "direccion": "Calle 1",
        "correo": "mismatch@banchoco.com",
        "contrasena": "Password123",
        "confirmar_contrasena": "Password999",
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422
    assert "Las contraseñas no coinciden" in response.text


def test_missing_mandatory_fields(client):
    # Faltan teléfono y dirección
    payload = {
        "nombres": "Juan",
        "apellidos": "Pérez",
        "documento": "12345678",
        "correo": "missing@banchoco.com",
        "contrasena": "Password123",
        "confirmar_contrasena": "Password123",
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422


def test_duplicate_email(client, db):
    email = "dup.email.auth@banchoco.com"
    doc1 = "6665554441"
    doc2 = "6665554442"

    try:
        res1 = client.post(
            "/auth/register",
            json={
                "nombres": "User One",
                "apellidos": "Test",
                "documento": doc1,
                "telefono": "3001112233",
                "direccion": "Carrera 1",
                "correo": email,
                "contrasena": "Password123",
                "confirmar_contrasena": "Password123",
            },
        )
        assert res1.status_code == 201

        res2 = client.post(
            "/auth/register",
            json={
                "nombres": "User Two",
                "apellidos": "Test",
                "documento": doc2,
                "telefono": "3004445566",
                "direccion": "Carrera 2",
                "correo": email,
                "contrasena": "Password123",
                "confirmar_contrasena": "Password123",
            },
        )
        assert res2.status_code == 409
        assert "correo ya se encuentra registrado" in res2.json()["detail"]

    finally:
        for d in [doc1, doc2]:
            c = db.query(Cliente).filter(Cliente.documento == d).first()
            if c:
                for a in c.cuentas:
                    db.delete(a)
                u = c.usuario
                db.delete(c)
                if u:
                    db.delete(u)
                db.commit()


def test_duplicate_document(client, db):
    email1 = "doc1.auth@banchoco.com"
    email2 = "doc2.auth@banchoco.com"
    doc = "5556667779"

    try:
        res1 = client.post(
            "/auth/register",
            json={
                "nombres": "Doc One",
                "apellidos": "Test",
                "documento": doc,
                "telefono": "3001112233",
                "direccion": "Carrera 1",
                "correo": email1,
                "contrasena": "Password123",
                "confirmar_contrasena": "Password123",
            },
        )
        assert res1.status_code == 201

        res2 = client.post(
            "/auth/register",
            json={
                "nombres": "Doc Two",
                "apellidos": "Test",
                "documento": doc,
                "telefono": "3004445566",
                "direccion": "Carrera 2",
                "correo": email2,
                "contrasena": "Password123",
                "confirmar_contrasena": "Password123",
            },
        )
        assert res2.status_code == 409
        assert "documento de identidad ya se encuentra registrado" in res2.json()["detail"]

    finally:
        for em in [email1, email2]:
            u = db.query(Usuario).filter(Usuario.correo == em).first()
            if u:
                if u.cliente:
                    for a in u.cliente.cuentas:
                        db.delete(a)
                    db.delete(u.cliente)
                db.delete(u)
                db.commit()


def test_atomic_rollback(client, db):
    email = "atomic.rollback.auth@banchoco.com"
    doc = "1112223339"

    original_gen = auth_service_module.generate_account_number

    def failing_gen(_db):
        raise RuntimeError("Simulated failure during account creation")

    auth_service_module.generate_account_number = failing_gen

    try:
        res = client.post(
            "/auth/register",
            json={
                "nombres": "Fail",
                "apellidos": "Tester",
                "documento": doc,
                "telefono": "3009998877",
                "direccion": "Avenida 3",
                "correo": email,
                "contrasena": "Password123",
                "confirmar_contrasena": "Password123",
            },
        )
        assert res.status_code == 500

        # Verificar que no existen registros huérfanos en la base de datos
        db_user = db.query(Usuario).filter(Usuario.correo == email).first()
        assert db_user is None

        db_client = db.query(Cliente).filter(Cliente.documento == doc).first()
        assert db_client is None

    finally:
        auth_service_module.generate_account_number = original_gen
