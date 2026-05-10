// elitrax-data.jsx — Brand tokens, mock data, shared UI components
// ── Brand tokens ───────────────────────────────────────────────
const T = {
  bg:          '#060E1A',
  bg1:         '#0A1628',
  bg2:         '#0D1E38',
  bg3:         '#112244',
  cian:        '#46C7F0',
  naranja:     '#F36C3A',
  green:       '#4ADE80',
  red:         '#FF5B5B',
  yellow:      '#FBBF24',
  white:       '#FFFFFF',
  muted:       'rgba(255,255,255,0.55)',
  faint:       'rgba(255,255,255,0.22)',
  border:      'rgba(255,255,255,0.08)',
  borderHi:    'rgba(255,255,255,0.16)',
  card:        'rgba(255,255,255,0.04)',
  cardHi:      'rgba(255,255,255,0.07)',
  cianDim:     'rgba(70,199,240,0.10)',
  naranjaDim:  'rgba(243,108,58,0.10)',
  greenDim:    'rgba(74,222,128,0.10)',
  exo:         "'Exo 2', sans-serif",
  dm:          "'DM Sans', sans-serif",
  mono:        "'JetBrains Mono', monospace",
};

const glass = (r=12) => ({
  background:           T.card,
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${T.border}`,
  borderRadius:         r,
});

// ── Mock data ──────────────────────────────────────────────────
const TEAM = {
  name: 'Club Atlético Belgrano — Sub 20',
  sport: 'Fútbol 11',
  season: 'Temporada 2026',
  coach: 'Prof. Ricardo Méndez',
  role: 'Director Técnico',
};

const PLAYERS = [
  { id:1,  name:'Lucas Fernández',   pos:'Delantero',    num:9,  km:10.8, sprints:34, vel:31.2, carga:92, estado:'ok'    },
  { id:2,  name:'Mateo González',    pos:'Mediocampista', num:8,  km:9.4,  sprints:28, vel:29.1, carga:78, estado:'ok'    },
  { id:3,  name:'Tomás Herrera',     pos:'Defensor',     num:4,  km:8.1,  sprints:18, vel:26.4, carga:65, estado:'ok'    },
  { id:4,  name:'Nicolás Romero',    pos:'Arquero',      num:1,  km:4.2,  sprints:8,  vel:22.1, carga:41, estado:'ok'    },
  { id:5,  name:'Santiago López',    pos:'Delantero',    num:11, km:11.2, sprints:38, vel:32.6, carga:98, estado:'alerta'},
  { id:6,  name:'Agustín Martínez',  pos:'Mediocampista', num:6,  km:9.8,  sprints:31, vel:28.9, carga:83, estado:'ok'    },
  { id:7,  name:'Rodrigo Vargas',    pos:'Defensor',     num:5,  km:7.9,  sprints:16, vel:25.8, carga:62, estado:'ok'    },
  { id:8,  name:'Facundo Torres',    pos:'Mediocampista', num:10, km:8.6,  sprints:25, vel:27.3, carga:71, estado:'ok'    },
  { id:9,  name:'Emiliano Díaz',     pos:'Defensor',     num:3,  km:8.3,  sprints:20, vel:26.1, carga:68, estado:'lesion'},
  { id:10, name:'Martín Acosta',     pos:'Defensor',     num:2,  km:8.7,  sprints:19, vel:25.5, carga:70, estado:'ok'    },
  { id:11, name:'Bruno Castillo',    pos:'Mediocampista', num:7,  km:9.1,  sprints:26, vel:28.4, carga:75, estado:'ok'    },
];

const SESSIONS_LOG = [
  { id:1, date:'30 Abr',  type:'Partido',       rival:'Talleres',       km:9.8,  sprints:27, duration:'90 min' },
  { id:2, date:'28 Abr',  type:'Entrenamiento', rival:'',               km:7.2,  sprints:18, duration:'75 min' },
  { id:3, date:'26 Abr',  type:'Partido',       rival:'Racing Cba',     km:10.1, sprints:29, duration:'90 min' },
  { id:4, date:'24 Abr',  type:'Entrenamiento', rival:'',               km:8.4,  sprints:22, duration:'80 min' },
  { id:5, date:'22 Abr',  type:'Partido',       rival:'Instituto',      km:9.5,  sprints:25, duration:'90 min' },
];

const WEEKLY_KM = [
  { day:'L', km:0   }, { day:'M', km:9.8 }, { day:'M', km:0   },
  { day:'J', km:7.2 }, { day:'V', km:0   }, { day:'S', km:10.1}, { day:'D', km:0 },
];

// ── Shared UI components ────────────────────────────────────────

function StatCard({ label, value, unit, sub, color=T.cian, icon, trend, style={} }) {
  return (
    <div style={{ ...glass(14), padding:'18px 20px', display:'flex', flexDirection:'column', gap:6, ...style,
      animation:'fadeUp 0.4s ease both' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:T.dm, fontSize:12, color:T.muted, letterSpacing:0.3 }}>{label}</span>
        {icon && <span style={{ fontSize:16, opacity:0.7 }}>{icon}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
        <span style={{ fontFamily:T.mono, fontSize:28, fontWeight:700, color, lineHeight:1 }}>{value}</span>
        {unit && <span style={{ fontFamily:T.dm, fontSize:12, color:T.faint }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontFamily:T.dm, fontSize:11, color: trend==='up' ? T.green : trend==='down' ? T.red : T.muted }}>{sub}</span>}
    </div>
  );
}

function Badge({ label, color=T.cian }) {
  const bg = color===T.cian ? T.cianDim : color===T.naranja ? T.naranjaDim : color===T.green ? T.greenDim : 'rgba(255,255,255,0.07)';
  return (
    <span style={{ fontFamily:T.dm, fontSize:10, fontWeight:600, color,
      background:bg, border:`1px solid ${color}22`, borderRadius:20,
      padding:'2px 8px', letterSpacing:0.4, whiteSpace:'nowrap' }}>
      {label}
    </span>
  );
}

function MiniBar({ val, max=100, color=T.cian, width=80 }) {
  return (
    <div style={{ width, height:4, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min((val/max)*100,100)}%`,
        background: val>=90 ? T.red : val>=75 ? T.naranja : color, borderRadius:2 }}/>
    </div>
  );
}

