import { useState } from 'react'
import { T, glass } from '../tokens'
import { TEAM_EVENT_TYPES } from '../data'

export default function TeamEventModal({ squad, allPlayers, onClose, onSave }) {
  const squadPlayers = squad?.players || []
  const [type, setType] = useState('gol')
  const [playerId, setPlayerId] = useState('')
  const [minute, setMinute] = useState('')
  const [relatedId, setRelatedId] = useState('')
  const [note, setNote] = useState('')

  const playersInSquad = squadPlayers
    .map(sp => allPlayers.find(p => p.id === sp.playerId))
    .filter(Boolean)

  const isSubstitution = type === 'cambio'
  const needsRelated = type === 'asistencia' || type === 'cambio'

  const handleSave = () => {
    if (!playerId || !minute) return
    onSave({
      type,
      playerId: Number(playerId),
      minute: Number(minute),
      relatedPlayerId: needsRelated && relatedId ? Number(relatedId) : null,
      note,
    })
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...glass(20), width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto', border:`1px solid ${T.borderHi}`, padding:'24px 28px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:17, color:T.white }}>Registrar evento</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>TIPO</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {TEAM_EVENT_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${type===t.id ? t.color : T.border}`, background: type===t.id ? `${t.color}22` : 'transparent', fontFamily:T.dm, fontSize:12, color: type===t.id ? t.color : T.muted, cursor:'pointer' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>JUGADOR</div>
          <select value={playerId} onChange={e => setPlayerId(e.target.value)}
            style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }}>
            <option value="">Seleccionar jugador...</option>
            {playersInSquad.map(p => (
              <option key={p.id} value={p.id}>#{p.num} {p.name} ({p.pos})</option>
            ))}
          </select>
        </div>

        {needsRelated && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>
              {type === 'asistencia' ? 'ASISTIÓ' : 'INGRESA'}
            </div>
            <select value={relatedId} onChange={e => setRelatedId(e.target.value)}
              style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }}>
              <option value="">{type === 'asistencia' ? '¿Quién asistió?' : '¿Quién ingresó?'}</option>
              {playersInSquad.filter(p => p.id !== Number(playerId)).map(p => (
                <option key={p.id} value={p.id}>#{p.num} {p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>MINUTO</div>
          <input type="number" min="0" max="120" value={minute} onChange={e => setMinute(e.target.value)}
            placeholder="Ej: 23"
            style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }} />
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:6 }}>NOTA (opcional)</div>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Descripción del evento..."
            style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none', resize:'vertical', minHeight:60 }} />
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px 0', borderRadius:10, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:13, color:T.muted, cursor:'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={!playerId || !minute}
            style={{ flex:1, padding:'11px 0', borderRadius:10, border:'none', background:`linear-gradient(135deg,${T.cian},#2EB5E0)`, fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.bg, cursor:'pointer', opacity: !playerId || !minute ? .5 : 1 }}>
            GUARDAR EVENTO
          </button>
        </div>
      </div>
    </div>
  )
}
