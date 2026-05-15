import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { auth, me } from '../lib/api'

const UserContext = createContext()

export function useUser() {
  return useContext(UserContext)
}

/**
 * Normaliza la respuesta de GET /me al formato que usa el frontend:
 *   { email, name, initials, accountId, role }
 */
function normalizeUser(meResponse) {
  const { user, activeAccount } = meResponse
  const fullName = user.fullName || user.email || 'Usuario'
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  return {
    email:     user.email,
    name:      fullName,
    initials,
    accountId: activeAccount?.id ?? null,
    role:      activeAccount?.role ?? null,
  }
}

export function UserProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [sessionReady, setSessionReady] = useState(false)

  /**
   * Al montar la app intenta restaurar sesión existente via GET /me.
   * Si hay cookies válidas el backend retorna el perfil y el usuario
   * queda autenticado sin necesidad de volver a hacer login.
   */
  useEffect(() => {
    me.get()
      .then(data  => setUser(normalizeUser(data)))
      .catch(() => {/* sin sesión activa — muestra login */})
      .finally(() => setSessionReady(true))
  }, [])

  /**
   * Llama a POST /api/v1/auth/login.
   * El backend setea cookies httpOnly; luego llamamos GET /me para
   * obtener el perfil completo del usuario.
   * @throws Error con .message en caso de credenciales incorrectas.
   */
  const login = useCallback(async (email, password) => {
    await auth.login(email, password)
    const data = await me.get()
    setUser(normalizeUser(data))
  }, [])

  /**
   * Llama a POST /api/v1/auth/logout.
   * El backend limpia las cookies de Supabase.
   */
  const logout = useCallback(async () => {
    try { await auth.logout() } catch { /* ignorar error de red en logout */ }
    setUser(null)
  }, [])

  return (
    <UserContext.Provider value={{ user, login, logout, isAuth: !!user, sessionReady }}>
      {children}
    </UserContext.Provider>
  )
}
