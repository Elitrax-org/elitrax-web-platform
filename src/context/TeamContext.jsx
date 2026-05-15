/**
 * TeamContext — Fase 2
 *
 * Gestiona el equipo activo del usuario.
 * - Carga equipos desde GET /teams al montar.
 * - Si ya existe un equipo, lo activa automáticamente.
 * - Si no existe, expone setSport() para crear uno vía POST /teams.
 *
 * NOTA: 'basketball' no está soportado por el backend (enum: football|hockey|rugby).
 * Se conserva en el frontend como opción local hasta la Fase 5.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { teams as teamsApi } from '../lib/api'

const TeamContext = createContext()

export function useTeam() {
  return useContext(TeamContext)
}

// Deportes soportados por el backend
const BACKEND_SPORTS = new Set(['football', 'hockey', 'rugby'])

export function TeamProvider({ children }) {
  const [teamId,  setTeamId]  = useState(null)
  const [sport,   setSportState] = useState(null)
  const [teamName, setTeamName] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Al montar: busca equipos existentes del usuario
  useEffect(() => {
    teamsApi.list()
      .then(({ teams }) => {
        if (teams && teams.length > 0) {
          const first = teams[0]
          setTeamId(first.id)
          setSportState(first.sportType)
          setTeamName(first.name)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  /**
   * Selecciona el deporte del equipo.
   * - Si el deporte es soportado por el backend → crea el equipo vía API.
   * - Si es 'basketball' (no soportado aún) → solo guarda localmente.
   */
  const setSport = useCallback(async (sportType) => {
    if (!BACKEND_SPORTS.has(sportType)) {
      // Deporte local (basketball) — sin persistencia en backend hasta Fase 5
      setSportState(sportType)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const team = await teamsApi.create({ name: 'Mi Equipo', sportType })
      setTeamId(team.id)
      setSportState(team.sportType)
      setTeamName(team.name)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <TeamContext.Provider value={{
      teamId, sport, teamName, loading, error, setSport,
    }}>
      {children}
    </TeamContext.Provider>
  )
}
