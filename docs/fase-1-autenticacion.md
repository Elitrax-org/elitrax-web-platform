# Fase 1 — Autenticación Real
**Proyecto:** elitrax-web-platform
**Backend:** Web Platform API (Next.js 16 + Supabase)
**Fecha:** Mayo 2026
**Branch:** feature/dashboard-interact-v1
**Commit:** 949ae58

---

## 1. Contexto y objetivo

Antes de esta fase, el frontend tenía autenticación completamente simulada:
- Las credenciales estaban hardcodeadas en `src/users.js`
- El login no llamaba a ningún servidor
- La sesión se perdía al recargar la página (solo existía en memoria React)
- No había validación real de usuarios

El objetivo de la Fase 1 es **conectar el login y la sesión del frontend al backend real**, sin cambiar nada visual ni de estructura.

---

## 2. Archivos creados o modificados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `vite.config.js` | Modificado | Proxy `/api` → backend |
| `src/lib/api.js` | Creado | Cliente HTTP centralizado |
| `src/context/UserContext.jsx` | Modificado | Auth real + restauración de sesión |
| `src/views/LoginPage.jsx` | Modificado | Consume API real |
| `src/App.jsx` | Modificado | Pantalla de carga mientras verifica sesión |

---

## 3. Arquitectura de autenticación

### 3.1 Flujo completo de login

```
Usuario ingresa email + contraseña
        ↓
LoginPage.jsx llama login(email, pass) de UserContext
        ↓
UserContext llama auth.login(email, pass) de src/lib/api.js
        ↓
src/lib/api.js hace POST /api/v1/auth/login
        ↓
Vite proxy redirige a http://localhost:3000/api/v1/auth/login
        ↓
Backend (Next.js) valida contra Supabase Auth
        ↓
Supabase setea cookies httpOnly en el navegador:
  - sb-access-token  (JWT de sesión)
  - sb-refresh-token (token de renovación)
        ↓
Backend retorna { ok: true }
        ↓
UserContext llama me.get() → GET /api/v1/me
        ↓
Backend lee cookies, valida sesión, retorna perfil:
  { user, activeAccount, memberships }
        ↓
UserContext normaliza y guarda en estado React:
  { email, name, initials, accountId, role }
        ↓
App.jsx detecta isAuth=true → muestra dashboard
```

### 3.2 Flujo de restauración de sesión (al recargar página)

```
Usuario recarga el navegador
        ↓
App.jsx muestra pantalla "Cargando..." (sessionReady=false)
        ↓
UserContext.useEffect() llama me.get() → GET /api/v1/me
        ↓
Si hay cookies válidas → backend retorna perfil → usuario autenticado
Si no hay cookies     → backend retorna 401   → muestra LoginPage
        ↓
sessionReady=true → renderiza la vista correcta
```

### 3.3 Flujo de logout

```
Usuario hace clic en cerrar sesión (Sidebar)
        ↓
UserContext.logout() llama auth.logout()
        ↓
POST /api/v1/auth/logout
        ↓
Backend limpia cookies de Supabase en el navegador
        ↓
UserContext setUser(null) → isAuth=false → muestra LoginPage
```

---

## 4. Estructura de base de datos relevante (backend)

### 4.1 Tablas de autenticación (schema `auth` — Supabase)

Gestionadas completamente por Supabase Auth. El frontend **nunca accede directamente** a estas tablas.

| Tabla | Descripción |
|-------|-------------|
| `auth.users` | Usuarios registrados. Campos clave: `id` (UUID), `email`, `created_at` |
| `auth.sessions` | Sesiones activas vinculadas a un usuario |
| `auth.refresh_tokens` | Tokens de renovación de sesión |

### 4.2 Tabla `profiles` (schema `public`)

Perfil extendido del usuario, complementa `auth.users`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK, FK → auth.users) | Mismo ID que el usuario de Supabase |
| `full_name` | String (opcional) | Nombre completo del usuario |
| `preferred_locale` | String (default: "en") | Idioma preferido |
| `avatar_url` | String (opcional) | URL de foto de perfil |
| `created_at` | Timestamptz | Fecha de creación |
| `updated_at` | Timestamptz | Última actualización |

### 4.3 Tabla `accounts` (schema `public`)

