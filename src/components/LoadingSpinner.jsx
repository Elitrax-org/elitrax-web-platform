import { T } from '../tokens'

export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, padding:'40px 20px' }}>
      <div style={{
        width:32, height:32,
        border:'3px solid rgba(255,255,255,0.06)',
        borderTop:'3px solid #46C7F0',
        borderRadius:'50%',
        animation:'spin .7s linear infinite',
      }} />
      <span style={{ fontFamily:T.dm, fontSize:13, color:T.muted }}>{text}</span>
    </div>
  )
}
