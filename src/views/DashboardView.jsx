import { T, glass, PLAYERS, SESSIONS, WEEKLY, initials } from '../data'
import Badge from '../components/Badge'
import MiniBar from '../components/MiniBar'

export default function DashboardView() {
  const alertas = PLAYERS.filter(p => p.estado !== 'ok')
  const avgKm   = (PLAYERS.reduce((s, p) => s + p.km,      0) / PLAYERS.length).toFixed(1)
  const avgSpr  = Math.round(PLAYERS.reduce((s, p) => s + p.sprints, 0) / PLAYERS.length)
  const maxVel  = Math.max(...PLAYERS.map(p => p.vel)).toFixed(1)
  const hiLoad  = PLAYERS.filter(p => p.carga >= 85).length

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:26, color:T.white }}>Dashboard</div>
          <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>
            Última sesión: <span style={{ color:T.white }}>30 Abr · Partido vs Talleres · 90 min</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ ...glass(10), padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:T.green, boxShadow:`0 0 6px ${T.green}` }} />
            <span style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>11 dispositivos activos</span>
          </div>
          <button style={{ ...glass(10), padding:'8px 16px', border:`1px solid rgba(243,108,58,.35)`, fontFamily:T.exo, fontWeight:600, fontSize:12, color:T.naranja, letterSpacing:.8, background:'rgba(243,108,58,.10)' }}>
            + NUEVA SESIÓN
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {alertas.length > 0 && (
        <div style={{ ...glass(12), padding:'12px 18px', marginBottom:22, border:'1px solid rgba(255,91,91,.28)', background:'rgba(255,91,91,.06)', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <div>
            <span style={{ fontFamily:T.dm, fontWeight:600, fontSize:13, color:T.red }}>{alertas.length} alerta{alertas.length > 1 ? 's' : ''}: </span>
            <span style={{ fontFamily:T.dm, fontSize:13, color:T.muted }}>
              {alertas.map(p => `${p.name} (${p.estado === 'alerta' ? 'sobrecarga' : 'lesión'})`).join(' · ')}
            </span>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { l:'Distancia promedio', v:avgKm,  u:'km',       c:T.cian,   s:'↑ 8% vs semana anterior'   },
          { l:'Sprints promedio',   v:avgSpr,  u:'/ses',     c:T.cian,   s:'↑ 12% vs semana anterior'  },
          { l:'Vel. máx. equipo',   v:maxVel, u:'km/h',     c:T.naranja, s:'Santiago López'            },
          { l:'Con alta carga',     v:hiLoad, u:'jugadores', c:T.red,    s:'Revisar recuperación'       },
        ].map((k, i) => (
          <div key={i} style={{ ...glass(14), padding:'18px 20px', display:'flex', flexDirection:'column', gap:6, animationDelay:`${i*60}ms`, animation:'fadeUp .4s ease both' }}>
            <span style={{ fontFamily:T.dm, fontSize:12, color:T.muted }}>{k.l}</span>
            <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
              <span style={{ fontFamily:T.mono, fontSize:28, fontWeight:700, color:k.c, lineHeight:1 }}>{k.v}</span>
              <span style={{ fontFamily:T.dm, fontSize:12, color:T.faint }}>{k.u}</span>
            </div>
            <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>{k.s}</span>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:18, marginBottom:18 }}>

        {/* Player table */}
        <div style={{ ...glass(14), overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:15, color:T.white }}>Plantel — Última sesión</div>
          </div>
          <div style={{ overflowY:'auto', maxHeight:320 }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,.03)' }}>
                  {['#','Jugador','Pos.','Dist.','Sprints','Vel.','Carga','Estado'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', fontFamily:T.dm, fontSize:10, color:T.faint, fontWeight:500, textAlign:'left', borderBottom:`1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAYERS.map((p, i) => {
                  const ec = p.estado==='ok' ? T.green : p.estado==='alerta' ? T.naranja : T.red
                  const el = p.estado==='ok' ? 'OK'    : p.estado==='alerta' ? 'Alerta'  : 'Lesión'
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom:`1px solid ${T.border}`, background: i%2===0 ? 'transparent' : 'rgba(255,255,255,.015)', cursor:'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(70,199,240,.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? 'transparent' : 'rgba(255,255,255,.015)'}
                    >
                      <td style={{ padding:'9px 12px', fontFamily:T.mono, fontSize:11, color:T.faint }}>{p.num}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:26, height:26, borderRadius:'50%', background:`linear-gradient(135deg,${T.cian}44 0%,${T.bg3} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:700, fontSize:9, color:T.cian }}>
                            {initials(p.name)}
                          </div>
                          <span style={{ fontFamily:T.dm, fontSize:13, color:T.white }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:'9px 12px', fontFamily:T.dm, fontSize:11, color:T.muted }}>{p.pos}</td>
                      <td style={{ padding:'9px 12px', fontFamily:T.mono, fontSize:12, color:T.cian, fontWeight:700 }}>{p.km}</td>
                      <td style={{ padding:'9px 12px', fontFamily:T.mono, fontSize:12, color:T.white }}>{p.sprints}</td>
                      <td style={{ padding:'9px 12px', fontFamily:T.mono, fontSize:12, color:T.white }}>{p.vel}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <MiniBar val={p.carga} width={56} />
                          <span style={{ fontFamily:T.mono, fontSize:11, color: p.carga>=90 ? T.red : p.carga>=75 ? T.naranja : T.muted }}>{p.carga}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'9px 12px' }}><Badge label={el} color={ec} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Weekly chart */}
          <div style={{ ...glass(14), padding:'16px 18px' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:14 }}>Distancia semanal</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:72 }}>
              {WEEKLY.map((d, i) => {
                const mx  = Math.max(...WEEKLY.map(x => x.km), 1)
                const hh  = d.km > 0 ? (d.km / mx) * 60 : 4
                const isT = i === 1
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', height:60, display:'flex', alignItems:'flex-end' }}>
                      <div style={{ width:'100%', height:hh, background: d.km===0 ? 'rgba(255,255,255,.05)' : isT ? T.cian : 'rgba(70,199,240,.35)', borderRadius:4 }} />
                    </div>
                    <span style={{ fontFamily:T.dm, fontSize:9, color: isT ? T.cian : T.faint }}>{d.day}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:10 }}>
              <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>Total semana</span>
              <span style={{ fontFamily:T.mono, fontSize:13, color:T.cian, fontWeight:700 }}>
                {WEEKLY.reduce((s, d) => s + d.km, 0).toFixed(1)} km
              </span>
            </div>
          </div>

          {/* Recent sessions */}
          <div style={{ ...glass(14), overflow:'hidden', flex:1 }}>
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>Últimas sesiones</div>
            </div>
            <div style={{ padding:'4px 0' }}>
              {SESSIONS.map((s, i) => (
                <div
                  key={s.id}
                  style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:10, borderBottom: i<3 ? `1px solid ${T.border}` : 'none', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(70,199,240,.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background: s.type==='Partido' ? T.naranja : T.cian }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:T.dm, fontSize:12, color:T.white, fontWeight:500 }}>{s.type}{s.rival ? ' vs ' + s.rival : ''}</div>
                    <div style={{ fontFamily:T.dm, fontSize:10, color:T.muted }}>{s.date} · {s.duration}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:T.mono, fontSize:12, color:T.cian }}>{s.km} km</div>
                    <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint }}>{s.sprints} spr.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Load distribution */}
          <div style={{ ...glass(14), padding:'14px 16px' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>Distribución de carga</div>
            {[
              { l:'Alta (≥85%)',  cnt: PLAYERS.filter(p => p.carga>=85).length,              c:T.red     },
              { l:'Media (60–84%)',cnt: PLAYERS.filter(p => p.carga>=60 && p.carga<85).length,c:T.naranja },
              { l:'Baja (<60%)',  cnt: PLAYERS.filter(p => p.carga<60).length,               c:T.green   },
            ].map((c, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom: i<2 ? 8 : 0 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:c.c, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ height:4, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:c.c, borderRadius:2, width:`${(c.cnt/PLAYERS.length)*100}%` }} />
                  </div>
                </div>
                <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted, width:80, textAlign:'right' }}>{c.l}</span>
                <span style={{ fontFamily:T.mono, fontSize:12, color:c.c, width:16, textAlign:'right' }}>{c.cnt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
