# LABORATORIO 2 — TESTING BACKEND CON PYTEST

> **Documento Oficial y Guía de Trabajo del Laboratorio 2**  
> **Proyecto:** Banco Digital (Banchocó)  
> **Estado de Actualización:** Agosto 2026  
> **Estado del documento:** Actualizado después de comprobar la conexión FastAPI → SQLAlchemy → PostgreSQL.

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

FastAPI ya fue ejecutado correctamente.

El endpoint:

```text
GET /health/db
```

respondió:

```text
200 OK
```

Por tanto, la conexión:

```text
FastAPI
   ↓
SQLAlchemy
   ↓
psycopg2
   ↓
localhost:5432
   ↓
PostgreSQL en Docker
```

ya fue comprobada exitosamente.

Los `404` observados anteriormente en `/health` o `/favicon.ico` no representan un conflicto de dependencias si `/health/db` responde correctamente. `/favicon.ico` puede ignorarse mientras no exista un favicon configurado.

---

## 3. Objetivo

El objetivo principal del **Laboratorio 2** es construir y validar una API REST bancaria utilizando:

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Pytest

Se busca:

1. Conectar FastAPI con PostgreSQL mediante SQLAlchemy.
2. Mapear mediante ORM el esquema real de `database/banco.sql`.
3. Crear schemas Pydantic.
4. Implementar servicios y reglas de negocio.
5. Crear endpoints REST.
6. Realizar pruebas unitarias y de integración.
7. Cubrir casos positivos, negativos y límite.
8. Comprobar persistencia y manejo de errores.

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

Durante el Laboratorio 2:

```text
Windows
├── FastAPI + Uvicorn
├── Pytest
└── Código Python
        ↓
   localhost:5432
        ↓
Docker
└── banco_postgres
        ↓
PostgreSQL
```

El backend todavía **NO está dentro de Docker**.

---

## 6. PostgreSQL y Docker

La configuración actual utiliza:

```yaml
services:
  postgres:
    image: postgres:17
    container_name: banco_postgres
    restart: unless-stopped

    environment:
      POSTGRES_DB: banco_digital
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123456

    ports:
      - "5432:5432"

    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/banco.sql:/docker-entrypoint-initdb.d/01-banco.sql

volumes:
  postgres_data:
```

### Conexión durante el Laboratorio 2

Como FastAPI se ejecuta directamente desde Windows:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_digital
DB_USER=postgres
DB_PASSWORD=123456
```

`DB_HOST=db` **NO se utiliza todavía**.

Ese valor se utilizará en el Laboratorio 3 cuando el backend también esté dentro de Docker Compose.

---

## 7. Variables de entorno

### `backend/.env.example`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_digital
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
```

### `backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_digital
DB_USER=postgres
DB_PASSWORD=123456
```

El `.env` contiene la configuración real y debe permanecer fuera del repositorio mediante `.gitignore`.

---

## 8. Estructura actual del proyecto

La estructura relevante es:

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
│   │   ├── schemas/
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
│   └── requirements.txt
│
├── frontend/
│
└── docker-compose.yml
```

### Importante sobre las carpetas `database`

Existen dos funciones distintas:

```text
Banco/database/
└── banco.sql
```

Contiene el SQL de PostgreSQL.

Mientras que:

```text
Banco/backend/app/database/
└── connection.py
```

contiene el código Python de conexión mediante SQLAlchemy.

No deben mezclarse.

Si existe una carpeta vacía:

```text
backend/database/
```

no es necesaria.

---

# 9. Estructura real de `database/banco.sql`

El archivo SQL proporcionado contiene **7 tablas**:

1. `usuarios`
2. `clientes`
3. `cuentas`
4. `transacciones`
5. `beneficiarios`
6. `refresh_tokens`
7. `auditoria`

No se deben inventar tablas adicionales.

### 9.1 `usuarios`

