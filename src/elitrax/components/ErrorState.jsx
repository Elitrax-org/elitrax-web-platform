import { T, glass } from '../tokens'

export default function ErrorState({ title = 'Algo salió mal', message, icon = '⚠️', onRetry }) {
  return (
    <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, padding:'40px 20px' }}>
      <div style={{ fontSize:44, lineHeight:1 }}>{icon}</div>
      <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:17, color:T.white, textAlign:'center' }}>{title}</div>
      {message && <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, textAlign:'center', maxWidth:320, lineHeight:1.6 }}>{message}</div>}
      {onRetry && (
        <button onClick={onRetry} style={{ marginTop:6, padding:'10px 24px', borderRadius:10, background:`linear-gradient(135deg,${T.cian},#2389AE)`, border:'none', fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>
          Reintentar
        </button>
      )}
    </div>
  )
}
