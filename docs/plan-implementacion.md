# Plan de Implementación — Elitrax Web Platform
**Objetivo:** Conectar el frontend React+Vite al backend Web Platform API (Next.js 16 + Supabase)
**Regla principal:** No modificar el backend. Solo adaptar el frontend.

---

## Estado general de fases

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 1 | Autenticación real | ✅ Completada |
| Fase 2 | Jugadores y equipos | ✅ Completada |
| Fase 3 | Sesiones y eventos de partido | ✅ Completada |
| Fase 4 | Métricas derivadas (carga, estado, km) | ✅ Completada (parcial) |
| Fase 5 | Funcionalidad faltante en backend | ✅ Completada (parcial) |
| Fase 6 | IA y Vitrina | ✅ Completada |

---

---

# ✅ FASE 1 — Autenticación Real

**Fecha:** Mayo 2026
**Branch:** `feature/dashboard-interact-v1`
**Commits:** `949ae58`, `edce6dc`

## Problema que resolvía

El frontend tenía autenticación 100% simulada:
- Credenciales hardcodeadas en `src/users.js` (4 usuarios ficticios)
- El login no llamaba a ningún servidor real
- La sesión vivía solo en memoria React → se perdía al recargar la página
- Cualquier email/contraseña inventada podía entrar si coincidía con el array local

## Archivos modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `vite.config.js` | Modificado | Proxy `/api` → `http://localhost:3000` |
| `src/lib/api.js` | Creado | Cliente HTTP centralizado |
| `src/context/UserContext.jsx` | Modificado | Auth real + restauración de sesión |
| `src/views/LoginPage.jsx` | Modificado | Consume API real, errores HTTP |
| `src/App.jsx` | Modificado | Pantalla de carga mientras verifica sesión |
| `docs/fase-1-autenticacion.md` | Creado | Especificaciones técnicas detalladas |

## Qué se implementó

### 1. Proxy Vite (`vite.config.js`)
Redirige internamente las llamadas de `/api/*` al backend en `localhost:3000`.
Elimina el problema de CORS sin modificar el backend.

```
Frontend (localhost:5173) → /api/v1/auth/login
         ↓ (proxy interno)
Backend  (localhost:3000) → /api/v1/auth/login
```

### 2. Cliente HTTP (`src/lib/api.js`)
Módulo centralizado con dos responsabilidades:
- Hacer `fetch` con `credentials: 'include'` (envía cookies automáticamente)
- Normalizar errores HTTP a objetos `Error` con `.status` y `.message`

Endpoints que expone:
```
auth.login(email, password)  →  POST /api/v1/auth/login
auth.logout()                →  POST /api/v1/auth/logout
me.get()                     →  GET  /api/v1/me
```

### 3. UserContext — autenticación real
Tres cambios claves:

**Login real:**
```
1. Llama POST /auth/login → backend valida en Supabase
2. Supabase setea cookies httpOnly (sb-access-token, sb-refresh-token)
3. Llama GET /me → obtiene perfil completo del usuario
4. Guarda en estado: { email, name, initials, accountId, role }
```

**Restauración de sesión al recargar:**
```
1. Al montar la app → llama GET /me automáticamente
2. Si hay cookies válidas → usuario autenticado sin hacer login
3. Si no hay cookies → muestra LoginPage
```

**Logout real:**
```
1. Llama POST /auth/logout
2. Backend elimina cookies de Supabase del navegador
3. user = null → muestra LoginPage
```

### 4. LoginPage — validación alineada con backend
- Contraseña: mínimo **8 caracteres** (antes era 4, ahora coincide con el backend)
- Errores HTTP mapeados a mensajes en español:

| HTTP | Mensaje al usuario |
|------|--------------------|
| 400 / 401 | "Credenciales incorrectas." |
| 429 | "Demasiados intentos. Esperá un momento." |
| Otro | "No se pudo conectar con el servidor." |

### 5. App.jsx — pantalla de carga
Mientras `UserContext` verifica si hay sesión activa (llamada a `GET /me`), la app muestra una pantalla de carga en lugar de flashear el login innecesariamente.

## Base de datos relevante (backend)