Una cuenta es el espacio de trabajo (club/organización). Un usuario puede pertenecer a varias cuentas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único de la cuenta |
| `type` | Enum (individual, corporate) | Tipo de cuenta |
| `display_name` | String | Nombre de la organización |
| `owner_user_id` | UUID (FK → auth.users) | Propietario de la cuenta |
| `country_code` | Char(2) | País (AR, UY, etc.) |
| `contact_email` | String | Email de contacto |
| `created_at` | Timestamptz | Fecha de creación |

### 4.4 Tabla `account_members` (schema `public`)

Relación entre usuarios y cuentas (membresías).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `account_id` | UUID (PK, FK → accounts) | Cuenta a la que pertenece |
| `user_id` | UUID (PK, FK → auth.users) | Usuario miembro |
| `role` | Enum | Rol del usuario en la cuenta |
| `joined_at` | Timestamptz | Fecha en que se unió |

**Roles disponibles:**

| Rol | Descripción |
|-----|-------------|
| `owner` | Propietario — acceso total, puede eliminar la cuenta |
| `administrator` | Administrador — acceso total excepto eliminar cuenta |
| `technician` | Técnico — acceso a jugadores, sesiones, métricas |
| `assistant` | Asistente — acceso limitado de lectura/escritura |
| `viewer` | Solo lectura — no puede crear ni editar datos |

---

## 5. Endpoints consumidos en esta fase

### POST `/api/v1/auth/login`

**Propósito:** Autenticar al usuario con email y contraseña.

**Request:**
```json
{
  "email": "usuario@dominio.com",
  "password": "contraseña123"
}
```

**Validaciones del backend (Zod):**
- `email`: string, formato email válido
- `password`: string, mínimo 8 caracteres, máximo 72

**Response exitoso (200):**
```json
{ "ok": true }
```

**Efecto secundario:** Supabase setea cookies httpOnly en el navegador (`sb-access-token`, `sb-refresh-token`).

**Errores posibles:**

| Status | Causa |
|--------|-------|
| 400 | Email o contraseña con formato inválido |
| 401 | Credenciales incorrectas |
| 429 | Rate limit excedido (10 req/min por IP) |
| 500 | Error interno del servidor |

---

### GET `/api/v1/me`

**Propósito:** Obtener el perfil del usuario autenticado y su cuenta activa.
Usado en dos momentos: al hacer login y al recargar la página.

**Headers requeridos:** Ninguno — las cookies de Supabase se envían automáticamente.

**Response exitoso (200):**
```json
{
  "user": {
    "userId": "uuid-del-usuario",
    "email": "usuario@dominio.com",
    "fullName": "Nombre Completo"
  },
  "activeAccount": {
    "id": "uuid-de-la-cuenta",
    "type": "corporate",
    "role": "administrator"
  },
  "memberships": [
    {
      "accountId": "uuid-de-la-cuenta",
      "role": "administrator"
    }
  ]
}
```

**Errores posibles:**

| Status | Causa |
|--------|-------|
| 401 | Sin sesión activa (cookies ausentes o expiradas) |
| 500 | Error interno |

---

### POST `/api/v1/auth/logout`

**Propósito:** Cerrar la sesión del usuario y limpiar las cookies de Supabase.

**Request:** Vacío.

**Response exitoso (200):**
```json
{ "ok": true }
```

**Efecto secundario:** Supabase elimina las cookies `sb-access-token` y `sb-refresh-token` del navegador.

---

## 6. Cliente HTTP — `src/lib/api.js`

### Responsabilidades
- Centralizar todas las llamadas HTTP al backend
- Incluir `credentials: 'include'` en cada request (envía cookies automáticamente)
- Normalizar errores HTTP a objetos `Error` con `.status` y `.message`
- Ser el único punto de contacto entre el frontend y la API

### Configuración
```
Base URL: /api/v1
Proxy Vite: /api → http://localhost:3000
Credentials: include (cookies automáticas)
Content-Type: application/json
```

### Manejo de errores
Cuando el backend retorna un status >= 400, `api.js` lanza un `Error` con:
- `error.status` → código HTTP (401, 429, 500, etc.)
- `error.message` → mensaje del backend o `"Error {status}"`
- `error.body` → body completo de la respuesta

### Estructura de módulos exportados
```js
auth.login(email, password)  → POST /auth/login
auth.logout()                → POST /auth/logout
me.get()                     → GET  /me
```

---

## 7. UserContext — lógica y reglas de negocio

