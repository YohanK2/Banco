# Progreso — Laboratorio 2: Backend Banco Digital

> Última actualización: 2026-08-08

## Estado de la sesión

- **Tokens/sesión:** ~15–20% estimado — aún lejos del 90%. Se avisará cuando se acerque al límite.

---

## Completado en esta sesión

### Paso 1 — FastAPI básico ✅

- Creado `backend/app/main.py` con:
  - `GET /` → mensaje de bienvenida
  - `GET /health` → estado de la API
  - `GET /health/db` → verificación de conexión a PostgreSQL

### Paso 3 — Variables de entorno ✅

- Creado `backend/.env.example` (plantilla sin credenciales reales)
- Creado `backend/.env` con valores alineados a `docker-compose.yml`:
  - `DB_NAME=banco_digital`
  - `DB_USER=postgres`
  - `DB_PASSWORD=123456`

### Paso 4 — `.gitignore` ✅

- Creado `backend/.gitignore` para excluir `venv/`, `.env`, `__pycache__/`, `.pytest_cache/`

### Paso 6 — Conexión SQLAlchemy ✅

- Creado `backend/app/database/connection.py` con:
  - Lectura de variables desde `.env`
  - `engine`, `SessionLocal`, `Base`
  - `get_db()` — dependencia para futuros endpoints
  - `check_connection()` — prueba `SELECT 1` contra PostgreSQL

### Paquetes Python ✅

- Creados `app/__init__.py` y `app/database/__init__.py`

---

## Cómo probar ahora

### 1. Levantar PostgreSQL (Docker Desktop debe estar activo)

```bash
cd Banco
docker compose up -d
docker ps
```

### 2. Ejecutar FastAPI

```bash
cd Banco/backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

### 3. Verificar endpoints

| URL | Resultado esperado |
|-----|-------------------|
| http://127.0.0.1:8000 | `{"message": "Banco Digital API funcionando"}` |
| http://127.0.0.1:8000/health | `{"status": "ok"}` |
| http://127.0.0.1:8000/health/db | `{"status": "ok", "database": "connected"}` |
| http://127.0.0.1:8000/docs | Swagger UI |

> Si Docker no está corriendo, `/health` responde OK pero `/health/db` devuelve **503 disconnected**.

---

## Pendiente / observaciones

### Ruta de `banco.sql` en Docker

`docker-compose.yml` monta `./database/banco.sql`, pero el archivo actual está en `backend/app/database/banco.sql`. Antes de confiar en el init de Docker, conviene alinear esa ruta (copiar o mover el SQL al lugar que espera Compose).

### Docker no estaba activo en la máquina al implementar

El daemon de Docker Desktop no respondía. Hay que iniciarlo manualmente antes de probar `/health/db`.

---

## Próximos pasos (orden del laboratorio)

| # | Paso | Archivos principales |
|---|------|---------------------|
| 7 | **Modelos SQLAlchemy** | `app/models/` basados en `banco.sql` |
| 8 | **Schemas Pydantic** | `app/schemas/` |
| 9 | **Servicios** | `app/services/` |
| 10 | **Endpoints — Clientes** | `app/routes/clients.py` |
| 11 | **Endpoints — Cuentas** | `app/routes/accounts.py` |
| 12 | **Autenticación** | `app/routes/auth.py` |
| 13 | **Depósitos / Retiros / Transferencias** | `app/routes/transactions.py` |
| 14 | **Beneficiarios** | `app/routes/beneficiaries.py` |
| 15 | **Pytest + fixtures** | `tests/` |

### Siguiente sesión recomendada: **Paso 7 — Modelos SQLAlchemy**

Entidades a mapear desde `banco.sql`:

1. `usuarios`
2. `clientes`
3. `cuentas`
4. `transacciones`
5. `beneficiarios`
6. `refresh_tokens`
7. `auditoria`

No inventar campos: respetar tipos, FKs e índices del SQL existente.

---

## Mapa de avance general

```
[✅] 1. FastAPI básico
[✅] 2. Ejecutar FastAPI (listo para probar)
[✅] 3. Variables de entorno
[✅] 4. .gitignore
[⏳] 5. Comprobar PostgreSQL (requiere Docker activo)
[✅] 6. Conexión SQLAlchemy
[ ] 7. Modelos SQLAlchemy
[ ] 8. Schemas Pydantic
[ ] 9. Clientes (CRUD)
[ ] 10. Cuentas
[ ] 11. Autenticación
[ ] 12. Depósitos
[ ] 13. Retiros
[ ] 14. Transferencias
[ ] 15. Beneficiarios
[ ] 16. Tests Pytest
```
