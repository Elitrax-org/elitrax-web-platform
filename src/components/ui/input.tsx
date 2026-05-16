"use client";

import type { InputHTMLAttributes, Ref } from "react";

import { cn } from "@/lib/ui/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>;
};

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 rounded-md border border-outline-variant bg-surface px-3 text-sm text-foreground placeholder:text-foreground/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}

Input.displayName = "Input";