### Tablas de Supabase Auth (schema `auth`) — solo lectura para nosotros
| Tabla | Rol |
|-------|-----|
| `auth.users` | Usuarios registrados. PK: `id` (UUID), tiene `email` |
| `auth.sessions` | Sesiones activas |
| `auth.refresh_tokens` | Tokens de renovación |

### Tabla `profiles` (schema `public`)
Perfil extendido del usuario.
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK = auth.users.id) | Mismo ID que Supabase Auth |
| `full_name` | String (nullable) | Nombre completo |
| `preferred_locale` | String (default: "en") | Idioma preferido |
| `avatar_url` | String (nullable) | URL de foto |

### Tabla `accounts` (schema `public`)
Espacio de trabajo (club u organización). Un usuario puede pertenecer a varias.
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | ID de la cuenta |
| `display_name` | String | Nombre del club |
| `type` | Enum (individual, corporate) | Tipo de cuenta |
| `owner_user_id` | UUID FK → auth.users | Dueño de la cuenta |

### Tabla `account_members` (schema `public`)
Relación usuario ↔ cuenta con rol asignado.
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `account_id` | UUID (PK) | Cuenta |
| `user_id` | UUID (PK) | Usuario |
| `role` | Enum | Rol del usuario en la cuenta |

**Roles disponibles:**
| Rol | Permisos |
|-----|----------|
| `owner` | Control total, puede eliminar la cuenta |
| `administrator` | Control total excepto eliminar cuenta |
| `technician` | Jugadores, sesiones, métricas |
| `assistant` | Lectura/escritura limitada |
| `viewer` | Solo lectura |

## Endpoints usados

| Método | Ruta | Propósito | Rate limit |
|--------|------|-----------|------------|
| POST | `/api/v1/auth/login` | Autenticar usuario | 10 req/min |
| GET | `/api/v1/me` | Obtener perfil + cuenta activa | — |
| POST | `/api/v1/auth/logout` | Cerrar sesión | — |

## Reglas de negocio aplicadas

1. **Contraseña mínima 8 caracteres** — alineada con la validación Zod del backend
2. **Un usuario puede tener múltiples cuentas** — `GET /me` retorna `memberships[]`. Por ahora el frontend usa solo `activeAccount`
3. **La sesión persiste en cookies httpOnly** — el frontend nunca toca ni almacena el JWT directamente
4. **`accountId` se guarda en UserContext** — será necesario en Fase 2 para todas las llamadas a jugadores/equipos (el backend filtra por tenant)

## Lo que NO cambió

- Diseño visual, colores, tipografías → intactos
- Jugadores, equipos, sesiones → siguen en localStorage (Fases 2-3)
- `src/users.js` → existe pero ya no se usa

## Cómo probar

**Prerequisitos:**
1. Backend corriendo: `npm run dev` en `Web platform-api` (puerto 3000)
2. Frontend corriendo: `npm run dev` en `elitrax-web-platform` (puerto 5173)
3. Usuario creado via `POST /api/v1/auth/sign-up`

**Casos de prueba:**
| Caso | Acción | Resultado esperado |
|------|--------|--------------------|
| Login exitoso | Credenciales correctas | Dashboard visible, nombre en sidebar |
| Login fallido | Contraseña incorrecta | "Credenciales incorrectas." |
| Contraseña < 8 chars | Menos de 8 caracteres | Error antes de llamar la API |
| Sesión persistente | Recargar página autenticado | Sigue en dashboard sin re-login |
| Logout | Clic en cerrar sesión | Vuelve al login, cookies eliminadas |
| Rate limit | +10 intentos en 1 min | "Demasiados intentos. Esperá un momento." |

---

---

# ✅ FASE 2 — Jugadores y Equipos

**Fecha:** Mayo 2026
**Branch:** `feature/dashboard-interact-v1`

## Archivos modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/api.js` | Extendido | Endpoints de teams y players |
| `src/context/TeamContext.jsx` | Reescrito | Equipos desde API real |
| `src/context/PlayerContext.jsx` | Reescrito | Roster desde API real |
| `src/App.jsx` | Modificado | Orden correcto de providers |

## Qué se implementó

### TeamContext
- Al montar: `GET /teams` → activa el primer equipo encontrado
- `setSport(sportType)`:
  - Si el deporte está soportado (`football|hockey|rugby`) → `POST /teams` con `{ name: 'Mi Equipo', sportType }`
  - Si es `basketball` → solo guarda localmente hasta Fase 5
