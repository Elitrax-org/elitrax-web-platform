// elitrax-dashboard.jsx — Dashboard view
// DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DashboardView() {
  const alertas = PLAYERS.filter(p => p.estado !== 'ok');
  const avgKm   = (PLAYERS.reduce((s,p)=>s+p.km,0)/PLAYERS.length).toFixed(1);
  const avgSpr  = Math.round(PLAYERS.reduce((s,p)=>s+p.sprints,0)/PLAYERS.length);
  const maxVel  = Math.max(...PLAYERS.map(p=>p.vel)).toFixed(1);
  const highLoad= PLAYERS.filter(p=>p.carga>=85).length;

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}>
      {/* Page header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:26, color:T.white }}>Dashboard</div>
          <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>
            Última sesión: <span style={{ color:T.white }}>30 Abr · Partido vs Talleres · 90 min</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ ...glass(10), padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:T.green, boxShadow:`0 0 6px ${T.green}` }}/>
            <span style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>11 dispositivos activos</span>
          </div>
          <button style={{ ...glass(10), padding:'8px 16px', border:`1px solid rgba(243,108,58,0.35)`,
            fontFamily:T.exo, fontWeight:600, fontSize:12, color:T.naranja, letterSpacing:0.8,
            background:`linear-gradient(135deg, rgba(243,108,58,0.14) 0%, rgba(243,108,58,0.05) 100%)`,
            boxShadow:'0 4px 12px rgba(243,108,58,0.18)' }}>
            + NUEVA SESIÓN
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {alertas.length > 0 && (
        <div style={{ ...glass(12), padding:'12px 18px', marginBottom:22,
          border:`1px solid rgba(255,91,91,0.28)`,
          background:'rgba(255,91,91,0.06)',
          display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <div>
            <span style={{ fontFamily:T.dm, fontWeight:600, fontSize:13, color:T.red }}>
              {alertas.length} alerta{alertas.length>1?'s':''} de plantel:
            </span>
            <span style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginLeft:8 }}>
              {alertas.map(p => `${p.name} (${p.estado === 'alerta' ? 'sobrecarga' : 'lesión'})`).join(' · ')}
            </span>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        <StatCard label="Distancia promedio" value={avgKm}   unit="km"    icon="📡" trend="up"   sub="↑ 8% vs semana anterior" color={T.cian} style={{animationDelay:'0ms'}}/>
        <StatCard label="Sprints promedio"   value={avgSpr}  unit="/ses"  icon="⚡" trend="up"   sub="↑ 12% vs semana anterior" color={T.cian} style={{animationDelay:'60ms'}}/>
        <StatCard label="Vel. máx. equipo"   value={maxVel}  unit="km/h"  icon="🔥" trend="up"   sub="Santiago López" color={T.naranja} style={{animationDelay:'120ms'}}/>
        <StatCard label="Con alta carga"     value={highLoad} unit="jugadores" icon="⚠" trend="down" sub="Revisar recuperación" color={T.red} style={{animationDelay:'180ms'}}/>
      </div>

      {/* Main grid: table + chart */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:18, marginBottom:18 }}>

        {/* Player table */}
        <div style={{ ...glass(14), overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}`,
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:15, color:T.white }}>
              Plantel — Última sesión
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {['Todo','Alertas'].map(f => (
                <button key={f} style={{ ...glass(8), padding:'4px 12px', border:`1px solid ${T.border}`,
                  fontFamily:T.dm, fontSize:11, color:T.muted }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowY:'auto', maxHeight:320 }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                  {['#','Jugador','Pos.','Dist.','Sprints','Vel. máx.','Carga','Estado'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', fontFamily:T.dm, fontSize:10,
                      color:T.faint, fontWeight:500, letterSpacing:0.5, textAlign:'left',
                      borderBottom:`1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAYERS.map((p,i) => {
                  const estadoColor = p.estado==='ok' ? T.green : p.estado==='alerta' ? T.naranja : T.red;
                  const estadoLabel = p.estado==='ok' ? 'OK' : p.estado==='alerta' ? 'Alerta' : 'Lesión';
                  return (
                    <tr key={p.id} style={{
                      borderBottom:`1px solid ${T.border}`,
                      background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      transition:'background 0.15s', cursor:'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(70,199,240,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? 'transparent':'rgba(255,255,255,0.015)'}>
                      <td style={{ padding:'9px 12px', fontFamily:T.mono, fontSize:11, color:T.faint }}>{p.num}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:26, height:26, borderRadius:'50%',
                            background:`linear-gradient(135deg, ${T.cian}44 0%, ${T.bg3} 100%)`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontFamily:T.exo, fontWeight:700, fontSize:9, color:T.cian }}>
                            {p.name.split(' ').map(n=>n[0]).join('')}
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
                          <MiniBar val={p.carga} width={56}/>
                          <span style={{ fontFamily:T.mono, fontSize:11,
                            color: p.carga>=90 ? T.red : p.carga>=75 ? T.naranja : T.muted }}>{p.carga}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        <Badge label={estadoLabel} color={estadoColor}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Weekly km chart */}
          <div style={{ ...glass(14), padding:'16px 18px' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:14 }}>
              Distancia semanal del equipo
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:72 }}>
              {WEEKLY_KM.map((d,i) => {
                const maxKm = Math.max(...WEEKLY_KM.map(x=>x.km), 1);
                const h = d.km > 0 ? (d.km/maxKm)*60 : 4;
                const isToday = i === 1;
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', height:60, display:'flex', alignItems:'flex-end' }}>
                      <div style={{ width:'100%', height:h,
                        background: d.km===0 ? 'rgba(255,255,255,0.05)' : isToday ? T.cian : 'rgba(70,199,240,0.35)',
                        borderRadius:4, transition:'height 0.3s' }}/>
                    </div>
                    <span style={{ fontFamily:T.dm, fontSize:9, color: isToday ? T.cian : T.faint }}>{d.day}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:10 }}>
              <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>Total semana</span>
              <span style={{ fontFamily:T.mono, fontSize:13, color:T.cian, fontWeight:700 }}>
                {WEEKLY_KM.reduce((s,d)=>s+d.km,0).toFixed(1)} km
              </span>
            </div>
          </div>

          {/* Recent sessions */}
          <div style={{ ...glass(14), overflow:'hidden', flex:1 }}>
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>Últimas sesiones</div>
            </div>
            <div style={{ padding:'4px 0' }}>
              {SESSIONS_LOG.slice(0,4).map((s,i) => (
                <div key={s.id} style={{
                  padding:'10px 16px', display:'flex', alignItems:'center', gap:10,
                  borderBottom: i<3 ? `1px solid ${T.border}` : 'none',
                  cursor:'pointer', transition:'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(70,199,240,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0,
                    background: s.type==='Partido' ? T.naranja : T.cian }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:T.dm, fontSize:12, color:T.white, fontWeight:500 }}>
                      {s.type}{s.rival ? ` vs ${s.rival}` : ''}
                    </div>
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

          {/* Carga distribution */}
          <div style={{ ...glass(14), padding:'14px 16px' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>
              Distribución de carga
            </div>
            {[
              { label:'Alta (≥85%)',   count: PLAYERS.filter(p=>p.carga>=85).length,   color:T.red },
              { label:'Media (60–84%)', count: PLAYERS.filter(p=>p.carga>=60&&p.carga<85).length, color:T.naranja },
              { label:'Baja (<60%)',   count: PLAYERS.filter(p=>p.carga<60).length,    color:T.green },
            ].map((c,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:i<2?8:0 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:c.color, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:c.color, borderRadius:2,
                      width:`${(c.count/PLAYERS.length)*100}%` }}/>
                  </div>
                </div>
                <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted, width:80, textAlign:'right' }}>
                  {c.label}
                </span>
                <span style={{ fontFamily:T.mono, fontSize:12, color:c.color, width:16, textAlign:'right' }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Object.assign(window, { DashboardView });
