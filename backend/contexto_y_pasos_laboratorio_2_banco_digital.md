# Banco Digital — Contexto y pasos del Laboratorio 2

## 1. Contexto actual

El proyecto **Banco Digital / Banchocó** tiene un frontend funcional construido con **React + Vite**, pero actualmente utiliza datos mock y todavía no existe una API/backend real. La base de datos PostgreSQL ya está definida en `database/banco.sql` y PostgreSQL se ejecuta mediante `docker-compose.yml`. El frontend ya tiene `axios` y `jwt-decode` instalados para la futura conexión con el backend, y Vitest + React Testing Library están disponibles para el Laboratorio 1.

El estado documentado indica que el backend/API real, la autenticación real, la persistencia y la conexión con PostgreSQL todavía estaban pendientes. 

## 2. Objetivo del Laboratorio 2

Construir una API REST con:

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Pytest

El flujo será:

```text
Petición HTTP
     ↓
FastAPI
     ↓
Servicios / lógica de negocio
     ↓
SQLAlchemy
     ↓
PostgreSQL
     ↓
Respuesta HTTP
```

## 3. PostgreSQL mediante Docker

Durante este laboratorio, PostgreSQL puede continuar ejecutándose mediante Docker mientras FastAPI y Pytest se ejecutan directamente en Python/Windows:

```text
Windows
├── FastAPI + Pytest
└── Docker
    └── PostgreSQL
```

La contenerización completa de frontend + backend + PostgreSQL corresponde al Laboratorio 3.

## 4. Estructura del backend

```text
backend/
├── app/
│   ├── database/
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
├── venv/
├── requirements.txt
└── README.md
```

- `database/`: conexión y configuración de PostgreSQL.
- `models/`: modelos SQLAlchemy.
- `schemas/`: validación Pydantic.
- `routes/`: endpoints.
- `services/`: lógica de negocio.
- `utils/`: funciones auxiliares.
- `tests/`: pruebas Pytest.

## 5. Entorno Python

El entorno virtual utilizado es:

```text
backend/venv/
```

El frontend y backend mantienen dependencias independientes:

```text
frontend → npm / package.json
backend  → Python / venv / requirements.txt
```

## 6. Dependencias ya instaladas

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

Se guardaron en:

```text
backend/requirements.txt
```

Funciones:

- **FastAPI:** crear la API REST.
- **Uvicorn:** ejecutar FastAPI.
- **SQLAlchemy:** trabajar con PostgreSQL desde Python.
- **psycopg2-binary:** controlador PostgreSQL.
- **Pydantic:** validar datos.
- **Pytest:** pruebas automatizadas.
- **HTTPX:** soporte para pruebas HTTP.
- **python-dotenv:** variables de entorno.

## 7. Paso 1 — Crear FastAPI

Crear:

```text
backend/app/main.py
```

Código inicial:

```python
from fastapi import FastAPI

app = FastAPI(
    title="Banco Digital API",
    description="API REST del Banco Digital",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Banco Digital API funcionando"}

@app.get("/health")
def health():
    return {"status": "ok"}
```

**Por qué:** primero se comprueba que FastAPI funciona antes de agregar la base de datos. Así cada capa se prueba por separado.

## 8. Paso 2 — Ejecutar FastAPI

Desde `backend/`:

```bash
uvicorn app.main:app --reload
```

Comprobar:

```text
http://127.0.0.1:8000
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

`/docs` permite probar los endpoints mediante la documentación Swagger generada por FastAPI.

## 9. Paso 3 — Variables de entorno

Crear:

```text
backend/.env
```

Ejemplo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_digital
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
```

Los valores deben coincidir con la configuración real de PostgreSQL en Docker.

**Por qué:** las credenciales no deben quedar escritas directamente en el código y posteriormente `DB_HOST` podrá cambiar a `db` cuando todo esté dentro de Docker Compose.

## 10. Paso 4 — `.gitignore`

Crear `backend/.gitignore`:

```gitignore
venv/
.env
__pycache__/
.pytest_cache/
```

**Por qué:** evita subir credenciales, el entorno virtual y archivos temporales.

## 11. Paso 5 — Comprobar PostgreSQL

Ejecutar en otra terminal:

```bash
docker ps
```

Comprobar que PostgreSQL está activo y que el puerto `5432` está publicado.

Durante esta etapa:

```text
FastAPI
   ↓
localhost:5432
   ↓
Docker
   ↓
PostgreSQL
```

## 12. Paso 6 — Conexión SQLAlchemy

Crear:

```text
backend/app/database/connection.py
```

La conexión deberá establecer:

```text
FastAPI
   ↓
SQLAlchemy
   ↓
psycopg2
   ↓
PostgreSQL
```

Primero se debe comprobar la conexión antes de crear modelos y endpoints.

