# Resumen Actual Final — Backend Banco Digital (Banchocó)

> Documento de referencia del **estado real y completo** del backend al cierre del Laboratorio 2.
> Fecha: 2026-08-08. Reemplaza/actualiza los docs previos del proyecto (`contexto_y_pasos...`,
> `LABORATORIO_2_BACKEND*.md`, `progreso_laboratorio_2.md`, `resumen-proyecto.md`,
> `estado_actual_y_hallazgos_backend.md`), que están desactualizados respecto de lo implementado.

---

## 1. Contexto general

Proyecto **Banco Digital / Banchocó** (Laboratorio 2): API REST bancaria construida con **FastAPI + SQLAlchemy + PostgreSQL**, con arquitectura limpia de **routes → services**, validación **Pydantic v2** y hashing de contraseñas funcional. El frontend (React + Vite) está terminado con datos mock y quedará conectado a esta API en etapas posteriores.

- **BD oficial**: `database/banco.sql` (la raíz). ⚠️ La copia `backend/app/database/banco.sql` es un duplicado que se mantiene sincronizado.
- **PostgreSQL 17** corre en Docker: contenedor `banco_postgres`, db `banco_digital`, user `postgres`, pass `123456`, puerto `5432`.
- **Entorno Python**: venv en `backend/venv/` (Python 3.13). Dependencias en `backend/requirements.txt` (UTF-8, incluye `bcrypt==4.0.1` — requerido por `passlib==1.7.4`).

---

## 2. Base de datos (esquema)

Tablas definidas en `database/banco.sql` (respetadas por el ORM):

| Tabla | Columnas clave |
|---|---|
| `usuarios` | id_usuario PK, correo UNIQUE, contrasena_hash, rol (default `CLIENTE`), estado (bool), fecha_creacion |
| `clientes` | id_cliente PK, id_usuario UNIQUE FK→usuarios, nombres, apellidos, documento UNIQUE, telefono, direccion |
| `cuentas` | id_cuenta PK, id_cliente FK→clientes, numero_cuenta UNIQUE, tipo, saldo NUMERIC(12,2), **estado**, fecha_creacion |
| `transacciones` | id_transaccion PK, cuenta_origen FK→cuentas (nullable), cuenta_destino FK→cuentas (nullable), tipo, monto, descripcion, fecha |
| `beneficiarios` | id_beneficiario PK, id_cliente FK, cuenta_destino FK, alias |
| `refresh_tokens` | id_token PK, id_usuario FK, token, fecha_expiracion, activo |
| `auditoria` | id_evento PK, id_usuario FK, accion, descripcion, ip, fecha |

### Evolución aplicada (decisión de la Etapa 13)
`cuentas.estado` pasó de `BOOLEAN DEFAULT TRUE` a **`VARCHAR(20) DEFAULT 'ACTIVA'`** con
**CHECK (estado IN ('ACTIVA','BLOQUEADA','CERRADA'))** — decisión tomada con el usuario porque la regla
de negocio exige 3 estados y el booleano solo distingue 2. Migración ya aplicada a la BD viva con `ALTER TABLE`
(FALSE→'CERRADA') y reflejada en `database/banco.sql` y en el duplicado de `backend/app/database/banco.sql`.
`usuarios.estado` sigue siendo BOOLEAN (intacto).

---

## 3. Estructura del backend

```text
backend/
├── app/
│   ├── main.py                        → FastAPI + registros de routers + /, /health, /health/db
│   ├── database/
│   │   ├── connection.py              → engine, SessionLocal, Base, get_db, check_connection
│   │   └── banco.sql                  → duplicado de la BD oficial (mantener sincronizado)
│   ├── models/                        → 7 modelos SQLAlchemy (user, client, account, transaction, beneficiary, audit)
│   ├── schemas/                       → Pydantic v2 (client, account, user, transaction, auth, beneficiary)
│   ├── routes/                        → client.py, account.py, user.py, transaction.py (+ __init__.py)
│   ├── services/                      → client_service.py, account_service.py, user_service.py,
│   │                                    transaction_service.py, auth_service.py (base), beneficiary_service.py (base)
│   └── utils/security.py              → hash_password / verify_password (bcrypt vía passlib, funcional)
├── tests/                             → pendiente de crear (Etapa Pytest)
├── venv/
├── requirements.txt
├── .env / .env.example / .gitignore
└── *.md                               → documentación (este documento es el actualizado)
```

### Capa de servicios (`app/services/`)
Los servicios reciben `db: Session` por inyección, contienen **toda** la lógica de negocio y devuelven
`None` (no excepciones) para recursos inexistentes/reglas no cumplidas; la ruta traduce a HTTP. Las
operaciones que tocan saldo usan `with_for_update()` y `commit`/`rollback` atómico.

