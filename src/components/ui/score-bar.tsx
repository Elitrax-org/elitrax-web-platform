import { cn } from "@/lib/ui/cn";

type ScoreBarProps = {
  value: number;
  max?: number;
  className?: string;
};

function barColor(pct: number): string {
  if (pct >= 80) return "bg-cian";
  if (pct >= 65) return "bg-naranja";
  return "bg-white/20";
}

export function ScoreBar({ value, max = 10, className }: ScoreBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 rounded-full bg-white/5 h-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs font-bold text-foreground/80 w-5 text-right">
        {value}
      </span>
    </div>
  );
}
