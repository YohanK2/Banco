# Contexto Final — Integración Frontend ↔ Backend

> Documento guía para terminar la funcionalidad de la página: conectar el frontend con el backend y eliminar los datos mock.
> Fuente de referencia interna del backend: `backend/resumen_actual_final_finall.md`.

---

## 1. Objetivo

Reemplazar todos los datos mock/hardcodeados del frontend por consumo real de la API del backend, dejando operativas las funcionalidades: registro, login (según decisión), consulta de saldo/movimientos, transferencias, retiros e historial.

## 2. Stack y arquitectura

| Capa | Tecnología | Ubicación |
|---|---|---|
| Base de datos | PostgreSQL 17 (Docker) | `database/banco.sql`, `docker-compose.yml` |
| Backend | Python 3.13 + FastAPI + SQLAlchemy 2 + Pydantic v2 | `backend/app/` |
| Frontend | React 19 + Vite 8 (JSX) + react-router-dom 7 | `frontend/src/` |

Arquitectura backend: `routes → services → models`, con schemas Pydantic en `backend/app/schemas/`.

## 3. Cómo correr todo el entorno

```powershell
# 1) Base de datos (desde la raíz del repo)
docker compose up -d          # Postgres 17 en :5432, crea esquema automáticamente

# 2) Backend (desde backend/)
.\venv\Scripts\activate
uvicorn app.main:app --reload # http://127.0.0.1:8000 — Swagger: http://127.0.0.1:8000/docs

# 3) Frontend (desde frontend/)
npm install                   # solo si falta node_modules
npm run dev                   # http://localhost:5173
```

Configuración BD por variables de entorno en `backend/.env` (ver plantilla `backend/.env.example`):
`DB_HOST=localhost`, `DB_PORT=5432`, `DB_NAME=banco_digital`, `DB_USER=postgres`, `DB_PASSWORD=123456`.

---

## 4. Estado actual del backend

### 4.1 Endpoints disponibles (todos públicos hoy)

| Método | Ruta | Body / Notas |
|---|---|---|
| GET | `/` , `/health` , `/health/db` | Bienvenida y healthchecks |
| POST | `/users` | `{correo, contrasena, rol?, estado?}` → 201; 409 si correo duplicado |
| GET | `/users` , `/users/{user_id}` | Lista / detalle |
| PUT | `/users/{user_id}` | Solo cambia `rol` / `estado` |
| POST | `/clients` | `{id_usuario, nombres, apellidos, documento, telefono?, direccion?}`; 400 si usuario no existe o documento duplicado |
| GET | `/clients` , `/clients/{client_id}` | Lista / detalle |
| PUT | `/clients/{client_id}` | Actualiza datos del cliente |
| DELETE | `/clients/{client_id}` | 204; 409 si tiene cuentas o beneficiarios |
| POST | `/accounts` | `{id_cliente, tipo, saldo_inicial?}` → fuerza estado ACTIVA |
| GET | `/accounts` , `/accounts/{account_id}` | Lista / detalle (incluye `numero_cuenta`) |
| PUT | `/accounts/{account_id}` | SOLO cambia `estado` (ACTIVA/BLOQUEADA/CERRADA). No existe DELETE de cuentas |
| GET | `/transactions` | Todas, fecha descendente |
| GET | `/transactions/account/{account_id}/statement` | Estado de cuenta con totales (ingresos/gastos/saldo) |
| GET | `/transactions/account/{account_id}` | Historial de la cuenta (origen o destino) |
| GET | `/transactions/{transaction_id}` | Detalle |
| POST | `/transactions/deposit` | `{numero_cuenta, monto, descripcion?}` |
| POST | `/transactions/withdraw` | `{numero_cuenta, monto, descripcion?}` |
| POST | `/transactions/transfer` | `{cuenta_origen, cuenta_destino, monto, descripcion?}` (usa **números** de cuenta, no ids) |

### 4.2 Brechas del backend (bloqueantes o pendientes)

1. **CORS NO configurado** → las peticiones desde `localhost:5173` serán bloqueadas. Es el paso 0 de la integración (sección 6).
2. **NO existe autenticación**: no hay `POST /auth/login`. El servicio `backend/app/services/auth_service.py` es un stub y no hay librería JWT instalada (`pyjwt`/`python-jose` ausentes en `requirements.txt`). Lo preparado: schemas `LoginRequest`/`TokenResponse` en `backend/app/schemas/auth.py`, modelo `RefreshToken` y utilidades bcrypt en `backend/app/utils/security.py`.
3. **NO existe CRUD de beneficiarios**: solo hay tabla/modelo/schema (`beneficiarios`, `backend/app/models/beneficiary.py`, `backend/app/schemas/beneficiary.py`); el service es un placeholder comentado.

### 4.3 Datos semilla en la BD viva (para pruebas)

- Usuario/cliente: `juan@banchoco.com` (id_usuario 4, documento 987654321).
- Cuenta `1000000001` (id_cuenta 3, saldo 500000) — **estado BLOQUEADA** (las transacciones sobre ella fallarán; cambiar estado vía `PUT /accounts/3` con `{"estado": "ACTIVA"}` para probar).
- Transacciones DEPOSITO/RETIRO asociadas a esa cuenta.

