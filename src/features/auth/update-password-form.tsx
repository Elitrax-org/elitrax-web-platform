"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import {
  updatePasswordInputSchema,
  type UpdatePasswordInput,
} from "@/application/schemas/auth";

type Props = { redirectTo: string };

/**
 * Formulario de actualización de contraseña tras flujo de recuperación.
 */
export default function UpdatePasswordForm({ redirectTo }: Props) {
  const t = useTranslations("Auth.update");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordInputSchema),
  });

  // Envía nueva contraseña y redirige al destino solicitado.
  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      // El endpoint abstrae si la actualización viene de una sesión normal o de un flujo de recuperación restaurado.
      const response = await fetch("/api/v1/auth/update-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setServerError(payload?.error?.message ?? t("genericError"));
        return;
      }

      // replace mantiene la navegación limpia después de cerrar el flujo de recovery/update.
      router.replace(redirectTo as never);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="password" className="font-label text-xs uppercase tracking-normal text-foreground/70">
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          className="h-10 w-full rounded-md border border-outline-variant bg-surface-container px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.password ? (
          <p className="text-xs text-error">{errors.password.message}</p>
        ) : null}
      </div>

      {serverError ? (
        <p role="alert" className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-md bg-primary font-label text-sm font-semibold text-on-primary transition hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
