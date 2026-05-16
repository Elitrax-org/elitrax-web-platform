/**
 * PlayerContext — Fase 2
 *
 * Gestiona el roster del equipo activo.
 * - Carga jugadores desde GET /teams/:teamId/players cuando cambia el equipo.
 * - CRUD conectado al backend via teams.roster.*
 * - Sub-recursos (injuries, anthropometrics, files, clubHistory) → localStorage.
 * - Métricas GPS (km, sprints, vel, carga) y estado → constantes hasta Fase 4.
 *
 * Mapeo de campos:
 *   frontend.name          → backend.displayName
 *   frontend.num           → backend.jerseyNumber
 *   frontend.pos           → backend.position
 *   frontend.birthDate     → backend.birthDate
 *   frontend.{altura,peso,email,phone} → backend.metadata
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTeam } from './TeamContext'
import { teams as teamsApi, players as playersApi } from '../lib/api'

const PlayerContext = createContext()

export function usePlayer() {
  return useContext(PlayerContext)
}

// ─── localStorage para sub-recursos por equipo ────────────────────────────────
const localKey = (teamId) => `elitrax_player_local_${teamId}`

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

// ─── Deriva estado del jugador desde injuries del backend ────────────────────
// Backend injury.status: 'injured' | 'recovering' | 'recovered'
function deriveEstado(injuries) {
  if (!injuries || injuries.length === 0) return 'ok'
  if (injuries.some(i => i.status === 'injured'))    return 'lesion'
  if (injuries.some(i => i.status === 'recovering')) return 'alerta'
  return 'ok'
}

// ─── Backend PlayerMeasurement → entrada de anthropometrics ──────────────────
function measurementToAnthro(m) {
  return {
    date:         m.takenAt?.slice(0, 10) || '',
    altura:       m.heightCentimeters  ?? 0,
    peso:         m.weightKilograms    ?? 0,
    grasa:        m.bodyFatPercentage  ?? 0,
    masaMuscular: 0,
  }
}

// ─── Backend RosterPlayer → shape del frontend ────────────────────────────────
function fromBackend(rp, localData = {}) {
  const meta  = rp.metadata || {}
  const local = localData[rp.id] || {}
  return {
    id:        rp.id,
    name:      rp.displayName,
    num:       rp.jerseyNumber ?? '',
    pos:       rp.position    ?? '',
    birthDate: rp.birthDate   ?? '',
    altura:    meta.altura    ?? 0,
    peso:      meta.peso      ?? 0,
    email:     meta.email     ?? '',
    phone:     meta.phone     ?? '',
    // Sub-recursos almacenados localmente
    anthropometrics: local.anthropometrics || [],
    clubHistory:     local.clubHistory     || [],
    files:           local.files           || [],
    injuries:        local.injuries        || [],
    stats:           local.stats           || { partidosJugados:0, minutosJugados:0, goles:0, asistencias:0, amarillas:0, rojas:0 },
    // Métricas GPS — Fase 4
    estado: 'ok', km: 0, sprints: 0, vel: 0, carga: 0,
  }
}

// ─── Shape del frontend → payload para el backend ────────────────────────────
// Nota: jerseyNumber NO se incluye aquí porque createPlayerInputSchema no lo acepta.
// Se setea en un PATCH separado tras crear el jugador (Fase 5).
function toBackendCreate(player) {
  return {
    displayName: player.name,
    position:    player.pos       || undefined,
    birthDate:   player.birthDate || undefined,
    metadata: {
      altura: player.altura || 0,
      peso:   player.peso   || 0,
      email:  player.email  || '',
      phone:  player.phone  || '',
    },
  }
}

// jerseyNumber debe ser string de 1-3 chars alfanuméricos (Zod backend)
function numToJersey(num) {
  if (num === '' || num == null) return undefined
  return String(num).toUpperCase().slice(0, 3)
}

export function PlayerProvider({ children }) {
  const { teamId } = useTeam()

  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Carga roster y deriva estado desde injuries (Fase 4) ─────────────────────
  useEffect(() => {
    if (!teamId) { setPlayers([]); return }

    setLoading(true)
    setError(null)

    teamsApi.roster.list(teamId)
      .then(async ({ roster }) => {
        const localData = loadLocal(teamId)
        const base = (roster || []).map(rp => fromBackend(rp, localData))
        setPlayers(base)

        // Fase 4: fetch injuries en paralelo para derivar el estado de cada jugador
        const results = await Promise.allSettled(
          base.map(p => playersApi.injuries.list(p.id))
        )
        setPlayers(prev => prev.map((p, i) => {
          const r = results[i]
          if (r.status !== 'fulfilled') return p
          return { ...p, estado: deriveEstado(r.value?.injuries) }
        }))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [teamId])

  // ── Persistir sub-recursos locales cuando cambian los jugadores ──────────────
  useEffect(() => {
    if (!teamId || players.length === 0) return
    const localData = {}
    players.forEach(p => {
      localData[p.id] = {
        anthropometrics: p.anthropometrics,
        clubHistory:     p.clubHistory,
        files:           p.files,
        injuries:        p.injuries,
        stats:           p.stats,
      }
    })
    saveLocal(teamId, localData)
  }, [players, teamId])

  // ── CRUD backend ─────────────────────────────────────────────────────────────

  const addPlayer = useCallback(async (player) => {
    if (!teamId) return
    const rp = await teamsApi.roster.createAndAssign(teamId, toBackendCreate(player))
    // Fase 5: jerseyNumber se setea en PATCH separado porque createPlayerInputSchema no lo acepta
    if (player.num !== '' && player.num != null) {
      try {
        await teamsApi.roster.update(teamId, rp.id, { jerseyNumber: numToJersey(player.num) })
      } catch {} // no bloquea si falla (campo opcional)
    }
    const localData = loadLocal(teamId)
    setPlayers(prev => [...prev, fromBackend({ ...rp, jerseyNumber: numToJersey(player.num) }, localData)])
  }, [teamId])

  const updatePlayer = useCallback(async (id, changes) => {
    if (!teamId) return
    // Fase 5: jerseyNumber como string (el backend valida /^[A-Z0-9]{1,3}$/)
    if ('num' in changes) {
      await teamsApi.roster.update(teamId, id, {
        jerseyNumber: numToJersey(changes.num),
      })
    }
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
  }, [teamId])

  const deletePlayer = useCallback(async (id) => {
    if (!teamId) return
    await teamsApi.roster.remove(teamId, id)
    setPlayers(prev => prev.filter(p => p.id !== id))
  }, [teamId])

  // Fase 4: carga mediciones del backend y actualiza anthropometrics del jugador (lazy)
  const loadPlayerMeasurements = useCallback(async (playerId) => {
    const { measurements } = await playersApi.measurements.list(playerId)
    if (!measurements || measurements.length === 0) return
    const sorted = [...measurements].sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))
    const latest  = sorted[0]
    const antros  = sorted.map(measurementToAnthro)
    setPlayers(prev => prev.map(p => p.id === playerId
      ? {
          ...p,
          altura:          latest.heightCentimeters ?? p.altura,
          peso:            latest.weightKilograms   ?? p.peso,
          anthropometrics: antros,
        }
      : p
    ))
  }, [])

  const reorderPlayers = useCallback((fromIdx, toIdx) => {
    setPlayers(prev => {
      const list = [...prev]
      const [moved] = list.splice(fromIdx, 1)
      list.splice(toIdx, 0, moved)
      return list
    })
  }, [])

  // ── Sub-recursos locales ─────────────────────────────────────────────────────

  // Fase 5: también POST al backend cuando se agrega una medición
  const addAnthropometric = useCallback(async (playerId, data) => {
    const date = data.date || new Date().toISOString().slice(0, 10)
    try {
      await playersApi.measurements.create(playerId, {
        takenAt:           new Date(date).toISOString(),
        heightCentimeters: data.altura   ? Number(data.altura)   : undefined,
        weightKilograms:   data.peso     ? Number(data.peso)     : undefined,
        bodyFatPercentage: data.grasa    ? Number(data.grasa)    : undefined,
        notes:             data.masaMuscular ? `masaMuscular:${data.masaMuscular}` : undefined,
      })
    } catch {} // no bloquea si falla
    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? { ...p, anthropometrics: [...p.anthropometrics, { ...data, date }] }
        : p
    ))
  }, [])

  const addInjury = useCallback((playerId, injury) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? { ...p, injuries: [...p.injuries, { ...injury, id: Date.now() }], estado: 'lesion' }
        : p
    ))
  }, [])

  const closeInjury = useCallback((playerId, injuryId) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? {
            ...p,
            injuries: p.injuries.map(i => i.id === injuryId ? { ...i, closedAt: new Date().toISOString() } : i),
            estado: p.injuries.some(i => i.id !== injuryId && !i.closedAt) ? 'lesion' : 'ok',
          }
        : p
    ))
  }, [])

  const addFile = useCallback((playerId, file) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? { ...p, files: [...p.files, { ...file, id: Date.now(), uploadedAt: new Date().toISOString() }] }
        : p
    ))
  }, [])

  const deleteFile = useCallback((playerId, fileId) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? { ...p, files: p.files.filter(f => f.id !== fileId) }
        : p
    ))
  }, [])

  const addClub = useCallback((playerId, club) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? { ...p, clubHistory: [...p.clubHistory, club] }
        : p
    ))
  }, [])

  const removeClub = useCallback((playerId, idx) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? { ...p, clubHistory: p.clubHistory.filter((_, i) => i !== idx) }
        : p
    ))
  }, [])

  return (
    <PlayerContext.Provider value={{
      players, loading, error,
      addPlayer, updatePlayer, deletePlayer, reorderPlayers,
      addAnthropometric, addInjury, closeInjury, addFile, deleteFile, addClub, removeClub,
      loadPlayerMeasurements,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}
