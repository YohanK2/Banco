# Resumen del Proyecto — Banco

> Documento de referencia del estado actual (la "base") para tener en cuenta en el futuro.
> Última actualización: agosto 2026.

## 1. Descripción general

App bancaria digital (banca móvil) construida con **React + Vite**. Nombre ficticio: **Banchocó** (antes MAREA). La UI y los flujos principales están completos y animados: **landing pública** (`/inicio`), **registro** (`/registro`), **login** con validación y **panel de sesión con sidebar** (dashboard, transferencias, saldo/movimientos, retiros, historial).

Los datos siguen siendo **mock** (frontend funcional sin API conectada todavía), pero ya existe la **base de datos PostgreSQL definida** (`database/banco.sql` + `docker-compose.yml`) lista para levantar el esquema cuando se construya el backend.

## 2. Stack y dependencias (package.json)

### Dependencias de producción
- **react** / **react-dom** ^19.2 — core de React 19.
- **react-router-dom** ^7.18 — enrutado SPA.
- **framer-motion** ^12.43 — animaciones y transiciones.
- **lucide-react** ^1.28 — iconos usados en todo el proyecto.
- **react-icons** ^5.7 — librería de iconos adicional (no usada aún en páginas).
- **sweetalert2** ^11.26 — modales de confirmación (usado en logout del sidebar).
- **react-hook-form** ^7.84 — formularios (instalado, aún no usado).
- **yup** ^1.7 — esquemas de validación (instalado, aún no usado).
- **@hookform/resolvers** ^5.7 — puente RHF ↔ Yup (instalado, aún no usado).
- **axios** ^1.19 — cliente HTTP para futuras llamadas al backend.
- **jwt-decode** ^4.0 — decodificar JWT (pensado para auth futura).
- **dayjs** ^1.11 — manejo de fechas (instalado, no usado aún).
- **react-toastify** ^11.1 — notificaciones toast (instalado, aún no usado).

### Dependencias de desarrollo
- **vite** ^8.2, **@vitejs/plugin-react** ^6 — tooling de build.
- **oxlint** ^1.77 — lint (comando `npm run lint`).
- **vitest** ^4.1 + **@testing-library** (react, jest-dom, user-event) + **jsdom** — testing configurado y disponible.

> Nota: react-hook-form, yup, axios, jwt-decode, dayjs y react-toastify ya están instalados pero **sin uso** — son la base pensada para la siguiente etapa (auth real + API + tests).

## 3. Estructura de carpetas

```
Banco/
├── frontend/                       → código fuente (proyecto Vite/React)
│   ├── src/
│   │   ├── main.jsx                → punto de entrada (monta React en #root)
│   │   ├── App.jsx                 → rutas del SPA
│   │   ├── components/
│   │   │   ├── InicioNavbar.jsx    → navbar de la landing pública
│   │   │   └── Sidebar.jsx         → sidebar del panel de sesión (reemplaza a Navbar.jsx)
│   │   ├── pages/
│   │   │   ├── inicio.jsx          → landing pública (hero, productos, seguridad…)
│   │   │   ├── login.jsx           → login con validación (BanchocoLogin)
│   │   │   ├── registro.jsx        → registro de cuenta con validación
│   │   │   ├── dashboard.jsx       → resumen de cuenta (panel con sidebar)
│   │   │   ├── transferencias.jsx  → transferencias
│   │   │   ├── SaldoMovimientos.jsx→ saldo y movimientos
│   │   │   ├── Retiros.jsx         → retiros
│   │   │   └── Historial.jsx       → historial con filtros
│   │   └── assets/
│   │       ├── styles/             → un CSS por página + index.css + App.css
│   │       └── hero.png
│   ├── public/                     → favicon, icons.svg, videos (choco/)
│   └── index.html
├── database/
│   └── banco.sql                   → esquema PostgreSQL (usuarios, clientes, cuentas, transacciones…)
├── docker-compose.yml              → Postgres 17 (db: banco_digital) con banco.sql de init
└── backend/                        → documentos/respaldo (aquí vive este resumen)
```

## 4. Rutas (App.jsx)

| Ruta | Componente | Notas |
|---|---|---|
| `/`, `/login` | Login | `BanchocoLogin` con validación |
| `/inicio` | Inicio | Landing pública |
| `/registro` | Registro | Crear cuenta con validación |
| `/dashboard`, `/resumen`, `/perfil`, `/soporte`, `/ajustes` | Dashboard | Varias rutas apuntan al mismo componente (páginas placeholder) |
| `/transferencias` | Transferencias | |
| `/movimientos` | SaldoMovimientos | |
| `/retiros` | Retiros | |
| `/historial` | Historial | |

