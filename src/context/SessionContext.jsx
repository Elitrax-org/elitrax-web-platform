/**
 * SessionContext — Fase 3
 *
 * Gestiona las sesiones (partidos y entrenamientos) del equipo activo.
 * - Carga sesiones desde GET /sessions al montar.
 * - addSquad  → POST /sessions + guarda extras (rival, venue, formation, score, players) en localStorage.
 * - addSquadEvent → POST /sessions/:id/events + guarda evento localmente.
 * - updateSquad / deleteSquad / removeSquadEvent → solo estado local (sin DELETE en backend).
 *
 * Mapeo de tipos:
 *   frontend 'partido'       → backend kind 'match'
 *   frontend 'entrenamiento' → backend kind 'team_training'
 *
 * Mapeo de eventos:
 *   frontend 'gol'       → backend 'goal'
 *   frontend 'asistencia'→ backend 'assist'
 *   frontend 'amarilla'  → backend 'yellow_card'
 *   frontend 'roja'      → backend 'red_card'
 *   frontend 'cambio'    → backend 'substitution'
 *   frontend 'lesion'    → backend 'injury'
 *   frontend 'penal'     → backend 'shot'
 *   frontend 'otros'     → backend 'note'
 *
 * Campos sin soporte backend (guardados en localStorage hasta Fase 5):
 *   rival, venue, formation, score, players (roles/posiciones), eventos (con relatedPlayerId)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTeam } from './TeamContext'
import { sessions as sessionsApi } from '../lib/api'

const SessionContext = createContext()

export function useSession() {
  return useContext(SessionContext)
}

// ─── localStorage por equipo ──────────────────────────────────────────────────
const localKey = (teamId) => `elitrax_session_local_${teamId}`

function loadLocal(teamId) {
  try {
    const saved = localStorage.getItem(localKey(teamId))
    if (saved) return JSON.parse(saved)
  } catch {}
  return {}
}

function saveLocal(teamId, data) {
  try { localStorage.setItem(localKey(teamId), JSON.stringify(data)) } catch {}
}

// ─── Mapeos de tipo ───────────────────────────────────────────────────────────
const TYPE_TO_KIND = {
  gol: 'goal', asistencia: 'assist', amarilla: 'yellow_card', roja: 'red_card',
  cambio: 'substitution', lesion: 'injury', penal: 'shot', otros: 'note',
}

// ─── Backend TrainingSession → shape del frontend ─────────────────────────────
function fromBackend(session, localData = {}) {
  const local = localData[session.id] || {}
  return {
    id:        session.id,
    name:      local.name      || '',
    type:      session.kind === 'match' ? 'partido' : 'entrenamiento',
    date:      session.scheduledFor,
    rival:     local.rival     || '',
    venue:     local.venue     || '',
    formation: local.formation || '4-4-2',
    score:     local.score     || { home: 0, away: 0 },
    notes:     session.notes   || '',
    players:   local.players   || [],
    events:    local.events    || [],
    createdAt: session.createdAt,
  }
}

export function SessionProvider({ children }) {
  const { teamId } = useTeam()

  const [squads,  setSquads]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Carga sesiones cuando cambia el equipo activo ─────────────────────────────
  useEffect(() => {
    setLoading(true)
    setError(null)

    sessionsApi.list()
      .then(({ sessions }) => {
        const localData = loadLocal(teamId || '__no_team__')
        setSquads((sessions || []).map(s => fromBackend(s, localData)))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [teamId])

  // ── Persistir extras locales cuando cambian los squads ────────────────────────
  useEffect(() => {
    if (squads.length === 0) return
    const key = teamId || '__no_team__'
    const localData = {}
    squads.forEach(sq => {
      localData[sq.id] = {
        name:      sq.name,
        rival:     sq.rival,
        venue:     sq.venue,
        formation: sq.formation,
        score:     sq.score,
        players:   sq.players,
        events:    sq.events,
      }
    })
    saveLocal(key, localData)
  }, [squads, teamId])

  // ── CRUD ──────────────────────────────────────────────────────────────────────

  const addSquad = useCallback(async (form) => {
    const playerIds = form.players.map(p => p.playerId)
    const session = await sessionsApi.create({
      teamId:          teamId || undefined,
      kind:            form.type === 'partido' ? 'match' : 'team_training',
      scheduledFor:    new Date(form.date).toISOString(),
      notes:           form.notes || undefined,
      playerIds,
    })

    const key = teamId || '__no_team__'
    const localData = loadLocal(key)
    const extras = {
      name:      form.name,
      rival:     form.rival,
      venue:     form.venue,
      formation: form.formation,
      score:     form.score,
      players:   form.players,
      events:    [],
    }
    const newSquad = fromBackend(session, { ...localData, [session.id]: extras })
    setSquads(prev => [newSquad, ...prev])
  }, [teamId])

  // updateSquad → solo local (score, formation, etc. no tienen PATCH en backend)
  const updateSquad = useCallback((id, changes) => {
    setSquads(prev => prev.map(sq => sq.id === id ? { ...sq, ...changes } : sq))
  }, [])

  // deleteSquad → solo local (no hay DELETE /sessions/:id en el backend)
  const deleteSquad = useCallback((id) => {
    setSquads(prev => prev.filter(sq => sq.id !== id))
  }, [])

  // addSquadEvent → POST /sessions/:id/events + guarda localmente
  const addSquadEvent = useCallback(async (sessionId, event) => {
    const kind = TYPE_TO_KIND[event.type] || 'note'

    await sessionsApi.events.create(sessionId, {
      kind,
      matchMinute: event.minute || undefined,
      playerId:    event.playerId || undefined,
      payload: {
        note:            event.note            || undefined,
        relatedPlayerId: event.relatedPlayerId || undefined,
      },
    })

    const localEvent = { id: Date.now(), ...event }
    setSquads(prev => prev.map(sq =>
      sq.id === sessionId
        ? { ...sq, events: [...sq.events, localEvent] }
        : sq
    ))
  }, [])

  // removeSquadEvent → solo local (no hay DELETE /sessions/:id/events/:id)
  const removeSquadEvent = useCallback((sessionId, eventId) => {
    setSquads(prev => prev.map(sq =>
      sq.id === sessionId
        ? { ...sq, events: sq.events.filter(e => e.id !== eventId) }
        : sq
    ))
  }, [])

  return (
    <SessionContext.Provider value={{
      squads, loading, error,
      addSquad, updateSquad, deleteSquad, addSquadEvent, removeSquadEvent,
    }}>
      {children}
    </SessionContext.Provider>
  )
}
