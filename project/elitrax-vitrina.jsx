// elitrax-vitrina.jsx — VitrinaView
// VITRINA / SCOUTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VITRINA_PLAYERS = [
  { id:1,  name:'Lucas Fernández',   pos:'Delantero',     age:19, club:'Atl. Belgrano Sub20', num:9,
    km:10.8, sprints:34, vel:31.2, carga:82, saltos:48, distSprint:24.2,
    desc:'Delantero dinámico con gran capacidad de definición y velocidad en profundidad. Referente ofensivo del equipo.',
    tags:['Velocidad','Definición','Líder'], videos:2, contactado:false },
  { id:2,  name:'Mateo González',    pos:'Mediocampista', age:20, club:'Atl. Belgrano Sub20', num:8,
    km:9.4,  sprints:28, vel:29.1, carga:78, saltos:41, distSprint:21.8,
    desc:'Mediocampista box-to-box con excelente lectura del juego. Buenas estadísticas de pases y recuperaciones.',
    tags:['Pase','Recuperación'], videos:1, contactado:false },
  { id:3,  name:'Tomás Herrera',     pos:'Defensor',      age:21, club:'Atl. Belgrano Sub20', num:4,
    km:8.1,  sprints:18, vel:26.4, carga:65, saltos:52, distSprint:18.4,
    desc:'Defensor central con gran salto y poderío aéreo. Fuerte en duelos y anticipación.',
    tags:['Aéreo','Duelos','Liderazgo'], videos:1, contactado:false },
  { id:4,  name:'Nicolás Romero',    pos:'Arquero',       age:20, club:'Atl. Belgrano Sub20', num:1,
    km:4.2,  sprints:8,  vel:22.1, carga:41, saltos:68, distSprint:9.1,
    desc:'Arquero con excelente manejo del área. Muy seguro en el juego aéreo y salidas.',
    tags:['Reflejos','Aéreo'], videos:3, contactado:false },
  { id:5,  name:'Santiago López',    pos:'Delantero',     age:18, club:'Atl. Belgrano Sub20', num:11,
    km:11.2, sprints:38, vel:32.6, carga:98, saltos:44, distSprint:26.8,
    desc:'Extremo rapidísimo, el más veloz del plantel. Desequilibrante en uno contra uno.',
    tags:['Velocidad','Regate','Explosivo'], videos:2, contactado:false },
  { id:6,  name:'Agustín Martínez',  pos:'Mediocampista', age:21, club:'Atl. Belgrano Sub20', num:6,
    km:9.8,  sprints:31, vel:28.9, carga:83, saltos:39, distSprint:22.1,
    desc:'Volante con gran motor. Cubre mucho terreno y tiene buen pie para la salida.',
    tags:['Motor','Pase','Presión'], videos:0, contactado:false },
  { id:7,  name:'Rodrigo Vargas',    pos:'Defensor',      age:19, club:'Atl. Belgrano Sub20', num:5,
    km:7.9,  sprints:16, vel:25.8, carga:62, saltos:45, distSprint:17.2,
    desc:'Lateral derecho ofensivo con buen juego asociado y capacidad de llegar al fondo.',
    tags:['Lateral','Ofensivo'], videos:1, contactado:false },
  { id:8,  name:'Facundo Torres',    pos:'Mediocampista', age:20, club:'Atl. Belgrano Sub20', num:10,
    km:8.6,  sprints:25, vel:27.3, carga:71, saltos:37, distSprint:19.5,
    desc:'Enganche creativo, el N°10 del equipo. Gran visión de juego y golpe de efecto.',
    tags:['Creatividad','Gol','Visión'], videos:2, contactado:false },
  { id:9,  name:'Martín Acosta',     pos:'Defensor',      age:22, club:'Atl. Belgrano Sub20', num:2,
    km:8.7,  sprints:19, vel:25.5, carga:70, saltos:43, distSprint:18.8,
    desc:'Defensor versátil, puede jugar de lateral o central. Buena salida con el balón.',
    tags:['Versátil','Salida'], videos:0, contactado:false },
  { id:10, name:'Bruno Castillo',    pos:'Mediocampista', age:19, club:'Atl. Belgrano Sub20', num:7,
    km:9.1,  sprints:26, vel:28.4, carga:75, saltos:40, distSprint:20.3,
    desc:'Mediapunta con llegada al gol. Buen cierre y recuperación defensiva.',
    tags:['Gol','Llegada'], videos:1, contactado:false },
];

