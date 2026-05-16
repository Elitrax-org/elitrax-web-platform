import { cn } from "@/lib/ui/cn";

type LoadingSpinnerProps = {
  text?: string;
  className?: string;
};

export function LoadingSpinner({ text, className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12",
        className,
      )}
    >
      <div
        className="size-8 rounded-full border-2 border-outline-variant border-t-cian animate-spin"
        role="status"
        aria-label={text || "Loading"}
      />
      {text ? (
        <p className="font-label text-xs text-foreground/60">{text}</p>
      ) : null}
    </div>
  );
}
