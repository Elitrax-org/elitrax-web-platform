/**
 * Cliente HTTP centralizado para comunicación con Web Platform API.
 *
 * Base URL: /api/v1  (Vite proxy → http://localhost:3000)
 * Autenticación: cookies httpOnly gestionadas por Supabase Auth (automáticas).
 * Todas las llamadas incluyen credentials: 'include' para enviar cookies.
 */

const BASE = '/api/v1'

/**
 * Wrapper base de fetch.
 * Lanza un objeto { status, message } en caso de error HTTP.
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (res.status === 204) return null

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      body.message || body.error || `Error ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.body = body
    throw err
  }

  return body
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  /**
   * Inicia sesión con email y contraseña.
   * El backend setea cookies httpOnly con la sesión de Supabase.
   * @returns {{ ok: boolean }}
   */
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Cierra la sesión del usuario y limpia las cookies de Supabase.
   * @returns {{ ok: boolean }}
   */
  logout: () =>
    request('/auth/logout', { method: 'POST' }),
}

// ─── Usuario ─────────────────────────────────────────────────────────────────

export const me = {
  /**
   * Devuelve el perfil del usuario autenticado y su cuenta activa.
   * Usado al montar la app para restaurar sesión existente.
   * @returns {{ user, activeAccount, memberships }}
   */
  get: () => request('/me'),
}