## 5. Módulos y funciones relevantes (por archivo)

### `src/main.jsx`
- `createRoot(...).render(<StrictMode><App/></StrictMode>)` — bootstrap de la app.

### `src/App.jsx`
- Define `<Router>` + `<Routes>` con todas las rutas.
- Exporta `App`.

### `src/components/InicioNavbar.jsx`
- Navbar de la **landing pública** (estilos en `InicioNavbar.css`).
- `NAV_ITEMS` — enlaces de anclaje a secciones (`#inicio`, `#productos`, `#para-ti`, `#seguridad`, `#nosotros`, `#ayuda`).
- Acciones: botón de búsqueda (decorativo), `Iniciar sesión` → `/login`, `Abrir cuenta` → `/registro`.
- Menú móvil desplegable (toggle `mobileOpen` con framer-motion).

### `src/components/Sidebar.jsx`
- Sidebar del **panel de sesión** (estilos en `Sidebar.css`). Reemplaza al viejo `Navbar.jsx`; lo usan dashboard, transferencias, SaldoMovimientos, Retiros e Historial.
- `NAV_LINKS` — `{ to, icon, label }` → Resumen (`/dashboard`), Transferencias, Saldo y Movimientos, Retiros, Ajustes (`/ajustes`).
- `getUserName()` / `getUserInitials()` — desde `user.first_name`/`last_name`/`email` en localStorage.
- `isActive(path)` — marca el enlace activo comparando `location.pathname`.
- `handleLogout()` — confirmación con SweetAlert2; borra `localStorage.user` y `localStorage.token`, navega a `/login`.
- Efecto: lee `localStorage.getItem("user")` al cambiar de ruta.
- En escritorio columna fija con marca, navegación, tarjeta promocional ("Invita y gana") y usuario; en móvil barra superior con menú desplegable.
- Espera un objeto `user` con `{ first_name, last_name, email }` y `token` en localStorage — la interfaz que deberá llenar el login real con JWT.

### `src/pages/inicio.jsx`
- **Landing pública** de Banchocó (estilos `inicio.css`), marca visual "verde bosque + dorado + acento lima".
- **Constantes de contenido**: `TRUST_ITEMS`, `MOVIMIENTOS`, `QUICK_ACTIONS`, `FEATURES`, `STATS`, `PRODUCTOS`, `PARA_TI`, `SEGURIDAD`, `VALORES`, `FAQS`, `CANALES_AYUDA`.
- **`fmtCOP(n)`** — formato moneda COP con `toLocaleString("es-CO")` y `Math.abs`.
- **`CountUp({ value, decimals, prefix, suffix })`** — contador animado con `useInView` + `requestAnimationFrame` (ease-out cúbico).
- **`FaqItem({ q, a, open, onToggle })`** — acordeón animado con `AnimatePresence`.
- `Inicio()` — secciones: hero (con mockup de teléfono flotante "app dentro de la landing"), features + stats, productos, para ti, seguridad, nosotros, ayuda/FAQ y botón "volver arriba" (aparece tras scroll > 560px).
- CTAs: "Abrir mi cuenta" → `/registro`, "Conoce más" (decorativo). Usa `InicioNavbar`.

### `src/pages/login.jsx`
- `BanchocoLogin({ onLogin = () => {} })` — componente exportable que recibe `onLogin` por prop.
- **`validate({ email, password })`** — validación real: correo obligatorio + regex, contraseña obligatoria + mínimo 8 caracteres.
- `handleSubmit(e)` — valida, llama `await onLogin(email, password)` (por defecto no hace nada) y navega a `/dashboard`. Estados de error en vivo con `aria-invalid`.
- Video de fondo `/choco/otro.mp4`, toggle de mostrar/ocultar contraseña, checkbox "Recordarme" y link "¿Olvidaste tu contraseña?" (decorativos).
- **TODO futuro**: aquí se conectará el POST a `/api/auth/login` (vía `onLogin`), se guardará `user` + `token` en localStorage y se validará con RHF + Yup (ya instalados).

