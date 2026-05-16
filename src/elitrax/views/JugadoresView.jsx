import { useState, useMemo, useEffect } from 'react'
import { T, glass } from '../tokens'
import { TEAM_EVENT_TYPES, initials } from '../data'
import { usePlayer } from '../context/PlayerContext'
import { useSession } from '../context/SessionContext'
import { useToast } from '../context/ToastContext'
import Badge from '../components/Badge'
import MiniBar from '../components/MiniBar'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import PlayerFormModal from '../components/PlayerFormModal'
import PlayerFilesModal from '../components/PlayerFilesModal'
import PlayerInjuryModal from '../components/PlayerInjuryModal'
import PlayerClubModal from '../components/PlayerClubModal'

function calcAge(bd) {
  if (!bd) return '—'
  const diff = Date.now() - new Date(bd).getTime()
  return Math.floor(diff / 31557600000)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })
}

const STATE_CONFIG = {
  ok:        { label:'OK',        color:T.green   },
  alerta:    { label:'Alerta',    color:T.naranja },
  lesion:    { label:'Lesión',    color:T.red     },
  suspendido:{ label:'Suspendido',color:T.red     },
}

const PROFILE_TABS = [
  { id:'resumen',    label:'Resumen'    },
  { id:'datos',      label:'Datos'      },
  { id:'lesiones',   label:'Lesiones'   },
  { id:'archivos',   label:'Archivos'   },
  { id:'clubes',     label:'Clubes'     },
  { id:'eventos',    label:'Eventos'    },
]

