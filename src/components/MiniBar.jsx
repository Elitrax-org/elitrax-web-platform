import { T } from '../data'

export default function MiniBar({ val, max = 100, width = 80 }) {
  const c = val >= 90 ? T.red : val >= 75 ? T.naranja : T.cian
  return (
    <div style={{ width, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min((val / max) * 100, 100)}%`, background: c, borderRadius: 2 }} />
    </div>
  )
}
