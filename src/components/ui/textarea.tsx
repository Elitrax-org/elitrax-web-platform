"use client";

import type { Ref, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/ui/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: Ref<HTMLTextAreaElement>;
};

export function Textarea({ className, ref, ...props }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}

Textarea.displayName = "Textarea";