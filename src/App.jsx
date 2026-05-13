import { useState } from 'react'
import { T } from './tokens'
import { UserProvider, useUser } from './context/UserContext'
import { ToastProvider } from './context/ToastContext'
import Sidebar   from './components/Sidebar'
import Topbar    from './components/Topbar'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './views/LoginPage'
import DashboardView    from './views/DashboardView'
import OptimizacionView from './views/OptimizacionView'
import VitrinaView      from './views/VitrinaView'
import PlaceholderView  from './views/PlaceholderView'

function AppShell() {
  const { user, logout, isAuth } = useUser()
  const [section, setSection] = useState('dashboard')

  const signout = () => { logout(); setSection('dashboard') }

  if (!isAuth) return <LoginPage />

  const views = {
    dashboard:    <DashboardView />,
    equipo:       <PlaceholderView title="Mi Equipo"        icon="👥" sub="Gestión completa del plantel"                     />,
    sesiones:     <PlaceholderView title="Sesiones"         icon="📋" sub="Historial y análisis de sesiones"                />,
    jugadores:    <PlaceholderView title="Jugadores"        icon="👤" sub="Perfiles individuales y evolución"               />,
    telemetria:   <PlaceholderView title="Telemetría"       icon="📡" sub="Datos en tiempo real desde dispositivos GPS/IMU" />,
    partido:      <PlaceholderView title="Modo Partido"     icon="🏟" sub="Seguimiento en vivo durante la competencia"      />,
    heatmaps:     <PlaceholderView title="Mapas de calor"   icon="🗺" sub="Zonas de juego e intensidad"                     />,
    carga:        <PlaceholderView title="Carga de trabajo" icon="⚡" sub="Planificación y periodización"                  />,
    reportes:     <PlaceholderView title="Reportes"         icon="📊" sub="PDF y exportación de datos"                     />,
    optimizacion: <OptimizacionView />,
    vitrina:      <VitrinaView />,
    config:       <PlaceholderView title="Configuración"    icon="⚙"  sub="Equipo, dispositivos y cuenta"                  />,
  }

  return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', overflow:'hidden', background:T.bg }}>
      <Sidebar active={section} onChange={setSection} onSignOut={signout} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <Topbar section={section} />
        <div style={{ flex:1, overflow:'hidden', animation:'fadeIn .3s ease' }}>
          <ErrorBoundary key={section} fallbackTitle="Error al cargar la vista" onRetry={() => setSection(prev => prev)}>
            {views[section] || views.dashboard}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </UserProvider>
  )
}
