import { useState } from 'react'
import { T, glass } from '../tokens'

export default function PlayerClubModal({ player, onClose, onSave }) {
  const [club, setClub] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [category, setCategory] = useState('')

  const handleSave = () => {
    if (!club.trim()) return
    onSave({ club: club.trim(), from: from.trim(), to: to.trim(), category: category.trim() })
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...glass(20), width:'100%', maxWidth:440, border:`1px solid ${T.borderHi}`, padding:'20px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:17, color:T.white }}>Agregar club — {player?.name}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>CLUB *</div>
          <input value={club} onChange={e => setClub(e.target.value)} placeholder="Nombre del club"
            style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>DESDE</div>
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ej: 2020"
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
          </div>
          <div>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>HASTA</div>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Ej: 2023 o Actualidad"
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:5 }}>CATEGORÍA</div>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Juveniles, Reserva, Primera"
            style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px 0', borderRadius:8, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:13, color:T.muted, cursor:'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={!club.trim()}
            style={{ flex:1, padding:'10px 0', borderRadius:8, border:'none', background:`linear-gradient(135deg,${T.cian},#2EB5E0)`, fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.bg, cursor:'pointer', opacity: !club.trim() ? .5 : 1 }}>
            AGREGAR CLUB
          </button>
        </div>
      </div>
    </div>
  )
}
