/**
 * PlayerContext — actualizado Fase 7
 *
 * Jugadores pertenecen al club (cuenta), no a un equipo específico.
 * - Carga jugadores desde GET /players (nivel cuenta, sin teamId).
 * - addPlayer → POST /players
 * - Sub-recursos (num, injuries, anthropometrics, files, clubHistory) → localStorage.
 * - Métricas GPS (km, sprints, vel, carga) y estado → pendiente de endpoint backend.
 *
 * Mapeo de campos:
 *   frontend.name          → backend.displayName
 *   frontend.pos           → backend.position
 *   frontend.birthDate     → backend.birthDate
 *   frontend.{altura,peso,email,phone} → backend.metadata
 *   frontend.num           → localStorage (no hay campo en Player, vive en TeamPlayer)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { players as playersApi } from '../lib/api'

const PlayerContext = createContext()

export function usePlayer() {
  return useContext(PlayerContext)
}

// ─── localStorage para sub-recursos de jugadores (nivel cuenta) ───────────────
const LOCAL_KEY = 'elitrax_player_local'

function loadLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return {}
}

function saveLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)) } catch {}
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

// ─── Backend Player → shape del frontend ─────────────────────────────────────
// El backend devuelve { id, displayName, position, birthDate, metadata, createdAt }
function fromBackend(p, localData = {}) {
  const meta  = p.metadata || {}
  const local = localData[p.id] || {}
  return {
    id:        p.id,
    name:      p.displayName ?? '',
    num:       local.num     ?? '',       // número de dorsal almacenado localmente
    pos:       p.position    ?? '',
    birthDate: p.birthDate   ?? '',
    altura:    meta.altura   ?? 0,
    peso:      meta.peso     ?? 0,
    email:     meta.email    ?? '',
    phone:     meta.phone    ?? '',
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

// ─── Shape del frontend → payload POST /players ───────────────────────────────
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

export function PlayerProvider({ children }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Carga todos los jugadores del club al montar ──────────────────────────────
  useEffect(() => {
    setLoading(true)
    setError(null)

    const run = async () => {
      const { players: list } = await playersApi.list()
      const localData = loadLocal()
      const base = (list || []).map(p => fromBackend(p, localData))
      setPlayers(base)

      // Deriva estado desde injuries en paralelo
      const results = await Promise.allSettled(
        base.map(p => playersApi.injuries.list(p.id))
      )
      setPlayers(prev => prev.map((p, i) => {
        const r = results[i]
        if (r.status !== 'fulfilled') return p
        return { ...p, estado: deriveEstado(r.value?.injuries) }
      }))
    }

    run()
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Persistir sub-recursos locales cuando cambian los jugadores ──────────────
  useEffect(() => {
    if (players.length === 0) return
    const localData = {}
    players.forEach(p => {
      localData[p.id] = {
        num:             p.num,
        anthropometrics: p.anthropometrics,
        clubHistory:     p.clubHistory,
        files:           p.files,
        injuries:        p.injuries,
        stats:           p.stats,
      }
    })
    saveLocal(localData)
  }, [players])

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const addPlayer = useCallback(async (player) => {
    const p = await playersApi.create(toBackendCreate(player))
    // Persiste el número de dorsal en localStorage (no existe campo en Player del backend)
    const localData = loadLocal()
    localData[p.id] = { ...(localData[p.id] || {}), num: player.num ?? '' }
    saveLocal(localData)
    setPlayers(prev => [...prev, fromBackend(p, localData)])
  }, [])

  const updatePlayer = useCallback(async (id, changes) => {
    // Sin PATCH /players/:id en el backend → todo se persiste localmente
    const localData = loadLocal()
    if (!localData[id]) localData[id] = {}
    if ('num' in changes) localData[id].num = changes.num ?? ''
    saveLocal(localData)
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
  }, [])

  const deletePlayer = useCallback(async (id) => {
    // Sin DELETE /players/:id en el backend → solo local
    setPlayers(prev => prev.filter(p => p.id !== id))
  }, [])

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