```text
id_usuario          SERIAL PRIMARY KEY
correo              VARCHAR(100) UNIQUE NOT NULL
contrasena_hash     VARCHAR(255) NOT NULL
rol                 VARCHAR(20) DEFAULT 'CLIENTE'
estado              BOOLEAN DEFAULT TRUE
fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 9.2 `clientes`

```text
id_cliente          SERIAL PRIMARY KEY
id_usuario          INT UNIQUE NOT NULL
nombres             VARCHAR(100)
apellidos           VARCHAR(100)
documento           VARCHAR(20) UNIQUE
telefono            VARCHAR(20)
direccion           TEXT
```

Relación:

```text
usuarios 1 ─── 1 clientes
```

mediante `clientes.id_usuario`.

### 9.3 `cuentas`

```text
id_cuenta           SERIAL PRIMARY KEY
id_cliente          INT NOT NULL
numero_cuenta       VARCHAR(20) UNIQUE
tipo                VARCHAR(20)
saldo               NUMERIC(12,2)
estado              BOOLEAN DEFAULT TRUE
fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

Relación:

```text
clientes 1 ─── N cuentas
```

### 9.4 `transacciones`

```text
id_transaccion      SERIAL PRIMARY KEY
cuenta_origen       INT
cuenta_destino      INT
tipo                VARCHAR(20)
monto               NUMERIC(12,2)
descripcion         TEXT
fecha               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

Tanto `cuenta_origen` como `cuenta_destino` referencian:

```text
cuentas.id_cuenta
```

Esto permite representar depósitos, retiros y transferencias de acuerdo con la lógica que se implemente en el servicio.

### 9.5 `beneficiarios`

```text
id_beneficiario     SERIAL PRIMARY KEY
id_cliente          INT
cuenta_destino      INT
alias               VARCHAR(50)
```

Relaciones:

```text
clientes → beneficiarios
cuentas  → beneficiarios
```

### 9.6 `refresh_tokens`

```text
id_token            SERIAL PRIMARY KEY
id_usuario          INT
token               TEXT
fecha_expiracion    TIMESTAMP
activo              BOOLEAN DEFAULT TRUE
```

Relación:

```text
usuarios 1 ─── N refresh_tokens
```

### 9.7 `auditoria`

```text
id_evento           SERIAL PRIMARY KEY
id_usuario          INT
accion              VARCHAR(100)
descripcion         TEXT
ip                  VARCHAR(50)
fecha               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

Relación:

```text
usuarios 1 ─── N auditoria
```

### Índices existentes

El SQL también crea índices para:

```text
clientes.documento
cuentas.numero_cuenta
transacciones.fecha
auditoria.id_usuario
```

Los modelos ORM deben respetar la estructura real de la base existente.

---

# 10. Plan de desarrollo actualizado

Este es el orden oficial que se seguirá desde este punto.

## Etapa completada

### 1. Entorno Python

- [x] Crear `backend/venv/`.
- [x] Activar entorno virtual.
- [x] Verificar intérprete Python.

### 2. Dependencias

- [x] Instalar dependencias backend.
- [x] Crear `requirements.txt`.

### 3. PostgreSQL

- [x] Configurar PostgreSQL en Docker.
- [x] Publicar `5432:5432`.
- [x] Configurar volumen `postgres_data`.
- [x] Configurar `database/banco.sql`.

### 4. Variables de entorno

- [x] Crear `.env`.
- [x] Crear `.env.example`.
- [x] Configurar `DB_HOST=localhost`.

### 5. FastAPI

- [x] Crear `main.py`.
- [x] Ejecutar Uvicorn.
- [x] Comprobar que FastAPI responde.

### 6. SQLAlchemy

- [x] Configurar `connection.py`.
- [x] Configurar lectura de `.env`.
- [x] Crear la conexión con PostgreSQL.

### 7. Conexión real

- [x] Comprobar `GET /health/db`.
- [x] Obtener respuesta `200 OK`.

---

## Etapas pendientes

### 8. Modelos SQLAlchemy ← SIGUIENTE

Crear los modelos ORM basados estrictamente en:

```text
database/banco.sql
```

Modelos previstos:

```text
Usuario
Cliente
Cuenta
Transaccion
Beneficiario
RefreshToken
Auditoria
```

No modificar la base de datos para adaptarla a los modelos.

Los modelos deben adaptarse al esquema existente.

### 9. Verificación de modelos

Comprobar que SQLAlchemy puede importar y consultar correctamente las tablas existentes.

### 10. Schemas Pydantic

Crear schemas de entrada, actualización y respuesta.

### 11. Dependencia de sesión

Implementar `get_db` para proporcionar sesiones SQLAlchemy a los endpoints.

