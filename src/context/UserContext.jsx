import { createContext, useContext, useState, useCallback } from 'react'

const UserContext = createContext()

export function useUser() {
  return useContext(UserContext)
}

const PROFILES = {
  dt:     { label: 'Director Técnico',    initials: 'RM', name: 'Prof. R. Méndez' },
  pf:     { label: 'Preparador Físico',   initials: 'PF', name: 'Lic. F. Álvarez' },
  scout:  { label: 'Scout',               initials: 'SC', name: 'Analista L. Ruiz' },
  analista: { label: 'Analista',          initials: 'AN', name: 'Analista G. Paz'  },
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = useCallback((role) => {
    setUser({ role, ...PROFILES[role] })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <UserContext.Provider value={{ user, login, logout, isAuth: !!user }}>
      {children}
    </UserContext.Provider>
  )
}
