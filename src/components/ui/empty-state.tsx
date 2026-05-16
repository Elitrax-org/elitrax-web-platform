import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/ui/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-outline-variant bg-surface-container px-5 py-8 text-center",
        className,
      )}
    >
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-foreground/68">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}