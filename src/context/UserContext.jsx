import { createContext, useContext, useState, useCallback } from 'react'

const UserContext = createContext()

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = useCallback((userData) => {
    setUser(userData)
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