### Estado almacenado
```js
{
  user: {
    email:     string,   // email del usuario
    name:      string,   // nombre completo (de profiles.full_name o email)
    initials:  string,   // primeras letras del nombre (ej: "JC" para Juan Cruz)
    accountId: string,   // UUID de la cuenta activa (para llamadas futuras a la API)
    role:      string,   // rol en la cuenta activa (owner, administrator, etc.)
  } | null,
  isAuth:       boolean,  // true si hay usuario autenticado
  sessionReady: boolean,  // true cuando terminó de verificar la sesión inicial
}
```

### Regla de normalización de usuario
El backend retorna `fullName` o puede estar vacío. La lógica de normalización:
1. Usa `fullName` si existe
2. Si no, usa `email` como nombre de display
3. Las iniciales se calculan con las primeras dos palabras del nombre

### Regla de restauración de sesión
Al montar la app, `UserContext` llama a `GET /me`:
- Si hay cookies válidas: el usuario queda autenticado sin necesidad de hacer login
- Si no hay cookies o expiraron: `user = null`, se muestra LoginPage
- En ambos casos: `sessionReady = true` cuando termina

### Regla de persistencia
La sesión persiste en las cookies httpOnly del navegador (gestionadas por Supabase). El estado de React (`user`) es solo un reflejo en memoria. Al recargar, el estado se reconstruye desde la cookie.

---

## 8. LoginPage — reglas de validación

| Campo | Regla frontend | Regla backend |
|-------|---------------|---------------|
| Email | Requerido, debe contener @ | Formato email válido (Zod) |
| Contraseña | Mínimo 8 caracteres | Mínimo 8, máximo 72 (Zod) |

**Mapeo de errores HTTP a mensajes de UI:**

| Status HTTP | Mensaje mostrado al usuario |
|-------------|----------------------------|
| 400 | "Credenciales incorrectas." |
| 401 | "Credenciales incorrectas." |
| 429 | "Demasiados intentos. Esperá un momento." |
| Otro / red | "No se pudo conectar con el servidor." |

---

## 9. Proxy Vite — `vite.config.js`

### Por qué es necesario
El frontend corre en `localhost:5173` y el backend en `localhost:3000`. Los navegadores bloquean peticiones entre distintos orígenes (CORS). El proxy de Vite resuelve esto redirigiendo las llamadas a `/api` internamente, de modo que el navegador solo ve un único origen (`localhost:5173`).

### Configuración
```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### Comportamiento
- `GET /api/v1/me` desde el frontend → el servidor Vite lo redirige a `GET http://localhost:3000/api/v1/me`
- Las cookies se preservan en el proceso (el browser las envía a `localhost:5173`, Vite las reenvía a `localhost:3000`)
- **Solo aplica en desarrollo.** En producción, el frontend y backend deben estar en el mismo dominio o configurar CORS en el backend.

---

## 10. Lo que NO cambió en esta fase

- Diseño visual, colores, tipografías, componentes → intactos
- Lógica de jugadores, equipos, sesiones → siguen usando localStorage (Fases 2-3)
- Estructura de carpetas → sin cambios
- `src/users.js` → el archivo se mantiene pero ya no se usa en el login

---

## 11. Limitaciones conocidas y próximos pasos

| Limitación | Fase que lo resuelve |
|------------|---------------------|
| Jugadores y equipos siguen en localStorage | Fase 2 |
| Sesiones y eventos siguen hardcodeados | Fase 3 |
| `accountId` está en el contexto pero no se usa aún | Fase 2 |
| En producción se requiere configurar CORS en el backend | Previo a deploy |
| `src/users.js` es código muerto (se puede eliminar) | Limpieza post Fase 2 |

---

## 12. Cómo probar la Fase 1

### Prerequisitos
1. Backend corriendo en `localhost:3000` (`npm run dev` en `Web platform-api`)
2. Frontend corriendo en `localhost:5173` (`npm run dev` en `elitrax-web-platform`)
3. Al menos un usuario creado en Supabase (via `POST /api/v1/auth/sign-up`)

### Casos de prueba

| Caso | Acción | Resultado esperado |
|------|--------|--------------------|
| Login exitoso | Email y contraseña correctos | Entra al dashboard, nombre visible en sidebar |
| Login fallido | Contraseña incorrecta | Mensaje "Credenciales incorrectas." |
| Contraseña corta | Menos de 8 caracteres | Error de validación antes de llamar la API |
| Sesión persistente | Recargar página estando autenticado | Sigue en el dashboard sin hacer login |
| Logout | Clic en cerrar sesión | Vuelve al login, sesión destruida |
| Rate limit | Más de 10 intentos en 1 min | "Demasiados intentos. Esperá un momento." |
