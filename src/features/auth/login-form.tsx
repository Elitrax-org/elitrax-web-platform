"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import {
  signInInputSchema,
  type SignInInput,
} from "@/application/schemas/auth";

type Props = {
  redirectTo: string;
};

/**
 * Formulario de login con validación Zod y manejo de error del backend.
 */
export default function LoginForm({ redirectTo }: Props) {
  const t = useTranslations("Auth.login");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(signInInputSchema) });

  // Envía credenciales y refresca shell al iniciar sesión.
  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      // El formulario delega por completo la autenticación al gateway HTTP para no acoplarse al proveedor real.
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        // Se intenta leer el mensaje del backend, pero siempre hay fallback localizable para UX estable.
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setServerError(payload?.error?.message ?? t("genericError"));
        return;
      }

      // replace evita que el usuario vuelva al login con Back después de una sesión exitosa.
      router.replace(redirectTo as never);
      router.refresh();
    });
  });

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

      <div className="space-y-1">
        <label htmlFor="password" className="font-label text-xs uppercase tracking-normal text-foreground/70">
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
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