### `src/pages/registro.jsx`
- Formulario de **creación de cuenta** con panel de marca + panel de formulario (estilos `registro.css`).
- **`validate({ nombre, email, password, confirm })`** — nombre obligatorio (≥2 chars), correo con regex, contraseña ≥8 caracteres, confirmación que coincida. Exportada para reuso/tests.
- `handleSubmit(e)` — valida; si pasa, simula el POST con `setTimeout(800ms)` y navega a `/login`.
- Campo `confirm` usa el mismo toggle de mostrar/ocultar que el password.
- **TODO futuro**: conectar el POST real a `/api/auth/registro` y crear el cliente/usuario en la BD (`database/banco.sql` ya tiene la tabla `usuarios` + `clientes`).

### `src/pages/dashboard.jsx`
- **Constantes**: `fmt(n)` (formato COP es-CO con 2 decimales), `MOVIMIENTOS` (array mock), `ICONOS_CAT` (mapea categoría → ícono), `ACCIONES` (accesos rápidos con `id/label/icon/title/text` listos para SweetAlert2).
- **`ConfirmModal({open, data, onClose})`**: modal animado (framer-motion) que usa `data.title` y `data.text`; comentario indica reemplazarlo por `Swal.fire`.
- `BankDashboard()`: estado `showBalance`, `modalData`. Saldo mock `4238500`, variación `2.4%`.
- Funciones clave: toggle de saldo oculto (`$ •••••••`), navegación al clicar "Transferir" → `/transferencias`, lista de movimientos recientes con colores según monto +/-, animación escalonada por índice.
- **TODO futuro**: reemplazar saldo/movimientos por datos de API; conectar `ACCIONES` (Recargar, Pagar servicios, Más) a sus páginas reales.

### `src/pages/transferencias.jsx`
- **`formatCOP(value)`** — formato moneda COP sin decimales (Intl.NumberFormat es-CO).
- **`initialForm`** — `{ cuentaDestino, nombreDestinatario, monto, descripcion }`.
- `handleChange(field)` — actualiza un campo; filtra no-dígitos en `monto`.
- `validate()` — valida cuenta obligatoria, nombre obligatorio, monto > 0; devuelve objeto de errores.
- `handleContinuar(e)` — valida y pasa a step `'confirm'`.
- `handleConfirmar()` — **simula** la llamada al backend con `setTimeout(900ms)`, luego step `'success'`.
- `handleNuevaTransferencia()` — reinicia formulario.
- **Flujo**: `form → confirm → success`, con comprobante en vivo (aside `receipt-card`) que muestra estado "Borrador / Pendiente de confirmación / Completado".
- **TODO futuro**: el comentario marca que ahí se conectará el servicio real de transferencias (API).

### `src/pages/SaldoMovimientos.jsx`
- **Constantes**: `fmt`, `MOVIMIENTOS` (6 movimientos mock), `ICONOS_CAT`.
- `SaldoMovimientos()`: estado `showBalance`, saldo mock `4238500`, variación `2.4%`.
- Tarjeta de saldo con toggle mostrar/ocultar, y lista de "todos los movimientos".
- **TODO futuro**: reemplazar mock por API (GET de saldo + movimientos).

### `src/pages/Retiros.jsx`
- **`formatCOP`**, **`cuentasDisponibles`** (array mock: cuenta ahorros `•••• 4521` saldo `850000`), **`initialForm`** `{ cuenta, monto }`.
- `handleChange(field)` — filtra no-dígitos en `monto`.
- `validate()` — cuenta obligatoria, monto > 0, y **monto no mayor al saldo disponible**.
- `handleContinuar` / `handleConfirmar` (simula API con 900ms) / `handleNuevoRetiro`.
- Cálculo en vivo de `saldoRestante = max(saldo - monto, 0)` mostrado en el comprobante.
- **TODO futuro**: conectar API real de retiros; traer `cuentasDisponibles` del backend.

### `src/pages/Historial.jsx`
- **`formatCOP`** (usa Math.abs) y **`formatFecha(isoDate)`** (Intl.DateTimeFormat es-CO, día-mes-año).
- **`tipoLabel`** — mapea `transferencia/deposito/retiro` a texto.
- **`movimientosDemo`** — array mock con `{ id, fecha, tipo, valor, estado }` (`completado`/`pendiente`).
- **`filtros`** — Todos / Transferencias / Depósitos / Retiros.
- `Historial()`: estado `filtroTipo`; usa `useMemo` para filtrar la tabla.
- Estados vacíos manejados: sin movimientos / sin resultados para el filtro.
- Tabla responsiva (atributos `data-label` para móvil), badges de estado (`status-pill`).
- **TODO futuro**: alimentar la tabla con el GET de historial real del backend.

## 6. Estilos (src/assets/styles)

