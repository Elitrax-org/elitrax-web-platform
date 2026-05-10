// elitrax-shell.jsx — Login, Sidebar, Topbar
// LOGIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginPage({ onLogin }) {
  const [email,   setEmail]   = React.useState('dt@atleticobel.com.ar');
  const [pass,    setPass]    = React.useState('••••••••');
  const [role,    setRole]    = React.useState('dt');
  const [loading, setLoading] = React.useState(false);
  const [err,     setErr]     = React.useState('');

  const roles = [
    { id:'dt',       label:'Director Técnico' },
    { id:'pf',       label:'Preparador Físico' },
    { id:'analista', label:'Analista' },
    { id:'scout',    label:'Scout' },
  ];

  const handleLogin = () => {
    if (!email.trim()) { setErr('Ingresá tu correo'); return; }
    setErr(''); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(role); }, 1500);
  };

  return (
    <div style={{
      width:'100vw', height:'100vh', display:'flex', overflow:'hidden',
      background: T.bg,
    }}>
      {/* Left panel — branding */}
      <div style={{ flex:'0 0 44%', position:'relative', overflow:'hidden',
        background:`linear-gradient(160deg, #0D1E38 0%, #060E1A 60%, #0A1628 100%)`,
        display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px 52px' }}>

        {/* Decorative grid */}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.06 }} viewBox="0 0 440 900" preserveAspectRatio="xMidYMid slice">
          {Array.from({length:12}).map((_,i) => <line key={'h'+i} x1="0" y1={i*80} x2="440" y2={i*80} stroke={T.cian} strokeWidth="0.5"/>)}
          {Array.from({length:7}).map((_,i)  => <line key={'v'+i} x1={i*80} y1="0" x2={i*80} y2="900" stroke={T.cian} strokeWidth="0.5"/>)}
        </svg>

        {/* Radial glow — naranja */}
        <div style={{ position:'absolute', top:'35%', left:'30%', width:400, height:400,
          borderRadius:'50%', background:`radial-gradient(circle, rgba(243,108,58,0.14) 0%, transparent 70%)`,
          transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

        <Logo size="lg" />

        <div style={{ animation:'fadeUp 0.6s ease both' }}>
          <div style={{ fontFamily:T.exo, fontWeight:800, fontSize:42, color:T.white, lineHeight:1.1, marginBottom:16 }}>
            La data de tu equipo,<br/>
            <span style={{ color:T.cian }}>en tiempo real.</span>
          </div>
          <div style={{ fontFamily:T.dm, fontSize:15, color:T.muted, lineHeight:1.7, maxWidth:320 }}>
            GPS + IMU + IA conversacional para directores técnicos, preparadores físicos, analistas y scouts.
          </div>
          {/* Feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:32 }}>
            {[
              { icon:'📡', text:'Métricas GPS e IMU en tiempo real' },
              { icon:'🤖', text:'IA que interpreta el rendimiento del equipo' },
              { icon:'🔭', text:'Perfiles públicos para captación de talentos' },
            ].map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:T.cianDim,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  {f.icon}
                </div>
                <span style={{ fontFamily:T.dm, fontSize:13, color:T.muted }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontFamily:T.dm, fontSize:11, color:T.faint }}>
          © 2026 Elitrax · Córdoba, Argentina · <span style={{ color:T.cian }}>www.elitrax.com</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        background:`linear-gradient(180deg, ${T.bg} 0%, ${T.bg1} 100%)`, padding:40 }}>
        <div style={{ width:'100%', maxWidth:420, animation:'fadeUp 0.5s 0.1s ease both', opacity:0 }}>

          <div style={{ marginBottom:32 }}>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:28, color:T.white, marginBottom:6 }}>
              Bienvenido
            </div>
            <div style={{ fontFamily:T.dm, fontSize:14, color:T.muted }}>
              Ingresá con tu cuenta institucional Elitrax PRO+
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.8, marginBottom:8 }}>
              CORREO INSTITUCIONAL
            </div>
            <div style={{ ...glass(10), padding:'13px 16px', display:'flex', alignItems:'center', gap:10,
              border:`1px solid ${T.border}` }}>
              <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
                <rect x="1" y="1" width="14" height="11" rx="2" stroke={T.muted} strokeWidth="1.3"/>
                <path d="M1 4l7 4.5L15 4" stroke={T.muted} strokeWidth="1.3"/>
              </svg>
              <input value={email} onChange={e => setEmail(e.target.value)}
                style={{ background:'none', border:'none', outline:'none', flex:1,
                  fontFamily:T.dm, fontSize:14, color:T.white }}/>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom:8 }}>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.8, marginBottom:8 }}>
              CONTRASEÑA
            </div>
            <div style={{ ...glass(10), padding:'13px 16px', display:'flex', alignItems:'center', gap:10 }}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <rect x="1" y="7" width="12" height="8" rx="2" stroke={T.muted} strokeWidth="1.3"/>
                <path d="M4 7V5a3 3 0 016 0v2" stroke={T.muted} strokeWidth="1.3"/>
                <circle cx="7" cy="11.5" r="1.5" fill={T.muted}/>
              </svg>
              <input value={pass} onChange={e => setPass(e.target.value)} type="password"
                style={{ background:'none', border:'none', outline:'none', flex:1,
                  fontFamily:T.dm, fontSize:14, color:T.white }}/>
            </div>
          </div>

          {err && <div style={{ fontFamily:T.dm, fontSize:12, color:T.red, marginBottom:8 }}>{err}</div>}

          <div style={{ textAlign:'right', marginBottom:24 }}>
            <span style={{ fontFamily:T.dm, fontSize:12, color:T.naranja, cursor:'pointer' }}>
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <button onClick={handleLogin} disabled={loading} style={{
            width:'100%', height:48,
            background: loading ? T.naranjaDim : `linear-gradient(135deg, ${T.naranja} 0%, #C94E1E 100%)`,
            border: loading ? `1px solid ${T.naranja}` : 'none',
            borderRadius:12, fontFamily:T.exo, fontWeight:700, fontSize:15, letterSpacing:1.5,
            color: loading ? T.naranja : T.white,
            boxShadow: loading ? 'none' : '0 6px 20px rgba(243,108,58,0.35)',
            transition:'all 0.25s',
          }}>
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>

          <div style={{ textAlign:'center', marginTop:20 }}>
            <span style={{ fontFamily:T.dm, fontSize:12, color:T.faint }}>¿No tenés cuenta? </span>
            <a href="https://www.elitrax.com" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily:T.dm, fontSize:12, color:T.naranja, textDecoration:'none', fontWeight:500 }}>
              Solicitá acceso en elitrax.com →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// SIDEBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NAV_ITEMS = [
  { id:'dashboard',    label:'Dashboard',        icon:'▦',  group:'main'      },
  { id:'equipo',       label:'Mi Equipo',         icon:'👥', group:'main'      },
  { id:'sesiones',     label:'Sesiones',          icon:'📋', group:'main'      },
  { id:'jugadores',    label:'Jugadores',         icon:'👤', group:'main'      },
  { id:'telemetria',   label:'Telemetría',        icon:'📡', group:'live'      },
  { id:'partido',      label:'Modo Partido',      icon:'🏟', group:'live'      },
  { id:'heatmaps',     label:'Mapas de calor',    icon:'🗺', group:'analisis'  },
  { id:'carga',        label:'Carga de trabajo',  icon:'⚡', group:'analisis'  },
  { id:'reportes',     label:'Reportes',          icon:'📊', group:'analisis'  },
  { id:'optimizacion', label:'Optimización IA',   icon:'🤖', group:'analisis'  },
  { id:'vitrina',      label:'Vitrina / Scouts',  icon:'🔭', group:'captacion' },
  { id:'config',       label:'Configuración',     icon:'⚙', group:'sistema'   },
];

function Sidebar({ active, onChange, role, onSignOut }) {
  const groups = [
    { id:'main',      label:'PRINCIPAL' },
    { id:'live',      label:'EN VIVO' },
    { id:'analisis',  label:'ANÁLISIS' },
    { id:'captacion', label:'CAPTACIÓN' },
    { id:'sistema',   label:'SISTEMA' },
  ];

  return (
    <div style={{
      width:220, height:'100vh', flexShrink:0,
      background:`linear-gradient(180deg, ${T.bg2} 0%, ${T.bg1} 100%)`,
      borderRight:`1px solid ${T.border}`,
      display:'flex', flexDirection:'column',
      padding:'0 0 20px',
    }}>
      {/* Logo */}
      <div style={{ padding:'22px 20px 18px', borderBottom:`1px solid ${T.border}` }}>
        <Logo />
      </div>

      {/* Team info */}
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}`, margin:'0 0 8px' }}>
        <div style={{ ...glass(10), padding:'10px 12px' }}>
          <div style={{ fontFamily:T.dm, fontWeight:600, fontSize:12, color:T.white, lineHeight:1.3 }}>
            {TEAM.name}
          </div>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:3 }}>
            {TEAM.sport} · {TEAM.season}
          </div>
          <div style={{ marginTop:6 }}>
            <Badge label={role === 'dt' ? 'Director Técnico' : role === 'pf' ? 'Preparador Físico' : role === 'scout' ? 'Scout' : 'Analista'} color={T.cian} />
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 10px' }}>
        {groups.map(g => {
          const items = NAV_ITEMS.filter(n => n.group === g.id);
          if (!items.length) return null;
          return (
            <div key={g.id} style={{ marginBottom:6 }}>
              <div style={{ fontFamily:T.dm, fontSize:9, color:T.faint, letterSpacing:1.2,
                padding:'10px 10px 4px' }}>{g.label}</div>
              {items.map(item => {
                const sel = active === item.id;
                const isLive = item.group === 'live';
                return (
                  <button key={item.id} onClick={() => onChange(item.id)} style={{
                    width:'100%', display:'flex', alignItems:'center', gap:10,
                    padding:'9px 12px', borderRadius:10, border:'none',
                    background: sel ? (isLive ? T.naranjaDim : T.cianDim) : 'transparent',
                    cursor:'pointer', textAlign:'left', marginBottom:2,
                    transition:'background 0.15s',
                  }}>
                    <span style={{ fontSize:15, opacity: sel ? 1 : 0.6, width:18, textAlign:'center' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontFamily:T.dm, fontSize:13, fontWeight: sel ? 600 : 400,
                      color: sel ? (isLive ? T.naranja : T.cian) : T.muted }}>
                      {item.label}
                    </span>
                    {isLive && !sel && (
                      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:T.naranja,
                          boxShadow:`0 0 5px ${T.naranja}`, animation:'pulse 1.8s ease infinite' }}/>
                      </div>
                    )}
                    {sel && <div style={{ marginLeft:'auto', width:3, height:16, borderRadius:2,
                      background: isLive ? T.naranja : T.cian }} />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User + sign out */}
      <div style={{ padding:'10px 16px 0', borderTop:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0' }}>
          <div style={{ width:34, height:34, borderRadius:'50%',
            background:`linear-gradient(135deg, ${T.cian} 0%, #1A8AB5 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.bg, flexShrink:0 }}>
            RM
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:T.dm, fontSize:12, fontWeight:600, color:T.white,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              Prof. R. Méndez
            </div>
            <div style={{ fontFamily:T.dm, fontSize:10, color:T.muted }}>PRO+</div>
          </div>
          <button onClick={onSignOut} style={{ background:'none', border:'none', padding:4,
            display:'flex', alignItems:'center', opacity:0.5 }}
            title="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 8H2M6 5l-3 3 3 3" stroke={T.white} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 3h5a1 1 0 011 1v8a1 1 0 01-1 1H8" stroke={T.white} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// TOPBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Topbar({ section }) {
  const sectionLabel = NAV_ITEMS.find(n=>n.id===section)?.label || 'Dashboard';
  const [now] = React.useState(new Date());
  const dateStr = now.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'});
  return (
    <div style={{
      height:56, flexShrink:0, borderBottom:`1px solid ${T.border}`,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 28px',
      background:`rgba(6,14,26,0.8)`,
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontFamily:T.dm, fontSize:12, color:T.faint, textTransform:'capitalize' }}>{dateStr}</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        {/* Search */}
        <div style={{ ...glass(8), padding:'6px 14px', display:'flex', alignItems:'center', gap:8,
          border:`1px solid ${T.border}`, width:220 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4.5" stroke={T.muted} strokeWidth="1.2"/>
            <path d="M9 9l3 3" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input placeholder="Buscar jugador, sesión..." style={{ background:'none', border:'none',
            outline:'none', fontFamily:T.dm, fontSize:12, color:T.white, flex:1 }}/>
        </div>
        {/* Notif */}
        <div style={{ position:'relative', cursor:'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a6 6 0 00-6 6v3l-2 3h16l-2-3V8a6 6 0 00-6-6z" stroke={T.muted} strokeWidth="1.3"/>
            <path d="M8 16a2 2 0 004 0" stroke={T.muted} strokeWidth="1.3"/>
          </svg>
          <div style={{ position:'absolute', top:-2, right:-2, width:8, height:8, borderRadius:'50%',
            background:T.red, border:`1.5px solid ${T.bg}` }}/>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Object.assign(window, { LoginPage, NAV_ITEMS, Sidebar, Topbar });
