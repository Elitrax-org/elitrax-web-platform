import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { PLAYERS } from '../data'

const STORAGE_KEY = 'elitrax_team'

const TeamContext = createContext()

export function useTeam() {
  return useContext(TeamContext)
}

function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { sport: null, players: [...PLAYERS] }
}

export function TeamProvider({ children }) {
  const [data, setData] = useState(loadInitial)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
  }, [data])

  const setSport = useCallback(sport => {
    setData(prev => ({ ...prev, sport }))
  }, [])

  const loginAs = useCallback(sport => {
    setData({ sport, players: [] })
  }, [])

  const addPlayer = useCallback(player => {
    setData(prev => ({ ...prev, players: [...prev.players, { ...player, id: Date.now() }] }))
  }, [])

  const updatePlayer = useCallback((id, changes) => {
    setData(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === id ? { ...p, ...changes } : p),
    }))
  }, [])

  const deletePlayer = useCallback(id => {
    setData(prev => ({ ...prev, players: prev.players.filter(p => p.id !== id) }))
  }, [])

  const reorderPlayers = useCallback((fromIdx, toIdx) => {
    setData(prev => {
      const list = [...prev.players]
      const [moved] = list.splice(fromIdx, 1)
      list.splice(toIdx, 0, moved)
      return { ...prev, players: list }
    })
  }, [])

  return (
    <TeamContext.Provider value={{
      sport: data.sport,
      players: data.players,
      setSport, loginAs, addPlayer, updatePlayer, deletePlayer, reorderPlayers,
    }}>
      {children}
    </TeamContext.Provider>
  )
}
