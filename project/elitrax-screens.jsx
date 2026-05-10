// Main screens: Home, Sessions, Live, Detail, Heatmap, Profile, AI Chat
const { C, font, gcard, USER, SESSIONS, WEEKLY, AI_MSGS,
        PlanBadge, Divider, MetricRow, ArcRing, WeeklyBar, SpeedLine } = window;

// ── Bottom Navigation ──────────────────────────────────────────
function BottomNav({ tab, onChange, onAI }) {
  const tabs = [
    { id:'home',     label:'Inicio',   icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 20v-7h6v7" strokeWidth="1.6" strokeLinecap="round"/></svg> },
    { id:'sessions', label:'Sesiones', icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="3" strokeWidth="1.6"/><path d="M7 11h8M7 7h5M7 15h3" strokeWidth="1.6" strokeLinecap="round"/></svg> },
    { id:'vitrina',  label:'Vitrina',  icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3C7 3 3.5 5.8 3 9.5c-.1.8-.1 1.7 0 2.5C3.5 16 7 19 11 19s7.5-3 8-7c.1-.8.1-1.7 0-2.5C18.5 5.8 15 3 11 3z" strokeWidth="1.6"/><circle cx="11" cy="11" r="3" strokeWidth="1.6"/></svg> },
    { id:'profile',  label:'Perfil',   icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" strokeWidth="1.6"/><path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  ];
  return (
    <div style={{ ...gcard(0), borderTop:`1px solid ${C.border}`, borderRadius:0,
      display:'flex', padding:'8px 0 20px', flexShrink:0 }}>
      {tabs.map(t => {
        const active = t.id === tab;
        const color  = t.id === 'vitrina' ? (active ? C.naranja : C.muted) : active ? C.cian : C.muted;
        return (
          <button key={t.id}
            onClick={() => onChange(t.id)}
            style={{ flex:1, background:'none', border:'none', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'4px 0' }}>
            <div style={{ color, transition:'color 0.2s' }}>
              {React.cloneElement(t.icon, { stroke: color })}
            </div>
            <span style={{ fontFamily:font.dm, fontSize:10, color, fontWeight: active ? 600 : 400,
              transition:'color 0.2s' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Home Screen ────────────────────────────────────────────────
function HomeScreen({ onStartLive, onSessionDetail }) {
  const last = SESSIONS[0];
  const totalKm = SESSIONS.reduce((s, x) => s + x.distance, 0).toFixed(1);
  return (
    <div style={{ overflowY:'auto', height:'100%', padding:'0 0 12px' }}>
      {/* Header */}
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <div>
            <div style={{ fontFamily:font.dm, fontSize:13, color:C.muted }}>Buenas tardes,</div>
            <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:24, color:C.white }}>
              {USER.name} <span style={{ fontFamily:font.mono, fontSize:13, verticalAlign:'middle' }}>
                <PlanBadge plan={USER.plan} />
              </span>
            </div>
          </div>
          {/* Avatar */}
          <div style={{ width:44, height:44, borderRadius:'50%',
            background:`linear-gradient(135deg, ${C.cian} 0%, #1A8AB5 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:font.exo, fontWeight:700, fontSize:14, color:C.bg }}>
            {USER.avatar}
          </div>
        </div>
        {/* Device status pill */}
        <div style={{ ...gcard(20), display:'inline-flex', alignItems:'center', gap:7,
          padding:'5px 14px', marginTop:10 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:C.green,
            boxShadow:`0 0 5px ${C.green}` }} />
          <span style={{ fontFamily:font.dm, fontSize:12, color:C.white }}>ELITRAX Motion conectado</span>
          <span style={{ fontFamily:font.mono, fontSize:11, color:C.muted }}>92%</span>
        </div>
      </div>

      {/* CTA — Start session */}
      <div style={{ padding:'16px 20px 0' }}>
        <button onClick={onStartLive} style={{
          width:'100%', background:`linear-gradient(135deg, ${C.naranja} 0%, #D4502A 100%)`,
          border:'none', borderRadius:18, padding:'18px 20px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          cursor:'pointer', boxShadow:`0 8px 24px rgba(243,108,58,0.30)`,
        }}>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:18, color:C.white }}>
              Iniciar Sesión
            </div>
            <div style={{ fontFamily:font.dm, fontSize:12, color:'rgba(255,255,255,0.75)', marginTop:2 }}>
              GPS + IMU activos
            </div>
          </div>
          <div style={{ width:48, height:48, borderRadius:'50%',
            background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <polygon points="6,3 17,10 6,17" fill="white"/>
            </svg>
          </div>
        </button>
      </div>

      {/* This week summary */}
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ ...gcard(20), padding:'18px 18px 14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:14, color:C.white }}>Esta semana</div>
              <div style={{ fontFamily:font.mono, fontSize:26, fontWeight:700, color:C.cian, marginTop:2 }}>
                {totalKm} <span style={{ fontSize:13, color:C.muted, fontFamily:font.dm }}>km</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:font.dm, fontSize:12, color:C.muted }}>5 sesiones</div>
              <div style={{ fontFamily:font.dm, fontSize:12, color:C.green, marginTop:2 }}>↑ 18% vs anterior</div>
            </div>
          </div>
          <WeeklyBar data={WEEKLY} todayIdx={1} />
        </div>
      </div>

      {/* Last session */}
      <div style={{ padding:'16px 20px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:15, color:C.white }}>Última sesión</div>
          <span style={{ fontFamily:font.dm, fontSize:12, color:C.cian, cursor:'pointer' }}>Ver todas →</span>
        </div>
        <button onClick={() => onSessionDetail(last)} style={{
          width:'100%', ...gcard(18), padding:'16px', border:'none', cursor:'pointer', textAlign:'left',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
            <div>
              <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:15, color:C.white }}>{last.type}</div>
              <div style={{ fontFamily:font.dm, fontSize:12, color:C.muted, marginTop:2 }}>{last.date} · {last.duration}</div>
            </div>
            <ArcRing value={last.explosivity} size={58} color={C.naranja} label={last.explosivity} sub="exp." />
          </div>
          <div style={{ display:'flex', gap:0 }}>
            {[
              { v: last.distance, u: 'km',   label: 'Distancia', c: C.cian },
              { v: last.maxSpeed, u: 'km/h', label: 'Vel. máx',  c: C.cian },
              { v: last.sprints,  u: '',     label: 'Sprints',   c: C.naranja },
            ].map((m, i) => (
              <div key={i} style={{ flex:1, textAlign:'center',
                borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ fontFamily:font.mono, fontSize:20, fontWeight:700, color:m.c }}>{m.v}</div>
                <div style={{ fontFamily:font.dm, fontSize:10, color:C.muted, marginTop:1 }}>{m.u} {m.label}</div>
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ padding:'16px 20px 0' }}>
        <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:15, color:C.white, marginBottom:10 }}>
          Resumen del mes
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {[
            { label:'Dist. promedio', value:'9.6', unit:'km', color:C.cian },
            { label:'Vel. máx prom.', value:'28.2', unit:'km/h', color:C.cian },
            { label:'Sprints prom.',  value:'24.2', unit:'',    color:C.naranja },
          ].map((m, i) => (
            <div key={i} style={{ flex:1, ...gcard(14), padding:'14px 10px', textAlign:'center' }}>
              <div style={{ fontFamily:font.mono, fontSize:19, fontWeight:700, color:m.color }}>{m.value}</div>
              <div style={{ fontFamily:font.dm, fontSize:10, color:C.muted, marginTop:3 }}>{m.unit} {m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sessions Screen ────────────────────────────────────────────
function SessionsScreen({ onDetail }) {
  const [filter, setFilter] = React.useState('Todas');
  const filters = ['Todas', 'Partido', 'Entrenamiento'];
  const shown = filter === 'Todas' ? SESSIONS : SESSIONS.filter(s => s.type === filter);

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'0 0 12px' }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:24, color:C.white, marginBottom:16 }}>
          Mis Sesiones
        </div>
        {/* Filters */}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...gcard(20), padding:'6px 16px', border:'none', cursor:'pointer',
              background: filter === f ? C.cian : C.card,
              fontFamily:font.dm, fontSize:13, fontWeight: filter === f ? 600 : 400,
              color: filter === f ? C.bg : C.muted, transition:'all 0.2s',
            }}>{f}</button>
          ))}
        </div>
      </div>
      {/* Session list */}
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:12 }}>
        {shown.map(s => (
          <button key={s.id} onClick={() => onDetail(s)} style={{
            ...gcard(18), padding:'16px', border:`1px solid ${C.border}`,
            cursor:'pointer', textAlign:'left', width:'100%',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:15, color:C.white }}>{s.type}</div>
                  <div style={{ ...gcard(20), padding:'2px 8px',
                    background: s.type === 'Partido' ? C.naranjaDim : C.cianDim }}>
                    <span style={{ fontFamily:font.dm, fontSize:10,
                      color: s.type === 'Partido' ? C.naranja : C.cian }}>{s.type}</span>
                  </div>
                </div>
                <div style={{ fontFamily:font.dm, fontSize:12, color:C.muted, marginTop:3 }}>
                  {s.date} · {s.duration}
                </div>
              </div>
              <div style={{ fontFamily:font.mono, fontSize:22, fontWeight:700, color:C.cian }}>
                {s.distance}<span style={{ fontSize:12, color:C.muted }}> km</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[
                { label:'Vel. máx', value:`${s.maxSpeed}`, unit:'km/h' },
                { label:'Sprints',  value:s.sprints, unit:'' },
                { label:'Impactos', value:s.impacts, unit:'' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontFamily:font.mono, fontSize:14, fontWeight:700, color:C.muted }}>
                    {m.value}<span style={{ fontFamily:font.dm, fontSize:11 }}>{m.unit && ' ' + m.unit}</span>
                  </div>
                  <div style={{ fontFamily:font.dm, fontSize:10, color:C.faint, marginTop:1 }}>{m.label}</div>
                </div>
              ))}
              <div style={{ marginLeft:'auto' }}>
                <ArcRing value={s.explosivity} size={44} strokeWidth={4} color={C.naranja}
                  label={s.explosivity} sub="" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Live Session Screen ────────────────────────────────────────
function LiveScreen({ onStop }) {
  const [seconds, setSeconds] = React.useState(0);
  const [paused,  setPaused]  = React.useState(false);
  const [distance, setDistance] = React.useState(0.00);
  const [speed,    setSpeed]    = React.useState(0.0);
  const [sprints,  setSprints]  = React.useState(0);
  const [acels,    setAcels]    = React.useState(0);

  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setSeconds(s => s + 1);
      setDistance(d => +(d + 0.0021 + Math.random() * 0.0008).toFixed(4));
      setSpeed(()   => +(10 + Math.random() * 18).toFixed(1));
      if (Math.random() < 0.04) setSprints(s => s + 1);
      if (Math.random() < 0.08) setAcels(a => a + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [paused]);

  const fmt = s => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  return (
    <div style={{ height:'100%', background:`linear-gradient(180deg, #060E1A 0%, ${C.bg} 100%)`,
      display:'flex', flexDirection:'column', padding:'20px 20px 32px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:18, color:C.white }}>Sesión en vivo</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#FF4444',
              boxShadow:'0 0 8px #FF4444', animation:'pulse 1s infinite' }} />
            <span style={{ fontFamily:font.dm, fontSize:12, color:C.muted }}>
              GPS + IMU activos
            </span>
          </div>
        </div>
        <div style={{ ...gcard(20), padding:'6px 14px' }}>
          <span style={{ fontFamily:font.dm, fontSize:12, color:C.green }}>92% 🔋</span>
        </div>
      </div>

      {/* Timer */}
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontFamily:font.mono, fontSize:56, fontWeight:700, color:C.white, letterSpacing:-2 }}>
          {fmt(seconds)}
        </div>
        <div style={{ fontFamily:font.dm, fontSize:12, color:C.muted, marginTop:4 }}>
          {paused ? '⏸ EN PAUSA' : 'GRABANDO'}
        </div>
      </div>

      {/* GPS track area */}
      <div style={{ ...gcard(18), padding:16, marginBottom:16, flex:'none' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontFamily:font.dm, fontSize:12, color:C.muted }}>Recorrido GPS</span>
          <span style={{ fontFamily:font.mono, fontSize:12, color:C.cian }}>{distance.toFixed(2)} km</span>
        </div>
        {/* Simulated GPS track */}
        <svg width="100%" height="80" viewBox="0 0 280 80" preserveAspectRatio="xMidYMid meet">
          <rect width="280" height="80" rx="8" fill="rgba(70,199,240,0.04)"/>
          {/* Field lines */}
          <line x1="0" y1="40" x2="280" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <line x1="140" y1="0" x2="140" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          {/* Simulated path */}
          <polyline
            points="20,60 45,35 70,50 95,25 120,40 145,55 170,30 195,45 220,20 245,38 260,55"
            fill="none" stroke={C.cian} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          {/* Current position dot */}
          <circle cx="260" cy="55" r="5" fill={C.cian} opacity="1"/>
          <circle cx="260" cy="55" r="10" fill={C.cian} opacity="0.2"/>
        </svg>
      </div>

      {/* Live metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { label:'Velocidad actual', value:paused ? '0.0' : speed.toFixed(1), unit:'km/h', color:C.cian },
          { label:'Vel. máxima',      value:'28.4', unit:'km/h', color:C.cian },
          { label:'Sprints',          value:sprints, unit:'',    color:C.naranja },
          { label:'Aceleraciones',    value:acels,   unit:'',    color:C.naranja },
        ].map((m, i) => (
          <div key={i} style={{ ...gcard(14), padding:'12px 14px' }}>
            <div style={{ fontFamily:font.dm, fontSize:11, color:C.muted, marginBottom:4 }}>{m.label}</div>
            <div style={{ fontFamily:font.mono, fontSize:22, fontWeight:700, color:m.color }}>
              {m.value} <span style={{ fontSize:11, color:C.faint, fontFamily:font.dm }}>{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:12, marginTop:'auto' }}>
        <button onClick={() => setPaused(p => !p)} style={{
          flex:1, ...gcard(14), padding:'16px 0', border:'none', cursor:'pointer',
          fontFamily:font.exo, fontWeight:700, fontSize:14, color:C.white, letterSpacing:1,
        }}>{paused ? '▶ CONTINUAR' : '⏸ PAUSAR'}</button>
        <button onClick={onStop} style={{
          flex:1, background:'rgba(255,80,80,0.15)', border:'1px solid rgba(255,80,80,0.40)',
          borderRadius:14, padding:'16px 0', cursor:'pointer',
          fontFamily:font.exo, fontWeight:700, fontSize:14, color:'#FF6B6B', letterSpacing:1,
        }}>■ DETENER</button>
      </div>
    </div>
  );
}

// ── Session Detail Screen ──────────────────────────────────────
function SessionDetailScreen({ session, onBack, onHeatmap }) {
  const s = session;
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'0 0 20px' }}>
      {/* Header */}
      <div style={{ padding:'20px 20px 0' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', gap:8, marginBottom:16, padding:0 }}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M9 1L1 8.5L9 16" stroke={C.cian} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily:font.dm, fontSize:14, color:C.cian }}>Volver</span>
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:22, color:C.white }}>{s.type}</div>
            <div style={{ fontFamily:font.dm, fontSize:13, color:C.muted, marginTop:2 }}>{s.date} · {s.duration}</div>
          </div>
          <ArcRing value={s.explosivity} size={64} color={C.naranja} label={s.explosivity} sub="explosiv." />
        </div>
      </div>

      {/* Hero metrics */}
      <div style={{ padding:'16px 20px 0' }}>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ flex:2, ...gcard(18), padding:'16px', background:`linear-gradient(135deg, rgba(70,199,240,0.12) 0%, rgba(70,199,240,0.05) 100%)`, border:`1px solid rgba(70,199,240,0.20)` }}>
            <div style={{ fontFamily:font.dm, fontSize:11, color:C.muted }}>DISTANCIA</div>
            <div style={{ fontFamily:font.mono, fontSize:36, fontWeight:700, color:C.cian, lineHeight:1, marginTop:4 }}>
              {s.distance}
            </div>
            <div style={{ fontFamily:font.dm, fontSize:13, color:C.muted }}>kilómetros</div>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ ...gcard(14), padding:'12px' }}>
              <div style={{ fontFamily:font.dm, fontSize:10, color:C.muted }}>VEL. MÁX</div>
              <div style={{ fontFamily:font.mono, fontSize:20, fontWeight:700, color:C.cian }}>{s.maxSpeed}</div>
              <div style={{ fontFamily:font.dm, fontSize:10, color:C.faint }}>km/h</div>
            </div>
            <div style={{ ...gcard(14), padding:'12px' }}>
              <div style={{ fontFamily:font.dm, fontSize:10, color:C.muted }}>VEL. PROM</div>
              <div style={{ fontFamily:font.mono, fontSize:20, fontWeight:700, color:C.cian }}>{s.avgSpeed}</div>
              <div style={{ fontFamily:font.dm, fontSize:10, color:C.faint }}>km/h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Speed chart */}
      <div style={{ padding:'16px 20px 0' }}>
        <div style={{ ...gcard(18), padding:'16px' }}>
          <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:14, color:C.white, marginBottom:12 }}>
            Velocidad durante la sesión
          </div>
          <SpeedLine values={[8,14,22,18,28,20,26,16,24,19,28,12,20,18,24]} color={C.cian} width={300} height={48} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontFamily:font.dm, fontSize:10, color:C.faint }}>0 min</span>
            <span style={{ fontFamily:font.dm, fontSize:10, color:C.faint }}>{s.duration}</span>
          </div>
        </div>
      </div>

      {/* GPS Metrics */}
      <div style={{ padding:'16px 20px 0' }}>
        <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:14, color:C.cian, marginBottom:10, letterSpacing:1 }}>
          GPS — POSICIÓN Y DESPLAZAMIENTO
        </div>
        <div style={{ ...gcard(18), padding:'4px 16px' }}>
          <MetricRow label="Distancia total"  value={s.distance}  unit="km"   color={C.cian} />
          <MetricRow label="Velocidad máxima" value={s.maxSpeed}  unit="km/h" color={C.cian} />
          <MetricRow label="Velocidad promedio" value={s.avgSpeed} unit="km/h" color={C.cian} />
          <MetricRow label="Zona dominante"   value={s.heatZone} unit=""     color={C.muted} last />
        </div>
      </div>

      {/* IMU Metrics */}
      <div style={{ padding:'16px 20px 0' }}>
        <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:14, color:C.naranja, marginBottom:10, letterSpacing:1 }}>
          IMU — MOVIMIENTO E INTENSIDAD
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {[
            { label:'Sprints',        value:s.sprints,     color:C.naranja },
            { label:'Aceleraciones',  value:s.acels,       color:C.naranja },
            { label:'Saltos',         value:s.jumps,       color:C.cian },
            { label:'Impactos',       value:s.impacts,     color:C.cian },
          ].map((m, i) => (
            <div key={i} style={{ ...gcard(14), padding:'14px' }}>
              <div style={{ fontFamily:font.dm, fontSize:11, color:C.muted, marginBottom:4 }}>{m.label}</div>
              <div style={{ fontFamily:font.mono, fontSize:28, fontWeight:700, color:m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap preview */}
      <div style={{ padding:'0 20px' }}>
        <button onClick={onHeatmap} style={{
          width:'100%', ...gcard(18), padding:'14px 16px',
          border:'none', cursor:'pointer', textAlign:'left',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <div>
            <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:14, color:C.white }}>Mapa de calor</div>
            <div style={{ fontFamily:font.dm, fontSize:12, color:C.muted, marginTop:2 }}>Zona dominante: {s.heatZone}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:40, height:28, borderRadius:6, background:'linear-gradient(90deg, rgba(70,199,240,0.2), rgba(243,108,58,0.8), rgba(255,40,40,0.9))', position:'relative' }}>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#FF2222', boxShadow:'0 0 8px #FF2222' }} />
              </div>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1l6 6.5L1 13" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Heatmap Screen ─────────────────────────────────────────────
function HeatmapScreen({ session, onBack }) {
  const s = session;
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'0 0 20px' }}>
      <div style={{ padding:'20px 20px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M9 1L1 8.5L9 16" stroke={C.cian} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:20, color:C.white }}>Mapa de calor</div>
          <div style={{ fontFamily:font.dm, fontSize:12, color:C.muted }}>{s.date} · {s.type}</div>
        </div>
      </div>

      {/* Field heatmap */}
      <div style={{ padding:'0 20px', marginBottom:16 }}>
        <div style={{ ...gcard(18), padding:16 }}>
          <svg width="100%" viewBox="0 0 300 200" style={{ display:'block' }}>
            {/* Field background */}
            <rect width="300" height="200" rx="8" fill="#0A2A18"/>
            {/* Field lines */}
            <rect x="4" y="4" width="292" height="192" rx="6" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
            {/* Center line */}
            <line x1="150" y1="4" x2="150" y2="196" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
            {/* Center circle */}
            <circle cx="150" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
            <circle cx="150" cy="100" r="2" fill="rgba(255,255,255,0.20)"/>
            {/* Penalty areas */}
            <rect x="4" y="60" width="50" height="80" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
            <rect x="246" y="60" width="50" height="80" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
            {/* Goals */}
            <rect x="0" y="80" width="10" height="40" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            <rect x="290" y="80" width="10" height="40" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>

            {/* Heat zones - mediocampo izquierdo */}
            <ellipse cx="100" cy="100" rx="55" ry="50" fill="rgba(243,108,58,0.12)"/>
            <ellipse cx="95" cy="105" rx="38" ry="35" fill="rgba(243,108,58,0.22)"/>
            <ellipse cx="90" cy="108" rx="24" ry="22" fill="rgba(243,108,58,0.38)"/>
            <ellipse cx="88" cy="110" rx="14" ry="12" fill="rgba(255,80,40,0.58)"/>
            <ellipse cx="87" cy="111" rx="7"  ry="6"  fill="rgba(255,40,20,0.80)"/>

            {/* Secondary activity zones */}
            <ellipse cx="70"  cy="60"  rx="20" ry="15" fill="rgba(70,199,240,0.15)"/>
            <ellipse cx="130" cy="80"  rx="15" ry="12" fill="rgba(70,199,240,0.12)"/>
            <ellipse cx="60"  cy="140" rx="18" ry="14" fill="rgba(70,199,240,0.10)"/>
            <ellipse cx="140" cy="130" rx="12" ry="10" fill="rgba(243,108,58,0.15)"/>
            <ellipse cx="180" cy="90"  rx="16" ry="13" fill="rgba(70,199,240,0.08)"/>

            {/* Player position marker */}
            <circle cx="87" cy="111" r="4" fill={C.cian} opacity="0.9"/>
            <circle cx="87" cy="111" r="9" fill={C.cian} opacity="0.2"/>
          </svg>

          {/* Legend */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
            <span style={{ fontFamily:font.dm, fontSize:11, color:C.faint }}>Menos tiempo</span>
            <div style={{ flex:1, height:6, borderRadius:3, margin:'0 10px',
              background:'linear-gradient(90deg, rgba(70,199,240,0.3), rgba(243,108,58,0.6), rgba(255,40,20,0.9))' }} />
            <span style={{ fontFamily:font.dm, fontSize:11, color:C.faint }}>Más tiempo</span>
          </div>
        </div>
      </div>

      {/* Zone stats */}
      <div style={{ padding:'0 20px' }}>
        <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:14, color:C.white, marginBottom:10 }}>
          Zonas de actividad
        </div>
        <div style={{ ...gcard(18), padding:'4px 16px' }}>
          <MetricRow label="Zona dominante"    value={s.heatZone}  unit="" color={C.naranja} />
          <MetricRow label="Tiempo en zona"    value="38"          unit="min" color={C.cian} />
          <MetricRow label="Distancia en zona" value="4.8"         unit="km"  color={C.cian} />
          <MetricRow label="Sprints en zona"   value={Math.floor(s.sprints * 0.6)} unit="" color={C.naranja} last />
        </div>
      </div>
    </div>
  );
}