- `index.css` — reset/global.
- `App.css`, `inicio.css`, `InicioNavbar.css`, `login.css`, `registro.css`, `dashboard.css`, `transferencias.css`, `SaldoMovimientos.css`, `retiros.css`, `historial.css`, `Sidebar.css` — un CSS por vista.
- Convenciones: paleta consistente (`#0B3D2E` navy, `#F2A93B` ámbar, `#12B76A` verde, `#F0655A` rojo, `#A9B3CC` gris), clases BEM-ish, numeros con clase `tabular`.
- La landing usa su propia paleta "Banchocó" (verde bosque + dorado + lima) con prefijos `bc-`; el panel conserva los colores de MAREA.
- Existe `COLORES.md` en la raíz del frontend con la paleta.

## 7. Base de datos (nueva)

- **`database/banco.sql`** — esquema PostgreSQL con 7 tablas:
  - `usuarios` (correo UNIQUE, contrasena_hash, rol, estado, fecha_creacion)
  - `clientes` (nombres, apellidos, documento UNIQUE, telefono, direccion → FK `usuarios`)
  - `cuentas` (numero_cuenta UNIQUE, tipo, saldo NUMERIC(12,2), estado → FK `clientes`)
  - `transacciones` (cuenta_origen/destino, tipo, monto, descripcion, fecha → FK `cuentas`)
  - `beneficiarios` (alias, → FK `clientes` y `cuentas`)
  - `refresh_tokens` (token, fecha_expiracion, activo → FK `usuarios`)
  - `auditoria` (accion, descripcion, ip → FK `usuarios`)
  - + 4 índices: `documento`, `numero_cuenta`, `fecha_transaccion`, `auditoria_usuario`.
- **`docker-compose.yml`** — servicio `postgres` (imagen `postgres:17`, container `banco_postgres`), DB `banco_digital`, user/pass `postgres`/`123456`, puerto `5432:5432`, volumen persistente `postgres_data` y monta `banco.sql` como init (`01-banco.sql`).
- El esquema ya contempla la estructura que necesitará la auth (hash + refresh tokens) y las operaciones del panel (cuentas, transferencias, beneficiarios).

## 8. Estado actual (lo que ES la base)

**Funciona hoy (100% mock):**
- Landing pública completa (`/inicio`): hero con mockup de app, features, estadísticas animadas, productos, para ti, seguridad, nosotros, FAQ.
- Registro (`/registro`): formulario con validación y redirección simulada al login.
- Login (`/login`): validación real, prop `onLogin` lista para conectar la API.
- Dashboard con tarjeta de saldo, toggle de ocultar saldo, accesos rápidos y movimientos recientes.
- Transferencias: formulario + validación + confirmación + comprobante + éxito.
- Retiros: igual, con validación contra saldo y saldo restante en vivo.
- Historial: tabla + filtros + estados vacíos.
- Sidebar (panel): navegación, usuario desde localStorage y logout con confirmación.
- Esquema de base de datos definido y listo para levantar (docker-compose).

**No existe todavía (pendiente):**
- Backend/API real (la carpeta `backend/` solo tiene documentos; `database/` solo tiene el SQL).
- Autenticación real con JWT (`jwt-decode` + `axios` instalados y listos).
- Conexión a la BD Postgres (levantar `docker-compose up` + construir el servidor).
- Persistencia de datos (saldos, movimientos, usuarios).
- Formularios con react-hook-form + yup (instalados y listos).
- Tests (vitest + testing-library configurados, sin tests escritos).
- Páginas placeholder (`/perfil`, `/soporte`, `/ajustes`) y accesos rápidos de dashboard.

## 9. Comandos útiles

```bash
npm run dev      # servidor de desarrollo (Vite, HMR)
npm run build    # build de producción
npm run lint     # oxlint
npm run preview  # previsualizar el build

docker compose up -d   # levantar Postgres 17 (db banco_digital, puerto 5432)
docker compose down    # detener el contenedor
```

## 10. Buenas prácticas ya establecidas (mantener)

- Un CSS por página, importado dentro del componente.
- Nombres de clases BEM-ish (ej. `hero-card__content`).
- Formatos de moneda/fecha con `Intl.NumberFormat('es-CO')`.
- Icons de lucide-react con `size` y `color` explícitos.
- Animaciones con framer-motion, con delays escalonados por índice.
- Datos de usuario en `localStorage` bajo `user` y `token`.
- Comentarios en el código marcando exactamente dónde conectar el backend.
