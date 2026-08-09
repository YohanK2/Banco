# Estado actual y hallazgos — Backend (Laboratorio 2)

> Revisión del 2026-08-08. Este documento describe qué hay realmente en `backend/`,
> qué funciona, qué falta y las cosas raras/inconsistentes que se encontraron al revisar el código.

---

## 1. Situación actual (resumen)

El backend **ya no es solo una carpeta de documentos**: hay un proyecto Python/FastAPI en construcción.

- **Stack real instalado** (`backend/venv/` + `requirements.txt`):
  FastAPI, Uvicorn, SQLAlchemy 2, psycopg2-binary, Pydantic v2, passlib + bcrypt,
  pytest, httpx, python-dotenv.
- **Base de datos**: Postgres 17 corriendo en Docker (`banco_postgres`, puerto `5432`).
  Verificado: `check_connection()` devuelve `True` → la conexión `FastAPI → SQLAlchemy → PostgreSQL` funciona.
- **El código importa sin errores** (verificado por consola): `app.main`, `app.models`, `app.schemas`, `app.utils`.

### Estructura actual

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  → FastAPI: GET /, /health, /health/db
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py        → engine, SessionLocal, Base, get_db, check_connection
│   │   └── banco.sql            → ⚠️ COPIA duplicada (ver hallazgo 3.2)
│   ├── models/
│   │   ├── __init__.py          → exporta los 7 modelos
│   │   └── user.py, client.py, account.py, transaction.py, beneficiary.py, audit.py
│   ├── schemas/
│   │   ├── __init__.py          → ⚠️ solo exporta client + account (ver hallazgo 3.4)
│   │   └── auth.py, client.py, account.py, transaction.py, beneficiary.py
│   ├── routes/
│   │   └── services/            → ⚠️ carpeta vacía (ver hallazgo 3.6)
│   ├── services/                → ⚠️ vacía (aún no existe lógica de negocio)
│   └── utils/
│       ├── __init__.py
│       └── security.py          → ⚠️ ROTO (ver hallazgo 3.1)
├── test/
│   └── no.txt                   → ⚠️ carpeta mal nombrada + archivo basura (ver 3.5)
├── venv/
├── .env                         → credenciales reales (ignorado por git)
├── .env.example
├── .gitignore
├── requirements.txt             → ⚠️ en UTF-16 (ver 3.3)
├── contexto_y_pasos_laboratorio_2_banco_digital.md      → desactualizado
├── LABORATORIO_2_BACKEND.md                              → desactualizado
├── LABORATORIO_2_BACKEND_ACTUALIZADO.md                  → el más al día
├── progreso_laboratorio_2.md
├── resumen-proyecto.md          → ⚠️ dice que backend solo tiene documentos (ya no es cierto)
└── estado_actual_y_hallazgos_backend.md  → este documento
```

### Qué existe y funciona hoy

| Pieza | Estado |
|---|---|
| FastAPI básico (`/`, `/health`, `/health/db`) | ✅ Funciona |
| Conexión a PostgreSQL | ✅ Funciona (Docker arriba, `check_connection=True`) |
| Modelos SQLAlchemy (7 tablas) | ✅ Creados y se importan |
| Schemas Pydantic | ✅ Creados y se importan (`auth`, `transaction`, `beneficiary` verificados por consola) |
| `get_db()` | ✅ Ya existe en `connection.py` |
| `security.py` (hashing) | ❌ Creado pero roto (ver hallazgo 3.1) |
| Servicios / rutas / endpoints de negocio | ❌ No existen |
| Tests | ❌ No existen |
| CORS | ❌ No configurado |

### Qué falta (orden lógico)

1. Arreglar `security.py`.
2. Crear `app/services/` (lógica de negocio).
3. Crear rutas (`auth`, `clients`, `accounts`, `transactions`, `beneficiaries`).
4. Autenticación (login/logout, JWT/refresh tokens).
5. CRUD de clientes, cuentas, depósitos, retiros, transferencias, historial, beneficiarios.
6. `tests/` con conftest + fixtures + casos positivos/negativos/límite.
7. CORS cuando se conecte el frontend.

---

## 2. Lo que se verificó por consola (evidencia)

```powershell
# Importar todo → OK
python -c "import app.main, app.models, app.schemas, app.utils; print('OK')"