### 12. Utilidades de seguridad

Implementar, según las necesidades reales del proyecto:

- Hashing de contraseñas.
- Verificación de contraseñas.
- Manejo de tokens.

### 13. Servicios

Crear la lógica de negocio separada de las rutas.

### 14. Autenticación

Implementar:

```text
POST /auth/login
POST /auth/logout
```

### 15. Clientes

Implementar CRUD:

```text
POST   /clients
GET    /clients
GET    /clients/{id}
PUT    /clients/{id}
DELETE /clients/{id}
```

### 16. Cuentas

Implementar:

```text
POST /accounts
GET  /accounts
GET  /accounts/{id}
```

y las operaciones necesarias para actualizar el estado.

### 17. Depósitos

```text
POST /transactions/deposit
```

Reglas:

- Monto mayor que 0.
- Cuenta existente.
- Cuenta activa.
- Aumentar saldo.
- Registrar transacción.

### 18. Retiros

```text
POST /transactions/withdraw
```

Reglas:

- Monto mayor que 0.
- Cuenta existente.
- Cuenta activa.
- Saldo suficiente.
- Disminuir saldo.
- Registrar transacción.

### 19. Transferencias

```text
POST /transactions/transfer
```

Reglas:

- Cuenta origen existente.
- Cuenta destino existente.
- Ambas activas.
- No transferir a la misma cuenta.
- Saldo suficiente.
- Descontar origen.
- Aumentar destino.
- Registrar transacción.
- Mantener la operación consistente.

### 20. Historial

```text
GET /transactions
```

Con filtros según corresponda:

- Cuenta.
- Tipo.
- Estado, si puede derivarse de la estructura implementada.
- Fecha.

### 21. Beneficiarios

Si se implementa el módulo:

```text
POST   /beneficiaries
GET    /beneficiaries
PUT    /beneficiaries/{id}
DELETE /beneficiaries/{id}
```

### 22. Fixtures Pytest

Crear:

```text
tests/conftest.py
```

con fixtures para:

- Base de datos de pruebas.
- Usuario.
- Cliente.
- Cuentas.
- Transacciones.
- `TestClient`.

### 23. Pruebas unitarias

Probar de forma aislada:

- Validaciones.
- Servicios.
- Seguridad.
- Reglas de negocio.

### 24. Pruebas de integración

Comprobar:

```text
TestClient
   ↓
FastAPI
   ↓
Services
   ↓
SQLAlchemy
   ↓
PostgreSQL
```

### 25. Casos positivos, negativos y límite

Cubrir cada módulo con:

- Casos exitosos.
- Datos inválidos.
- Recursos inexistentes.
- Duplicados.
- Estados bloqueados/inactivos.
- Montos cero.
- Montos negativos.
- Saldos insuficientes.
- Casos límite.

### 26. Ejecución y reporte

Ejecutar:

```bash
pytest
```

y registrar los resultados.

### 27. Documentación final

Actualizar:

- `LABORATORIO_2_BACKEND.md`
- `backend/README.md`

con los resultados finales.

---

# 11. Conexión FastAPI + SQLAlchemy + PostgreSQL

La conexión se centraliza en:

```text
backend/app/database/connection.py
```

Conceptos:

- **Engine:** administra la conexión/pool de SQLAlchemy.
- **Session:** permite interactuar con la base de datos.
- **Base:** clase declarativa para los modelos ORM.
- **get_db:** dependencia que proporciona una sesión a los endpoints.

No se deben escribir credenciales directamente en el código.

---

# 12. Modelos SQLAlchemy (Implementados)

Los modelos ORM se han creado exitosamente en la carpeta `backend/app/models/` tomando como fuente exclusiva la estructura real de `database/banco.sql`.

### Correspondencia e Implementación

