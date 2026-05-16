"use client";

import { cn } from "@/lib/ui/cn";

type PlayerBrief = {
  id: string;
  displayName: string;
  position?: string;
  jerseyNumber?: string;
};

type SquadPlayer = {
  playerId: string;
  role: "titular" | "suplente" | "banco";
  position?: string;
};

type PitchViewProps = {
  squadPlayers: {
    formation: string;
    players: SquadPlayer[];
  };
  allPlayers: PlayerBrief[];
  onSelectSlot?: (playerId: string | null) => void;
  selectedPlayerId?: string | null;
  compact?: boolean;
  className?: string;
};

function parseFormation(f: string) {
  const nums = f.split("-").map(Number);
  if (nums.length !== 3 || nums.some(isNaN)) return { def: 4, mid: 4, fwd: 2 };
  return { def: nums[0], mid: nums[1], fwd: nums[2] };
}

export function calcRoles(formation: string) {
  const { def, mid, fwd } = parseFormation(formation);
  return [
    "Arquero",
    ...Array(def).fill("Defensor"),
    ...Array(mid).fill("Mediocampista"),
    ...Array(fwd).fill("Delantero"),
  ];
}

export function PitchView({
  squadPlayers,
  allPlayers,
  onSelectSlot,
  selectedPlayerId,
  compact = false,
  className,
}: PitchViewProps) {
  const roles = calcRoles(squadPlayers?.formation || "4-4-2");
  const squad = squadPlayers?.players || [];
  const assigned: Record<string, SquadPlayer> = {};
  squad.forEach((sp) => {
    assigned[sp.playerId] = sp;
  });

  const rows = [
    { label: "ARQ", count: 1, y: 82 },
    { label: "DEF", count: roles.filter((r) => r === "Defensor").length, y: 60 },
    { label: "MED", count: roles.filter((r) => r === "Mediocampista").length, y: 42 },
    { label: "DEL", count: roles.filter((r) => r === "Delantero").length, y: 22 },
  ];

  const unassigned = allPlayers.filter(
    (p) => !assigned[p.id] || assigned[p.id].role !== "titular",
  );

  const w = compact ? 240 : 320;
  const h = compact ? 320 : 420;

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: w, height: h, flexShrink: 0 }}
        className="rounded-md"
      >
        {/* Field background */}
        <rect x="0" y="0" width={w} height={h} rx="6" fill="#1B5E20" stroke="#2E7D32" strokeWidth="2" />
        {/* Inner border */}
        <rect
          x={w * 0.08}
          y={h * 0.03}
          width={w * 0.84}
          height={h * 0.94}
          rx="2"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />
        {/* Center line */}
        <line
          x1={w / 2}
          y1={h * 0.03}
          x2={w / 2}
          y2={h * 0.97}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />
        {/* Center circle */}
        <circle
          cx={w / 2}
          cy={h / 2}
          r={h * 0.1}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />
        {/* Center kickoff dot */}
        <circle cx={w / 2} cy={h / 2} r={2} fill="rgba(255,255,255,0.15)" />
        {/* Top penalty area */}
        <rect
          x={w / 2 - w * 0.06}
          y={h * 0.03}
          width={w * 0.12}
          height={h * 0.08}
          rx="1"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />
        {/* Bottom penalty area */}
        <rect
          x={w / 2 - w * 0.06}
          y={h * 0.89}
          width={w * 0.12}
          height={h * 0.08}
          rx="1"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />

        {/* Player positions */}
        {rows.map((row) => {
          const positions: { x: number; y: number }[] = [];
          for (let i = 0; i < row.count; i++) {
            const spacing = (w * 0.7) / (row.count + 1);
            const px = w * 0.15 + spacing * (i + 1);
            const py = (h * row.y) / 100;
            positions.push({ x: px, y: py });
          }
          return positions.map((pos, i) => {
            const rowIndex = rows.indexOf(row);
            const slotPlayers = squad.filter((sp) => {
              const p = allPlayers.find((ap) => ap.id === sp.playerId);
              if (rowIndex === 0) return p?.position === "Arquero";
              if (rowIndex === 1)
                return (
                  p?.position === "Defensor" ||
                  (p?.position !== "Arquero" &&
                    p?.position !== "Mediocampista" &&
                    p?.position !== "Delantero")
                );
              if (rowIndex === 2) return p?.position === "Mediocampista";
              if (rowIndex === 3) return p?.position === "Delantero";
              return false;
            });
            const sp = slotPlayers[i];
            const player = sp ? allPlayers.find((ap) => ap.id === sp.playerId) : null;
            const r = 7;
            const isSel = selectedPlayerId === sp?.playerId;
            return (
              <g
                key={`${row.label}-${i}`}
                onClick={() => onSelectSlot?.(sp?.playerId || null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={
                    player
                      ? "rgba(70, 199, 240, 0.15)"
                      : "rgba(255,255,255,0.08)"
                  }
                  stroke={
                    isSel
                      ? "#F36C3A"
                      : player
                        ? "#46C7F0"
                        : "rgba(255,255,255,0.15)"
                  }
                  strokeWidth={isSel ? 2 : 0.8}
                />
                {player && (
                  <text
                    x={pos.x}
                    y={pos.y + 1.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={5}
                    fontWeight={700}
                    fontFamily="var(--font-lexend), sans-serif"
                  >
                    {player.jerseyNumber || ""}
                  </text>
                )}
                {player && !compact && (
                  <text
                    x={pos.x}
                    y={pos.y + r + 8}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize={5}
                    fontFamily="var(--font-manrope), sans-serif"
                  >
                    {player.displayName?.split(" ")[0]}
                  </text>
                )}
              </g>
            );
          });
        })}
      </svg>
      {!compact && unassigned.length > 0 && onSelectSlot && (
        <div className="max-h-[300px] overflow-y-auto w-[180px] flex flex-col gap-1">
          <p className="font-label text-[10px] text-foreground/45 px-1 py-1 uppercase tracking-wider">
            Sin asignar
          </p>
          {unassigned.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectSlot(p.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-label transition",
                selectedPlayerId === p.id
                  ? "bg-cian/10 border border-cian/40 text-foreground"
                  : "border border-transparent text-foreground/80 hover:bg-white/5",
              )}
            >
              <span className="font-mono text-[10px] text-foreground/45">
                #{p.jerseyNumber || "-"}
              </span>
              {p.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