| Módulo | Funciones |
|---|---|
| `client_service.py` | `create_client`, `get_clients`, `get_client_by_id`, `update_client`, `delete_client` |
| `account_service.py` | `create_account`, `get_accounts`, `get_account_by_id`, `update_account_state` |
| `user_service.py` | `create_user`, `get_users`, `get_user_by_id`, `update_user` |
| `transaction_service.py` | `deposit`, `withdraw`, `transfer`, `get_transactions`, `get_transaction_by_id`, `get_account_transactions`, `get_account_statement` |
| `auth_service.py` | estructura base (futuro login/JWT) |
| `beneficiary_service.py` | estructura base (futuro CRUD beneficiarios) |

### Schemas (`app/schemas/`)
- **client.py**: `ClientCreate`, `ClientUpdate`, `ClientResponse` (`from_attributes`).
- **account.py**: `AccountEstado = Literal["ACTIVA","BLOQUEADA","CERRADA"]`, `AccountCreate` (saldo `ge=0`),
  `AccountUpdate` (solo `estado`, con `extra="forbid"`), `AccountResponse`.
- **user.py**: `UserCreate` (correo `EmailStr`, contrasena, rol default `CLIENTE`), `UserUpdate` (solo
  `rol`/`estado`, `extra="forbid"`), `UserResponse` (sin `contrasena_hash`).
- **transaction.py**: `DepositRequest`, `WithdrawalRequest`, `TransferRequest` (monto `gt=0`, se usan
  números de cuenta), `TransactionResponse`, `TransactionStatement`.
- **auth.py**: `LoginRequest`, `TokenResponse`, `RefreshTokenRequest` (para la Etapa de autenticación).

---

## 4. Endpoints implementados y verificados (uvicorn real)

### Usuarios — `app/routes/user.py` (prefix `/users`, tag "Usuarios")
| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| POST | `/users` | 201 (rol default CLIENTE; nunca expone hash) | 409 correo duplicado; 422 email/rol inválido |
| GET | `/users` | 200 lista | — |
| GET | `/users/{id}` | 200 | 404 |
| PUT | `/users/{id}` | 200 (solo rol/estado) | 404; 422 si envía correo/contrasena (extra="forbid") |

### Clientes — `app/routes/client.py` (prefix `/clients`, tag "Clientes")
| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| POST | `/clients` | 201 | 400 usuario inexistente o documento duplicado |
| GET | `/clients` | 200 lista | — |
| GET | `/clients/{id}` | 200 | 404 |
| PUT | `/clients/{id}` | 200 | 404 |
| DELETE | `/clients/{id}` | 204 | 404; 409 si tiene cuentas/beneficiarios (FK) |

### Cuentas — `app/routes/account.py` (prefix `/accounts`, tag "Cuentas")
| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| POST | `/accounts` | 201 (estado inicial forzado ACTIVA) | 400 cliente inexistente / número duplicado / estado inicial ≠ ACTIVA; 422 saldo negativo |
| GET | `/accounts` | 200 lista | — |
| GET | `/accounts/{id}` | 200 | 404 |
| PUT | `/accounts/{id}` | 200 (solo estado) | 404; 422 campos extra |

> No hay DELETE de cuentas: solo se cambia el estado (BLOQUEADA/CERRADA).

### Transacciones — `app/routes/transaction.py` (prefix `/transactions`, tag "Transacciones")
| Método | Ruta | Éxito | Errores |
|---|---|---|---|
| POST | `/transactions/deposit` | 201 | 400 cuenta inexistente/no activa; 422 monto ≤ 0 |
| POST | `/transactions/withdraw` | 201 | 400 cuenta inexistente/no activa/saldo insuficiente; 422 monto ≤ 0 |
| POST | `/transactions/transfer` | 201 | 400 misma cuenta/cuentas inexistentes/no activas/saldo insuficiente; 422 monto ≤ 0 |
| GET | `/transactions` | 200 lista (fecha desc) | — |
| GET | `/transactions/account/{id}/statement` | 200 estado de cuenta | 404 cuenta inexistente |
| GET | `/transactions/account/{id}` | 200 historial (origen o destino, fecha desc) | 404 cuenta inexistente |
| GET | `/transactions/{id}` | 200 | 404 |

> ⚠️ Orden de declaración en el router: `/account/...` se declara **antes** de `/{transaction_id}`.

### Otros — `app/main.py`
- `GET /` → mensaje de bienvenida; `GET /health` → ok; `GET /health/db` → `connected`/`503`.
- Documentación interactiva en `/docs` (Swagger UI).

---

## 5. Reglas de negocio implementadas

**Depósito**: monto > 0 · cuenta existe · estado ACTIVA · saldo aumenta · registra tipo `DEPOSITO`
(`cuenta_destino` = cuenta, `cuenta_origen` = NULL) · atómico con rollback.

**Retiro**: monto > 0 · cuenta existe · ACTIVA · saldo suficiente **antes** de retirar · saldo disminuye ·
registra tipo `RETIRO` (`cuenta_origen` = cuenta, `cuenta_destino` = NULL) · atómico con rollback.

**Transferencia**: origen y destino existen · ambas ACTIVA · monto > 0 · saldo suficiente en origen ·
**no misma cuenta** · saldo origen −=, saldo destino += · registra tipo `TRANSFERENCIA` con ambos ids ·
atómico con rollback.

