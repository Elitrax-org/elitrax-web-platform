import { T } from '../tokens'

export default function Badge({ label, color = T.cian }) {
  const bg =
    color === T.cian    ? T.cianDim :
    color === T.naranja ? T.naranjaDim :
    color === T.green   ? T.greenDim :
    'rgba(255,255,255,0.07)'

  return (
    <span style={{
      fontFamily: T.dm, fontSize: 10, fontWeight: 600, color,
      background: bg, border: `1px solid ${color}22`,
      borderRadius: 20, padding: '2px 8px',
      letterSpacing: .4, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