- Expone: `{ teamId, sport, teamName, loading, error, setSport }`

### PlayerContext
- Lee `teamId` de `useTeam()` — requiere que `TeamProvider` sea el provider padre
- Al cambiar `teamId`: `GET /teams/:teamId/players` → carga roster
- Sub-recursos sin endpoint de backend (anthropometrics, injuries, files, clubHistory, stats) → `localStorage` con clave `elitrax_player_local_${teamId}`

### CRUD de jugadores
| Operación | Backend | Local |
|-----------|---------|-------|
| Agregar | `POST /teams/:id/players/create-and-assign` | — |
| Editar número | `PATCH /teams/:id/players/:playerId` | sincronizado |
| Editar resto | — | estado React + localStorage |
| Eliminar | `DELETE /teams/:id/players/:playerId` | — |

### Mapeo de campos
| Frontend | Backend |
|----------|---------|
| `name` | `displayName` |
| `num` | `jerseyNumber` |
| `pos` | `position` |
| `birthDate` | `birthDate` |
| `altura, peso, email, phone` | `metadata` (JSON) |
| `km, sprints, vel, carga` | `0` hasta Fase 4 |
| `estado` | `'ok'` hasta Fase 4 |

### App.jsx — orden de providers corregido
`TeamProvider` envuelve a `PlayerProvider` para que `PlayerContext` pueda llamar `useTeam()`.

## Endpoints consumidos

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/v1/teams` | Cargar equipo activo al montar |
| POST | `/api/v1/teams` | Crear equipo al seleccionar deporte |
| GET | `/api/v1/teams/:id/players` | Cargar roster del equipo |
| POST | `/api/v1/teams/:id/players/create-and-assign` | Agregar jugador |
| PATCH | `/api/v1/teams/:id/players/:playerId` | Actualizar dorsalNumber |
| DELETE | `/api/v1/teams/:id/players/:playerId` | Eliminar jugador |

## Brechas conocidas (pendientes de Fases siguientes)
| Brecha | Fase |
|--------|------|
| `basketball` no soportado por backend | Fase 5 |
| `km, vel, sprints, carga` hardcodeados en `0` | Fase 4 |
| `estado` hardcodeado en `'ok'` | Fase 4 |
| `injuries, files, clubHistory` solo en localStorage | Fase 5 |
| Editar `displayName`, `position`, `birthDate`, `metadata` no se sincroniza al backend | Fase 5 |

---

# ✅ FASE 3 — Sesiones y Eventos de Partido

**Fecha:** Mayo 2026
**Branch:** `feature/dashboard-interact-v1`

## Archivos modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/api.js` | Extendido | Endpoints de sessions y events |
| `src/context/SessionContext.jsx` | Creado | Sesiones y eventos desde API real |
| `src/views/MiEquipoView.jsx` | Modificado | Usa SessionContext en lugar de TeamContext |
| `src/App.jsx` | Modificado | SessionProvider agregado al árbol de providers |

## Qué se implementó

### SessionContext
- Al montar: `GET /sessions` → carga todas las sesiones de la cuenta
- `addSquad(form)` → `POST /sessions` con `{ teamId, kind, scheduledFor, notes, playerIds }`
- `addSquadEvent(sessionId, event)` → `POST /sessions/:id/events` con `{ kind, matchMinute, playerId, payload }`
- `updateSquad` / `deleteSquad` / `removeSquadEvent` → solo estado local (sin PATCH/DELETE en backend)
- Campos sin soporte en backend → guardados en `localStorage` con clave `elitrax_session_local_${teamId}`

### Mapeo de tipos de sesión
| Frontend | Backend |
|----------|---------|
| `partido` | `match` |
| `entrenamiento` | `team_training` |

### Mapeo de tipos de evento
| Frontend | Backend |
|----------|---------|
| `gol` | `goal` |
| `asistencia` | `assist` |
| `amarilla` | `yellow_card` |
| `roja` | `red_card` |
| `cambio` | `substitution` |
| `lesion` | `injury` |
| `penal` | `shot` |
| `otros` | `note` |

### MiEquipoView — cambio de contexto
La vista dejó de usar `useTeam()` para squads y ahora usa `useSession()`.

