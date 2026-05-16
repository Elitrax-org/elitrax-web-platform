"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import {
  requestPasswordResetInputSchema,
  type RequestPasswordResetInput,
} from "@/application/schemas/auth";

/**
 * Formulario para solicitar recuperación de contraseña por email.
 */
export default function RecoverForm() {
  const t = useTranslations("Auth.recover");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetInputSchema),
  });

  // Solicita recuperación y muestra estado exitoso cuando aplica.
  const onSubmit = handleSubmit((values) => {
    setServerMessage(null);
    startTransition(async () => {
      // El formulario no diferencia errores funcionales finos para no filtrar información sobre cuentas existentes.
      const response = await fetch("/api/v1/auth/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setServerMessage(payload?.error?.message ?? t("genericError"));
        return;
      }
      setSuccess(true);
    });
  });

  if (success) {
    // Después de un request exitoso se reemplaza el formulario por un estado final simple.
    return (
      <p role="status" className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
        {t("sent")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="email" className="font-label text-xs uppercase tracking-normal text-foreground/70">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="h-10 w-full rounded-md border border-outline-variant bg-surface-container px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.email ? (
          <p className="text-xs text-error">{errors.email.message}</p>
        ) : null}
      </div>

      {serverMessage ? (
        <p role="alert" className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
          {serverMessage}
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