## 13. Paso 7 — Modelos SQLAlchemy

Los modelos deben corresponder a las tablas reales de:

```text
database/banco.sql
```

Entidades principales:

- Usuarios.
- Clientes.
- Cuentas.
- Transacciones.
- Beneficiarios, si corresponden.

No inventar campos o relaciones sin comprobar el SQL existente.

## 14. Paso 8 — Schemas Pydantic

Los schemas definirán y validarán los datos de entrada y salida de la API.

Se validarán, entre otros:

- Correos.
- Montos.
- Documentos.
- Clientes.
- Cuentas.
- Depósitos.
- Retiros.
- Transferencias.

## 15. Paso 9 — Servicios

Separar las reglas de negocio de las rutas:

```text
routes/
    transactions.py

services/
    transaction_service.py
```

Flujo:

```text
POST /transactions/deposit
          ↓
       Route
          ↓
 TransactionService
          ↓
      SQLAlchemy
          ↓
      PostgreSQL
```

## 16. Paso 10 — Endpoints

### Autenticación

```text
POST /auth/login
POST /auth/logout
```

### Clientes

```text
POST /clients
GET /clients
GET /clients/{id}
PUT /clients/{id}
DELETE /clients/{id}
```

### Cuentas

Crear, consultar y actualizar cuentas.

Estados:

```text
Activa
Bloqueada
Cerrada
```

### Transacciones

```text
POST /transactions/deposit
POST /transactions/withdraw
POST /transactions/transfer
GET /transactions
```

### Beneficiarios

Si están presentes en la base:

```text
POST /beneficiaries
GET /beneficiaries
PUT /beneficiaries/{id}
DELETE /beneficiaries/{id}
```

## 17. Paso 11 — Reglas de negocio

### Depósito

- Monto > 0.
- Cuenta existente.
- Cuenta activa.
- Aumentar saldo.
- Registrar transacción.

### Retiro

- Monto > 0.
- Cuenta existente.
- Cuenta activa.
- Saldo suficiente.
- Reducir saldo.
- Registrar transacción.

### Transferencia

- Cuenta origen existente.
- Cuenta destino existente.
- Ambas activas.
- No permitir misma cuenta.
- Saldo suficiente.
- Descontar origen.
- Aumentar destino.
- Registrar transacción.

## 18. Paso 12 — Pytest

Crear:

```text
backend/tests/
├── test_auth.py
├── test_clients.py
├── test_accounts.py
├── test_deposits.py
├── test_withdrawals.py
├── test_transfers.py
└── test_transactions.py
```

Utilizar:

- `pytest`
- `TestClient`
- fixtures
- mocks cuando correspondan

## 19. Paso 13 — Fixtures

Crear fixtures para:

- Usuario.
- Cliente.
- Cuenta.
- Transacción.
- Base de datos de prueba.

Flujo:

```text
Fixture
   ↓
Prepara datos
   ↓
Test
   ↓
Ejecuta operación
   ↓
Verifica resultado
```

## 20. Paso 14 — Tipos de pruebas

### Positivas

Ejemplo:

```text
Depósito válido → 200 OK
```

### Negativas

Ejemplo:

```text
Retiro con saldo insuficiente → error
```

### Casos límite

Ejemplos:

```text
Monto = 0
Monto negativo
Monto exactamente igual al saldo
```

## 21. Orden recomendado

```text
1. FastAPI básico
2. Conexión PostgreSQL
3. Modelos SQLAlchemy
4. Schemas Pydantic
5. Clientes
6. Cuentas
7. Autenticación
8. Depósitos
9. Retiros
10. Transferencias
11. Historial
12. Beneficiarios
13. Fixtures
14. Tests Pytest
15. Reporte de pruebas
```

## 22. Relación con el frontend

Actualmente:

```text
React
   ↓
Datos mock
```

No se deben eliminar todavía.

Cuando el backend esté funcionando:

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

Los mocks pueden conservarse para pruebas independientes del frontend.

## 23. Laboratorio 3

Después del Laboratorio 2 se integrará:

```text
Docker Compose
│
├── frontend
├── backend
└── PostgreSQL
```

Se crearán Dockerfiles y se configurará la comunicación entre servicios.

## 24. Punto actual

Ya está preparado:

- Frontend React + Vite.
- Flujos principales.
- Datos mock.
- `database/banco.sql`.
- PostgreSQL mediante Docker.
- `docker-compose.yml`.
- `backend/venv`.
- Dependencias Python.
- `requirements.txt`.

### Siguiente paso concreto

Configurar:

```text
backend/app/database/connection.py
```

para comprobar:

```text
FastAPI
   ↓
SQLAlchemy
   ↓
PostgreSQL en Docker
```

Después se crearán los modelos basados directamente en `database/banco.sql`.
