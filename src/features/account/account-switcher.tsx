"use client";

import { useTransition } from "react";

import { useRouter } from "@/i18n/routing";

/**
 * Selector de cuenta activa para usuarios con múltiples membresías.
 */
export function AccountSwitcher({
  accounts,
  activeAccountId,
}: {
  accounts: ReadonlyArray<{ accountId: string; role: string }>;
  activeAccountId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (accounts.length <= 1) return null;

  return (
    <select
      aria-label="Switch active account"
      {...(pending ? { "aria-busy": true } : {})}
      disabled={pending}
      value={activeAccountId}
      onChange={(e) => {
        const next = e.target.value;
        // Persiste cambio de cuenta activa y refresca contexto de tenant.
        startTransition(async () => {
          await fetch(`/api/v1/accounts/${next}/switch`, { method: "POST" });
          router.refresh();
        });
      }}
      className="mt-2 w-full rounded-md border border-outline-variant bg-surface p-1 text-xs"
    >
      {accounts.map((m) => (
        <option key={m.accountId} value={m.accountId}>
          {m.accountId.slice(0, 8)} ({m.role})
        </option>
      ))}
    </select>
  );
}
