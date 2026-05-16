"use client";

import { useRouter } from "@/i18n/routing";
import { useTransition } from "react";

/**
 * Botón cliente para cerrar sesión y volver a login.
 */
export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/v1/auth/logout", { method: "POST" });
          router.replace("/login");
          router.refresh();
        });
      }}
      className="w-full rounded-md border border-outline-variant px-3 py-2 text-sm text-foreground/80 hover:bg-surface-container-high disabled:opacity-50"
    >
      {label}
    </button>
  );
}
