import { T, glass } from '../data'

export default function PlaceholderView({ title, icon, sub }) {
  return (
    <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48, opacity:.4 }}>{icon}</div>
      <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:22, color:T.white }}>{title}</div>
      <div style={{ fontFamily:T.dm, fontSize:14, color:T.muted }}>{sub || 'Próximamente'}</div>
      <div style={{ ...glass(12), padding:'8px 18px', marginTop:4 }}>
        <span style={{ fontFamily:T.dm, fontSize:12, color:T.cian }}>En desarrollo</span>
      </div>
    </div>
  )
}
