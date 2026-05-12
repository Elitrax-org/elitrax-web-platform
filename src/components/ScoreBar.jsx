import { T } from '../tokens'

export default function ScoreBar({ val }) {
  const n = parseFloat(val)
  const c = n >= 80 ? T.cian : n >= 65 ? T.naranja : T.muted
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:5, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${n}%`, background:c, borderRadius:3 }} />
      </div>
      <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:c, width:38, textAlign:'right' }}>
        {val}
      </span>
    </div>
  )
}
