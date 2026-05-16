import { useState, useMemo, useEffect } from 'react'
import { T, glass } from '../tokens'
import { PLAYERS, TEAM_HISTORY, TEAM_EVENT_TYPES, TACTICAS, initials } from '../data'
import { useSession } from '../context/SessionContext'
import { usePlayer } from '../context/PlayerContext'
import { useToast } from '../context/ToastContext'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import PitchView, { calcRoles } from '../components/PitchView'
import TeamEventModal from '../components/TeamEventModal'

function formatDate(d) {
  const dt = new Date(d)
  return dt.toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })
}

const ROLE_LABELS = { titular:'Titular', suplente:'Suplente', banco:'Banco' }
const ROLE_COLORS = { titular:T.cian, suplente:T.naranja, banco:T.faint }

export default function MiEquipoView() {
  const { players:ctxPlayers, updatePlayer } = usePlayer()
  const { squads, addSquad, updateSquad, deleteSquad, addSquadEvent, removeSquadEvent } = useSession()
  const toast = useToast()

  const players = ctxPlayers.length ? ctxPlayers : PLAYERS

  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [searchRival, setSearchRival] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)

  const [formStep, setFormStep] = useState(1)
  const [form, setForm] = useState({
    name:'', type:'partido', date:new Date().toISOString().slice(0,10), rival:'', venue:'',
    formation:'4-4-3', score:{home:0, away:0}, notes:'', players:[], events:[]
  })

  useEffect(() => { const t = setTimeout(() => setLoading(false), 300); return () => clearTimeout(t) }, [])

  const allSquads = useMemo(() => {
    let list = [...squads]
    if (TEAM_HISTORY.length > list.length) list = [...TEAM_HISTORY, ...list]
    if (filterType) list = list.filter(s => s.type === filterType)
    if (searchRival.trim()) list = list.filter(s => s.rival?.toLowerCase().includes(searchRival.toLowerCase()))
    return list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
  }, [squads, filterType, searchRival])

  const squadPlayers = selected?.players || []
  const squadEvents = selected?.events || []

  const resetForm = () => {
    setForm({
      name:'', type:'partido', date:new Date().toISOString().slice(0,10), rival:'', venue:'',
    formation:'4-4-2', score:{home:0, away:0}, notes:'', players:[], events:[]
    })
    setFormStep(1)
  }

  const startCreate = () => { resetForm(); setView('form') }

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const togglePlayerSquad = (playerId) => {
    setForm(prev => {
      const exists = prev.players.find(p => p.playerId === playerId)
      if (exists) return { ...prev, players: prev.players.filter(p => p.playerId !== playerId) }
      const p = players.find(x => x.id === playerId)
      return { ...prev, players: [...prev.players, { playerId, role:'titular', position:p?.pos || '', minutesPlayed:0 }] }
    })
  }

  const setPlayerRole = (playerId, role) => {
    setForm(prev => ({ ...prev, players: prev.players.map(p => p.playerId === playerId ? { ...p, role } : p) }))
  }

  const autoAssign = () => {
    setForm(prev => {
      const roles = calcRoles(form.formation)
      const sorted = [...prev.players].sort((a, b) => {
        const pa = players.find(p => p.id === a.playerId)
        const pb = players.find(p => p.id === b.playerId)
        if (!pa || !pb) return 0
        const idxA = roles.indexOf(pa.pos)
        const idxB = roles.indexOf(pb.pos)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
        return 0
      })
      return {
        ...prev,
        players: sorted.map((p, i) => ({
          ...p,
          role: i < 11 ? 'titular' : i < 16 ? 'suplente' : 'banco',
          position: players.find(x => x.id === p.playerId)?.pos || ''
        }))
      }
    })
  }

  const handleCreate = () => {
    if (form.players.length < 11) { toast.warning('Mínimo 11 jugadores convocados.'); return }
    if (!form.name.trim()) {
      const autoName = form.type === 'partido' && form.rival ? `vs ${form.rival} — ${formatDate(form.date)}` : `Entrenamiento — ${formatDate(form.date)}`
      form.name = autoName
    }
    addSquad(form)
    toast.success('Equipo creado correctamente.')
    setView('list')
  }

  const handleDelete = () => {
    if (deleteId == null) return
    deleteSquad(deleteId)
    toast.success('Equipo eliminado.')
    setDeleteId(null)
    if (selected?.id === deleteId) { setSelected(null); setView('list') }
  }

  const handleAddEvent = (event) => {
    if (!selected) return
    addSquadEvent(selected.id, event)
    const p = players.find(x => x.id === event.playerId)
    if (p) {
      const stats = { ...(p.stats || { partidosJugados:0, minutosJugados:0, goles:0, asistencias:0, amarillas:0, rojas:0 }) }
      if (event.type === 'gol') stats.goles = (stats.goles || 0) + 1
      if (event.type === 'amarilla') stats.amarillas = (stats.amarillas || 0) + 1
      if (event.type === 'roja') stats.rojas = (stats.rojas || 0) + 1
      updatePlayer(event.playerId, { stats })
    }
    if (event.type === 'lesion' && p) updatePlayer(event.playerId, { estado: 'lesion' })
    toast.success('Evento registrado.')
    setShowEventModal(false)
  }

  const handleRemoveEvent = (eventId) => {
    if (!selected) return
    removeSquadEvent(selected.id, eventId)
    toast.info('Evento eliminado.')
  }

  const handleScoreChange = (side, val) => {
    setSelected(prev => {
      const newScore = { ...(prev.score || { home:0, away:0 }), [side]: Math.max(0, (prev.score?.[side] || 0) + val) }
      updateSquad(prev.id, { score: newScore })
      return { ...prev, score: newScore }
    })
  }

  if (loading) return <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}><LoadingSpinner text="Cargando equipos..." /></div>

  /* ==================== LIST VIEW ==================== */
  if (view === 'list') {
    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:24, color:T.white }}>Mi Equipo</div>
            <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>
              {allSquads.length} equipo{allSquads.length !== 1 ? 's' : ''} registrado{allSquads.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={startCreate} style={{ padding:'9px 18px', borderRadius:10, background:`linear-gradient(135deg,${T.cian},#2EB5E0)`, border:'none', fontFamily:T.exo, fontWeight:600, fontSize:12, color:T.bg, cursor:'pointer' }}>
            + CREAR EQUIPO
          </button>
        </div>

        <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
          {['','partido','entrenamiento'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ padding:'6px 16px', borderRadius:20, border:`1.5px solid ${filterType===t ? T.cian : T.border}`, background: filterType===t ? T.cianDim : 'transparent', fontFamily:T.dm, fontSize:12, color: filterType===t ? T.cian : T.muted, cursor:'pointer' }}>
              {t === '' ? 'Todos' : t === 'partido' ? 'Partidos' : 'Entrenamientos'}
            </button>
          ))}
          <input value={searchRival} onChange={e => setSearchRival(e.target.value)} placeholder="Buscar rival..."
            style={{ padding:'6px 14px', borderRadius:20, background:T.bg2, border:`1px solid ${T.border}`, fontFamily:T.dm, fontSize:12, color:T.white, outline:'none', width:180 }} />
        </div>

        {allSquads.length === 0 ? (
          <EmptyState icon="👥" title="Sin equipos" subtitle="Creá tu primer equipo para un partido o entrenamiento." cta="Crear equipo" onCta={startCreate} />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(330px,1fr))', gap:14 }}>
            {allSquads.map(sq => {
              const titulares = sq.players?.filter(p => p.role === 'titular').length || 0
              const total = sq.players?.length || 0
              const eventCount = sq.events?.length || 0
              const goles = sq.events?.filter(e => e.type === 'gol').length || 0
              const isPartido = sq.type === 'partido'
              return (
                <div key={sq.id} onClick={() => { setSelected(sq); setView('detail') }}
                  style={{ ...glass(16), padding:'18px 20px', cursor:'pointer', border:`1px solid ${T.border}`, display:'flex', flexDirection:'column', gap:10, transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = isPartido ? T.naranja+'44' : T.cian+'44'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontFamily:T.dm, fontWeight:600, fontSize:14, color:T.white }}>{sq.name || `vs ${sq.rival}`}</div>
                      <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>{formatDate(sq.date || sq.createdAt)}</div>
                    </div>
                    <Badge label={isPartido ? 'Partido' : 'Entrenamiento'} color={isPartido ? T.naranja : T.cian} />
                  </div>
                  <div style={{ display:'flex', gap:16 }}>
                    {isPartido && sq.score && (
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontFamily:T.mono, fontSize:20, fontWeight:700, color: sq.score.home > sq.score.away ? T.green : T.white }}>
                          {sq.score.home}–{sq.score.away}
                        </span>
                        <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>vs {sq.rival}</span>
                      </div>
                    )}
                    {!isPartido && sq.formation && (
                      <span style={{ fontFamily:T.mono, fontSize:13, color:T.cian }}>{sq.formation}</span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:12, fontSize:11, fontFamily:T.dm, color:T.muted }}>
                    <span>👥 {total} jug.</span>
                    <span>⚽ {goles} gol{goles !== 1 ? 'es' : ''}</span>
                    <span>📋 {eventCount} evento{eventCount !== 1 ? 's' : ''}</span>
                    <span style={{ color: titulares >= 11 ? T.green : T.naranja }}>🟢 {titulares}/11 tit.</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {deleteId != null && (
          <ConfirmDialog title="Eliminar equipo" message="¿Estás seguro? Esta acción no se puede deshacer."
            onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
        )}
      </div>
    )
  }

  /* ==================== FORM VIEW ==================== */
  if (view === 'form') {
    const totalSelected = form.players.length
    const titularesCount = form.players.filter(p => p.role === 'titular').length

    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={() => setView('list')} style={{ background:'none', border:'none', color:T.muted, fontSize:18, cursor:'pointer' }}>←</button>
          <div>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:20, color:T.white }}>Crear equipo</div>
            <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted }}>Paso {formStep} de 3</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:6, marginBottom:20 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex:1, height:4, borderRadius:2, background: formStep >= s ? T.cian : T.border, transition:'background .3s' }} />
          ))}
        </div>

        {/* STEP 1: Info general */}
        {formStep === 1 && (
          <div style={{ ...glass(16), padding:'24px 28px', maxWidth:580 }}>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              {['partido','entrenamiento'].map(t => (
                <button key={t} onClick={() => updateForm('type', t)}
                  style={{ flex:1, padding:'12px 0', borderRadius:10, border:`1.5px solid ${form.type===t ? (t==='partido'?T.naranja:T.cian) : T.border}`, background: form.type===t ? (t==='partido'?T.naranjaDim:T.cianDim) : 'transparent', fontFamily:T.dm, fontSize:14, fontWeight:600, color: form.type===t ? (t==='partido'?T.naranja:T.cian) : T.muted, cursor:'pointer' }}>
                  {t === 'partido' ? '🏟 Partido' : '🏃 Entrenamiento'}
                </button>
              ))}
            </div>

            {form.type === 'partido' && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>RIVAL</div>
                <input value={form.rival} onChange={e => { updateForm('rival', e.target.value); if (!form.name) updateForm('name', `vs ${e.target.value}`) }} placeholder="Nombre del rival"
                  style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }} />
              </div>
            )}

            <div style={{ marginBottom:14 }}>
              <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>CANCHA / LUGAR</div>
              <input value={form.venue} onChange={e => updateForm('venue', e.target.value)} placeholder="Ej: Predio Elitrax"
                style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>FECHA</div>
                <input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)}
                  style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none', colorScheme:'dark' }} />
              </div>
              <div>
                <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>FORMACIÓN</div>
                <select value={form.formation} onChange={e => updateForm('formation', e.target.value)}
                  style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.mono, fontSize:13, color:T.cian, outline:'none' }}>
                  {TACTICAS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>NOMBRE DEL EQUIPO</div>
              <input value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Ej: vs Talleres — Fecha 12"
                style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }} />
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>NOTAS (opcional)</div>
              <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} placeholder="Comentarios sobre el partido/entrenamiento..."
                style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none', resize:'vertical', minHeight:60 }} />
            </div>

            <button onClick={() => setFormStep(2)} disabled={form.type === 'partido' && !form.rival.trim()}
              style={{ width:'100%', padding:'11px 0', borderRadius:10, border:'none', background:`linear-gradient(135deg,${T.cian},#2EB5E0)`, fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.bg, cursor:'pointer', opacity: form.type === 'partido' && !form.rival.trim() ? .5 : 1 }}>
              CONTINUAR — CONVOCAR JUGADORES
            </button>
          </div>
        )}

        {/* STEP 2: Convocar jugadores */}
        {formStep === 2 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16, alignItems:'start' }}>
            <div style={{ ...glass(16), overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>Plantel disponible</div>
                <Badge label={`${totalSelected} convocados`} color={totalSelected >= 11 ? T.green : T.naranja} />
              </div>
              {players.map(p => {
                const selected = form.players.find(x => x.playerId === p.id)
                return (
                  <div key={p.id} onClick={() => togglePlayerSquad(p.id)}
                    style={{ padding:'10px 20px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', borderBottom:`1px solid ${T.border}`, background: selected ? 'rgba(70,199,240,.06)' : 'transparent', transition:'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = selected ? 'rgba(70,199,240,.10)' : 'rgba(255,255,255,.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = selected ? 'rgba(70,199,240,.06)' : 'transparent'}>
                    <div style={{ width:20, height:20, borderRadius:4, border:`1.5px solid ${selected ? T.cian : T.border}`, background: selected ? T.cian : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color: selected ? T.bg : 'transparent', transition:'all .15s' }}>
                      {selected ? '✓' : ''}
                    </div>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${T.cian}44 0%,${T.bg3} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:700, fontSize:9, color:T.cian, flexShrink:0 }}>
                      {initials(p.name)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:T.dm, fontSize:13, color:T.white }}>{p.name}</div>
                      <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>{p.pos} · #{p.num}</div>
                    </div>
                    <Badge label={p.estado === 'ok' ? 'OK' : p.estado} color={p.estado === 'ok' ? T.green : p.estado === 'alerta' ? T.naranja : T.red} />
                  </div>
                )
              })}
            </div>
            <div style={{ ...glass(16), padding:'16px 18px', position:'sticky', top:0 }}>
              <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>Resumen</div>
              {[
                { l:'Convocados', v:totalSelected, c: totalSelected >= 11 ? T.green : T.naranja },
                { l:'Titulares', v: titularesCount, c:T.cian },
                { l:'Faltan para 11', v: Math.max(0, 11 - totalSelected), c: totalSelected >= 11 ? T.green : T.red },
              ].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${T.border}`, fontFamily:T.dm, fontSize:12 }}>
                  <span style={{ color:T.muted }}>{r.l}</span>
                  <span style={{ color:r.c, fontWeight:700, fontFamily:T.mono }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', gap:8, marginTop:16 }}>
                <button onClick={() => setFormStep(1)} style={{ flex:1, padding:'9px 0', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:12, color:T.muted, cursor:'pointer' }}>← Atrás</button>
                <button onClick={() => setFormStep(3)} disabled={totalSelected < 11}
                  style={{ flex:2, padding:'9px 0', borderRadius:8, border:'none', background:`linear-gradient(135deg,${T.cian},#2EB5E0)`, fontFamily:T.exo, fontWeight:700, fontSize:12, color:T.bg, cursor:'pointer', opacity: totalSelected < 11 ? .5 : 1 }}>
                  ARMAR EQUIPO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Armar equipo */}
        {formStep === 3 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start' }}>
            <div style={{ ...glass(16), padding:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>Campo — {form.formation}</div>
                <button onClick={autoAssign} style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:10, color:T.cian, cursor:'pointer' }}>Auto-asignar</button>
              </div>
              <PitchView squadPlayers={{ formation:form.formation, players: form.players.filter(p => p.role==='titular') }} allPlayers={players} />
              <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>ROLES</div>
                {form.players.map(sp => {
                  const p = players.find(x => x.id === sp.playerId)
                  if (!p) return null
                  return (
                    <div key={sp.playerId} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 8px', borderRadius:6, background:'rgba(255,255,255,.03)' }}>
                      <span style={{ fontFamily:T.dm, fontSize:12, color:T.white, flex:1 }}>{p.name}</span>
                      {(['titular','suplente','banco']).map(r => (
                        <button key={r} onClick={() => setPlayerRole(sp.playerId, r)}
                          style={{ padding:'2px 8px', borderRadius:4, border:`1px solid ${sp.role===r ? ROLE_COLORS[r] : T.border}`, background: sp.role===r ? ROLE_COLORS[r]+'22' : 'transparent', fontFamily:T.dm, fontSize:9, color: sp.role===r ? ROLE_COLORS[r] : T.faint, cursor:'pointer' }}>
                          {ROLE_LABELS[r]}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ ...glass(16), padding:'20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>Resumen final</div>
                {[
                  { l:'Tipo', v: form.type === 'partido' ? '🏟 Partido' : '🏃 Entrenamiento' },
                  { l:'Rival', v: form.rival || '—' },
                  { l:'Fecha', v: formatDate(form.date) },
                  { l:'Formación', v: form.formation },
                  { l:'Convocados', v: form.players.length },
                  { l:'Titulares', v: form.players.filter(p => p.role === 'titular').length },
                  { l:'Suplentes', v: form.players.filter(p => p.role === 'suplente').length },
                  { l:'Banco', v: form.players.filter(p => p.role === 'banco').length },
                ].map(r => (
                  <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${T.border}`, fontFamily:T.dm, fontSize:12 }}>
                    <span style={{ color:T.muted }}>{r.l}</span>
                    <span style={{ color:T.white }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setFormStep(2)} style={{ flex:1, padding:'11px 0', borderRadius:10, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:13, color:T.muted, cursor:'pointer' }}>← Atrás</button>
                <button onClick={handleCreate}
                  style={{ flex:2, padding:'11px 0', borderRadius:10, border:'none', background:`linear-gradient(135deg,${T.naranja},#C94E1E)`, fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.white, cursor:'pointer' }}>
                  CREAR EQUIPO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ==================== DETAIL VIEW ==================== */
  if (view === 'detail' && selected) {
    const titulares = squadPlayers.filter(p => p.role === 'titular')
    const suplentes = squadPlayers.filter(p => p.role === 'suplente')
    const banca = squadPlayers.filter(p => p.role === 'banco')
    const goles = squadEvents.filter(e => e.type === 'gol')
    const isPartido = selected.type === 'partido'

    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'28px 32px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => { setSelected(null); setView('list') }} style={{ background:'none', border:'none', color:T.muted, fontSize:18, cursor:'pointer' }}>←</button>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:22, color:T.white }}>{selected.name || `vs ${selected.rival}`}</div>
                <Badge label={isPartido ? 'Partido' : 'Entrenamiento'} color={isPartido ? T.naranja : T.cian} />
              </div>
              <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:2 }}>
                {formatDate(selected.date || selected.createdAt)} · {selected.venue || 'Sin cancha'} · {selected.formation}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {isPartido && (
              <div style={{ ...glass(10), padding:'6px 16px', display:'flex', alignItems:'center', gap:16 }}>
                <button onClick={() => handleScoreChange('home', -1)} style={{ background:'none', border:'none', color:T.muted, fontSize:16, cursor:'pointer', padding:0 }}>−</button>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:T.mono, fontSize:26, fontWeight:700, color: (selected.score?.home || 0) > (selected.score?.away || 0) ? T.green : T.white }}>
                    {selected.score?.home || 0} – {selected.score?.away || 0}
                  </div>
                  <div style={{ fontFamily:T.dm, fontSize:9, color:T.faint }}>vs {selected.rival}</div>
                </div>
                <button onClick={() => handleScoreChange('away', 1)} style={{ background:'none', border:'none', color:T.muted, fontSize:16, cursor:'pointer', padding:0 }}>+</button>
              </div>
            )}
            <button onClick={() => { setDeleteId(selected.id) }} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${T.red}33`, background:'transparent', fontFamily:T.dm, fontSize:11, color:T.red, cursor:'pointer' }}>🗑</button>
          </div>
        </div>

        {/* Content grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Field view */}
          <div style={{ ...glass(16), padding:'20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
            <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:14, alignSelf:'flex-start' }}>XI Titular — {selected.formation}</div>
            <PitchView squadPlayers={{ formation:selected.formation, players: titulares }} allPlayers={players} compact />
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Player lists */}
            <div style={{ ...glass(16), overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`, background:T.bg3 }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>Equipo completo</div>
              </div>
              {[{ label:'Titulares', data:titulares, color:T.cian }, { label:'Suplentes', data:suplentes, color:T.naranja }, { label:'Banco', data:banca, color:T.faint }].map(g => g.data.length > 0 && (
                <div key={g.label}>
                  <div style={{ padding:'8px 16px', fontFamily:T.dm, fontSize:10, color:g.color, background:'rgba(255,255,255,.02)' }}>{g.label} ({g.data.length})</div>
                  {g.data.map(sp => {
                    const p = players.find(x => x.id === sp.playerId)
                    if (!p) return null
                    return (
                      <div key={sp.playerId} style={{ padding:'7px 16px', display:'flex', alignItems:'center', gap:8, borderBottom:`1px solid ${T.border}` }}>
                        <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,${g.color}44,${T.bg3})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:700, fontSize:8, color:g.color }}>
                          {initials(p.name)}
                        </div>
                        <div style={{ flex:1 }}>
                          <span style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>{p.name}</span>
                          <span style={{ fontFamily:T.dm, fontSize:10, color:T.muted, marginLeft:6 }}>#{p.num} · {sp.position}</span>
                        </div>
                        {sp.minutesPlayed > 0 && <span style={{ fontFamily:T.mono, fontSize:10, color:T.faint }}>{sp.minutesPlayed}'</span>}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Events timeline */}
            <div style={{ ...glass(16), overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>Eventos</div>
                <button onClick={() => setShowEventModal(true)} style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:10, color:T.cian, cursor:'pointer' }}>
                  + AGREGAR
                </button>
              </div>
              {squadEvents.length === 0 ? (
                <div style={{ padding:'20px', textAlign:'center', fontFamily:T.dm, fontSize:12, color:T.faint }}>
                  Sin eventos registrados
                </div>
              ) : (
                <div style={{ padding:'12px 16px', maxHeight:300, overflowY:'auto' }}>
                  {squadEvents.sort((a, b) => b.minute - a.minute).map(ev => {
                    const evType = TEAM_EVENT_TYPES.find(t => t.id === ev.type)
                    const p = players.find(x => x.id === ev.playerId)
                    const rp = ev.relatedPlayerId ? players.find(x => x.id === ev.relatedPlayerId) : null
                    return (
                      <div key={ev.id} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:`1px solid ${T.border}`, position:'relative' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:32, flexShrink:0 }}>
                          <div style={{ width:6, height:6, borderRadius:'50%', background: evType?.color || T.faint }} />
                          <div style={{ fontFamily:T.mono, fontSize:9, color:T.faint, marginTop:2 }}>{ev.minute}'</div>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:12 }}>{evType?.icon}</span>
                            <span style={{ fontFamily:T.dm, fontSize:12, color:T.white, fontWeight:500 }}>{evType?.label || ev.type}</span>
                            {p && <span style={{ fontFamily:T.dm, fontSize:12, color:T.muted }}>— {p.name}</span>}
                          </div>
                          {ev.note && <div style={{ fontFamily:T.dm, fontSize:11, color:T.faint, marginTop:2 }}>{ev.note}</div>}
                          {rp && <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>🔄 {ev.type === 'cambio' ? 'Ingresa' : 'Asistencia'}: {rp.name}</div>}
                        </div>
                        <button onClick={() => handleRemoveEvent(ev.id)} style={{ position:'absolute', top:4, right:0, background:'none', border:'none', color:T.red, fontSize:12, cursor:'pointer', opacity:.4 }}>×</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {selected.notes && (
          <div style={{ ...glass(12), padding:'14px 18px', marginTop:16 }}>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:4 }}>NOTAS</div>
            <div style={{ fontFamily:T.dm, fontSize:13, color:T.white }}>{selected.notes}</div>
          </div>
        )}

        {showEventModal && (
          <TeamEventModal squad={selected} allPlayers={players} onClose={() => setShowEventModal(false)} onSave={handleAddEvent} />
        )}

        {deleteId != null && (
          <ConfirmDialog title="Eliminar equipo" message="¿Estás seguro? Esta acción no se puede deshacer."
            onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
        )}
      </div>
    )
  }

  return null
}