| Tabla SQL | Modelo ORM | Archivo Python | Relaciones ORM configuradas |
|---|---|---|---|
| `usuarios` | `Usuario` | `app/models/user.py` | `cliente` (1:1), `refresh_tokens` (1:N), `auditorias` (1:N) |
| `refresh_tokens` | `RefreshToken` | `app/models/user.py` | `usuario` (N:1) |
| `clientes` | `Cliente` | `app/models/client.py` | `usuario` (1:1), `cuentas` (1:N), `beneficiarios` (1:N) |
| `cuentas` | `Cuenta` | `app/models/account.py` | `cliente` (N:1), `transacciones_origen` (1:N), `transacciones_destino` (1:N), `beneficiarios` (1:N) |
| `transacciones` | `Transaccion` | `app/models/transaction.py` | `origen` (N:1), `destino` (N:1) |
| `beneficiarios` | `Beneficiario` | `app/models/beneficiary.py` | `cliente` (N:1), `cuenta_destino_rel` (N:1) |
| `auditoria` | `Auditoria` | `app/models/audit.py` | `usuario` (N:1) |

### Características clave respetadas:
- **Claves primarias e Índices:** `id_usuario`, `id_cliente`, `id_cuenta`, `id_transaccion`, `id_beneficiario`, `id_token`, `id_evento` con `primary_key=True` e `index=True`.
- **Campos únicos:** `correo` en `usuarios`, `documento` en `clientes`, `numero_cuenta` en `cuentas`, `id_usuario` en `clientes`.
- **Valores por defecto:** `estado=True`, `fecha_creacion=datetime.utcnow`, `saldo=0.00`.
- **Relaciones bidireccionales:** Todas las FKs están respaldadas por `relationship(..., back_populates=...)` para facilitar consultas desde SQLAlchemy.
- **Exportación limpia:** Centralizada en `backend/app/models/__init__.py` con `__all__`.


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

### Características clave respetadas:
- **Validación de tipos y rangos:** Uso de `EmailStr` para correos y `Decimal` con validaciones de `Field(gt=0)` para montos financieros sin pérdida de precisión.
- **Compatibilidad con SQLAlchemy:** Configurados con `model_config = ConfigDict(from_attributes=True)` para serialización automática directa desde modelos ORM.
- **Exportaciones centralizadas:** Disponibles desde `backend/app/schemas/__init__.py`.


---

# 14. Servicios

La lógica de negocio se separará de las rutas:

```text
Route
  ↓
Service
  ↓
SQLAlchemy
  ↓
PostgreSQL
```

Servicios previstos:

```text
auth_service.py
client_service.py
account_service.py
transaction_service.py
beneficiary_service.py
```

---

# 15. Reglas de negocio

## Depósito

1. `monto > 0`.
2. La cuenta debe existir.
3. La cuenta debe estar activa.
4. El saldo debe aumentar.
5. Debe registrarse la transacción.

## Retiro

1. `monto > 0`.
2. La cuenta debe existir.
3. La cuenta debe estar activa.
4. Debe existir saldo suficiente.
5. El saldo debe disminuir.
6. Debe registrarse la transacción.

## Transferencia

1. Ambas cuentas deben existir.
2. Ambas deben estar activas.
3. No pueden ser la misma cuenta.
4. El monto debe ser mayor que cero.
5. El origen debe tener saldo suficiente.
6. Debe descontarse el origen.
7. Debe aumentarse el destino.
8. Debe registrarse la transacción.
9. La operación debe mantenerse consistente ante errores.

---

# 16. Estrategia de testing con Pytest

Las pruebas estarán en:

```text
backend/tests/
```

Se utilizarán:

- `pytest`
- `TestClient`
- fixtures
- mocks cuando sean necesarios
- `assert`
- parametrización cuando aporte valor

Se probarán códigos HTTP y comportamiento de la API.

---

# 17. Fixtures

Se crearán fixtures para:

```text
db_session
client
test_user
test_client_entity
test_accounts
test_transactions
```

Las pruebas deben ser reproducibles y no depender de datos arbitrarios del entorno de desarrollo.

---

# 18. Pruebas unitarias

Validarán de forma aislada:

- Servicios.
- Validaciones.
- Seguridad.
- Reglas de negocio.

---

# 19. Pruebas de integración

Validarán la interacción entre:

```text
FastAPI
+
Services
+
SQLAlchemy
+
PostgreSQL
```

Se cubrirán:

- Autenticación.
- Clientes.
- Cuentas.
- Depósitos.
- Retiros.
- Transferencias.
- Historial.
- Beneficiarios.

---

# 20. Casos positivos, negativos y límite

### Positivos

- Login válido.
- Cliente válido.
- Cuenta válida.
- Depósito exitoso.
- Retiro exitoso.
- Transferencia exitosa.
- Consulta de historial.

