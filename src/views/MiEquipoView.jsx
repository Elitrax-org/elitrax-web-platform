import { useState, useMemo, useRef } from 'react'
import { T, glass } from '../tokens'
import { SPORTS, initials } from '../data'
import { useTeam } from '../context/TeamContext'
import { useToast } from '../context/ToastContext'
import Badge from '../components/Badge'
import MiniBar from '../components/MiniBar'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import PlayerFormModal from '../components/PlayerFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import PlayerDetailModal from '../components/PlayerDetailModal'

const Silueta = () => (
  <svg viewBox="0 0 40 40" width="22" height="22" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.3">
    <circle cx="20" cy="14" r="6" />
    <path d="M8 34c0-6.6 5.4-12 12-12s12 5.4 12 12" />
  </svg>
)

function Avatar({ player, sportColor, size = 44, style, onClick }) {
  const s = size
  return (
    <div
      onClick={onClick}
      style={{
        width: s, height: s, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
        background: player?.photo ? 'none' : `linear-gradient(135deg,${sportColor}44 0%,${T.bg3} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.exo, fontWeight: 800, fontSize: s * 0.38, color: sportColor,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: `0 0 16px ${sportColor}18`,
        transition: 'box-shadow .2s ease',
        ...style,
      }}
    >
      {player?.photo
        ? <img src={player.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : player?.name
          ? initials(player.name)
          : <Silueta />
      }
    </div>
  )
}

export default function MiEquipoView() {
  const { sport, players, setSport, addPlayer, updatePlayer, deletePlayer, reorderPlayers } = useTeam()
  const toast = useToast()

  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(false)
  const [search,    setSearch]    = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [showForm,  setShowForm]  = useState(false)
  const [editPlayer, setEditPlayer] = useState(null)
  const [deleteId,  setDeleteId]  = useState(null)
  const [selPlayer, setSelPlayer] = useState(null)
  const [viewMode,  setViewMode]  = useState('cards')
  const [dragIdx,   setDragIdx]   = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  const dragNode = useRef(null)

  useState(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  })

  const currentSport = SPORTS.find(s => s.id === sport)
  const sportColor = currentSport?.color || T.cian
  const sportColorDim = sportColor + '22'

  const positions = currentSport?.positions || []

  const filtered = useMemo(() => {
    let list = [...players]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    if (posFilter) list = list.filter(p => p.pos === posFilter)
    return list
  }, [players, search, posFilter])

  const total = players.length
  const lesionados = players.filter(p => p.estado === 'lesion').length
  const alertasCnt = players.filter(p => p.estado === 'alerta').length
  const disponibles = players.filter(p => p.estado === 'ok').length

  const distPos = useMemo(() => {
    const map = {}
    players.forEach(p => { map[p.pos] = (map[p.pos] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [players])

  const handleDragStart = (e, idx) => {
    setDragIdx(idx)
    dragNode.current = e.target
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', idx)
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIdx !== idx) setDragOverIdx(idx)
  }

  const handleDragLeave = () => setDragOverIdx(null)

  const handleDrop = (e, toIdx) => {
    e.preventDefault()
    if (dragIdx != null && dragIdx !== toIdx) reorderPlayers(dragIdx, toIdx)
    setDragIdx(null)
    setDragOverIdx(null)
    dragNode.current = null
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    setDragOverIdx(null)
    dragNode.current = null
  }

  if (error) {
    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px', animation:'fadeIn .3s ease both' }}>
        <ErrorState title="Error al cargar el plantel" message="Ocurrió un problema al obtener los datos." icon="🚨" onRetry={() => setError(false)} />
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}>
        <LoadingSpinner text="Cargando plantel..." />
      </div>
    )
  }

  if (!sport) {
    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, animation:'fadeIn .3s ease both' }}>
        <div style={{ fontSize:48 }}>🏟️</div>
        <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:22, color:T.white, textAlign:'center' }}>Seleccioná el deporte de tu equipo</div>
        <div style={{ fontFamily:T.dm, fontSize:14, color:T.muted, textAlign:'center', maxWidth:300 }}>Esto definirá las posiciones disponibles para los jugadores.</div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
          {SPORTS.map(s => (
            <button
              key={s.id}
              onClick={() => setSport(s.id)}
              style={{ ...glass(16), padding:'18px 28px', border:`1.5px solid ${T.border}`, background:'transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:140, transition:'all .2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize:32 }}>{s.id === 'football' ? '⚽' : s.id === 'hockey' ? '🏑' : s.id === 'rugby' ? '🏉' : '🏀'}</span>
              <span style={{ fontFamily:T.dm, fontSize:14, fontWeight:600, color:T.white }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const handleSavePlayer = data => {
    if (editPlayer) {
      updatePlayer(editPlayer.id, data)
      toast.success('Jugador actualizado correctamente.')
    } else {
      addPlayer(data)
      toast.success('Jugador agregado al plantel.')
    }
    setShowForm(false)
    setEditPlayer(null)
  }

  const handleDelete = () => {
    if (deleteId == null) return
    const p = players.find(x => x.id === deleteId)
    deletePlayer(deleteId)
    toast.success(`"${p?.name}" eliminado del plantel.`)
    setDeleteId(null)
  }

  const openEdit = p => { setEditPlayer(p); setShowForm(true) }
  const openAdd = () => { setEditPlayer(null); setShowForm(true) }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px', animation:'slideIn .3s ease both' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div style={{ animation:'fadeUp .3s ease both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:24, color:T.white }}>Mi Equipo</div>
            <div style={{ ...glass(8), padding:'4px 12px', border:`1px solid ${sportColor}44` }}>
              <span style={{ fontFamily:T.dm, fontSize:11, color: sportColor }}>{currentSport?.label}</span>
            </div>
          </div>
          <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>
            {total} jugadores · {disponibles} disponibles · {alertasCnt > 0 ? `${alertasCnt} en alerta` : ''} {lesionados > 0 ? `· ${lesionados} lesionados` : ''}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            title={viewMode === 'cards' ? 'Vista tabla' : 'Vista tarjetas'}
            style={{ padding:'8px 10px', borderRadius:8, background:'transparent', border:`1px solid ${T.border}`, fontFamily:T.dm, fontSize:15, color:T.muted, lineHeight:1 }}>
            {viewMode === 'cards' ? '☰' : '⊞'}
          </button>
          <button onClick={openAdd} style={{ padding:'9px 18px', borderRadius:10, background:`linear-gradient(135deg,${sportColor},${sportColor}cc)`, border:'none', fontFamily:T.exo, fontWeight:600, fontSize:12, color:T.white }}>
            + AGREGAR JUGADOR
          </button>
        </div>
      </div>

      {/* Search + position filter */}
      <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap', animation:'fadeUp .35s ease both' }}>
        <div style={{ ...glass(10), padding:'8px 14px', display:'flex', alignItems:'center', gap:8, border:`1px solid ${T.border}`, width:220 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4.5" stroke={T.muted} strokeWidth="1.2"/>
            <path d="M9 9l3 3" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input value={search} onInput={e => setSearch(e.target.value)} placeholder="Buscar jugador..." style={{ background:'none', border:'none', outline:'none', fontFamily:T.dm, fontSize:12, color:T.white, flex:1 }} />
        </div>
        <button onClick={() => setPosFilter('')} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${posFilter === '' ? sportColor : T.border}`, background: posFilter === '' ? sportColorDim : 'transparent', fontFamily:T.dm, fontSize:12, color: posFilter === '' ? sportColor : T.muted, transition:'all .15s ease' }}>Todos</button>
        {positions.map(p => (
          <button key={p} onClick={() => setPosFilter(p)} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${posFilter === p ? sportColor : T.border}`, background: posFilter === p ? sportColorDim : 'transparent', fontFamily:T.dm, fontSize:12, color: posFilter === p ? sportColor : T.muted, transition:'all .15s ease' }}>{p}</button>
        ))}
      </div>

      {/* Distribution by position */}
      <div style={{ ...glass(14), padding:'16px 20px', marginBottom:22, animation:'fadeIn .4s ease both' }}>
        <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:12 }}>Distribución por posición</div>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          {distPos.map(([pos, cnt]) => (
            <div key={pos} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:T.dm, fontSize:12, color:T.muted }}>{pos}</span>
              <div style={{ width:80, height:5, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(cnt / total) * 100}%`, background:sportColor, borderRadius:3 }} />
              </div>
              <span style={{ fontFamily:T.mono, fontSize:12, color:sportColor, fontWeight:700, width:20, textAlign:'right' }}>{cnt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View content */}
      {filtered.length === 0 ? (
        <EmptyState icon={search || posFilter ? '🔍' : '👥'} title={search || posFilter ? 'Sin resultados' : 'Sin jugadores'} subtitle={search || posFilter ? 'No hay jugadores que coincidan con los filtros.' : 'Agregá tu primer jugador para empezar.'} cta={!search && !posFilter ? 'Agregar jugador' : undefined} onCta={!search && !posFilter ? openAdd : undefined} />
      ) : viewMode === 'cards' ? (
        /* ---------- Cards view ---------- */
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {filtered.map((p, idx) => {
            const ec = p.estado === 'ok' ? T.green : p.estado === 'alerta' ? T.naranja : T.red
            const el = p.estado === 'ok' ? 'OK' : p.estado === 'alerta' ? 'Alerta' : 'Lesión'
            const isOver = dragOverIdx === idx && dragIdx !== idx
            const isDrag = dragIdx === idx
            return (
              <div
                key={p.id}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                style={{
                  ...glass(16), padding:'18px 20px',
                  border: `1px solid ${isOver ? sportColor + '66' : isDrag ? sportColor + '33' : T.border}`,
                  borderStyle: isOver ? 'dashed' : 'solid',
                  cursor: 'grab',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  animation: `fadeUp .35s ease both`,
                  animationDelay: `${idx * 0.04}s`,
                  transition: 'all .25s ease, border-color .15s',
                  opacity: isDrag ? 0.4 : 1,
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isDrag) {
                    e.currentTarget.style.borderColor = sportColor + '44'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isDrag) {
                    e.currentTarget.style.borderColor = T.border
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {/* Jersey number badge */}
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: sportColorDim, border: `1px solid ${sportColor}44`,
                  borderRadius: 8, padding: '1px 8px',
                  fontFamily: T.mono, fontWeight: 900, fontSize: 13, color: sportColor,
                  lineHeight: 1.6,
                }}>
                  #{p.num}
                </div>

                <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <Avatar player={p} sportColor={sportColor} size={44} onClick={() => setSelPlayer(p)} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontFamily:T.dm, fontWeight:600, fontSize:14, color:T.white, cursor:'pointer' }} onClick={() => setSelPlayer(p)}>{p.name}</span>
                      <Badge label={el} color={ec} />
                    </div>
                    <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:2 }}>{p.pos}</div>
                    <div style={{ display:'flex', gap:6, marginTop:8 }}>
                      <button onClick={() => openEdit(p)} style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:10, color:T.faint }}>✎ Editar</button>
                      <button onClick={e => { e.stopPropagation(); setDeleteId(p.id) }} style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${T.red}33`, background:'transparent', fontFamily:T.dm, fontSize:10, color:T.red }}>🗑 Eliminar</button>
                    </div>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
                  {[
                    { l:'km',   v: p.km ? p.km.toFixed(1) : '-'   },
                    { l:'spr.', v: p.sprints || '-' },
                    { l:'vel',  v: p.vel ? p.vel.toFixed(1) : '-' },
                    { l:'carga',v: p.carga ? p.carga + '%' : '-' },
                  ].map((m, i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,.04)', borderRadius:8, padding:'8px 6px', textAlign:'center' }}>
                      <div style={{ fontFamily:T.mono, fontSize:13, fontWeight:700, color:sportColor }}>{m.v}</div>
                      <div style={{ fontFamily:T.dm, fontSize:9, color:T.faint }}>{m.l}</div>
                    </div>
                  ))}
                </div>

                {p.carga > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:T.dm, fontSize:10, color:T.muted, width:70, flexShrink:0 }}>Carga física</span>
                    <MiniBar val={p.carga} width={80} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* ---------- Table view ---------- */
        <div style={{ ...glass(14), overflow:'hidden', animation:'fadeUp .35s ease both' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {['#', 'Nombre', 'Posición', 'km', 'Spr.', 'Vel.', 'Carga', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', fontFamily:T.dm, fontSize:11, color:T.muted, fontWeight:600, textAlign:'left', letterSpacing:.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const ec = p.estado === 'ok' ? T.green : p.estado === 'alerta' ? T.naranja : T.red
                const el = p.estado === 'ok' ? 'OK' : p.estado === 'alerta' ? 'Alerta' : 'Lesión'
                return (
                  <tr key={p.id}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      borderBottom: `1px solid ${T.border}`,
                      transition: 'all .15s ease',
                      opacity: dragIdx === idx ? 0.4 : 1,
                      cursor: 'grab',
                      animation: `fadeUp .3s ease both`,
                      animationDelay: `${idx * 0.03}s`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding:'10px 14px', fontFamily:T.mono, fontWeight:700, fontSize:12, color:sportColor }}>{p.num}</td>
                    <td style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar player={p} sportColor={sportColor} size={32} />
                      <span style={{ fontFamily:T.dm, fontSize:13, color:T.white }}>{p.name}</span>
                    </td>
                    <td style={{ padding:'10px 14px', fontFamily:T.dm, fontSize:12, color:T.muted }}>{p.pos}</td>
                    <td style={{ padding:'10px 14px', fontFamily:T.mono, fontSize:12, color:T.cian }}>{p.km?.toFixed(1) || '-'}</td>
                    <td style={{ padding:'10px 14px', fontFamily:T.mono, fontSize:12, color:T.cian }}>{p.sprints || '-'}</td>
                    <td style={{ padding:'10px 14px', fontFamily:T.mono, fontSize:12, color:T.naranja }}>{p.vel?.toFixed(1) || '-'}</td>
                    <td style={{ padding:'10px 14px' }}><MiniBar val={p.carga} width={60} /></td>
                    <td style={{ padding:'10px 14px' }}><Badge label={el} color={ec} /></td>
                    <td style={{ padding:'10px 14px', display:'flex', gap:6 }}>
                      <button onClick={() => openEdit(p)} style={{ padding:'3px 8px', borderRadius:5, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:10, color:T.faint }}>✎</button>
                      <button onClick={() => setDeleteId(p.id)} style={{ padding:'3px 8px', borderRadius:5, border:`1px solid ${T.red}33`, background:'transparent', fontFamily:T.dm, fontSize:10, color:T.red }}>🗑</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Injury/alert list */}
      {alertasCnt + lesionados > 0 && (
        <div style={{ ...glass(14), padding:'16px 20px', marginTop:22, border:`1px solid ${T.red}33`, background:'rgba(255,91,91,.04)', animation:'fadeIn .5s ease both' }}>
          <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.red, marginBottom:10 }}>⚠️ Atención requerida</div>
          {players.filter(p => p.estado !== 'ok').map(p => (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:`1px solid ${T.border}` }}>
              <Avatar player={p} sportColor={sportColor} size={28} />
              <span style={{ fontFamily:T.dm, fontSize:13, color:T.white, flex:1 }}>{p.name}</span>
              <Badge label={p.estado === 'alerta' ? 'Sobrecarga' : 'Lesión'} color={p.estado === 'alerta' ? T.naranja : T.red} />
              <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>{p.pos}</span>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && <PlayerFormModal sport={sport} player={editPlayer} onClose={() => { setShowForm(false); setEditPlayer(null) }} onSave={handleSavePlayer} />}
      {deleteId != null && (
        <ConfirmDialog
          title="Eliminar jugador"
          message={`¿Estás seguro de eliminar a "${players.find(p => p.id === deleteId)?.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
      {selPlayer && <PlayerDetailModal player={selPlayer} onClose={() => setSelPlayer(null)} />}
    </div>
  )
}
