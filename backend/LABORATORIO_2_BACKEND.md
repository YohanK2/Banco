# LABORATORIO 2 — TESTING BACKEND CON PYTEST

> **Documento Oficial y Guía de Trabajo del Laboratorio 2**  
> **Proyecto:** Banco Digital (Banchocó)  
> **Estado de Actualización:** Agosto 2026  
> **Estado del documento:** Actualizado después de implementar los modelos SQLAlchemy y Schemas Pydantic.

---

## 1. Contexto del proyecto

El proyecto **Banco Digital (Banchocó)** es una aplicación bancaria en desarrollo.

Actualmente cuenta con:

- Frontend funcional desarrollado con React + Vite.
- Landing pública, registro, login, dashboard, transferencias, retiros, movimientos e historial.
- Datos mock en el frontend.
- Base de datos PostgreSQL definida mediante `database/banco.sql`.
- PostgreSQL ejecutándose mediante Docker Compose.
- Backend Python en construcción para este Laboratorio 2.

Durante este laboratorio el backend se desarrolla de forma independiente del frontend.

---

## 2. Estado actual

### Frontend

El frontend React + Vite continúa funcionando con datos mock.

No se deben eliminar todavía esos datos. La conexión React → API se realizará posteriormente.

### Base de datos

PostgreSQL 17 se ejecuta mediante Docker Compose.

La estructura oficial de la base de datos se encuentra en:

```text
Banco/
├── database/
│   └── banco.sql
```

**Importante:** esta es la ubicación que debe conservarse para que la ruta del `docker-compose.yml`:

```yaml
./database/banco.sql:/docker-entrypoint-initdb.d/01-banco.sql
```

siga siendo válida.

No se debe crear otro `init.sql` ni mantener copias innecesarias del `banco.sql`.

### Backend

El backend se encuentra en:

```text
backend/
```

Existe un único entorno virtual:

```text
backend/venv/
```

No crear otro entorno virtual.

Dependencias ya instaladas:

```text
fastapi
uvicorn
sqlalchemy
psycopg2-binary
pydantic
pytest
httpx
python-dotenv
```

El archivo `backend/requirements.txt` ya contiene las dependencias fijadas.

### Configuración ya realizada

- `backend/.env`
- `backend/.env.example`
- `backend/.gitignore`
- `backend/app/main.py`
- `backend/app/database/connection.py`
- `backend/app/models/` (`user.py`, `client.py`, `account.py`, `transaction.py`, `beneficiary.py`, `audit.py`, `__init__.py`)
- `backend/app/schemas/` (`auth.py`, `client.py`, `account.py`, `transaction.py`, `beneficiary.py`, `__init__.py`)

FastAPI ya fue ejecutado correctamente y la conexión `/health/db` responde `200 OK`.

---

## 3. Objetivo

El objetivo principal del **Laboratorio 2** es construir y validar una API REST bancaria utilizando:

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Pytest

---

## 4. Tecnologías

- **Python:** lenguaje del backend.
- **FastAPI:** framework para construir la API REST.
- **Uvicorn:** servidor ASGI.
- **SQLAlchemy:** ORM utilizado para trabajar con PostgreSQL.
- **psycopg2-binary:** adaptador PostgreSQL para Python.
- **Pydantic:** validación y serialización de datos.
- **Pytest:** framework de pruebas.
- **HTTPX:** soporte utilizado por `TestClient`.
- **python-dotenv:** lectura de variables desde `.env`.
- **PostgreSQL 17:** motor de base de datos ejecutándose en Docker.

---

## 5. Arquitectura del Laboratorio 2

```text
Petición HTTP / TestClient
          ↓
Routes / Controllers
          ↓
Schemas Pydantic
          ↓
Services
          ↓
Models SQLAlchemy
          ↓
Database Layer
          ↓
PostgreSQL 17
          ↓
Docker
```

---

## 6. PostgreSQL y Docker

Configuración en `docker-compose.yml`:
- `banco_postgres` (PostgreSQL 17) en puerto `5432`.
- `DB_HOST=localhost` en `backend/.env`.

---

## 7. Variables de entorno

- `backend/.env.example` (plantilla sin credenciales).
- `backend/.env` (configuración real `DB_HOST=localhost`, `DB_PORT=5432`, `DB_NAME=banco_digital`, `DB_USER=postgres`, `DB_PASSWORD=123456`).

---

## 8. Estructura actual del proyecto

```text
Banco/
│
├── database/
│   └── banco.sql
│
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── connection.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── client.py
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── beneficiary.py
│   │   │   └── audit.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── client.py
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   └── beneficiary.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── __init__.py
│   │   └── main.py
│   │
│   ├── tests/
│   ├── venv/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   └── LABORATORIO_2_BACKEND.md
│
├── frontend/
│
└── docker-compose.yml
```

---

# 9. Estructura real de `database/banco.sql`

