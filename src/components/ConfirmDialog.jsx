import { T, glass } from '../tokens'

export default function ConfirmDialog({ title, message, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(6px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ ...glass(20), width:'100%', maxWidth:380, border:`1px solid ${T.borderHi}`, animation:'fadeUp .25s ease both', padding:'28px 24px 20px', textAlign:'center' }}
      >
        <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
        <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:17, color:T.white, marginBottom:8 }}>{title || '¿Estás seguro?'}</div>
        {message && <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginBottom:20, lineHeight:1.5 }}>{message}</div>}
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={onCancel} style={{ padding:'10px 20px', borderRadius:10, border:`1px solid ${T.border}`, background:'transparent', fontFamily:T.dm, fontSize:13, color:T.muted }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} style={{ padding:'10px 20px', borderRadius:10, border:'none', background:T.red, fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
