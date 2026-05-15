import { useState } from 'react'
import { T, glass } from '../tokens'

export default function PlayerFilesModal({ player, onClose, onSave, onDelete }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fileData, setFileData] = useState('')
  const [fileName, setFileName] = useState('')

  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setFileName(f.name)
    const reader = new FileReader()
    reader.onload = ev => setFileData(ev.target.result)
    reader.readAsDataURL(f)
  }

  const handleSave = () => {
    if (!fileData || !description.trim()) return
    onSave({ name: fileName, type: fileName.split('.').pop() || 'bin', size: fileData.length, description: description.trim(), data: fileData })
    setFileData(''); setFileName(''); setDescription('')
  }

  const files = player?.files || []

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...glass(20), width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', border:`1px solid ${T.borderHi}`, padding:'20px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:17, color:T.white }}>Archivos — {player?.name}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ ...glass(12), padding:'16px', marginBottom:16, border:`1px solid ${T.border}` }}>
          <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>Subir archivo</div>
          <div style={{ marginBottom:10 }}>
            <label style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 14px', borderRadius:8, border:`1px dashed ${T.border}`, background:'rgba(255,255,255,.03)', cursor:'pointer' }}>
              <span style={{ fontSize:20 }}>📄</span>
              <span style={{ fontFamily:T.dm, fontSize:12, color: fileName ? T.white : T.muted }}>{fileName || 'Seleccionar archivo...'}</span>
              <input type="file" onChange={handleFile} style={{ display:'none' }} />
            </label>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginBottom:4 }}>DESCRIPCIÓN *</div>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="¿Qué contiene este archivo?"
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.bg2, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.dm, fontSize:13, outline:'none', resize:'vertical', minHeight:50 }} />
          </div>
          <button onClick={handleSave} disabled={!fileData || !description.trim()}
            style={{ width:'100%', padding:'9px 0', borderRadius:8, border:'none', background:`linear-gradient(135deg,${T.cian},#2EB5E0)`, fontFamily:T.exo, fontWeight:700, fontSize:12, color:T.bg, cursor:'pointer', opacity: !fileData || !description.trim() ? .5 : 1 }}>
            SUBIR ARCHIVO
          </button>
        </div>

        {files.length === 0 ? (
          <div style={{ textAlign:'center', padding:'20px', fontFamily:T.dm, fontSize:12, color:T.faint }}>Sin archivos subidos</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {files.map(f => (
              <div key={f.id} style={{ padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,.03)', border:`1px solid ${T.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:T.dm, fontSize:12, color:T.white, fontWeight:500 }}>{f.name || 'Archivo'}</div>
                    <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:3 }}>{f.description}</div>
                    <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint, marginTop:4 }}>
                      .{f.type} · {f.data ? `${(f.data.length * 0.75 / 1024).toFixed(0)} KB` : ''} · {f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString('es-AR') : ''}
                    </div>
                  </div>
                  <button onClick={() => onDelete(f.id)} style={{ background:'none', border:'none', color:T.red, fontSize:14, cursor:'pointer', opacity:.5, flexShrink:0 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
