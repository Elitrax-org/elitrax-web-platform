import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const TeamContext = createContext()

export function useTeam() {
  return useContext(TeamContext)
}

const squadsKey = (email) => `elitrax_squads_${email}`

function loadSquads(email) {
  try {
    const saved = localStorage.getItem(squadsKey(email))
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

export function TeamProvider({ children, userEmail }) {
  const [squads, setSquads] = useState(() => loadSquads(userEmail))

  useEffect(() => {
    setSquads(loadSquads(userEmail))
  }, [userEmail])

  useEffect(() => {
    if (!userEmail) return
    try { localStorage.setItem(squadsKey(userEmail), JSON.stringify(squads)) } catch {}
  }, [squads, userEmail])

  const addSquad = useCallback(squad => {
    setSquads(prev => [{ ...squad, id: Date.now(), createdAt: new Date().toISOString() }, ...prev])
  }, [])

  const updateSquad = useCallback((id, changes) => {
    setSquads(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s))
  }, [])

  const deleteSquad = useCallback(id => {
    setSquads(prev => prev.filter(s => s.id !== id))
  }, [])

  const addSquadEvent = useCallback((squadId, event) => {
    setSquads(prev => prev.map(s => {
      if (s.id !== squadId) return s
      const newEvent = { ...event, id: Date.now() + Math.random() }
      return { ...s, events: [...(s.events || []), newEvent] }
    }))
  }, [])

  const removeSquadEvent = useCallback((squadId, eventId) => {
    setSquads(prev => prev.map(s => {
      if (s.id !== squadId) return s
      return { ...s, events: (s.events || []).filter(e => e.id !== eventId) }
    }))
  }, [])

  return (
    <TeamContext.Provider value={{
      squads,
      addSquad, updateSquad, deleteSquad, addSquadEvent, removeSquadEvent,
    }}>
      {children}
    </TeamContext.Provider>
  )
}
