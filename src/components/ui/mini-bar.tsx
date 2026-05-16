import { cn } from "@/lib/ui/cn";

type MiniBarProps = {
  value: number;
  max?: number;
  width?: number;
  className?: string;
};

function barColor(value: number, max: number): string {
  const pct = max > 0 ? (value / max) * 100 : 0;
  if (pct >= 90) return "bg-error";
  if (pct >= 75) return "bg-naranja";
  return "bg-cian";
}

export function MiniBar({ value, max = 100, width = 60, className }: MiniBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className={cn("rounded-full bg-white/5 overflow-hidden", className)}
      style={{ width, height: 5 }}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300", barColor(value, max))}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
