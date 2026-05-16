"use client";

import type { Ref, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/ui/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  ref?: Ref<HTMLSelectElement>;
};

export function Select({ className, ref, ...props }: SelectProps) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 rounded-md border border-outline-variant bg-surface px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}

Select.displayName = "Select";