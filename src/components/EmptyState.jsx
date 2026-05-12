import { T } from '../data'

export default function EmptyState({ icon, title, subtitle, cta, onCta }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:'36px 20px' }}>
      <div style={{ fontSize:36, lineHeight:1 }}>{icon || '📭'}</div>
      <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:15, color:T.white, textAlign:'center' }}>{title}</div>
      {subtitle && <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, textAlign:'center', maxWidth:280 }}>{subtitle}</div>}
      {cta && onCta && (
        <button onClick={onCta} style={{ marginTop:6, padding:'10px 22px', borderRadius:10, background:`linear-gradient(135deg,${T.cian},#2389AE)`, border:'none', fontFamily:T.exo, fontWeight:600, fontSize:12, color:T.white }}>
          {cta}
        </button>
      )}
    </div>
  )
}