## Endpoints consumidos

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/v1/sessions` | Cargar sesiones al montar |
| POST | `/api/v1/sessions` | Crear nuevo partido o entrenamiento |
| POST | `/api/v1/sessions/:id/events` | Registrar evento de partido |

## Brechas conocidas (pendientes de Fases siguientes)
| Brecha | Fase |
|--------|------|
| `rival`, `venue`, `formation`, `score` no están en el schema de backend | Fase 5 |
| Roles de jugadores (titular/suplente/banco) no están en `session_players` | Fase 5 |
| No hay `DELETE /sessions/:id` — deleteSquad es solo local | Fase 5 |
| No hay `DELETE /sessions/:id/events/:id` — removeSquadEvent es solo local | Fase 5 |
| Eventos con `relatedPlayerId` (cambios) guardados solo en localStorage payload | Fase 5 |

---

# ✅ FASE 4 — Métricas Derivadas

**Fecha:** Mayo 2026
**Branch:** `feature/dashboard-interact-v1`

## Archivos modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/context/PlayerContext.jsx` | Modificado | Fetch injuries en paralelo al cargar roster + loadPlayerMeasurements |
| `src/views/JugadoresView.jsx` | Modificado | Fix squads → useSession(), cargar mediciones al abrir perfil |

## Qué se implementó

### `estado` — derivado desde backend injuries
Al cargar el roster, `PlayerContext` hace `GET /players/:id/injuries` para todos los jugadores en paralelo (`Promise.allSettled`). El estado se deriva así:

| Backend `injury.status` | Frontend `estado` |
|-------------------------|-------------------|
| `injured` (al menos uno) | `lesion` |
| `recovering` (al menos uno) | `alerta` |
| Todos `recovered` o sin lesiones | `ok` |

### Mediciones — carga lazy al abrir perfil
`loadPlayerMeasurements(playerId)` hace `GET /players/:id/measurements` cuando el usuario abre el perfil de un jugador en `JugadoresView`. Actualiza:
- `player.altura` → `heightCentimeters` de la medición más reciente
- `player.peso` → `weightKilograms` de la medición más reciente
- `player.anthropometrics` → historial completo de mediciones del backend

### Fix aplicado: JugadoresView usaba useTeam() para squads
`JugadoresView` usaba `useTeam()` para leer `squads`. Corregido a `useSession()`.

## Endpoints consumidos

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/v1/players/:id/injuries` | Derivar estado (en paralelo al cargar roster) |
| GET | `/api/v1/players/:id/measurements` | Cargar mediciones al abrir perfil |

## Brechas que quedan pendientes

| Campo frontend | Causa | Fase |
|----------------|-------|------|
| `player.km` | No hay endpoint público para `session_player_metrics` | Fase 5 |
| `player.vel` | Mismo origen — `max_speed_mps × 3.6` sin endpoint | Fase 5 |
| `player.sprints` | No existe en el backend | Fase 5 |
| `player.carga` | No existe en el backend | Fase 5 |

---

# ✅ FASE 5 — Funcionalidad Faltante en Backend

**Fecha:** Mayo 2026
**Branch:** `feature/dashboard-interact-v1`

## Lo que se implementó (sin cambiar el backend)

### Fix: jersey number — tipo correcto y flujo en dos pasos
El backend requiere que `jerseyNumber` sea un string `[A-Z0-9]{1,3}` (Zod).
El frontend enviaba `Number(num)` → fallaba validación silenciosamente.

**Correcciones en `PlayerContext`:**
- `toBackendCreate` ya no incluye `jerseyNumber` (el schema de `createPlayerInputSchema` no lo acepta)
- Tras `createAndAssign`, si el jugador tiene número → PATCH separado con `jerseyNumber` como string
- `updatePlayer` ahora envía `jerseyNumber` como string vía `numToJersey()`

### Sync de mediciones al backend
`addAnthropometric` ahora hace `POST /players/:id/measurements` además de guardar localmente:
- `altura → heightCentimeters`
- `peso → weightKilograms`
- `grasa → bodyFatPercentage`
- Si falla el POST, el dato se guarda igual localmente (sin bloquear el flujo)

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/context/PlayerContext.jsx` | Fix jersey number + sync measurements |

## Brechas que requieren cambios en el backend (no implementables desde el frontend)