const POSICIONES_FILTER = ['Todos','Arquero','Defensor','Mediocampista','Delantero'];

const METRICAS_VITRINA = [
  { key:'km',         label:'Dist. prom.',  unit:'km',   color:T.cian   },
  { key:'vel',        label:'Vel. máx.',    unit:'km/h', color:T.naranja },
  { key:'sprints',    label:'Sprints',      unit:'/ses', color:T.cian   },
  { key:'saltos',     label:'Saltos',       unit:'/ses', color:T.green  },
  { key:'distSprint', label:'Dist. sprint', unit:'m',    color:T.naranja },
];

function PlayerCard({ player, onOpen, contactados, onContact }) {
  const initials = player.name.split(' ').map(n=>n[0]).join('');
  const isContacted = contactados.includes(player.id);
  return (
    <div onClick={() => onOpen(player)} style={{
      ...glass(16), padding:'20px', cursor:'pointer',
      transition:'transform 0.15s, border-color 0.15s',
      border:`1px solid ${T.border}`,
      display:'flex', flexDirection:'column', gap:14,
      animation:'fadeUp 0.35s ease both',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor=`rgba(70,199,240,0.30)`; e.currentTarget.style.transform='translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform='translateY(0)'; }}>

      {/* Header */}
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ width:48, height:48, borderRadius:14, flexShrink:0,
          background:`linear-gradient(135deg, ${T.cian}55 0%, ${T.bg3} 100%)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:T.exo, fontWeight:800, fontSize:15, color:T.cian }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:T.dm, fontWeight:600, fontSize:14, color:T.white,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{player.name}</div>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>
            {player.pos} · {player.age} años · {player.club}
          </div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:6 }}>
            {player.tags.map(t => (
              <span key={t} style={{ fontFamily:T.dm, fontSize:9, fontWeight:600,
                color:T.cian, background:T.cianDim, border:`1px solid ${T.cian}22`,
                borderRadius:20, padding:'2px 7px', letterSpacing:0.3 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas clave */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {[
          { label:'Vel. máx', val:player.vel, unit:'km/h', color:T.naranja },
          { label:'Dist.',    val:player.km,  unit:'km',   color:T.cian   },
          { label:'Sprints',  val:player.sprints, unit:'', color:T.cian   },
        ].map((m,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
            <div style={{ fontFamily:T.mono, fontSize:14, fontWeight:700, color:m.color }}>{m.val}{m.unit}</div>
            <div style={{ fontFamily:T.dm, fontSize:9, color:T.faint, marginTop:2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Videos + CTA */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:13, opacity:0.6 }}>▶</span>
          <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>
            {player.videos > 0 ? `${player.videos} video${player.videos>1?'s':''}` : 'Sin videos'}
          </span>
        </div>
        <button onClick={e => { e.stopPropagation(); onContact(player.id); }} style={{
          padding:'6px 14px', borderRadius:8,
          background: isContacted ? T.greenDim : `linear-gradient(135deg, ${T.naranja}, #C94E1E)`,
          border: isContacted ? `1px solid ${T.green}` : 'none',
          fontFamily:T.dm, fontSize:11, fontWeight:600,
          color: isContacted ? T.green : T.white,
          boxShadow: isContacted ? 'none' : '0 3px 10px rgba(243,108,58,0.30)',
          transition:'all 0.2s',
        }}>
          {isContacted ? '✓ Interés enviado' : 'Contactar vía Elitrax'}
        </button>
      </div>
    </div>
  );
}

function PlayerModal({ player, onClose, contactados, onContact }) {
  if (!player) return null;
  const isContacted = contactados.includes(player.id);
  const [videoPlaying, setVideoPlaying] = React.useState(null);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, padding:24, backdropFilter:'blur(6px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...glass(20), width:'100%', maxWidth:820, maxHeight:'88vh',
        overflowY:'auto', border:`1px solid ${T.borderHi}`,
        animation:'fadeUp 0.25s ease both',
      }}>

        {/* Modal header */}
        <div style={{ padding:'24px 28px', borderBottom:`1px solid ${T.border}`,
          display:'flex', gap:16, alignItems:'flex-start' }}>
          <div style={{ width:64, height:64, borderRadius:18, flexShrink:0,
            background:`linear-gradient(135deg, ${T.cian}55 0%, ${T.bg3} 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:T.exo, fontWeight:800, fontSize:20, color:T.cian }}>
            {player.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:22, color:T.white }}>{player.name}</div>
            <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>
              {player.pos} · {player.age} años · #{player.num} · {player.club}
            </div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:8 }}>
              {player.tags.map(t => (
                <span key={t} style={{ fontFamily:T.dm, fontSize:10, fontWeight:600,
                  color:T.cian, background:T.cianDim, border:`1px solid ${T.cian}22`,
                  borderRadius:20, padding:'3px 9px' }}>{t}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted,
            fontSize:22, lineHeight:1, padding:'2px 6px', flexShrink:0 }}>×</button>
        </div>

        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:22 }}>

          {/* Descripción */}
          <div>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.8, marginBottom:8 }}>
              DESCRIPCIÓN DEL JUGADOR
            </div>
            <div style={{ fontFamily:T.dm, fontSize:14, color:T.white, lineHeight:1.7,
              background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'14px 16px',
              border:`1px solid ${T.border}` }}>
              "{player.desc}"
            </div>
          </div>

          {/* Métricas GPS completas */}
          <div>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.8, marginBottom:12 }}>
              MÉTRICAS GPS / IMU — PROMEDIO ÚLTIMAS SESIONES
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
              {METRICAS_VITRINA.map(m => (
                <div key={m.key} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12,
                  padding:'14px 12px', textAlign:'center', border:`1px solid ${T.border}` }}>
                  <div style={{ fontFamily:T.mono, fontSize:22, fontWeight:700, color:m.color, lineHeight:1 }}>
                    {player[m.key]}
                  </div>
                  <div style={{ fontFamily:T.dm, fontSize:9, color:T.faint, marginTop:4 }}>{m.unit}</div>
                  <div style={{ fontFamily:T.dm, fontSize:10, color:T.muted, marginTop:2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Barra de carga física */}
            <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted, width:120, flexShrink:0 }}>
                Carga física semana
              </span>
              <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:3, transition:'width 0.4s',
                  width:`${player.carga}%`,
                  background: player.carga>=90 ? T.red : player.carga>=75 ? T.naranja : T.cian }}/>
              </div>
              <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, width:40, textAlign:'right',
                color: player.carga>=90 ? T.red : player.carga>=75 ? T.naranja : T.cian }}>
                {player.carga}%
              </span>
            </div>
          </div>

          {/* Videos */}
          <div>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.8, marginBottom:12 }}>
              VIDEOS ({player.videos})
            </div>
            {player.videos === 0 ? (
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'20px',
                textAlign:'center', border:`1px solid ${T.border}` }}>
                <div style={{ fontFamily:T.dm, fontSize:13, color:T.faint }}>
                  El jugador no ha subido videos aún
                </div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(player.videos,3)},1fr)`, gap:10 }}>
                {Array.from({length:player.videos}).map((_,i) => (
                  <div key={i} onClick={() => setVideoPlaying(videoPlaying===i ? null : i)}
                    style={{ borderRadius:12, overflow:'hidden', aspectRatio:'16/9', position:'relative',
                    background:`linear-gradient(135deg, ${T.bg3} 0%, #0A1628 100%)`,
                    border:`1px solid ${T.border}`, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {videoPlaying === i ? (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:T.naranja,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          animation:'pulse 1s ease infinite', fontSize:16 }}>⏸</div>
                        <span style={{ fontFamily:T.dm, fontSize:10, color:T.muted }}>Reproduciendo...</span>
                      </div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                        <div style={{ width:44, height:44, borderRadius:'50%',
                          background:`linear-gradient(135deg, ${T.naranja}, #C94E1E)`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          boxShadow:'0 4px 16px rgba(243,108,58,0.40)', fontSize:18 }}>▶</div>
                        <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>
                          Video {i+1} · {['Partido vs Talleres','Entrenamiento táctico','Partido vs Instituto'][i] || 'Sesión'}
                        </span>
                      </div>
                    )}
                    {/* Duración */}
                    <div style={{ position:'absolute', bottom:8, right:10,
                      fontFamily:T.mono, fontSize:10, color:T.faint }}>
                      {['1:24','0:58','2:07'][i]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA contacto */}
          <div style={{ ...glass(14), padding:'20px 22px',
            border:`1px solid ${isContacted ? T.green+'44' : T.naranja+'33'}`,
            background: isContacted ? 'rgba(74,222,128,0.04)' : 'rgba(243,108,58,0.04)',
            display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14,
                color: isContacted ? T.green : T.white, marginBottom:4 }}>
                {isContacted ? '✓ Interés registrado por Elitrax' : 'Contactar al jugador vía Elitrax'}
              </div>
              <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, lineHeight:1.6 }}>
                {isContacted
                  ? `Elitrax notificó a ${player.name} que un scout mostró interés. El equipo coordinará el contacto.`
                  : `Al hacer clic, Elitrax notifica a ${player.name} que un scout está interesado. El jugador recibirá un aviso en su aplicación.`}
              </div>
            </div>
            {!isContacted && (
              <button onClick={() => onContact(player.id)} style={{
                padding:'12px 22px', borderRadius:10, flexShrink:0,
                background:`linear-gradient(135deg, ${T.naranja}, #C94E1E)`,
                border:'none', fontFamily:T.exo, fontWeight:700, fontSize:13, letterSpacing:0.8,
                color:T.white, boxShadow:'0 4px 16px rgba(243,108,58,0.35)',
                whiteSpace:'nowrap',
              }}>
                QUIERO CONTACTARLO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VitrinaView() {
  const [search,      setSearch]      = React.useState('');
  const [posFilter,   setPosFilter]   = React.useState('Todos');
  const [velMin,      setVelMin]      = React.useState(0);
  const [kmMin,       setKmMin]       = React.useState(0);
  const [sprintMin,   setSprintMin]   = React.useState(0);
  const [soloVideos,  setSoloVideos]  = React.useState(false);
  const [selected,    setSelected]    = React.useState(null);
  const [contactados, setContactados] = React.useState([]);
  const [showFilters, setShowFilters] = React.useState(false);

  const handleContact = (id) => {
    setContactados(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const filtered = VITRINA_PLAYERS.filter(p => {
    if (posFilter !== 'Todos' && p.pos !== posFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (p.vel < velMin) return false;
    if (p.km  < kmMin)  return false;
    if (p.sprints < sprintMin) return false;
    if (soloVideos && p.videos === 0) return false;
    return true;
  });

  const activeFilters = (velMin>0?1:0)+(kmMin>0?1:0)+(sprintMin>0?1:0)+(soloVideos?1:0);

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'24px 32px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:24, color:T.white }}>
              Vitrina <span style={{ color:T.cian }}>/ Scouts</span>
            </div>
            <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>
              Perfiles públicos de jugadores · métricas reales · videos
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <Badge label={`${filtered.length} jugadores`} color={T.cian}/>
            {contactados.length > 0 && (
              <Badge label={`${contactados.length} contactado${contactados.length>1?'s':''}`} color={T.green}/>
            )}
          </div>
        </div>

        {/* Búsqueda + filtros */}
        <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
          {/* Search */}
          <div style={{ ...glass(10), padding:'9px 14px', display:'flex', alignItems:'center', gap:8,
            border:`1px solid ${T.border}`, flex:'0 0 260px' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" stroke={T.muted} strokeWidth="1.2"/>
              <path d="M9 9l3 3" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar jugador o característica..."
              style={{ background:'none', border:'none', outline:'none',
                fontFamily:T.dm, fontSize:12, color:T.white, flex:1 }}/>
          </div>

          {/* Posición chips */}
          <div style={{ display:'flex', gap:6 }}>
            {POSICIONES_FILTER.map(p => (
              <button key={p} onClick={() => setPosFilter(p)} style={{
                padding:'7px 14px', borderRadius:20,
                border:`1.5px solid ${posFilter===p ? T.cian : T.border}`,
                background: posFilter===p ? T.cianDim : 'transparent',
                fontFamily:T.dm, fontSize:12, fontWeight: posFilter===p ? 600 : 400,
                color: posFilter===p ? T.cian : T.muted, transition:'all 0.15s',
              }}>{p}</button>
            ))}
          </div>

          {/* Filtros avanzados toggle */}
          <button onClick={() => setShowFilters(f=>!f)} style={{
            marginLeft:'auto', ...glass(8), padding:'8px 14px',
            border:`1.5px solid ${showFilters || activeFilters>0 ? T.naranja : T.border}`,
            background: showFilters ? T.naranjaDim : 'transparent',
            fontFamily:T.dm, fontSize:12, fontWeight:500,
            color: showFilters || activeFilters>0 ? T.naranja : T.muted,
            display:'flex', alignItems:'center', gap:6,
          }}>
            <span>⚙ Filtros</span>
            {activeFilters > 0 && (
              <span style={{ background:T.naranja, color:T.white, borderRadius:'50%',
                width:16, height:16, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700 }}>{activeFilters}</span>
            )}
          </button>
        </div>

        {/* Panel de filtros avanzados */}
        {showFilters && (
          <div style={{ ...glass(12), padding:'16px 20px', marginBottom:16,
            border:`1px solid ${T.naranja}33`, animation:'fadeUp 0.2s ease both' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18, alignItems:'start' }}>
              {[
                { label:'Velocidad máx. mínima', val:velMin, set:setVelMin, min:0, max:34, unit:'km/h' },
                { label:'Distancia mínima',       val:kmMin,  set:setKmMin,  min:0, max:12, unit:'km'   },
                { label:'Sprints mínimos',         val:sprintMin, set:setSprintMin, min:0, max:40, unit:'' },
              ].map((f,i) => (
                <div key={i}>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>
                    {f.label}: <span style={{ color:T.naranja, fontWeight:600 }}>{f.val}{f.unit ? ' '+f.unit : ''}</span>
                  </div>
                  <input type="range" min={f.min} max={f.max} value={f.val}
                    onChange={e => f.set(+e.target.value)}
                    style={{ width:'100%', accentColor:T.naranja }}/>
                </div>
              ))}
              <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', height:'100%' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <input type="checkbox" checked={soloVideos} onChange={e => setSoloVideos(e.target.checked)}
                    style={{ accentColor:T.naranja, width:14, height:14 }}/>
                  <span style={{ fontFamily:T.dm, fontSize:12, color:T.muted }}>Solo con videos</span>
                </label>
                <button onClick={() => { setVelMin(0); setKmMin(0); setSprintMin(0); setSoloVideos(false); }}
                  style={{ marginTop:10, background:'none', border:`1px solid ${T.border}`,
                    borderRadius:7, padding:'5px 10px', fontFamily:T.dm, fontSize:11, color:T.faint }}>
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid de jugadores */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 32px 28px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:40, opacity:0.3, marginBottom:12 }}>🔭</div>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:16, color:T.muted }}>
              Sin resultados para esos filtros
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
            {filtered.map(p => (
              <PlayerCard key={p.id} player={p}
                onOpen={setSelected}
                contactados={contactados}
                onContact={handleContact}/>
            ))}
          </div>
        )}
      </div>

      {/* Modal perfil */}
      {selected && (
        <PlayerModal
          player={selected}
          onClose={() => setSelected(null)}
          contactados={contactados}
          onContact={(id) => { handleContact(id); }}/>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Object.assign(window, { PlayerCard, PlayerModal, VitrinaView });