---

## 5. Inventario de datos mock en el frontend (lo que hay que limpiar)

Verificado: hoy el frontend **no hace ninguna petición HTTP** (ni fetch ni axios). No existe capa de servicios ni variables `VITE_*`. Librerías ya instaladas pero sin usar: `axios`, `jwt-decode`, `dayjs`, `react-toastify`, `react-hook-form` + `yup`.

### Por archivo

| Archivo (ruta) | Mocks | Destino real |
|---|---|---|
| `frontend/src/pages/dashboard.jsx` | `MOVIMIENTOS` (~línea 41), `saldo=4238500` y `variacion=2.4` (~133), tarjeta `"•••• 4821"` (~185) | `GET /accounts` + `GET /transactions/account/{id}` |
| `frontend/src/pages/SaldoMovimientos.jsx` | `MOVIMIENTOS` (~21), `saldo`, `variacion` (~41) | `GET /accounts` + `GET /transactions/account/{id}` |
| `frontend/src/pages/Historial.jsx` | `CUENTA_ORIGEN` (~53), `RESUMEN_PERIODO` (~58), `MOVIMIENTOS_DEMO` (~86), paginación falsa con `TOTAL_MOVIMIENTOS=160` (~109), `"Hola, Juan"` (~173), badges fijos 5/3 (~165) | `GET /accounts` + `GET /transactions/account/{id}/statement` + paginación desde el array real |
| `frontend/src/pages/transferencias.jsx` | `CUENTA_ORIGEN` (~93), `CONTACTOS_FRECUENTES` (~130, crear contacto solo hace setState en memoria ~312), `ACTIVIDAD_RECIENTE` (~138), `LIMITES` (~146), transferencia simulada con `setTimeout(900)` en `handleConfirmar` (~409), `"Hola, Juan"` (~450). `BANCOS_COLOMBIA` (~69) es catálogo legítimo: se queda | `GET /accounts` + `POST /transactions/transfer`; contactos → tabla `beneficiarios` (endpoint pendiente) |
| `frontend/src/pages/Retiros.jsx` | `cuentasDisponibles` (~14), retiro simulado con `setTimeout(900)` (~62) | `GET /accounts` + `POST /transactions/withdraw` |
| `frontend/src/pages/login.jsx` | Login falso: valida formato y navega a `/dashboard` con cualquier credencial (`onLogin` es no-op, ~45) | `POST /auth/login` (no existe aún — ver decisión en 7.2) |
| `frontend/src/pages/registro.jsx` | Registro simulado con `setTimeout(800)` (~69); saldo decorativo en tarjeta promocional (~104) | `POST /users` + `POST /clients` |
| `frontend/src/pages/inicio.jsx` | Mockup de teléfono: movimientos falsos (~71), saldo (~352), "Hola Juan" (~340). Landing comercial (`STATS`, `PRODUCTOS`, `FAQS`) es contenido de marketing: se queda | Solo el mockup si se quiere dinámico; landing normalmente estática |
| `frontend/src/components/Sidebar.jsx` | Sin mocks, pero define el **contrato de sesión**: lee `localStorage["user"]` con forma `{first_name, last_name, email}` y borra `localStorage["token"]` al salir | Quien haga el login debe guardar esas claves exactas |

---

## 6. Plan de integración (orden de ejecución)

### Paso 0 — Habilitar comunicación (elegir UNA opción)

**Opción A (recomendada): CORS en el backend.** En `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Opción B: proxy de desarrollo en `frontend/vite.config.js`** (evita tocar CORS):

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

Si se elige B, todas las llamadas del frontend usan prefijo `/api/...`.

### Paso 1 — Crear capa de servicios en el frontend

Crear `frontend/src/services/api.js` con axios (ya instalado):

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
});

export default api;
```

Y un módulo por dominio (`frontend/src/services/accounts.js`, `transactions.js`, etc.) o funciones agrupadas. Definir `VITE_API_URL` en `frontend/.env` si se quiere configurar por entorno.

### Paso 2 — Sesión mínima compartida

Crear un contexto (`frontend/src/context/AuthContext.jsx`) que:
- Guarde en `localStorage` la clave `user` con forma EXACTA `{first_name, last_name, email}` (contrato que ya consume `Sidebar.jsx`), y opcionalmente `token`.
- Exponga la cuenta activa (id, numero_cuenta, saldo) para dashboard/movimientos/transferencias/retiros.

### Paso 3 — Conectar página por página (reemplazos concretos)

