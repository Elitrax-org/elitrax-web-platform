import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { PLAYERS } from '../data'

const PlayerContext = createContext()

export function usePlayer() {
  return useContext(PlayerContext)
}

const storageKey = (email) => `elitrax_players_${email}`

function loadPlayers(email) {
  try {
    const saved = localStorage.getItem(storageKey(email))
    if (saved) return JSON.parse(saved)
  } catch {}
  return PLAYERS.map(p => enrich(p))
}

function enrich(p) {
  return {
    ...p,
    birthDate: p.birthDate || '',
    altura: p.altura || 0,
    peso: p.peso || 0,
    email: p.email || '',
    phone: p.phone || '',
    anthropometrics: p.anthropometrics || [],
    clubHistory: p.clubHistory || [],
    files: p.files || [],
    injuries: p.injuries || [],
    stats: p.stats || { partidosJugados:0, minutosJugados:0, goles:0, asistencias:0, amarillas:0, rojas:0 },
    estado: p.estado || 'ok',
    km: p.km || 0, sprints: p.sprints || 0, vel: p.vel || 0, carga: p.carga || 0,
  }
}

export function PlayerProvider({ children, userEmail }) {
  const [players, setPlayers] = useState(() => loadPlayers(userEmail))

  useEffect(() => {
    setPlayers(loadPlayers(userEmail))
  }, [userEmail])

  useEffect(() => {
    if (!userEmail) return
    try { localStorage.setItem(storageKey(userEmail), JSON.stringify(players)) } catch {}
  }, [players, userEmail])

  const addPlayer = useCallback(player => {
    setPlayers(prev => [...prev, enrich({ ...player, id: Date.now() })])
  }, [])

  const updatePlayer = useCallback((id, changes) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
  }, [])

  const deletePlayer = useCallback(id => {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }, [])

  const reorderPlayers = useCallback((fromIdx, toIdx) => {
    setPlayers(prev => {
      const list = [...prev]
      const [moved] = list.splice(fromIdx, 1)
      list.splice(toIdx, 0, moved)
      return list
    })
  }, [])

  const addAnthropometric = useCallback((playerId, data) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId
        ? { ...p, anthropometrics: [...p.anthropometrics, { ...data, date: data.date || new Date().toISOString().slice(0,10) }] }
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
        ? { ...p, injuries: p.injuries.map(i => i.id === injuryId ? { ...i, closedAt: new Date().toISOString() } : i),
            estado: p.injuries.some(i => i.id !== injuryId && !i.closedAt) ? 'lesion' : 'ok' }
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
      players, addPlayer, updatePlayer, deletePlayer, reorderPlayers,
      addAnthropometric, addInjury, closeInjury, addFile, deleteFile, addClub, removeClub,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}
