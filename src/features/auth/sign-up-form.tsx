"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/routing";
import {
  signUpInputSchema,
  type SignUpInput,
} from "@/application/schemas/auth";

type Props = {
  redirectTo: string;
};

/**
 * Formulario de registro con validación local y fallback de error servidor.
 */
export default function SignUpForm({ redirectTo }: Props) {
  const t = useTranslations("Auth.signUp");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpInputSchema) });

  // Registra usuario y decide redirección según confirmación de email.
  const onSubmit = handleSubmit((values) => {
    setServerError(null);

    // Se omite `fullName` cuando viene vacío para no ensuciar metadata opcional del proveedor.
    const payload: SignUpInput = {
      email: values.email,
      password: values.password,
      ...(values.fullName ? { fullName: values.fullName } : {}),
    };
    startTransition(async () => {
      const response = await fetch("/api/v1/auth/sign-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setServerError(body?.error?.message ?? t("genericError"));
        return;
      }

      // El flujo bifurca según el provider haya abierto sesión inmediata o requiera confirmación por email.
      const data = (await response.json().catch(() => null)) as
        | { requiresEmailConfirmation?: boolean }
        | null;
      if (data?.requiresEmailConfirmation) {
        router.replace("/sign-up/check-email");
        return;
      }
      router.replace(redirectTo as never);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label
          htmlFor="fullName"
          className="font-label text-xs uppercase tracking-normal text-foreground/70"
        >
          {t("fullNameLabel")}
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          {...register("fullName")}
          className="h-10 w-full rounded-md border border-outline-variant bg-surface-container px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.fullName ? (
          <p className="text-xs text-error">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="font-label text-xs uppercase tracking-normal text-foreground/70"
        >
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
        <label
          htmlFor="password"
          className="font-label text-xs uppercase tracking-normal text-foreground/70"
        >
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
        <p
          role="alert"
          className="rounded-md bg-error/10 px-3 py-2 text-sm text-error"
        >
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