// ── Profile Screen ─────────────────────────────────────────────
function ProfileScreen({ onSignOut }) {
  const [notif, setNotif] = React.useState(true);
  const [gps,   setGps]   = React.useState(true);

  const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{
      width:44, height:26, borderRadius:13, position:'relative', cursor:'pointer',
      background: on ? C.cian : 'rgba(255,255,255,0.15)', transition:'background 0.25s',
    }}>
      <div style={{
        position:'absolute', top:3, left: on ? 21 : 3, width:20, height:20,
        borderRadius:'50%', background:C.white, transition:'left 0.25s',
        boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'0 0 20px' }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:24, color:C.white, marginBottom:20 }}>
          Mi Perfil
        </div>
        {/* Avatar card */}
        <div style={{ ...gcard(20), padding:'20px', display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
          <div style={{ width:64, height:64, borderRadius:'50%',
            background:`linear-gradient(135deg, ${C.cian} 0%, #1A8AB5 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:font.exo, fontWeight:700, fontSize:22, color:C.bg, flexShrink:0 }}>
            {USER.avatar}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:18, color:C.white }}>
              {USER.name} {USER.lastname}
            </div>
            <div style={{ fontFamily:font.dm, fontSize:13, color:C.muted, marginTop:2 }}>{USER.email}</div>
            <div style={{ marginTop:6 }}><PlanBadge plan={USER.plan} /></div>
          </div>
        </div>

        {/* Plan card */}
        <div style={{ ...gcard(18), padding:'16px',
          background:`linear-gradient(135deg, rgba(243,108,58,0.12) 0%, rgba(243,108,58,0.05) 100%)`,
          border:`1px solid rgba(243,108,58,0.25)`, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:15, color:C.white }}>Plan PRO+</div>
            <PlanBadge plan="PRO+" />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {['Métricas GPS + IMU completas', 'IA conversacional', 'Plataforma web para cuerpo técnico', 'Hasta 3 usuarios por dispositivo'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', background:C.naranjaDim,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke={C.naranja} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                </div>
                <span style={{ fontFamily:font.dm, fontSize:13, color:C.muted }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device */}
        <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:13, color:C.muted, letterSpacing:1, marginBottom:8 }}>
          DISPOSITIVO
        </div>
        <div style={{ ...gcard(18), padding:'4px 16px', marginBottom:16 }}>
          <MetricRow label="Modelo"     value="ELITRAX Motion"  unit=""  color={C.white} />
          <MetricRow label="ID"         value="ELX-2409-A3F"    unit=""  color={C.muted} />
          <MetricRow label="Batería"    value="92"              unit="%" color={C.green} />
          <MetricRow label="Firmware"   value="v1.4.2"          unit=""  color={C.muted} last />
        </div>

        {/* Settings toggles */}
        <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:13, color:C.muted, letterSpacing:1, marginBottom:8 }}>
          AJUSTES
        </div>
        <div style={{ ...gcard(18), padding:'0 16px', marginBottom:16 }}>
          {[
            { label:'Notificaciones', on:notif, onToggle:() => setNotif(n => !n) },
            { label:'GPS automático', on:gps,   onToggle:() => setGps(g  => !g) },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 0', borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontFamily:font.dm, fontSize:15, color:C.white }}>{item.label}</span>
              <Toggle on={item.on} onToggle={item.onToggle} />
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button onClick={onSignOut} style={{ width:'100%', background:'rgba(255,80,80,0.08)', border:'1px solid rgba(255,80,80,0.20)',
          borderRadius:14, padding:'14px 0', cursor:'pointer',
          fontFamily:font.dm, fontSize:15, color:'#FF6B6B' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ── AI Chat Overlay ────────────────────────────────────────────
function AIChatOverlay({ onClose }) {
  const [msgs, setMsgs] = React.useState(AI_MSGS);
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const endRef = React.useRef(null);

  React.useEffect(() => {
    if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMsgs(m => [...m, { role:'user', text:userMsg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { role:'ai', text:'Analizando tus datos... Basándome en tus últimas 5 sesiones, tu rendimiento va en alza. ¡Seguí así!' }]);
    }, 1600);
  };

  return (
    <div style={{ position:'absolute', inset:0, zIndex:100, display:'flex', flexDirection:'column' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ flex:1, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }} />
      {/* Panel */}
      <div style={{ background:`linear-gradient(180deg, #0D1E38 0%, ${C.bg2} 100%)`,
        borderTop:`1px solid ${C.border}`, borderRadius:'24px 24px 0 0',
        padding:'0 0 40px', maxHeight:'75%', display:'flex', flexDirection:'column' }}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
          <div style={{ width:40, height:4, borderRadius:2, background:C.border }} />
        </div>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:12,
              background:`linear-gradient(135deg, ${C.cian} 0%, #1A8AB5 100%)`,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="7" r="5" stroke={C.bg} strokeWidth="1.6"/>
                <circle cx="6.5" cy="7" r="1" fill={C.bg}/>
                <circle cx="11.5" cy="7" r="1" fill={C.bg}/>
                <path d="M4.5 12.5C3 14 2.5 16 2.5 16h13s-.5-2-2-3.5" stroke={C.bg} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:15, color:C.white }}>ELITRAX IA</div>
              <div style={{ fontFamily:font.dm, fontSize:11, color:C.green }}>● En línea</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            color:C.muted, fontSize:22, lineHeight:1, padding:4 }}>×</button>
        </div>
        {/* Messages */}
        <div ref={endRef} style={{ flex:1, overflowY:'auto', padding:'0 16px', display:'flex', flexDirection:'column', gap:10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth:'82%', padding:'10px 14px', borderRadius:
                  m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user'
                  ? `linear-gradient(135deg, ${C.cian} 0%, #2EB5E0 100%)`
                  : C.card,
                border: m.role === 'ai' ? `1px solid ${C.border}` : 'none',
                fontFamily:font.dm, fontSize:14, lineHeight:1.5,
                color: m.role === 'user' ? C.bg : C.white,
              }}>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div style={{ display:'flex', gap:5, padding:'10px 14px', ...gcard(18), alignSelf:'flex-start', width:60 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:C.cian, opacity:0.6,
                  animation:`bounce 1s infinite ${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>
        {/* Input */}
        <div style={{ padding:'12px 16px 0', display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ flex:1, ...gcard(24), padding:'12px 16px', display:'flex', alignItems:'center' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Preguntale algo a tu entrenador IA..."
              style={{ background:'none', border:'none', outline:'none', flex:1,
                fontFamily:font.dm, fontSize:14, color:C.white }} />
          </div>
          <button onClick={send} style={{
            width:44, height:44, borderRadius:'50%', flexShrink:0,
            background:`linear-gradient(135deg, ${C.cian} 0%, #2EB5E0 100%)`,
            border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:`0 4px 14px rgba(70,199,240,0.30)`,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h12M12 5l4 4-4 4" stroke={C.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  BottomNav, HomeScreen, SessionsScreen, LiveScreen,
  SessionDetailScreen, HeatmapScreen, ProfileScreen, AIChatOverlay,
});
