import type { ReactNode } from "react";

import { cn } from "@/lib/ui/cn";

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className,
  children,
}: FieldProps) {
  return (
    <label htmlFor={htmlFor} className={cn("flex flex-col gap-1 text-xs", className)}>
      <span className="font-label uppercase tracking-[0.08em] text-foreground/72">
        {label}
        {required ? <span className="ml-1 text-error">*</span> : null}
      </span>
      {children}
      {error ? <span role="alert" className="text-xs text-error">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-foreground/55">{hint}</span> : null}
    </label>
  );
}