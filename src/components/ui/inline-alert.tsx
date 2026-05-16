import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/ui/cn";

type InlineAlertProps = {
  tone?: "error" | "success" | "info";
  title?: string;
  message: string;
  className?: string;
};

const toneStyles = {
  error: {
    icon: AlertCircle,
    className: "border-error/35 bg-error/10 text-error",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/35 bg-success/10 text-success",
  },
  info: {
    icon: Info,
    className: "border-secondary/35 bg-secondary/10 text-foreground",
  },
} as const;

export function InlineAlert({ tone = "info", title, message, className }: InlineAlertProps) {
  const Icon = toneStyles[tone].icon;
  const content = (
    <>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-0.5">
        {title ? <p className="font-label text-xs uppercase tracking-[0.08em]">{title}</p> : null}
        <p>{message}</p>
      </div>
    </>
  );

  const sharedClassName = cn(
    "flex items-start gap-3 rounded-md border px-3 py-2 text-sm",
    toneStyles[tone].className,
    className,
  );

  if (tone === "error") {
    return <div role="alert" className={sharedClassName}>{content}</div>;
  }

  return <div role="status" className={sharedClassName}>{content}</div>;
}