**Historial**: solo lectura (las transacciones son **inmutables**) · orden por fecha descendente ·
404 si la cuenta/transacción no existe.

**Estado de cuenta** (`/statement`): información de la cuenta + saldo actual + totales de depósitos,
retiros, transferencias enviadas y recibidas + movimientos cronológicos + fecha inicio/fin del reporte.

---

## 6. Smoke tests ejecutados (resumen)

Todos los módulos se probaron contra uvicorn real con datos temporales creados vía API y **limpiados después**
(la BD quedó sin residuos de prueba):

- **Usuarios (14/14)**: 201 creación (rol CLIENTE y ADMIN), respuesta sin `contrasena`, 409 duplicado, 422 email inválido,
  GET lista/detalle, PUT rol/estado (200), PUT correo/contrasena → 422, 404 inexistente. `verify_password` True/False correctos.
- **Clientes**: 201/200/404/400 (usuario inexistente, documento duplicado), PUT 200/404, DELETE 204/404/409.
- **Cuentas**: 201, estado inicial ACTIVA, 400 cliente inexistente/número duplicado/estado≠ACTIVA, 422 saldo negativo/estado inválido,
  PUT solo estado con ciclo BLOQUEADA→CERRADA→ACTIVA, 422 campos extra.
- **Depósitos (9/9)**: saldo 100→250.50, tx `DEPOSITO` persistida, 400 inexistente/bloqueada, 422 monto 0/negativo, rollback verificado.
- **Retiros (10/10)**: saldo 1000→749.50→0.00 (monto exacto permitido), 400 insuficiente/inexistente/bloqueada/cerrada, 422, rollback verificado.
- **Transferencias (13/13)**: origen 1000→700→0, destino 200→500→1200, 400 misma cuenta/inexistentes/insuficiente/no activas, 422, rollback verificado.
- **Historial (15/15)**: listado desc, GET por id, historial por cuenta (origen o destino), statement con totales exactos (A: dep 100/ret 200/env 50/rec 0, saldo 850; B: dep 300/ret 25/env 0/rec 50, saldo 825), 404s.

---

## 7. Estado actual de la BD (datos externos)

Existe **datos semilla externos** (no creados por las pruebas) que se deben conservar:
- Usuario `juan@banchoco.com` (id 4) + cliente (doc `987654321`) + cuenta `1000000001` (id 3, saldo 500000, estado BLOQUEADA) + varias transacciones (DEPOSITO/RETIRO) asociadas.

---

## 8. Próximos pasos (en orden sugerido)

1. **Etapa de Autenticación (JWT)** — completar `app/services/auth_service.py` + crear `app/routes/auth.py`:
   `POST /auth/login` (verifica `verify_password`, genera access/refresh token), `POST /auth/logout`,
   registro unificado usuario+cliente, refresco de tokens. Ya existen los schemas `LoginRequest`,
   `TokenResponse`, `RefreshTokenRequest` y la tabla `refresh_tokens`. Preparar dependencia de
   `get_current_user` para proteger rutas.
2. **Beneficiarios** — completar `beneficiary_service.py` + `app/routes/beneficiary.py`:
   `POST/GET/GET{id}/PUT/DELETE /beneficiaries` (tabla `beneficiarios` ya existe).
3. **CORS** — agregar `CORSMiddleware` en `main.py` para permitir el frontend React (otro puerto).
4. **Pytest** — crear `backend/tests/` (hoy no existe) con `conftest.py` + fixtures (usuario, cliente,
   cuenta, transacción, BD de prueba) y test_*.py (auth, clients, accounts, deposits, withdrawals,
   transfers, transactions, history) con casos positivos/negativos/límite (monto 0, negativo, exacto al saldo).
5. **Reporte de pruebas y limpieza de documentación** — consolidar la doc (varios archivos `.md` están
   desactualizados; este documento es la fuente de verdad).
6. **Conexión del frontend** — sustituir los mocks por llamadas `axios` a la API (`/api/...`), usando
   los endpoints listados en la sección 4 y guardando `user` + `token` en localStorage.

### Comandos útiles

```bash
# BD
docker compose up -d            # Postgres 17 (db banco_digital, puerto 5432)

# Backend (desde backend/)
.\venv\Scripts\activate
uvicorn app.main:app --reload   # API en http://127.0.0.1:8000, Swagger en /docs
python -c "from app.database.connection import check_connection; print(check_connection())"
```

---

## 9. Convenciones a mantener

- Toda la lógica de negocio vive en `app/services/`; las rutas solo validan con Pydantic, llaman al
  servicio vía `Depends(get_db)` y devuelven HTTP.
- Los servicios devuelven `None` en lugar de excepciones para recursos inexistentes o reglas fallidas.
- Schemas Pydantic v2 con `ConfigDict(from_attributes=True)` para respuestas.
- La contraseña **nunca** se devuelve en respuestas; se almacena solo `contrasena_hash`.
- No modificar la estructura de `database/banco.sql` sin decisión explícita (documentar cualquier evolución).