### Negativos

- Usuario inexistente.
- Contraseña incorrecta.
- Documento duplicado.
- Cuenta inexistente.
- Cuenta inactiva.
- Saldo insuficiente.
- Transferencia a la misma cuenta.
- Datos obligatorios faltantes.

### Límite

- Monto igual a cero.
- Monto negativo.
- Retirar exactamente todo el saldo.
- Valores decimales.
- Límites de longitud de campos.

---

# 21. Relación con el frontend

Actualmente:

```text
React
  ↓
Datos mock
```

Durante el Laboratorio 2:

```text
FastAPI
  ↓
Swagger /docs + Pytest
```

Posteriormente:

```text
React
  ↓
Axios
  ↓
FastAPI
  ↓
SQLAlchemy
  ↓
PostgreSQL
```

Los mocks del frontend no se eliminarán automáticamente. Pueden seguir siendo útiles para pruebas aisladas del Laboratorio 1.

---

# 22. Relación con Docker Compose

El Laboratorio 3 será independiente y posterior.

En ese momento:

```text
Docker Compose
├── Frontend
├── Backend
└── PostgreSQL
```

La comunicación interna será:

```text
Frontend
   ↓
Backend
   ↓
db
   ↓
PostgreSQL
```

Dentro de Docker, el backend utilizará el nombre del servicio de PostgreSQL, no `localhost`.

---

# 23. Estado y checklist

## Completado

- [x] Entorno virtual Python configurado.
- [x] Dependencias instaladas.
- [x] `requirements.txt` creado.
- [x] `.gitignore` configurado.
- [x] `.env` configurado.
- [x] `.env.example` configurado.
- [x] PostgreSQL configurado en Docker.
- [x] `database/banco.sql` definido como SQL oficial.
- [x] FastAPI funcionando.
- [x] SQLAlchemy configurado.
- [x] Endpoint `/health/db` comprobado con respuesta `200 OK`.
- [x] Estructura real de `database/banco.sql` analizada.
- [x] Siete tablas identificadas.
- [x] Crear modelos SQLAlchemy (`app/models/`: `Usuario`, `RefreshToken`, `Cliente`, `Cuenta`, `Transaccion`, `Beneficiario`, `Auditoria`).
- [x] Verificar modelos y relaciones ORM.
- [x] Schema `client.py` creado y verificado por consola (`ClientCreate`, `ClientUpdate`, `ClientResponse`).
- [x] Schema `account.py` creado y verificado por consola (`AccountCreate`, `AccountUpdate`, `AccountResponse`).
- [x] Paquete `app.schemas` exporta correctamente todos los schemas verificados.

## Pendiente

- [ ] Verificar schemas `transaction.py` y `beneficiary.py` por consola.
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
- [ ] Crear pruebas unitarias.
- [ ] Crear pruebas de integración.
- [ ] Ejecutar suite completa.
- [ ] Corregir errores.
- [ ] Generar reporte.
- [ ] Actualizar README.
- [ ] Cerrar Laboratorio 2.

---

# 24. Próximo paso

El siguiente paso técnico es:

## Etapa 8.2 — Verificar schemas `transaction.py` y `beneficiary.py`

Verificar por consola que los schemas de transacciones y beneficiarios se importan correctamente:

```powershell
python -c "from app.schemas.transaction import DepositRequest, WithdrawalRequest, TransferRequest, TransactionResponse; print('OK')"
python -c "from app.schemas.beneficiary import BeneficiaryCreate, BeneficiaryResponse; print('OK')"
```

Si responden correctamente, continuar con la siguiente etapa:

## Etapa siguiente — Utilidades de seguridad (`backend/app/utils/security.py`)

Implementar las funciones de hashing de contraseñas, verificación de hashes y creación/validación de tokens para la autenticación segura de usuarios.


---

## Regla de trabajo

Cada etapa debe:

1. Explicar qué se hará.
2. Explicar por qué.
3. Indicar qué archivo se crea/modifica.
4. Mostrar el código.
5. Indicar dónde ejecutar los comandos.
6. Indicar cómo comprobar el resultado.
7. Detenerse si aparece un error.
8. Actualizar este documento cuando una etapa se complete.

**No avanzar automáticamente varias etapas.**

