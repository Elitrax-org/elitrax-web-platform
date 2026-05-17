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
 * Lanza un Error con .status y .message en caso de error HTTP.
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
    const message = body.message || body.error || `Error ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.body = body
    throw err
  }

  return body
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  /** POST /auth/login — setea cookies httpOnly de Supabase */
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  /** POST /auth/logout — elimina cookies de Supabase */
  logout: () =>
    request('/auth/logout', { method: 'POST' }),
}

// ─── Usuario ──────────────────────────────────────────────────────────────────

export const me = {
  /** GET /me → { user, activeAccount, memberships } */
  get: () => request('/me'),
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export const teams = {
  /** GET /teams → { teams: Team[] } */
  list: () => request('/teams'),

  /**
   * POST /teams → Team
   * @param {{ name: string, sportType: 'football'|'hockey'|'rugby' }} data
   */
  create: (data) =>
    request('/teams', { method: 'POST', body: JSON.stringify(data) }),

  /** GET /teams/:id → Team */
  get: (teamId) => request(`/teams/${teamId}`),

  roster: {
    /** GET /teams/:id/players → { roster: RosterPlayer[] } */
    list: (teamId) => request(`/teams/${teamId}/players`),

    /**
     * POST /teams/:id/players/create-and-assign → RosterPlayer
     * Crea el jugador Y lo asigna al equipo en un solo paso.
     * @param {{ displayName, position?, birthDate?, jerseyNumber?, metadata? }} data
     */
    createAndAssign: (teamId, data) =>
      request(`/teams/${teamId}/players/create-and-assign`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /**
     * PATCH /teams/:teamId/players/:playerId → RosterPlayer
     * Actualiza datos de asignación (solo jerseyNumber por ahora).
     */
    update: (teamId, playerId, data) =>
      request(`/teams/${teamId}/players/${playerId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    /** DELETE /teams/:teamId/players/:playerId */
    remove: (teamId, playerId) =>
      request(`/teams/${teamId}/players/${playerId}`, { method: 'DELETE' }),
  },
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const onboarding = {
  /**
   * POST /onboarding — crea cuenta inicial y membership para el usuario logueado.
   * Necesario en modo dev/in-memory cuando el usuario no tiene ninguna cuenta aún.
   * @param {{ displayName: string, email: string }} data
   */
  complete: (data) =>
    request('/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        account: {
          type: 'individual',
          displayName: data.displayName || 'Mi Organización',
          address: { countryCode: 'AR', city: 'Buenos Aires', line1: 'Sin dirección' },
          contact: { email: data.email, phone: '+541100000000' },
          billing: {
            legalName: data.displayName || 'Mi Organización',
            billingAddress: { countryCode: 'AR', city: 'Buenos Aires', line1: 'Sin dirección' },
          },
        },
        subscription: { tier: 'pro', interval: 'monthly' },
      }),
    }),
}

// ─── IA ───────────────────────────────────────────────────────────────────────

export const ai = {
  /**
   * POST /ai/recommendations → recomendaciones de alineación
   * @param {{ candidates: Candidate[], prompt?: { context?: string, objective?: string } }} data
   * Candidate: { playerId, availability, performanceScore, fatigueScore, daysSinceLastInjury? }
   */
  recommendations: (data) =>
    request('/ai/recommendations', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessions = {
  /**
   * GET /sessions → { sessions: TrainingSession[], nextCursor }
   * @param {{ limit?: number, cursor?: string }} params
   */
  list: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.limit)  qs.set('limit',  params.limit)
    if (params.cursor) qs.set('cursor', params.cursor)
    const q = qs.toString()
    return request(`/sessions${q ? `?${q}` : ''}`)
  },

  /**
   * POST /sessions → TrainingSession
   * @param {{ teamId?: string, kind: string, scheduledFor: string, durationSeconds?: number, notes?: string, playerIds?: string[] }} data
   */
  create: (data) =>
    request('/sessions', { method: 'POST', body: JSON.stringify(data) }),

  events: {
    /** GET /sessions/:id/events → { events: MatchEvent[], nextCursor } */
    list: (sessionId, params = {}) => {
      const qs = new URLSearchParams()
      if (params.limit)  qs.set('limit',  params.limit)
      if (params.cursor) qs.set('cursor', params.cursor)
      const q = qs.toString()
      return request(`/sessions/${sessionId}/events${q ? `?${q}` : ''}`)
    },

    /**
     * POST /sessions/:id/events → MatchEvent
     * @param {{ kind: string, matchMinute?: number, playerId?: string, payload?: object }} data
     */
    create: (sessionId, data) =>
      request(`/sessions/${sessionId}/events`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
}

// ─── Players ──────────────────────────────────────────────────────────────────

export const players = {
  /** GET /players → { players: Player[], nextCursor } */
  list: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.limit)  qs.set('limit',  params.limit)
    if (params.cursor) qs.set('cursor', params.cursor)
    const q = qs.toString()
    return request(`/players${q ? `?${q}` : ''}`)
  },

  /** POST /players → Player */
  create: (data) =>
    request('/players', { method: 'POST', body: JSON.stringify(data) }),

  injuries: {
    /** GET /players/:id/injuries → { injuries: Injury[] } */
    list: (playerId) => request(`/players/${playerId}/injuries`),

    /** POST /players/:id/injuries → Injury */
    create: (playerId, data) =>
      request(`/players/${playerId}/injuries`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** PATCH /players/:id/injuries/:injuryId → Injury */
    update: (playerId, injuryId, data) =>
      request(`/players/${playerId}/injuries/${injuryId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    /** DELETE /players/:id/injuries/:injuryId */
    remove: (playerId, injuryId) =>
      request(`/players/${playerId}/injuries/${injuryId}`, { method: 'DELETE' }),
  },

  measurements: {
    /** GET /players/:id/measurements → { measurements: Measurement[] } */
    list: (playerId) => request(`/players/${playerId}/measurements`),

    /** POST /players/:id/measurements → Measurement */
    create: (playerId, data) =>
      request(`/players/${playerId}/measurements`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  comments: {
    /** GET /players/:id/comments → { comments, nextCursor } */
    list: (playerId) => request(`/players/${playerId}/comments`),

    /** POST /players/:id/comments → Comment */
    create: (playerId, body) =>
      request(`/players/${playerId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
  },
}