| Brecha | Razón |
|--------|-------|
| `player.files` | No hay tabla ni endpoints en backend |
| `player.clubHistory` | No hay tabla ni endpoints en backend |
| `player.displayName / position / birthDate / metadata` update | No existe `PATCH /players/:id` |
| `squad.score` y `squad.formation` | No hay campos en `training_sessions` |
| `DELETE /sessions/:id` | No existe en el backend |
| `DELETE /sessions/:id/events/:id` | No existe en el backend |
| `player.km`, `player.vel` | No hay endpoint público para `session_player_metrics` |
| `player.sprints`, `player.carga` | No existen en el backend |
| Basketball como sport | No está en el enum del backend |
| Roles titular/suplente/banco en `session_players` | No existe campo `role` en la tabla |

---

# ✅ FASE 6 — IA y Vitrina

**Fecha:** Mayo 2026
**Branch:** `feature/dashboard-interact-v1`

## Archivos modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/api.js` | Modificado | Agregado módulo `ai` con `ai.recommendations()` |
| `src/views/OptimizacionView.jsx` | Modificado | Conectado a `POST /ai/recommendations` con jugadores reales |
| `src/views/VitrinaView.jsx` | Modificado | Reemplazado `VP` hardcodeado por jugadores reales de `usePlayer()` |

## Qué se implementó

### `src/lib/api.js` — módulo IA
Nuevo módulo `ai`:
- `ai.recommendations(data)` → `POST /api/v1/ai/recommendations`
- Payload: `{ candidates: Candidate[], prompt?: { context?, objective? } }`
- `Candidate`: `{ playerId, availability, performanceScore, fatigueScore }`

### `OptimizacionView` — integración IA real

`runAnalysis()` ahora:
1. Filtra jugadores cuyo `id` sea un UUID válido (jugadores del backend)
2. Construye `candidates[]` con datos reales:
   - `availability`: derivado de `player.estado` (`ok→available`, `alerta→limited`, `lesion→unavailable`)
   - `performanceScore`: `score / 100` (calculado por la función interna `calcScore`)
   - `fatigueScore`: `player.carga / 100`
3. Llama a `POST /ai/recommendations` con los candidates y un prompt de contexto
4. Si la llamada falla o no hay UUID players, cae al modo simulación local
5. El resultado del backend (`aiResult`) se renderiza en la UI

El estado local `vals` para jugadores se inicializa dinámicamente con `useEffect` al cambiar el roster de `usePlayer()` (eliminado el hardcoded `PLAYERS`).

### `VitrinaView` — jugadores reales

La vista ahora consume `usePlayer()` en lugar del array `VP` hardcodeado de `data.js`.

**Función `toVitrina(player)`** mapea el shape de `PlayerContext` al shape de la vitrina:
| Campo vitrina | Fuente |
|---------------|--------|
| `pos` | `normalizePos(player.pos)` — mapea strings del backend a las 4 posiciones del UI |
| `age` | Calculado desde `player.birthDate` |
| `since` | `player.clubHistory.at(-1).from` (o `null`) |
| `tags` | Generados desde posición y `player.stats` |
| `desc` | Descripción en lenguaje natural generada desde posición, edad y historial |
| `videos` | `player.files.length` |
| `saltos`, `distSprint` | `0` (no hay endpoint backend) |
| `km`, `vel`, `sprints`, `carga` | Directo de `player.*` (actualmente 0 hasta Fase 4 backend) |

**Normalización de posiciones** (`POS_MAP`): mapea strings del backend (ej. `GK`, `DEF`, `MID`, `ST`) a las 4 posiciones del filtro UI.

**Generación de tags** (`buildTags`): hasta 4 tags por jugador basados en posición, goles, asistencias, fair play, velocidad máxima y disponibilidad.

## Endpoints consumidos

| Método | Ruta | Propósito |
|--------|------|-----------|
| POST | `/api/v1/ai/recommendations` | Análisis de alineación con IA |

## Brechas conocidas

| Campo | Causa |
|-------|-------|
| `player.km`, `player.vel`, `player.sprints`, `player.carga` | Sin endpoint público `session_player_metrics` → vitrina muestra 0 |
| `player.saltos`, `player.distSprint` | No existen en el backend |
| IA con jugadores locales (IDs no UUID) | Falls back a simulación local |