# Schemas sueltos → OK
python -c "from app.schemas.auth import LoginRequest, TokenResponse, RefreshTokenRequest; print('auth OK')"
python -c "from app.schemas.transaction import DepositRequest; print('transaction OK')"
python -c "from app.schemas.beneficiary import BeneficiaryCreate; print('beneficiary OK')"

# Conexión a la BD → OK
python -c "from app.database.connection import check_connection; print(check_connection())"   # True

# Seguridad → FALLA
python -c "from app.utils.security import hash_password; hash_password('test12345')"
# ↑ lanza ValueError: password cannot be longer than 72 bytes ...
```

---

## 3. Cosas raras / hallazgos (por importancia)

### 3.1 CRÍTICO — `app/utils/security.py` está roto
- `hash_password()` y `verify_password()` **no funcionan**. Reproducido por consola.
- **Causa**: `passlib 1.7.4` es incompatible con `bcrypt >= 4.1`. Passlib intenta leer
  `bcrypt.__about__.__version__`, atributo eliminado en bcrypt 4.x, y el fallo termina en
  `ValueError: password cannot be longer than 72 bytes` (durante la detección de "wrap bug").
- **Fix sugerido**: bajar bcrypt a `bcrypt==4.0.1` en `requirements.txt` y reinstalar, **o**
  reescribir `security.py` usando `bcrypt` directamente (sin passlib). No dejar esto para después:
  cualquier endpoint de registro/login que lo use va a explotar.

### 3.2 Duplicado de `banco.sql`
- Existen **dos** copias: `database/banco.sql` (la oficial, la que monta `docker-compose.yml`)
  y `backend/app/database/banco.sql` (una copia extra).
- El propio `LABORATORIO_2_BACKEND_ACTUALIZADO.md` dice: *"No se debe crear otro `init.sql` ni
  mantener copias innecesarias del `banco.sql`."*
- Riesgo: si se editan por separado, divergen y el modelo ORM deja de coincidir con la BD real.
- **Recomendación**: borrar `backend/app/database/banco.sql` y dejar solo el de la raíz.

### 3.3 `requirements.txt` guardado en UTF-16 LE (BOM)
- Los primeros bytes son `FF FE` → archivo en **UTF-16**, no UTF-8.
- Por eso algunas herramientas (incluido el lector de archivos) lo reportan como binario.
- En Windows puede funcionar, pero **rompe o genera warnings en Linux/CI** y en `pip` no siempre se parsea bien.
- **Recomendación**: reescribirlo en UTF-8 (`pip freeze > requirements.txt` de nuevo, o guardar con codificación UTF-8).

### 3.4 `app/schemas/__init__.py` incompleto
- Solo exporta `client` y `account`:
  ```python
  from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
  from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse
  ```
- **No** exporta `auth`, `transaction` ni `beneficiary`, aunque los documentos afirman que las
  exportaciones están "centralizadas" en ese `__init__.py`.
- No impide importar cada módulo directo, pero es inconsistente con lo documentado.

### 3.5 Carpeta de tests mal nombrada y con archivo basura
- Existe `backend/test/` (singular) con un archivo vacío `no.txt`.
- El plan del laboratorio y pytest esperan `backend/tests/`.
- **Recomendación**: renombrar a `tests/`, borrar `no.txt`, y ahí crear `conftest.py` + los `test_*.py`.

### 3.6 Carpetas vacías / restos de estructura
- `app/routes/services/` — subcarpeta `services` vacía dentro de `routes`. Parece un error:
  los servicios van en `app/services/` (que también está vacía). Sugerencia: borrar `app/routes/services/`.

### 3.7 Documentación duplicada y desactualizada
Hay **4 documentos** que se pisan entre sí:

| Documento | Estado |
|---|---|
| `contexto_y_pasos_laboratorio_2_banco_digital.md` | Desactualizado (su "siguiente paso" es crear `connection.py`, que ya existe) |
| `LABORATORIO_2_BACKEND.md` | Desactualizado; numeración rara (salta de #12 a #23) |
| `LABORATORIO_2_BACKEND_ACTUALIZADO.md` | El más al día, pero aún tiene desfases |
| `progreso_laboratorio_2.md` | Intermedio, marca pasos como pendientes que ya están hechos |

Desfases concretos entre los docs y la realidad:
- Listan "Implementar `app/utils/security.py`" como **siguiente paso** → el archivo **ya existe** (aunque roto).
- Listan "Crear dependencia `get_db`" como pendiente → **ya existe** en `connection.py`.
- El checklist del ACTUALIZADO dice que falta verificar `transaction.py`/`beneficiary.py` →
  **ya los verifiqué y funcionan**.
- El `resumen-proyecto.md` general todavía afirma que `backend/` "solo tiene documentos" →
  falso desde hoy.

**Recomendación**: unificar en un único documento (el ACTUALIZADO) y borrar los demás,
o al menos marcar cuáles quedan obsoletos.

### 3.8 `Bien.txt` fue eliminado del repo
- Git muestra `D backend/Bien.txt` (estaba versionado y se borró). Probablemente fue renombrado/
  reemplazado por los nuevos docs. Solo como dato, por si era importante.

### 3.9 Modelos ligeramente más estrictos que el SQL
- `Transaccion.monto` es `nullable=False` en el modelo, pero en `banco.sql` `monto NUMERIC(12,2)`
  **permite NULL**.
- `RefreshToken.fecha_expiracion` es `nullable=False` en el modelo, pero en el SQL es nullable.
- No rompe nada, pero el plan decía "respetar fielmente el SQL" y estas diferencias existen.

### 3.10 Imports sin usar en `app/schemas/auth.py`
- Se importan `datetime` y `ConfigDict` y no se usan. Menor, pero sucio para un proyecto que
  prometió limpieza.

### 3.11 No hay CORS configurado
- `main.py` no agrega `CORSMiddleware`. Cuando el frontend React (otro puerto) quiera llamar la API,
  las peticiones serán bloqueadas por el navegador. Pensarlo antes de conectar el frontend.

### 3.12 Seguridad básica de credenciales
- `.env` contiene `DB_PASSWORD=123456` (igual que `docker-compose.yml`). Está correctamente ignorado
  por `.gitignore`, así que no se sube al repo. Para cualquier despliegue real, cambiar esa contraseña.
- La URL de conexión se arma sin escapado del password (si la contraseña tuviera `@`, `:` o `/`, la URL se rompería).

---

## 4. Checklist del laboratorio (real, no el de los docs)

```text
[x] Entorno Python + venv
[x] Dependencias + requirements.txt   (⚠️ UTF-16)
[x] PostgreSQL en Docker              (✅ corriendo, verificado)
[x] .env / .env.example / .gitignore
[x] FastAPI básico                    (/, /health, /health/db)
[x] Conexión SQLAlchemy + get_db
[x] Modelos SQLAlchemy (7 tablas)
[x] Schemas Pydantic (5 módulos)
[ ] Verificar schemas en __init__ centralizado  (incompleto)
[ ] security.py funcional              (❌ roto)
[ ] Servicios app/services/
[ ] Rutas/endpoints (auth, clients, accounts, transactions, beneficiaries)
[ ] Autenticación (login/logout, JWT, refresh)
[ ] CRUD clientes / cuentas
[ ] Depósitos / retiros / transferencias / historial
[ ] Beneficiarios
[ ] tests/ + conftest + fixtures
[ ] Pruebas unitarias + integración (positivos/negativos/límite)
[ ] CORS
[ ] Reporte + docs unificados
```

---

## 5. Próximos pasos sugeridos (en orden)

1. **Arreglar `security.py`** (bajar `bcrypt` a 4.0.1 o usar bcrypt directo). Es lo único roto del código existente.
2. **Borrar** `backend/app/database/banco.sql` (copia duplicada).
3. **Reescribir `requirements.txt` en UTF-8**.
4. **Renombrar `test/` → `tests/`**, borrar `no.txt`, crear `conftest.py`.
5. Completar `app/schemas/__init__.py` (exportar auth, transaction, beneficiary) o dejar de prometerlo en los docs.
6. Crear `app/services/` → rutas → autenticación → CRUD → transacciones → tests.
7. Agregar CORS cuando se conecte el frontend.
8. Unificar la documentación (dejar el ACTUALIZADO como único) y corregir `resumen-proyecto.md`.
