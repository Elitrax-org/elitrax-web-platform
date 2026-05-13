import { useState } from 'react'
import { T, glass } from '../tokens'

export default function NewSessionModal({ onClose, onCreate }) {
  const [tipo,       setTipo]       = useState('Entrenamiento')
  const [rival,      setRival]      = useState('')
  const [fecha,      setFecha]      = useState('')
  const [dur,        setDur]        = useState('90 min')
  const [distance,   setDistance]   = useState('')
  const [maxSpeed,   setMaxSpeed]   = useState('')
  const [avgSpeed,   setAvgSpeed]   = useState('')
  const [spr,        setSpr]        = useState('')
  const [acels,      setAcels]      = useState('')
  const [jumps,      setJumps]      = useState('')
  const [impacts,    setImpacts]    = useState('')
  const [heatZone,   setHeatZone]   = useState('')
  const [explosivity,setExplosivity]= useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (!fecha || !dur) return
    onCreate({
      tipo, rival: tipo === 'Partido' ? rival : '',
      fecha, duration: dur,
      distance: parseFloat(distance) || 0,
      maxSpeed: parseFloat(maxSpeed) || 0,
      avgSpeed: parseFloat(avgSpeed) || 0,
      sprints: parseInt(spr) || 0,
      acels: parseInt(acels) || 0,
      jumps: parseInt(jumps) || 0,
      impacts: parseInt(impacts) || 0,
      heatZone,
      explosivity: parseInt(explosivity) || 0,
    })
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(6px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ ...glass(20), width:'100%', maxWidth:540, border:`1px solid ${T.borderHi}`, animation:'fadeUp .25s ease both' }}
      >
        <div style={{ padding:'20px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:17, color:T.white }}>Nueva Sesión</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, lineHeight:1, padding:'2px 6px' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>

          <div>
            <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>TIPO</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }}>
              <option value="Entrenamiento">Entrenamiento</option>
              <option value="Partido">Partido</option>
            </select>
          </div>

          {tipo === 'Partido' && (
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>RIVAL</label>
              <input value={rival} onChange={e => setRival(e.target.value)} placeholder="Nombre del rival"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>FECHA</label>
              <input value={fecha} onChange={e => setFecha(e.target.value)} placeholder="Ej: 5 May"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>DURACIÓN</label>
              <input value={dur} onChange={e => setDur(e.target.value)} placeholder="Ej: 90 min"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:10, color:T.muted, display:'block', marginBottom:4 }}>DISTANCIA (km)</label>
              <input value={distance} onChange={e => setDistance(e.target.value)} placeholder="9.2" type="number" step="0.1"
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:12, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:10, color:T.muted, display:'block', marginBottom:4 }}>VEL. MÁX (km/h)</label>
              <input value={maxSpeed} onChange={e => setMaxSpeed(e.target.value)} placeholder="32.1" type="number" step="0.1"
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:12, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:10, color:T.muted, display:'block', marginBottom:4 }}>VEL. MEDIA</label>
              <input value={avgSpeed} onChange={e => setAvgSpeed(e.target.value)} placeholder="13.2" type="number" step="0.1"
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:12, outline:'none' }} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:10, color:T.muted, display:'block', marginBottom:4 }}>SPRINTS</label>
              <input value={spr} onChange={e => setSpr(e.target.value)} placeholder="27" type="number"
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:12, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:10, color:T.muted, display:'block', marginBottom:4 }}>ACELERACIONES</label>
              <input value={acels} onChange={e => setAcels(e.target.value)} placeholder="42" type="number"
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:12, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:10, color:T.muted, display:'block', marginBottom:4 }}>SALTOS</label>
              <input value={jumps} onChange={e => setJumps(e.target.value)} placeholder="8" type="number"
                style={{ width:'100%', padding:'9px 10px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:12, outline:'none' }} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>IMPACTOS</label>
              <input value={impacts} onChange={e => setImpacts(e.target.value)} placeholder="Ej: 156" type="number"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>ZONA DE CALOR</label>
              <input value={heatZone} onChange={e => setHeatZone(e.target.value)} placeholder="Ej: Mediocampo izq."
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
          </div>

          <div>
            <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>EXPLOSIVIDAD (0–100)</label>
            <input value={explosivity} onChange={e => setExplosivity(e.target.value)} placeholder="Ej: 78" type="number" min="0" max="100"
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
          </div>

          <button type="submit" style={{ marginTop:6, padding:'12px', borderRadius:10, background:`linear-gradient(135deg,${T.naranja},#C94E1E)`, border:'none', fontFamily:T.exo, fontWeight:700, fontSize:14, color:T.white }}>
            CREAR SESIÓN
          </button>
        </form>
      </div>
    </div>
  )
}
