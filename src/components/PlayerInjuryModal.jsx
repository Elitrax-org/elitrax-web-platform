import { useState } from 'react'
import { T, glass } from '../tokens'

const ZONES = ['Isquiotibiales','Cuádriceps','Gemelo','Sóleo','Recto femoral','Aductor','Abductor','Tobillo','Rodilla','Hombro','Muñeca','Espalda baja','Cervical','Otro']
const SEVERITIES = [
  { id:'leve', label:'Leve', color:T.green },
  { id:'moderado', label:'Moderado', color:T.naranja },
  { id:'grave', label:'Grave', color:T.red },
]

export default function PlayerInjuryModal({ player, onClose, onSave }) {
  const [type, setType] = useState('')
  const [zone, setZone] = useState('')
  const [severity, setSeverity] = useState('leve')
  const [recoveryDays, setRecoveryDays] = useState('')
  const [note, setNote] = useState('')

  const handleSave = () => {
    if (!type.trim()) return
    onSave({
      date: new Date().toISOString().slice(0,10),
      type: type.trim(), zone, severity,
      recoveryDays: parseInt(recoveryDays) || 0,
      note: note.trim(),
      closedAt: '',
    })
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...glass(20), width:'100%', maxWidth:460, border:`1px solid ${T.borderHi}`, padding:'20px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:17, color:T.white }}>Registrar lesión — {player?.name}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>TIPO DE LESIÓN *</div>
          <input value={type} onChange={e => setType(e.target.value)} placeholder="Ej: Desgarro fibrilar, Distensión..."
            style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>ZONA</div>
          <select value={zone} onChange={e => setZone(e.target.value)}
            style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }}>
            <option value="">Seleccionar zona...</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>GRAVEDAD</div>
          <div style={{ display:'flex', gap:8 }}>
            {SEVERITIES.map(s => (
              <button key={s.id} onClick={() => setSeverity(s.id)}
                style={{ flex:1, padding:'8px 0', borderRadius:8, border:`1.5px solid ${severity===s.id ? s.color : T.border}`, background: severity===s.id ? `${s.color}22` : 'transparent', fontFamily:T.dm, fontSize:12, color: severity===s.id ? s.color : T.muted, cursor:'pointer' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>DÍAS ESTIMADOS DE RECUPERACIÓN</div>
          <input type="number" min="0" value={recoveryDays} onChange={e => setRecoveryDays(e.target.value)} placeholder="Ej: 21"
            style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>NOTA</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Detalles de la lesión..."
            style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none', resize:'vertical', minHeight:50 }} />
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px 0', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:13, color:T.muted, cursor:'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={!type.trim()}
            style={{ flex:1, padding:'10px 0', borderRadius:8, border:'none', background:`linear-gradient(135deg,${T.red},#CC3333)`, fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.white, cursor:'pointer', opacity: !type.trim() ? .5 : 1 }}>
            REGISTRAR LESIÓN
          </button>
        </div>
      </div>
    </div>
  )
}
