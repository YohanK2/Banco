from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_full_banking_flow():
    # Use unique identifiers to avoid conflicts with existing data
    import time
    unique_suffix = int(time.time() * 1000)
    
    # 1. Register User 1
    user1_email = f"ana.flow.{unique_suffix}@banchoco.com"
    user1_doc = f"109988{unique_suffix % 100000:05d}"
    reg1_payload = {
        "nombres": "Ana",
        "apellidos": "Gómez",
        "documento": user1_doc,
        "telefono": "3101234567",
        "direccion": "Cra 5 # 10-20",
        "correo": user1_email,
        "contrasena": "password123",
        "confirmar_contrasena": "password123",
        "tipo_cuenta": "AHORROS",
    }
    reg1_res = client.post("/auth/register", json=reg1_payload)
    assert reg1_res.status_code == 201
    reg1_data = reg1_res.json()
    assert reg1_data["usuario"]["correo"] == user1_email
    assert reg1_data["cliente"]["nombres"] == "Ana"
    account1_number = reg1_data["cuenta"]["numero_cuenta"]
    account1_id = reg1_data["cuenta"]["id_cuenta"]
    assert account1_number is not None
    assert Decimal(str(reg1_data["cuenta"]["saldo"])) == Decimal("0.00")

    # 2. Login User 1 -> Check JWT and Session Data
    login_payload = {
        "correo": user1_email,
        "contrasena": "password123",
    }
    login_res = client.post("/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    token = login_data["access_token"]
    assert login_data["usuario"]["correo"] == user1_email
    assert login_data["cliente"]["nombres"] == "Ana"
    assert login_data["cuenta"]["numero_cuenta"] == account1_number

    # 3. Test /auth/me with JWT Bearer Token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["usuario"]["correo"] == user1_email
    assert me_data["cliente"]["documento"] == user1_doc
    assert me_data["cuenta_principal"]["numero_cuenta"] == account1_number

    # 4. Deposit into User 1 Account
    dep_payload = {
        "numero_cuenta": account1_number,
        "monto": 500000.00,
        "descripcion": "Depósito inicial de nómina",
    }
    dep_res = client.post("/transactions/deposit", json=dep_payload)
    assert dep_res.status_code == 201
    dep_data = dep_res.json()
    assert dep_data["tipo"] == "DEPOSITO"

    # Verify balance is now 500,000
    acc_res = client.get(f"/accounts/{account1_id}")
    assert acc_res.status_code == 200
    assert Decimal(str(acc_res.json()["saldo"])) == Decimal("500000.00")

    # 5. Withdraw from User 1 Account
    with_payload = {
        "numero_cuenta": account1_number,
        "monto": 100000.00,
        "descripcion": "Retiro cajero centro",
    }
    with_res = client.post("/transactions/withdraw", json=with_payload)
    assert with_res.status_code == 201

    # Verify balance is now 400,000
    acc_res = client.get(f"/accounts/{account1_id}")
    assert Decimal(str(acc_res.json()["saldo"])) == Decimal("400000.00")

    # 6. Register User 2 to test transfer
    user2_email = f"pedro.flow.{unique_suffix}@banchoco.com"
    user2_doc = f"109988{(unique_suffix + 1) % 100000:05d}"
    reg2_payload = {
        "nombres": "Pedro",
        "apellidos": "Murillo",
        "documento": user2_doc,
        "telefono": "3119876543",
        "direccion": "Calle 20 # 4-50",
        "correo": user2_email,
        "contrasena": "password123",
        "confirmar_contrasena": "password123",
        "tipo_cuenta": "AHORROS",
    }
    reg2_res = client.post("/auth/register", json=reg2_payload)
    assert reg2_res.status_code == 201
    account2_number = reg2_res.json()["cuenta"]["numero_cuenta"]
    account2_id = reg2_res.json()["cuenta"]["id_cuenta"]

    # 7. Transfer 150,000 from User 1 to User 2
    trans_payload = {
        "cuenta_origen": account1_number,
        "cuenta_destino": account2_number,
        "monto": 150000.00,
        "descripcion": "Pago de servicios compartidos",
    }
    trans_res = client.post("/transactions/transfer", json=trans_payload)
    assert trans_res.status_code == 201

    # Verify User 1 balance: 400,000 - 150,000 = 250,000
    acc1_res = client.get(f"/accounts/{account1_id}")
    assert Decimal(str(acc1_res.json()["saldo"])) == Decimal("250000.00")

    # Verify User 2 balance: 0 + 150,000 = 150,000
    acc2_res = client.get(f"/accounts/{account2_id}")
    assert Decimal(str(acc2_res.json()["saldo"])) == Decimal("150000.00")

    # 8. Check Statement & Transactions History
    stmt_res = client.get(f"/transactions/account/{account1_id}/statement")
    assert stmt_res.status_code == 200
    stmt_data = stmt_res.json()
    assert Decimal(str(stmt_data["saldo_actual"])) == Decimal("250000.00")
    assert Decimal(str(stmt_data["total_depositos"])) == Decimal("500000.00")
    assert Decimal(str(stmt_data["total_retiros"])) == Decimal("100000.00")
    assert Decimal(str(stmt_data["total_transferencias_enviadas"])) == Decimal("150000.00")
    assert len(stmt_data["movimientos"]) == 3
