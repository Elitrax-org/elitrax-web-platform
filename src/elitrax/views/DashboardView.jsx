import { useState, useMemo, useEffect } from 'react'
import { T, glass } from '../tokens'
import { initials } from '../data'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Badge from '../components/Badge'
import MiniBar from '../components/MiniBar'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import NewSessionModal from '../components/NewSessionModal'
import PlayerDetailModal from '../components/PlayerDetailModal'
import { usePlayer } from '../context/PlayerContext'
import { useSession } from '../context/SessionContext'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = e => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

export default function DashboardView() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  const { players: rawPlayers, loading: playersLoading } = usePlayer()
  const { squads, loading: sessionsLoading, addSquad } = useSession()

  const players = rawPlayers || []
  const loading = playersLoading || sessionsLoading

  const [searchQuery,  setSearchQuery]  = useState('')
  const [sortBy,       setSortBy]       = useState({ key: null, dir: 'asc' })
  const [showNewSession, setShowNewSession] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const alertas    = players.filter(p => p.estado !== 'ok')
  const lastSession = squads[0] || null

  // KPI cards con datos reales
  const totalJugadores = players.length
  const totalSesiones  = squads.length
  const enAlerta       = players.filter(p => p.estado === 'alerta').length
  const lesionados     = players.filter(p => p.estado === 'lesion').length

  // Gráfico semanal — últimos 7 días, cantidad de sesiones por día
  const weeklyData = useMemo(() => {
    const labels = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - 6 + i)
      const dateStr = d.toISOString().slice(0, 10)
      const count = squads.filter(s => s.date && s.date.slice(0, 10) === dateStr).length
      const dow = d.getDay()
      return { label: labels[dow === 0 ? 6 : dow - 1], sesiones: count }
    })
  }, [squads])

  const handleSort = key => {
    setSortBy(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const SORTABLE = ['km', 'sprints', 'vel', 'carga']

  const filteredPlayers = useMemo(() => {
    let list = [...players]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    if (sortBy.key) {
      list.sort((a, b) => {
        const av = a[sortBy.key]
        const bv = b[sortBy.key]
        return sortBy.dir === 'asc' ? av - bv : bv - av
      })
    }
    return list
  }, [players, searchQuery, sortBy])

  const sortIcon = key => {
    if (sortBy.key !== key) return <span style={{ color:T.faint, marginLeft:3, fontSize:8 }}>↕</span>
    return <span style={{ color:T.cian, marginLeft:3, fontSize:8 }}>{sortBy.dir === 'asc' ? '▲' : '▼'}</span>
  }

  if (loading) {
    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}>
        <LoadingSpinner text="Cargando dashboard..." />
      </div>
    )
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding: isMobile ? '16px' : isTablet ? '20px 24px' : '28px 32px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: isMobile ? 18 : 28, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0 }}>
        <div>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize: isMobile ? 20 : 26, color:T.white }}>Dashboard</div>
          <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>
            {lastSession
              ? <>Última sesión: <span style={{ color:T.white }}>{formatDate(lastSession.date)} · {lastSession.type === 'partido' ? `Partido${lastSession.rival ? ' vs ' + lastSession.rival : ''}` : 'Entrenamiento'}</span></>
              : <span>Sin sesiones registradas aún</span>
            }
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ ...glass(10), padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:T.green, boxShadow:`0 0 6px ${T.green}` }} />
            <span style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>{totalJugadores} jugadores activos</span>
          </div>
          <button
            onClick={() => setShowNewSession(true)}
            style={{ ...glass(10), padding:'8px 16px', border:`1px solid rgba(243,108,58,.35)`, fontFamily:T.exo, fontWeight:600, fontSize:12, color:T.naranja, letterSpacing:.8, background:'rgba(243,108,58,.10)' }}
          >
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
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 16 : 24 }}>
        {[
          { l:'Total jugadores',  v:totalJugadores, u:'en plantel',  c:T.cian,    s: totalJugadores > 0 ? 'Plantel cargado' : 'Sin jugadores aún'   },
          { l:'Sesiones totales', v:totalSesiones,  u:'registradas', c:T.cian,    s: totalSesiones > 0  ? 'Historial activo' : 'Sin sesiones aún'   },
          { l:'En sobrecarga',    v:enAlerta,        u:'jugadores',   c:T.naranja, s: enAlerta > 0       ? 'Revisar carga'    : 'Plantel en forma'   },
          { l:'Lesionados',       v:lesionados,      u:'jugadores',   c:T.red,     s: lesionados > 0     ? 'Revisar recuperación' : 'Sin lesiones'   },
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
      <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 340px', gap: isMobile ? 12 : 18, marginBottom:18 }}>

        {/* Player table */}
        <div style={{ ...glass(14), overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:15, color:T.white }}>Plantel</div>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar jugador..."
              style={{ padding:'7px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:12, outline:'none', width:180 }}
            />
          </div>
          {players.length === 0 ? (
            <EmptyState icon="👤" title="Sin jugadores" subtitle="Agregá jugadores en la sección Jugadores." />
          ) : filteredPlayers.length === 0 ? (
            <EmptyState icon="🔍" title="Sin resultados" subtitle="No hay jugadores que coincidan con tu búsqueda." />
          ) : (
          <div style={{ overflowY:'auto', maxHeight:320 }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,.03)' }}>
                  {['#','Jugador','Pos.'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', fontFamily:T.dm, fontSize:10, color:T.faint, fontWeight:500, textAlign:'left', borderBottom:`1px solid ${T.border}` }}>{h}</th>
                  ))}
                  {[
                    { key:'km',      label:'Dist.' },
                    { key:'sprints', label:'Sprints' },
                    { key:'vel',     label:'Vel.' },
                    { key:'carga',   label:'Carga' },
                  ].map(h => (
                    <th key={h.key} onClick={() => handleSort(h.key)} style={{ padding:'8px 12px', fontFamily:T.dm, fontSize:10, color: sortBy.key === h.key ? T.cian : T.faint, fontWeight: sortBy.key === h.key ? 600 : 500, textAlign:'left', borderBottom:`1px solid ${T.border}`, cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' }}>
                      {h.label}{sortIcon(h.key)}
                    </th>
                  ))}
                  <th style={{ padding:'8px 12px', fontFamily:T.dm, fontSize:10, color:T.faint, fontWeight:500, textAlign:'left', borderBottom:`1px solid ${T.border}` }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p, i) => {
                  const ec = p.estado==='ok' ? T.green : p.estado==='alerta' ? T.naranja : T.red
                  const el = p.estado==='ok' ? 'OK'    : p.estado==='alerta' ? 'Alerta'  : 'Lesión'
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPlayer(p)}
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
                      <td style={{ padding:'9px 12px', fontFamily:T.mono, fontSize:12, color: sortBy.key==='km' ? T.cian : T.white, fontWeight: sortBy.key==='km' ? 700 : 400 }}>{p.km ?? 0}</td>
                      <td style={{ padding:'9px 12px', fontFamily:T.mono, fontSize:12, color: sortBy.key==='sprints' ? T.cian : T.white, fontWeight: sortBy.key==='sprints' ? 700 : 400 }}>{p.sprints ?? 0}</td>
                      <td style={{ padding:'9px 12px', fontFamily:T.mono, fontSize:12, color: sortBy.key==='vel' ? T.cian : T.white, fontWeight: sortBy.key==='vel' ? 700 : 400 }}>{p.vel ?? 0}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <MiniBar val={p.carga ?? 0} width={56} />
                          <span style={{ fontFamily:T.mono, fontSize:11, color: (p.carga??0)>=90 ? T.red : (p.carga??0)>=75 ? T.naranja : T.muted }}>{p.carga ?? 0}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'9px 12px' }}><Badge label={el} color={ec} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Weekly chart */}
          <div style={{ ...glass(14), padding:'16px 18px' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:14 }}>Actividad últimos 7 días</div>
            <div style={{ height: isMobile ? 120 : 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top:4, right:4, bottom:0, left:-16 }}>
                  <XAxis dataKey="label" tick={{ fill:'rgba(255,255,255,0.22)', fontSize:10, fontFamily:'DM Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'rgba(255,255,255,0.22)', fontSize:9, fontFamily:'JetBrains Mono' }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background:'rgba(6,14,26,.92)', border:'1px solid rgba(70,199,240,.2)', borderRadius:8, fontSize:12, fontFamily:'DM Sans', boxShadow:'0 4px 20px rgba(0,0,0,.4)' }}
                    labelStyle={{ color:'#FFFFFF', fontWeight:600 }}
                    formatter={v => [`${v} sesión${v !== 1 ? 'es' : ''}`, 'Actividad']}
                    cursor={{ fill:'rgba(70,199,240,.06)' }}
                  />
                  <Bar dataKey="sesiones" radius={[4,4,0,0]} maxBarSize={32}>
                    {weeklyData.map((d, i) => (
                      <Cell key={i} fill={d.sesiones === 0 ? 'rgba(255,255,255,.05)' : i === weeklyData.length - 1 ? '#46C7F0' : 'rgba(70,199,240,.35)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
              <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>Total semana</span>
              <span style={{ fontFamily:T.mono, fontSize:13, color:T.cian, fontWeight:700 }}>
                {weeklyData.reduce((s, d) => s + d.sesiones, 0)} sesión{weeklyData.reduce((s,d)=>s+d.sesiones,0) !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>

          {/* Recent sessions */}
          <div style={{ ...glass(14), overflow:'hidden', flex:1 }}>
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>Últimas sesiones</div>
            </div>
            {squads.length === 0 ? (
              <EmptyState icon="📋" title="Sin sesiones" subtitle="Aún no hay sesiones registradas." />
            ) : (
            <div style={{ padding:'4px 0' }}>
              {squads.slice(0, 5).map((s, i) => (
                <div
                  key={s.id}
                  style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:10, borderBottom: i < Math.min(squads.length, 5) - 1 ? `1px solid ${T.border}` : 'none', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(70,199,240,.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background: s.type==='partido' ? T.naranja : T.cian }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:T.dm, fontSize:12, color:T.white, fontWeight:500 }}>
                      {s.type === 'partido' ? 'Partido' : 'Entrenamiento'}{s.rival ? ' vs ' + s.rival : ''}
                    </div>
                    <div style={{ fontFamily:T.dm, fontSize:10, color:T.muted }}>{formatDate(s.date)}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:T.mono, fontSize:11, color:T.faint }}>{s.notes ? s.notes.slice(0, 20) : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Load distribution */}
          <div style={{ ...glass(14), padding:'14px 16px' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>Estado del plantel</div>
            {players.length === 0 ? (
              <div style={{ fontFamily:T.dm, fontSize:12, color:T.faint }}>Sin jugadores aún.</div>
            ) : (
              [
                { l:'Disponibles',    cnt: players.filter(p => p.estado==='ok').length,     c:T.green   },
                { l:'Sobrecarga',     cnt: players.filter(p => p.estado==='alerta').length,  c:T.naranja },
                { l:'Lesionados',     cnt: players.filter(p => p.estado==='lesion').length,  c:T.red     },
              ].map((c, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom: i<2 ? 8 : 0 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:c.c, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ height:4, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', background:c.c, borderRadius:2, width:`${players.length > 0 ? (c.cnt/players.length)*100 : 0}%` }} />
                    </div>
                  </div>
                  <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted, width:80, textAlign:'right' }}>{c.l}</span>
                  <span style={{ fontFamily:T.mono, fontSize:12, color:c.c, width:16, textAlign:'right' }}>{c.cnt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewSession && (
        <NewSessionModal onClose={() => setShowNewSession(false)} onCreate={addSquad} />
      )}
      {selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  )
}
