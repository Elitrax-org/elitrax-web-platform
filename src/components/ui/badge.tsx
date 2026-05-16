import { cn } from "@/lib/ui/cn";

type BadgeProps = {
  label: string;
  color?: string;
  className?: string;
};

const colorMap: Record<string, string> = {
  "#46C7F0": "bg-cian/10 text-cian border-cian/30",
  "#F36C3A": "bg-naranja/10 text-naranja border-naranja/30",
  "#4ADE80": "bg-green-dim text-success border-success/30",
  "#FF5B5B": "bg-error/10 text-error border-error/30",
};

export function Badge({ label, color, className }: BadgeProps) {
  const defaultColor = "#46C7F0";
  const c = color || defaultColor;
  const classes = colorMap[c] || "bg-secondary/10 text-secondary border-secondary/30";
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wider border",
        classes,
        className,
      )}
    >
      {label}
    </span>
  );
}