| Funcionalidad | Archivo | Cambio |
|---|---|---|
| Registro | `registro.jsx` | Reemplazar el `setTimeout` por `POST /users` (correo+contraseña) y luego `POST /clients` (nombres, apellidos, documento...) con el `id_usuario` devuelto. Redirigir a `/login` |
| Login | `login.jsx` | Mientras no exista `/auth/login`: mantener validación local pero guardar el usuario en localStorage (contrato del Sidebar) y validar contra `GET /users` es inaceptable en producción — decidir según 7.2 |
| Dashboard | `dashboard.jsx` | Saldo/tarjeta ← `GET /accounts/{id}`; movimientos recientes ← `GET /transactions/account/{id}` (primeros N); número de tarjeta ← últimos 4 dígitos de `numero_cuenta` |
| Movimientos | `SaldoMovimientos.jsx` | Ídem dashboard |
| Historial | `Historial.jsx` | Resumen ← `GET /transactions/account/{id}/statement`; listado ← `GET /transactions/account/{id}`; paginar en cliente sobre el array real; filtros por tipo mapeados a DEPOSITO/RETIRO/TRANSFERENCIA |
| Transferencias | `transferencias.jsx` | Cuenta origen ← `GET /accounts`; `handleConfirmar` → `POST /transactions/transfer` con `{cuenta_origen, cuenta_destino, monto, descripcion}` (montos como número, sin separadores de miles); manejar errores 400/404/409 del backend con SweetAlert/toast; actividad reciente ← historial real |
| Retiros | `Retiros.jsx` | Cuentas ← `GET /accounts` (solo estado ACTIVA); confirmación → `POST /transactions/withdraw` con `{numero_cuenta, monto}` |
| Beneficiarios/contactos | `transferencias.jsx` | Pendiente hasta implementar CRUD `/beneficiaries` en el backend |

### Paso 4 — Limpieza final de mocks

- Borrar constantes listadas en sección 5 (excepto `BANCOS_COLOMBIA` y contenido de marketing de `inicio.jsx`).
- Eliminar estados/props muertos que quedaron sin uso tras la conexión.
- Quitar los comentarios tipo "aquí se conecta con el servicio real".
- Correr `npm run lint` en `frontend/` para detectar imports/variables sin uso.

---

## 7. Decisiones pendientes (definir antes de cerrar)

1. **Autenticación**: ¿se implementa ahora `app/routes/auth.py` con `POST /auth/login` (requiere agregar `pyjwt` a requirements y firmar/verificar tokens usando `verify_password` y la tabla `refresh_tokens`, todo ya modelado)? Mientras tanto el login seguirá siendo simulado. El frontend ya tiene `jwt-decode` instalado y contempla `token` en localStorage, así que el camino natural es: login → guardar `{access_token, ...}` → decodificar para armar `user` del Sidebar → enviar `Authorization: Bearer` en el interceptor de axios.
2. **Cuenta por defecto**: hoy `GET /accounts` devuelve TODAS las cuentas (no filtra por usuario logueado porque no hay sesión). Decidir si se filtra en cliente (por `id_cliente`) o se agrega endpoint filtrado cuando exista auth.
3. **Categorías visuales del Historial**: el backend solo tiene tipos DEPOSITO/RETIRO/TRANSFERENCIA; el mock usa categorías (compras, entretenimiento, alimentación). Opción simple: derivar categoría a partir del tipo (mapeo UI) o mostrar el tipo tal cual.
4. **Paginación del historial**: hacerla en cliente (array completo ya trae el endpoint) o paginada real en backend (requiere query params nuevos).
5. **Beneficiarios**: ¿se implementa el CRUD en esta iteración o los "contactos frecuentes" quedan fuera de alcance?

## 8. Mapeos y formatos importantes

- Montos: backend usa NUMERIC(12,2) → enviar/recibir números JS planos (sin `$`, sin puntos de miles); formatear solo en render (`Intl.NumberFormat("es-CO")`).
- Fechas: backend devuelve ISO; el frontend tiene `dayjs` instalado para formatear.
- Tipos de transacción válidos: `DEPOSITO | RETIRO | TRANSFERENCIA`. Estados de cuenta: `ACTIVA | BLOQUEADA | CERRADA`.
- Transferencias y retiros trabajan con `numero_cuenta` (string), igual que los formularios actuales — no requiere cambios de modelo en el frontend.
- Errores FastAPI: `{detail: "mensaje"}` — mostrar ese campo en los diálogos de error.

## 9. Checklist de aceptación

- [ ] CORS o proxy funcionando (petición desde 5173 llega a 8000 sin error de navegador).
- [ ] Registro crea usuario + cliente reales (visible en Swagger/BD) y redirige a login.
- [ ] Login persiste `localStorage.user` con `{first_name, last_name, email}` y el Sidebar lo muestra.
- [ ] Dashboard muestra saldo y movimientos reales de una cuenta ACTIVA.
- [ ] Depósito, retiro y transferencia ejecutados desde la UI se reflejan en la BD y en los saldos.
- [ ] Historial muestra statement (ingresos/gastos) y movimientos reales, sin arrays demo ni paginación falsa.
- [ ] `grep` de `MOVIMIENTOS_DEMO`, `CUENTA_ORIGEN`, `CONTACTOS_FRECUENTES`, `ACTIVIDAD_RECIENTE`, `TOTAL_MOVIMIENTOS` en `frontend/src` devuelve 0 resultados.
- [ ] `npm run lint` sin warnings de código muerto.
