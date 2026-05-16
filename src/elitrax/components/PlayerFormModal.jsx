import { useState, useEffect } from 'react'
import { T, glass } from '../tokens'
import { POSICIONES_POR_DEPORTE } from '../data'

export default function PlayerFormModal({ sport, player, onClose, onSave }) {
  const positions = POSICIONES_POR_DEPORTE[sport] || []
  const isEdit = !!player

  const [name,      setName]      = useState('')
  const [pos,       setPos]       = useState('')
  const [customPos, setCustomPos] = useState('')
  const [num,       setNum]       = useState('')
  const [photo,     setPhoto]     = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [altura,    setAltura]    = useState('')
  const [peso,      setPeso]      = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')

  useEffect(() => {
    if (player) {
      setName(player.name || '')
      setNum(String(player.num || ''))
      setBirthDate(player.birthDate || '')
      setAltura(player.altura ? String(player.altura) : '')
      setPeso(player.peso ? String(player.peso) : '')
      setEmail(player.email || '')
      setPhone(player.phone || '')
      if (player.photo) setPhotoPreview(player.photo)
      if (positions.includes(player.pos)) {
        setPos(player.pos)
        setCustomPos('')
      } else {
        setPos('custom')
        setCustomPos(player.pos || '')
      }
    }
  }, [player, positions])

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPhoto(ev.target.result); setPhotoPreview(ev.target.result) }
    reader.readAsDataURL(file)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!name.trim()) return
    const finalPos = pos === 'custom' ? customPos.trim() : pos
    if (!finalPos) return
    onSave({
      name: name.trim(), pos: finalPos, num: parseInt(num) || 0,
      birthDate, altura: parseFloat(altura) || 0, peso: parseFloat(peso) || 0,
      email: email.trim(), phone: phone.trim(),
      photo: photo || undefined,
      km: player?.km || 0, sprints: player?.sprints || 0,
      vel: player?.vel || 0, carga: player?.carga || 0, estado: player?.estado || 'ok',
    })
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...glass(20), width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', border:`1px solid ${T.borderHi}`, animation:'fadeUp .25s ease both' }}>
        <div style={{ padding:'20px 24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:17, color:T.white }}>{isEdit ? 'Editar Jugador' : 'Agregar Jugador'}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, lineHeight:1, padding:'2px 6px' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>NOMBRE *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre y apellido"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>N°</label>
              <input value={num} onChange={e => setNum(e.target.value)} placeholder="Ej: 9" type="number"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
          </div>

          <div>
            <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>POSICIÓN *</label>
            <select value={pos} onChange={e => setPos(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }}>
              <option value="">Seleccionar...</option>
              {positions.map(p => <option key={p} value={p}>{p}</option>)}
              <option value="custom">✏️ Otra (personalizada)</option>
            </select>
          </div>

          {pos === 'custom' && (
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>POSICIÓN PERSONALIZADA</label>
              <input value={customPos} onChange={e => setCustomPos(e.target.value)} placeholder="Ej: Líbero, Cierre..."
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>FECHA DE NAC.</label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none', colorScheme:'dark' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>TELÉFONO</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+54 351 123-4567"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>ALTURA (cm)</label>
              <input value={altura} onChange={e => setAltura(e.target.value)} placeholder="178" type="number"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>PESO (kg)</label>
              <input value={peso} onChange={e => setPeso(e.target.value)} placeholder="74" type="number"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
            <div>
              <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>EMAIL</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jugador@mail.com"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none' }} />
            </div>
          </div>

          <div>
            <label style={{ fontFamily:T.dm, fontSize:11, color:T.muted, display:'block', marginBottom:5 }}>FOTO</label>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:T.faint, border:`1px solid ${T.border}` }}>
                {photoPreview ? <img src={photoPreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📷'}
              </div>
              <label style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${T.border}`, fontFamily:T.dm, fontSize:11, color:T.muted, cursor:'pointer' }}>
                {photoPreview ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
              </label>
              {photoPreview && <button type="button" onClick={() => { setPhoto(''); setPhotoPreview('') }} style={{ background:'none', border:'none', color:T.red, fontFamily:T.dm, fontSize:11 }}>Quitar</button>}
            </div>
          </div>

          <button type="submit" style={{ marginTop:6, padding:'12px', borderRadius:10, background:`linear-gradient(135deg,${T.cian},#2389AE)`, border:'none', fontFamily:T.exo, fontWeight:700, fontSize:14, color:T.white, cursor:'pointer' }}>
            {isEdit ? 'GUARDAR CAMBIOS' : 'AGREGAR JUGADOR'}
          </button>
        </form>
      </div>
    </div>
  )
}
