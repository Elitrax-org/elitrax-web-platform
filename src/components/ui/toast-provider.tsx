"use client";

import {
  createContext,
  use,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: string;
  title?: string;
  message: string;
  tone: ToastTone;
};

type PushToastInput = {
  title?: string;
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastContextValue = {
  pushToast: (toast: PushToastInput) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClassName: Record<ToastTone, string> = {
  success: "border-success/35 bg-surface-container text-foreground",
  error: "border-error/35 bg-surface-container text-foreground",
  info: "border-secondary/35 bg-surface-container text-foreground",
};

const toneIcon: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: CheckCircle2,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(() => ({
    pushToast: ({ title, message, tone = "info", durationMs = 4200 }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, title, message, tone }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, durationMs);
    },
    dismissToast: (id: string) => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4"
      >
        {toasts.map((toast) => {
          const Icon = toneIcon[toast.tone];
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur",
                toneClassName[toast.tone],
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  toast.tone === "error" ? "text-error" : toast.tone === "success" ? "text-success" : "text-secondary",
                )}
              />
              <div className="min-w-0 flex-1">
                {toast.title ? (
                  <p className="font-label text-xs uppercase tracking-[0.08em] text-foreground/70">
                    {toast.title}
                  </p>
                ) : null}
                <p className="text-sm">{toast.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                aria-label="Dismiss notification"
                onClick={() => value.dismissToast(toast.id)}
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = use(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}