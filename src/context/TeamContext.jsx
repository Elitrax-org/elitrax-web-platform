import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const TeamContext = createContext()

export function useTeam() {
  return useContext(TeamContext)
}

const storageKey = (email) => `elitrax_team_${email}`

function loadForUser(email) {
  try {
    const saved = localStorage.getItem(storageKey(email))
    if (saved) return JSON.parse(saved)
  } catch {}
  return { sport: null, players: [] }
}

export function TeamProvider({ children, userEmail }) {
  const [data, setData] = useState(() => loadForUser(userEmail))

  useEffect(() => {
    setData(loadForUser(userEmail))
  }, [userEmail])

  useEffect(() => {
    if (!userEmail) return
    try { localStorage.setItem(storageKey(userEmail), JSON.stringify(data)) } catch {}
  }, [data, userEmail])

  const setSport = useCallback(sport => {
    setData(prev => ({ ...prev, sport }))
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
      setSport, addPlayer, updatePlayer, deletePlayer, reorderPlayers,
    }}>
      {children}
    </TeamContext.Provider>
  )
}
