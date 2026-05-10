// ── PLACEHOLDER ────────────────────────────────────────────────
function PlaceholderView({title,icon,sub}) {
  return html`<div style=${{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
    <div style=${{fontSize:48,opacity:.4}}>${icon}</div>
    <div style=${{fontFamily:T.exo,fontWeight:700,fontSize:22,color:T.white}}>${title}</div>
    <div style=${{fontFamily:T.dm,fontSize:14,color:T.muted}}>${sub||'Próximamente'}</div>
    <div style=${{...glass(12),padding:'8px 18px',marginTop:4}}><span style=${{fontFamily:T.dm,fontSize:12,color:T.cian}}>En desarrollo</span></div>
  </div>`;
}

// ── APP ROOT ───────────────────────────────────────────────────
function App() {
  const [page,setPage]=useState('login');
  const [role,setRole]=useState('dt');
  const [section,setSection]=useState('dashboard');
  const login=r=>{setRole(r);setPage('app');};
  const signout=()=>{setPage('login');setSection('dashboard');};
  if(page==='login')return html`<${LoginPage} onLogin=${login}/>`;
  const views={
    dashboard:html`<${DashboardView}/>`,
    equipo:html`<${PlaceholderView} title="Mi Equipo" icon="👥" sub="Gestión completa del plantel"/>`,
    sesiones:html`<${PlaceholderView} title="Sesiones" icon="📋" sub="Historial y análisis de sesiones"/>`,
    jugadores:html`<${PlaceholderView} title="Jugadores" icon="👤" sub="Perfiles individuales y evolución"/>`,
    telemetria:html`<${PlaceholderView} title="Telemetría" icon="📡" sub="Datos en tiempo real desde dispositivos GPS/IMU"/>`,
    partido:html`<${PlaceholderView} title="Modo Partido" icon="🏟" sub="Seguimiento en vivo durante la competencia"/>`,
    heatmaps:html`<${PlaceholderView} title="Mapas de calor" icon="🗺" sub="Zonas de juego e intensidad"/>`,
    carga:html`<${PlaceholderView} title="Carga de trabajo" icon="⚡" sub="Planificación y periodización"/>`,
    reportes:html`<${PlaceholderView} title="Reportes" icon="📊" sub="PDF y exportación de datos"/>`,
    optimizacion:html`<${OptimizacionView}/>`,
    vitrina:html`<${VitrinaView}/>`,
    config:html`<${PlaceholderView} title="Configuración" icon="⚙" sub="Equipo, dispositivos y cuenta"/>`,
  };
  return html`<div style=${{width:'100vw',height:'100vh',display:'flex',overflow:'hidden',background:T.bg}}>
    <${Sidebar} active=${section} onChange=${setSection} role=${role} onSignOut=${signout}/>
    <div style=${{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
      <${Topbar} section=${section}/>
      <div style=${{flex:1,overflow:'hidden',animation:'fadeIn .3s ease'}}>${views[section]||views.dashboard}</div>
    </div>
  </div>`;
}

render(html`<${App}/>`, document.getElementById('root'));