import { T } from '../tokens'

function parseFormation(f) {
  const nums = f.split('-').map(Number)
  if (nums.length !== 3 || nums.some(isNaN)) return { def: 4, mid: 4, fwd: 2 }
  return { def: nums[0], mid: nums[1], fwd: nums[2] }
}

export function calcRoles(formation) {
  const { def, mid, fwd } = parseFormation(formation)
  return ['Arquero', ...Array(def).fill('Defensor'), ...Array(mid).fill('Mediocampista'), ...Array(fwd).fill('Delantero')]
}

export default function PitchView({ squadPlayers, allPlayers, onSelectSlot, selectedPlayerId, compact }) {
  const roles = calcRoles(squadPlayers?.formation || '4-4-2')
  const squad = squadPlayers?.players || []
  const assigned = {}
  squad.forEach(sp => { assigned[sp.playerId] = sp })

  const rows = [
    { label: 'ARQ', count: 1, y: 82 },
    { label: 'DEF', count: roles.filter(r => r === 'Defensor').length, y: 60 },
    { label: 'MED', count: roles.filter(r => r === 'Mediocampista').length, y: 42 },
    { label: 'DEL', count: roles.filter(r => r === 'Delantero').length, y: 22 },
  ]

  const unassigned = allPlayers?.filter(p => !assigned[p.id] || assigned[p.id].role !== 'titular') || []

  const w = compact ? 240 : 320
  const h = compact ? 320 : 420

  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'center' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h, flexShrink:0 }}>
        <rect x="0" y="0" width={w} height={h} rx="6" fill="#1B5E20" stroke="#2E7D32" strokeWidth="2" />
        <rect x={w*0.08} y={h*0.03} width={w*0.84} height={h*0.94} rx="2" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <line x1={w/2} y1={h*0.03} x2={w/2} y2={h*0.97} stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <circle cx={w/2} cy={h/2} r={h*0.1} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <rect x={w/2 - w*0.06} y={h*0.03} width={w*0.12} height={h*0.08} rx="1" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <rect x={w/2 - w*0.06} y={h*0.89} width={w*0.12} height={h*0.08} rx="1" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        {rows.map(row => {
          const positions = []
          for (let i = 0; i < row.count; i++) {
            const spacing = w * 0.7 / (row.count + 1)
            const px = w*0.15 + spacing * (i + 1)
            const py = h * row.y / 100
            positions.push({ x: px, y: py })
          }
          return positions.map((pos, i) => {
            const slotIdx = { 0: 'GK', 1: 'DEF', 2: 'MID', 3: 'FWD' }[rows.indexOf(row)]
            const slotPlayers = squad.filter(sp => {
              const p = allPlayers?.find(ap => ap.id === sp.playerId)
              if (rows.indexOf(row) === 0) return p?.pos === 'Arquero'
              if (rows.indexOf(row) === 1) return p?.pos === 'Defensor' || (p?.pos !== 'Arquero' && p?.pos !== 'Mediocampista' && p?.pos !== 'Delantero')
              if (rows.indexOf(row) === 2) return p?.pos === 'Mediocampista'
              if (rows.indexOf(row) === 3) return p?.pos === 'Delantero'
              return false
            })
            const sp = slotPlayers[i]
            const player = sp ? allPlayers?.find(ap => ap.id === sp.playerId) : null
            const r = 7
            const isSel = selectedPlayerId === sp?.playerId
            return (
              <g key={`${row.label}-${i}`} onClick={() => onSelectSlot && onSelectSlot(sp?.playerId || null)} style={{ cursor:'pointer' }}>
                <circle cx={pos.x} cy={pos.y} r={r} fill={player ? T.cianDim : 'rgba(255,255,255,0.08)'} stroke={isSel ? T.naranja : player ? T.cian : 'rgba(255,255,255,0.15)'} strokeWidth={isSel ? 2 : 0.8} />
                {player && (
                  <text x={pos.x} y={pos.y + 2} textAnchor="middle" fill={T.white} fontSize={5} fontWeight={700} fontFamily="DM Sans">
                    {player.num || ''}
                  </text>
                )}
                {player && !compact && (
                  <text x={pos.x} y={pos.y + r + 8} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={5} fontFamily="DM Sans">
                    {player.name?.split(' ')[0]}
                  </text>
                )}
              </g>
            )
          })
        })}
      </svg>
      {!compact && unassigned.length > 0 && onSelectSlot && (
        <div style={{ maxHeight:300, overflowY:'auto', width:180, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint, padding:'4px 0' }}>SIN ASIGNAR</div>
          {unassigned.map(p => (
            <div key={p.id} onClick={() => onSelectSlot(p.id)}
              style={{ padding:'4px 8px', borderRadius:6, background: selectedPlayerId === p.id ? T.cianDim : 'transparent', border:`1px solid ${selectedPlayerId === p.id ? T.cian : T.border}`, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:T.dm, color:T.white }}>
              <span style={{ fontFamily:T.mono, fontSize:9, color:T.faint }}>#{p.num}</span>
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