Las 7 tablas relacionales mapeadas:
1. `usuarios` (`Usuario`, `RefreshToken`)
2. `clientes` (`Cliente`)
3. `cuentas` (`Cuenta`)
4. `transacciones` (`Transaccion`)
5. `beneficiarios` (`Beneficiario`)
6. `refresh_tokens` (`RefreshToken`)
7. `auditoria` (`Auditoria`)

---

# 10. Plan de desarrollo actualizado

## Etapas completadas
- [x] Entorno Python
- [x] Dependencias
- [x] PostgreSQL
- [x] Variables de entorno
- [x] FastAPI básico
- [x] SQLAlchemy connection
- [x] Conexión real (`/health/db`)
- [x] Modelos SQLAlchemy (`app/models/`)
- [x] Schemas Pydantic (`app/schemas/`)

## Etapas pendientes
- [ ] Implementar utilidades de seguridad (`app/utils/security.py`) ← SIGUIENTE
- [ ] Dependencia `get_db`
- [ ] Servicios
- [ ] Autenticación
- [ ] CRUD de clientes
- [ ] Cuentas
- [ ] Depósitos
- [ ] Retiros
- [ ] Transferencias
- [ ] Historial
- [ ] Beneficiarios
- [ ] Fixtures Pytest
- [ ] Pruebas unitarias e integración

---

# 12. Modelos SQLAlchemy (Implementados)

Los modelos ORM se han creado exitosamente en la carpeta `backend/app/models/` tomando como fuente exclusiva la estructura real de `database/banco.sql`.

---

# 13. Schemas Pydantic (Implementados)

Los esquemas de validación se han creado exitosamente en la carpeta `backend/app/schemas/` para garantizar la validación de entrada/salida de la API REST utilizando Pydantic v2:

| Módulo | Archivo | Schemas Pydantic Implementados | Función |
|---|---|---|---|
| Autenticación | `app/schemas/auth.py` | `LoginRequest`, `TokenResponse`, `RefreshTokenRequest` | Validación de credenciales de entrada y contrato de tokens de respuesta |
| Clientes | `app/schemas/client.py` | `ClientCreate`, `ClientUpdate`, `ClientResponse` | Validación para registro, actualización y respuesta de perfiles de clientes |
| Cuentas | `app/schemas/account.py` | `AccountCreate`, `AccountResponse` | Validación para creación y consulta de cuentas bancarias |
| Transacciones | `app/schemas/transaction.py` | `DepositRequest`, `WithdrawalRequest`, `TransferRequest`, `TransactionResponse` | Validaciones estrictas de montos positivos (`gt=0`) para depósitos, retiros y transferencias atómicas |
| Beneficiarios | `app/schemas/beneficiary.py` | `BeneficiaryCreate`, `BeneficiaryResponse` | Validación para libreta de contactos / beneficiarios frecuentes |

---

# 23. Estado y checklist

## Completado

- [x] Entorno virtual Python configurado.
- [x] Dependencias instaladas (`requirements.txt`).
- [x] `.gitignore` y `.env` configurados.
- [x] PostgreSQL configurado en Docker.
- [x] `database/banco.sql` definido como SQL oficial.
- [x] FastAPI funcionando.
- [x] SQLAlchemy configurado (`connection.py`).
- [x] Endpoint `/health/db` comprobado con respuesta `200 OK`.
- [x] Estructura real de `database/banco.sql` analizada.
- [x] Crear modelos SQLAlchemy (`app/models/`: `Usuario`, `RefreshToken`, `Cliente`, `Cuenta`, `Transaccion`, `Beneficiario`, `Auditoria`).
- [x] Verificar modelos y relaciones ORM.
- [x] Crear schemas Pydantic (`app/schemas/`: `auth.py`, `client.py`, `account.py`, `transaction.py`, `beneficiary.py`).

## Pendiente

- [ ] Implementar utilidades de seguridad (`app/utils/security.py`).
- [ ] Crear dependencia `get_db`.
- [ ] Crear servicios (`app/services/`).
- [ ] Implementar autenticación.
- [ ] Implementar CRUD de clientes.
- [ ] Implementar cuentas.
- [ ] Implementar depósitos.
- [ ] Implementar retiros.
- [ ] Implementar transferencias.
- [ ] Implementar historial.
- [ ] Implementar beneficiarios.
- [ ] Crear fixtures (`tests/conftest.py`).
- [ ] Crear pruebas unitarias e integración.
- [ ] Ejecutar suite completa.

---

# 24. Próximo paso

El siguiente paso técnico es:

## Crear utilidades de seguridad (`backend/app/utils/security.py`)

Ubicación:
```text
backend/app/utils/security.py
```

Implementar las funciones de hashing de contraseñas (usando `passlib` / `bcrypt`), verificación de hashes y creación/validación de tokens JWT para la autenticación segura de usuarios.