export default function JugadoresView() {
  const { players, addPlayer, updatePlayer, deletePlayer, addAnthropometric, addInjury, closeInjury, addFile, deleteFile, addClub, removeClub, loadPlayerMeasurements } = usePlayer()
  const { squads } = useSession()
  const toast = useToast()

  const [loading,      setLoading]    = useState(true)
  const [view,         setView]       = useState('list')
  const [selected,     setSelected]   = useState(null)
  const [tab,          setTab]        = useState('resumen')
  const [search,       setSearch]     = useState('')
  const [posFilter,    setPosFilter]  = useState('')
  const [stateFilter,  setStateFilter] = useState('')
  const [viewStyle,    setViewStyle]  = useState('cards')
  const [showForm,     setShowForm]   = useState(false)
  const [editPlayer,   setEditPlayer] = useState(null)
  const [deleteId,     setDeleteId]   = useState(null)
  const [showFiles,    setShowFiles]  = useState(false)
  const [showInjury,   setShowInjury] = useState(false)
  const [showClub,     setShowClub]   = useState(false)
  const [showAnthropo, setShowAnthropo] = useState(false)
  const [anthropoForm, setAnthropoForm] = useState({ altura:'', peso:'', grasa:'', masaMuscular:'', note:'' })

  useEffect(() => { const t = setTimeout(() => setLoading(false), 300); return () => clearTimeout(t) }, [])

  // Fase 4: carga mediciones reales cuando se abre el perfil de un jugador
  useEffect(() => {
    if (selected?.id && loadPlayerMeasurements) {
      loadPlayerMeasurements(selected.id).catch(() => {})
    }
  }, [selected?.id])

  const allPositions = [...new Set(players.map(p => p.pos))]

  const filtered = useMemo(() => {
    let list = [...players]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    if (posFilter) list = list.filter(p => p.pos === posFilter)
    if (stateFilter) list = list.filter(p => p.estado === stateFilter)
    return list
  }, [players, search, posFilter, stateFilter])

  const avgKm = (players.reduce((s, p) => s + (p.km || 0), 0) / (players.length || 1)).toFixed(1)
  const avgVel = (players.reduce((s, p) => s + (p.vel || 0), 0) / (players.length || 1)).toFixed(1)

  function getPlayerEvents(playerId) {
    const evs = []
    squads.forEach(sq => {
      ;(sq.events || []).forEach(ev => {
        if (ev.playerId === playerId) evs.push({ ...ev, squadName: sq.name, squadDate: sq.date, squadId: sq.id })
        if (ev.relatedPlayerId === playerId) evs.push({ ...ev, squadName: sq.name, squadDate: sq.date, squadId: sq.id, isRelated: true })
      })
    })
    return evs.sort((a, b) => (b.minute || 0) - (a.minute || 0))
  }

  const handleSavePlayer = data => {
    if (editPlayer) {
      updatePlayer(editPlayer.id, data)
      toast.success('Jugador actualizado.')
    } else {
      addPlayer(data)
      toast.success('Jugador agregado.')
    }
    setShowForm(false); setEditPlayer(null)
  }

  const handleDelete = () => {
    if (deleteId == null) return
    deletePlayer(deleteId)
    toast.success('Jugador eliminado.')
    setDeleteId(null)
    if (selected?.id === deleteId) { setSelected(null); setView('list') }
  }

  const handleSaveAnthropo = () => {
    if (!selected) return
    addAnthropometric(selected.id, {
      date: new Date().toISOString().slice(0,10),
      altura: parseFloat(anthropoForm.altura) || selected.altura,
      peso: parseFloat(anthropoForm.peso) || selected.peso,
      grasa: parseFloat(anthropoForm.grasa) || 0,
      masaMuscular: parseFloat(anthropoForm.masaMuscular) || 0,
      note: anthropoForm.note.trim(),
    })
    toast.success('Medición registrada.')
    setShowAnthropo(false)
    setAnthropoForm({ altura:'', peso:'', grasa:'', masaMuscular:'', note:'' })
  }

  if (loading) return <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}><LoadingSpinner text="Cargando plantel..." /></div>

  /* ==================== LIST VIEW ==================== */
  if (view === 'list') {
    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:24, color:T.white }}>Jugadores</div>
            <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>{players.length} jugadores en el plantel</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setViewStyle(viewStyle === 'cards' ? 'table' : 'cards')} title={viewStyle === 'cards' ? 'Vista tabla' : 'Vista tarjetas'}
              style={{ padding:'8px 10px', borderRadius:8, background:'transparent', border:`1px solid ${T.border}`, fontFamily:T.dm, fontSize:15, color:T.muted, lineHeight:1, cursor:'pointer' }}>
              {viewStyle === 'cards' ? '☰' : '⊞'}
            </button>
            <button onClick={() => { setEditPlayer(null); setShowForm(true) }}
              style={{ padding:'9px 18px', borderRadius:10, background:`linear-gradient(135deg,${T.cian},#2EB5E0)`, border:'none', fontFamily:T.exo, fontWeight:600, fontSize:12, color:T.bg, cursor:'pointer' }}>
              + AGREGAR
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ ...glass(10), padding:'8px 14px', display:'flex', alignItems:'center', gap:8, border:`1px solid ${T.border}`, width:220 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke={T.muted} strokeWidth="1.2"/><path d="M9 9l3 3" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round"/></svg>
            <input value={search} onInput={e => setSearch(e.target.value)} placeholder="Buscar jugador..." style={{ background:'none', border:'none', outline:'none', fontFamily:T.dm, fontSize:12, color:T.white, flex:1 }} />
          </div>
          {['',...allPositions].map(p => (
            <button key={p} onClick={() => setPosFilter(p)}
              style={{ padding:'5px 12px', borderRadius:20, border:`1.5px solid ${posFilter===p ? T.cian : T.border}`, background: posFilter===p ? T.cianDim : 'transparent', fontFamily:T.dm, fontSize:11, color: posFilter===p ? T.cian : T.muted, cursor:'pointer' }}>
              {p || 'Todos'}
            </button>
          ))}
          {Object.entries(STATE_CONFIG).map(([k, v]) => (
            <button key={k} onClick={() => setStateFilter(stateFilter===k ? '' : k)}
              style={{ padding:'5px 10px', borderRadius:20, border:`1.5px solid ${stateFilter===k ? v.color : T.border}`, background: stateFilter===k ? `${v.color}18` : 'transparent', fontFamily:T.dm, fontSize:10, color: stateFilter===k ? v.color : T.muted, cursor:'pointer' }}>
              {v.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="👤" title="Sin jugadores" subtitle={search || posFilter || stateFilter ? 'No hay jugadores que coincidan con los filtros.' : 'Agregá tu primer jugador.'} cta={!search && !posFilter && !stateFilter ? 'Agregar jugador' : undefined} onCta={() => { setEditPlayer(null); setShowForm(true) }} />
        ) : viewStyle === 'cards' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {filtered.map(p => {
              const sc = STATE_CONFIG[p.estado] || STATE_CONFIG.ok
              return (
                <div key={p.id} onClick={() => { setSelected(p); setView('profile'); setTab('resumen') }}
                  style={{ ...glass(16), padding:'16px 18px', cursor:'pointer', border:`1px solid ${T.border}`, transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.cian+'44'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,${T.cian}44,${T.bg3})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:800, fontSize:14, color:T.cian }}>
                      {initials(p.name)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontFamily:T.dm, fontWeight:600, fontSize:14, color:T.white, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</span>
                        <Badge label={sc.label} color={sc.color} />
                      </div>
                      <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>{p.pos} · {p.num} · {calcAge(p.birthDate)} años</div>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginTop:10 }}>
                    <div style={{ textAlign:'center', background:'rgba(255,255,255,.04)', borderRadius:6, padding:'6px 4px' }}>
                      <div style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:T.cian }}>{p.stats?.goles || 0}</div>
                      <div style={{ fontFamily:T.dm, fontSize:8, color:T.faint }}>Goles</div>
                    </div>
                    <div style={{ textAlign:'center', background:'rgba(255,255,255,.04)', borderRadius:6, padding:'6px 4px' }}>
                      <div style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:T.cian }}>{p.stats?.partidosJugados || 0}</div>
                      <div style={{ fontFamily:T.dm, fontSize:8, color:T.faint }}>PJ</div>
                    </div>
                    <div style={{ textAlign:'center', background:'rgba(255,255,255,.04)', borderRadius:6, padding:'6px 4px' }}>
                      <div style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:T.naranja }}>{p.vel || '—'}</div>
                      <div style={{ fontFamily:T.dm, fontSize:8, color:T.faint }}>Vel.</div>
                    </div>
                    <div style={{ textAlign:'center', background:'rgba(255,255,255,.04)', borderRadius:6, padding:'6px 4px' }}>
                      <div style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color: (p.carga||0)>=90 ? T.red : (p.carga||0)>=75 ? T.naranja : T.muted }}>{p.carga || 0}%</div>
                      <div style={{ fontFamily:T.dm, fontSize:8, color:T.faint }}>Carga</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ ...glass(14), overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,.03)' }}>
                  {['#','Nombre','Edad','Posición','Estado','PJ','Goles','km','Vel.','Carga',''].map(h => (
                    <th key={h} style={{ padding:'10px 14px', fontFamily:T.dm, fontSize:10, color:T.faint, fontWeight:500, textAlign:'left', borderBottom:`1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const sc = STATE_CONFIG[p.estado] || STATE_CONFIG.ok
                  return (
                    <tr key={p.id} onClick={() => { setSelected(p); setView('profile'); setTab('resumen') }}
                      style={{ borderBottom:`1px solid ${T.border}`, cursor:'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.03)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px 14px', fontFamily:T.mono, fontSize:12, color:T.faint }}>{p.num}</td>
                      <td style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${T.cian}44,${T.bg3})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:700, fontSize:9, color:T.cian, flexShrink:0 }}>
                          {initials(p.name)}
                        </div>
                        <span style={{ fontFamily:T.dm, fontSize:13, color:T.white }}>{p.name}</span>
                      </td>
                      <td style={{ padding:'10px 14px', fontFamily:T.dm, fontSize:12, color:T.muted }}>{calcAge(p.birthDate)}</td>
                      <td style={{ padding:'10px 14px', fontFamily:T.dm, fontSize:12, color:T.muted }}>{p.pos}</td>
                      <td style={{ padding:'10px 14px' }}><Badge label={sc.label} color={sc.color} /></td>
                      <td style={{ padding:'10px 14px', fontFamily:T.mono, fontSize:12, color:T.cian }}>{p.stats?.partidosJugados || 0}</td>
                      <td style={{ padding:'10px 14px', fontFamily:T.mono, fontSize:12, color:T.cian }}>{p.stats?.goles || 0}</td>
                      <td style={{ padding:'10px 14px', fontFamily:T.mono, fontSize:12, color:T.cian }}>{p.km || '—'}</td>
                      <td style={{ padding:'10px 14px', fontFamily:T.mono, fontSize:12, color:T.naranja }}>{p.vel || '—'}</td>
                      <td style={{ padding:'10px 14px' }}><MiniBar val={p.carga || 0} width={50} /></td>
                      <td style={{ padding:'10px 14px' }}>
                        <button onClick={e => { e.stopPropagation(); setEditPlayer(p); setShowForm(true) }} style={{ background:'none', border:'none', color:T.faint, fontSize:13, cursor:'pointer' }}>✎</button>
                        <button onClick={e => { e.stopPropagation(); setDeleteId(p.id) }} style={{ marginLeft:4, background:'none', border:'none', color:T.red, fontSize:13, cursor:'pointer' }}>🗑</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {showForm && <PlayerFormModal sport={players[0]?.sport || 'football'} player={editPlayer} onClose={() => { setShowForm(false); setEditPlayer(null) }} onSave={handleSavePlayer} />}
        {deleteId != null && <ConfirmDialog title="Eliminar jugador" message="¿Estás seguro? Esta acción no se puede deshacer." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      </div>
    )
  }

  /* ==================== PROFILE VIEW ==================== */
  if (view === 'profile' && selected) {
    const p = players.find(x => x.id === selected.id) || selected
    const sc = STATE_CONFIG[p.estado] || STATE_CONFIG.ok
    const activeInjury = p.injuries?.find(i => !i.closedAt)
    const playerEvents = getPlayerEvents(p.id)

    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'24px 32px 0', flexShrink:0 }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              <button onClick={() => setView('list')} style={{ background:'none', border:'none', color:T.muted, fontSize:18, cursor:'pointer', marginTop:4 }}>←</button>
              <div style={{ width:56, height:56, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,${T.cian}55,${T.bg3})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:800, fontSize:18, color:T.cian }}>
                {initials(p.name)}
              </div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:22, color:T.white }}>{p.name}</div>
                  <Badge label={sc.label} color={sc.color} />
                </div>
                <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:2 }}>
                  {p.pos} · #{p.num} · {calcAge(p.birthDate)} años · {p.altura} cm · {p.peso} kg
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setEditPlayer(p); setShowForm(true) }} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:11, color:T.muted, cursor:'pointer' }}>✎ Editar</button>
              <button onClick={() => { setDeleteId(p.id) }} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${T.red}33`, background:'transparent', fontFamily:T.dm, fontSize:11, color:T.red, cursor:'pointer' }}>🗑</button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:14 }}>
            {[
              { l:'Partidos', v:p.stats?.partidosJugados||0, c:T.cian },
              { l:'Minutos',  v:p.stats?.minutosJugados||0, c:T.cian },
              { l:'Goles',    v:p.stats?.goles||0,          c:T.green },
              { l:'Asistencias', v:p.stats?.asistencias||0, c:T.cian },
              { l:'Amarillas/Rojas', v:`${p.stats?.amarillas||0}/${p.stats?.rojas||0}`, c:T.naranja },
            ].map(s => (
              <div key={s.l} style={{ ...glass(10), padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontFamily:T.mono, fontSize:22, fontWeight:700, color:s.c, lineHeight:1.2 }}>{s.v}</div>
                <div style={{ fontFamily:T.dm, fontSize:9, color:T.faint, marginTop:3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:2, borderBottom:`1px solid ${T.border}` }}>
            {PROFILE_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding:'8px 16px', border:'none', borderRadius:'6px 6px 0 0', background: tab===t.id ? T.bg2 : 'transparent', fontFamily:T.dm, fontSize:12, fontWeight: tab===t.id ? 600 : 400, color: tab===t.id ? T.white : T.muted, borderBottom: tab===t.id ? `2px solid ${T.cian}` : '2px solid transparent', cursor:'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 32px 28px' }}>

          {/* ── TAB: Resumen ── */}
          {tab === 'resumen' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Metrics */}
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:14 }}>Métricas de rendimiento</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { l:'Distancia', v:p.km||'—', u:'km', c:T.cian, avg:avgKm },
                    { l:'Velocidad máx.', v:p.vel||'—', u:'km/h', c:T.naranja, avg:avgVel },
                    { l:'Sprints', v:p.sprints||'—', u:'/ses', c:T.cian },
                    { l:'Carga física', v:`${p.carga||0}%`, u:'', c:(p.carga||0)>=90?T.red:(p.carga||0)>=75?T.naranja:T.cian },
                  ].map((m, i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,.04)', borderRadius:10, padding:'12px 14px', border:`1px solid ${T.border}` }}>
                      <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint, marginBottom:4 }}>{m.l}</div>
                      <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                        <span style={{ fontFamily:T.mono, fontSize:20, fontWeight:700, color:m.c, lineHeight:1 }}>{m.v}</span>
                        {m.u && <span style={{ fontFamily:T.dm, fontSize:10, color:T.faint }}>{m.u}</span>}
                      </div>
                      {m.avg != null && (
                        <div style={{ marginTop:6 }}>
                          <div style={{ height:3, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${Math.min(((p.km||0) / (parseFloat(m.avg)||1)) * 100, 100)}%`, background:m.c, borderRadius:2 }} />
                          </div>
                          <div style={{ fontFamily:T.dm, fontSize:9, color:T.muted, marginTop:2 }}>Prom. equipo: {m.avg}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Health + Info */}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ ...glass(14), padding:'16px 18px', border:`1px solid ${sc.color}33`, background: p.estado==='ok' ? 'rgba(74,222,128,.04)' : 'rgba(255,91,91,.06)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:22 }}>{p.estado === 'ok' ? '✅' : '⚠️'}</span>
                    <div>
                      <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:sc.color }}>
                        {p.estado === 'ok' ? 'Disponible' : p.estado === 'alerta' ? 'Sobrecarga' : p.estado === 'lesion' ? `Lesión activa: ${activeInjury?.type || ''}` : 'Suspendido'}
                      </div>
                      <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:2 }}>
                        {p.estado === 'ok' ? 'En condiciones para la próxima sesión.' : activeInjury ? `Desde ${formatDate(activeInjury.date)} · ${activeInjury.zone}` : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ ...glass(14), padding:'16px 18px' }}>
                  <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:10 }}>Datos personales</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                    {[
                      { l:'Email', v:p.email || '—' },
                      { l:'Teléfono', v:p.phone || '—' },
                      { l:'Altura', v:p.altura ? `${p.altura} cm` : '—' },
                      { l:'Peso', v:p.peso ? `${p.peso} kg` : '—' },
                    ].map(d => (
                      <div key={d.l} style={{ padding:'6px 0', borderBottom:`1px solid ${T.border}` }}>
                        <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint }}>{d.l}</div>
                        <div style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {p.clubHistory?.length > 0 && (
                  <div style={{ ...glass(14), padding:'12px 16px' }}>
                    <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:12, color:T.white, marginBottom:8 }}>Trayectoria</div>
                    {p.clubHistory.slice(-2).map((c, i) => (
                      <div key={i} style={{ fontFamily:T.dm, fontSize:11, color:T.muted, padding:'3px 0' }}>• {c.club} ({c.from}–{c.to})</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: Datos ── */}
          {tab === 'datos' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:14 }}>Información personal</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    { l:'Nombre completo', v:p.name },
                    { l:'Fecha de nac.', v:formatDate(p.birthDate) },
                    { l:'Edad', v:`${calcAge(p.birthDate)} años` },
                    { l:'Altura', v:p.altura ? `${p.altura} cm` : '—' },
                    { l:'Peso', v:p.peso ? `${p.peso} kg` : '—' },
                    { l:'Email', v:p.email || '—' },
                    { l:'Teléfono', v:p.phone || '—' },
                    { l:'Posición', v:p.pos },
                    { l:'Número', v:`#${p.num}` },
                  ].map(d => (
                    <div key={d.l} style={{ padding:'6px 0', borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint }}>{d.l}</div>
                      <div style={{ fontFamily:T.dm, fontSize:13, color:T.white }}>{d.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ ...glass(14), padding:'16px 18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>Antropometría</div>
                    <button onClick={() => setShowAnthropo(true)} style={{ padding:'5px 10px', borderRadius:6, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:10, color:T.cian, cursor:'pointer' }}>+ Medición</button>
                  </div>
                  {p.anthropometrics?.length === 0 ? (
                    <div style={{ fontFamily:T.dm, fontSize:12, color:T.faint, textAlign:'center', padding:16 }}>Sin mediciones registradas</div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      {[...p.anthropometrics].reverse().map((m, i) => (
                        <div key={i} style={{ padding:'8px 10px', borderRadius:6, background:'rgba(255,255,255,.03)', border:`1px solid ${T.border}` }}>
                          <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint }}>{formatDate(m.date)}</div>
                          <div style={{ display:'flex', gap:12, marginTop:3 }}>
                            {m.altura && <span style={{ fontFamily:T.mono, fontSize:12, color:T.cian }}>{m.altura} cm</span>}
                            {m.peso && <span style={{ fontFamily:T.mono, fontSize:12, color:T.cian }}>{m.peso} kg</span>}
                            {m.grasa != null && m.grasa > 0 && <span style={{ fontFamily:T.mono, fontSize:12, color:T.naranja }}>Grasa: {m.grasa}%</span>}
                            {m.masaMuscular != null && m.masaMuscular > 0 && <span style={{ fontFamily:T.mono, fontSize:12, color:T.green }}>MM: {m.masaMuscular}%</span>}
                          </div>
                          {m.note && <div style={{ fontFamily:T.dm, fontSize:10, color:T.muted, marginTop:2 }}>{m.note}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Lesiones ── */}
          {tab === 'lesiones' && (
            <div style={{ maxWidth:600 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>Historial de lesiones</div>
                <button onClick={() => setShowInjury(true)} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${T.red}33`, background: `${T.red}11`, fontFamily:T.dm, fontSize:11, color:T.red, cursor:'pointer' }}>+ Registrar lesión</button>
              </div>
              {p.injuries?.length === 0 ? (
                <div style={{ ...glass(14), padding:'30px', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8, opacity:.4 }}>🩹</div>
                  <div style={{ fontFamily:T.dm, fontSize:13, color:T.faint }}>Sin lesiones registradas</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[...p.injuries].reverse().map(inj => {
                    const sevColor = inj.severity === 'leve' ? T.green : inj.severity === 'moderado' ? T.naranja : T.red
                    return (
                      <div key={inj.id} style={{ ...glass(14), padding:'14px 16px', border:`1px solid ${inj.closedAt ? T.border : sevColor+'44'}`, background: inj.closedAt ? 'transparent' : `${sevColor}08` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:8, height:8, borderRadius:'50%', background: sevColor }} />
                              <span style={{ fontFamily:T.dm, fontWeight:600, fontSize:14, color:T.white }}>{inj.type}</span>
                              <Badge label={inj.severity} color={sevColor} />
                            </div>
                            <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:4 }}>{inj.zone} · {formatDate(inj.date)}</div>
                            {inj.note && <div style={{ fontFamily:T.dm, fontSize:12, color:T.faint, marginTop:4 }}>{inj.note}</div>}
                            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:4 }}>
                              {inj.recoveryDays ? `${inj.recoveryDays} días estimados` : ''}
                            </div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            {inj.closedAt ? (
                              <Badge label="Recuperado" color={T.green} />
                            ) : (
                              <div>
                                <Badge label="Activa" color={T.red} />
                                <button onClick={() => closeInjury(p.id, inj.id)} style={{ display:'block', marginTop:6, padding:'4px 10px', borderRadius:6, border:`1px solid ${T.green}33`, background:'transparent', fontFamily:T.dm, fontSize:10, color:T.green, cursor:'pointer' }}>Cerrar</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Archivos ── */}
          {tab === 'archivos' && (
            <div style={{ maxWidth:500 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>Archivos</div>
                <button onClick={() => setShowFiles(true)} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:11, color:T.cian, cursor:'pointer' }}>+ Subir archivo</button>
              </div>
              {p.files?.length === 0 ? (
                <div style={{ ...glass(14), padding:'30px', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8, opacity:.4 }}>📁</div>
                  <div style={{ fontFamily:T.dm, fontSize:13, color:T.faint }}>Sin archivos subidos</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {p.files.map(f => (
                    <div key={f.id} style={{ ...glass(12), padding:'12px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:T.dm, fontSize:13, color:T.white, fontWeight:500 }}>{f.name}</div>
                          <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:3 }}>{f.description}</div>
                          <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint, marginTop:4 }}>.{f.type} · {formatDate(f.uploadedAt)}</div>
                        </div>
                        <button onClick={() => deleteFile(p.id, f.id)} style={{ background:'none', border:'none', color:T.red, fontSize:14, cursor:'pointer', opacity:.5 }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Clubes ── */}
          {tab === 'clubes' && (
            <div style={{ maxWidth:500 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>Trayectoria</div>
                <button onClick={() => setShowClub(true)} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:11, color:T.cian, cursor:'pointer' }}>+ Agregar club</button>
              </div>
              {p.clubHistory?.length === 0 ? (
                <div style={{ ...glass(14), padding:'30px', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8, opacity:.4 }}>🏟️</div>
                  <div style={{ fontFamily:T.dm, fontSize:13, color:T.faint }}>Sin clubes registrados</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {[...p.clubHistory].reverse().map((c, i) => (
                    <div key={i} style={{ ...glass(12), padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontFamily:T.dm, fontSize:13, color:T.white, fontWeight:500 }}>{c.club}</div>
                        <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:2 }}>{c.from} – {c.to} · {c.category}</div>
                      </div>
                      <button onClick={() => removeClub(p.id, p.clubHistory.length - 1 - i)} style={{ background:'none', border:'none', color:T.red, fontSize:14, cursor:'pointer', opacity:.4 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Eventos ── */}
          {tab === 'eventos' && (
            <div style={{ maxWidth:600 }}>
              <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:14 }}>Eventos registrados en Mi Equipo</div>
              {playerEvents.length === 0 ? (
                <div style={{ ...glass(14), padding:'30px', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8, opacity:.4 }}>📋</div>
                  <div style={{ fontFamily:T.dm, fontSize:13, color:T.faint }}>Sin eventos registrados desde Mi Equipo</div>
                  <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:4 }}>Los eventos registrados en partidos/entrenamientos aparecerán aquí.</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {playerEvents.map((ev, i) => {
                    const evType = TEAM_EVENT_TYPES.find(t => t.id === ev.type)
                    return (
                      <div key={i} style={{ ...glass(12), padding:'10px 14px', display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ width:24, height:24, borderRadius:'50%', background:(evType?.color||T.faint)+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0 }}>
                          {evType?.icon || '📌'}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>
                            {evType?.label || ev.type} {ev.isRelated ? '(asistió/incluido)' : ''}
                            <span style={{ color:T.muted }}> — {ev.minute}'</span>
                          </div>
                          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>
                            {ev.squadName || 'Equipo'} · {formatDate(ev.squadDate)}
                          </div>
                          {ev.note && <div style={{ fontFamily:T.dm, fontSize:11, color:T.faint, marginTop:2 }}>{ev.note}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modals */}
        {showForm && <PlayerFormModal sport={p.sport||'football'} player={editPlayer||p} onClose={() => { setShowForm(false); setEditPlayer(null) }} onSave={handleSavePlayer} />}
        {deleteId != null && <ConfirmDialog title="Eliminar jugador" message="¿Estás seguro?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
        {showFiles && <PlayerFilesModal player={p} onClose={() => setShowFiles(false)} onSave={data => addFile(p.id, data)} onDelete={fileId => deleteFile(p.id, fileId)} />}
        {showInjury && <PlayerInjuryModal player={p} onClose={() => setShowInjury(false)} onSave={data => addInjury(p.id, data)} />}
        {showClub && <PlayerClubModal player={p} onClose={() => setShowClub(false)} onSave={data => addClub(p.id, data)} />}
        {showAnthropo && (
          <div onClick={() => setShowAnthropo(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(4px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ ...glass(20), width:'100%', maxWidth:420, border:`1px solid ${T.borderHi}`, padding:'20px 24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:17, color:T.white }}>Registrar medición</div>
                <button onClick={() => setShowAnthropo(false)} style={{ background:'none', border:'none', color:T.muted, fontSize:20, cursor:'pointer' }}>×</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:4 }}>ALTURA (cm)</div>
                  <input type="number" value={anthropoForm.altura} onChange={e => setAnthropoForm(f=>({...f, altura:e.target.value}))} placeholder={String(p.altura)}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
                </div>
                <div>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:4 }}>PESO (kg)</div>
                  <input type="number" value={anthropoForm.peso} onChange={e => setAnthropoForm(f=>({...f, peso:e.target.value}))} placeholder={String(p.peso)}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:4 }}>% GRASA</div>
                  <input type="number" step="0.1" value={anthropoForm.grasa} onChange={e => setAnthropoForm(f=>({...f, grasa:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
                </div>
                <div>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:4 }}>% MASA MUSCULAR</div>
                  <input type="number" step="0.1" value={anthropoForm.masaMuscular} onChange={e => setAnthropoForm(f=>({...f, masaMuscular:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:4 }}>NOTA</div>
                <textarea value={anthropoForm.note} onChange={e => setAnthropoForm(f=>({...f, note:e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none', resize:'vertical', minHeight:50 }} />
              </div>
              <button onClick={handleSaveAnthropo} style={{ width:'100%', padding:'10px 0', borderRadius:8, border:'none', background:`linear-gradient(135deg,${T.cian},#2EB5E0)`, fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.bg, cursor:'pointer' }}>
                REGISTRAR
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