// Simple sparkline
function Spark({ values, color=T.cian, w=80, h=28 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const pts = values.map((v,i) => {
    const x = (i/(values.length-1))*w;
    const y = h - (v/max)*h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(values.length-1)/(values.length-1)*w} cy={h-(values[values.length-1]/max)*h} r="2.5" fill={color}/>
    </svg>
  );
}

// ── LOGO ──────────────────────────────────────────────────────
function Logo({ collapsed=false, size='md' }) {
  const iconSize = size === 'lg' ? 48 : 36;
  const fontSize = size === 'lg' ? 26 : 16;
  const subSize  = size === 'lg' ? 11 : 9;
  return (
    <div style={{ display:'flex', alignItems:'center', gap: size==='lg' ? 14 : 10 }}>
      {/* Icon box — naranja background like brand */}
      <div style={{ width:iconSize, height:iconSize, borderRadius: size==='lg' ? 14 : 10,
        flexShrink:0, position:'relative', overflow:'hidden',
        background:`linear-gradient(145deg, #F36C3A 0%, #C94E1E 100%)`,
        boxShadow:`0 4px 16px rgba(243,108,58,0.40)`,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width={iconSize*0.62} height={iconSize*0.62} viewBox="0 0 24 24" fill="none">
          {/* Pulse / ECG line */}
          <polyline points="1,13 5,13 7,7 9,17 11,10 13,13 16,13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
          {/* Arrow / bolt */}
          <path d="M17 4l-4 7h4l-4 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {!collapsed && (
        <div>
          <div style={{ fontFamily:T.exo, fontWeight:800, fontSize, color:T.white, letterSpacing:2, lineHeight:1 }}>
            ELI<span style={{ color:T.naranja }}>TRAX</span>
          </div>
          <div style={{ fontFamily:T.dm, fontSize:subSize, color:T.cian, letterSpacing:2, opacity:0.7, marginTop:2 }}>
            PLATAFORMA PRO+
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Object.assign(window, { T, glass, TEAM, PLAYERS, SESSIONS_LOG, WEEKLY_KM, StatCard, Badge, MiniBar, Spark, Logo });
