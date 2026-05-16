"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/routing";
import {
  onboardingInputSchema,
  type OnboardingInput,
} from "@/application/schemas";
import { planTiers } from "@/domain/billing/feature-entitlement-policy";
import { billingIntervals } from "@/domain/shared/money";
import { LogoutButton } from "@/features/auth/logout-button";

const INPUT_CLASS =
  "rounded-md border border-outline-variant bg-surface p-2 text-sm";
const INPUT_CLASS_UPPER = `${INPUT_CLASS} uppercase`;

const DEFAULT_VALUES: OnboardingInput = {
  account: {
    type: "corporate",
    displayName: "",
    address: {
      countryCode: "",
      city: "",
      line1: "",
      line2: "",
      postalCode: "",
      region: "",
    },
    contact: { email: "", phone: "" },
    billing: {
      legalName: "",
      taxId: "",
      billingEmail: "",
      billingAddress: {
        countryCode: "",
        city: "",
        line1: "",
        line2: "",
        postalCode: "",
        region: "",
      },
    },
  },
  subscription: { tier: "basic", interval: "monthly" },
};

/**
 * Wizard de onboarding en dos pasos:
 * 1) perfil de cuenta y datos de facturación
 * 2) selección de plan e intervalo de suscripción
 */
export function OnboardingWizard() {
  const t = useTranslations("Onboarding");
  const tShell = useTranslations("App.shell");
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reuseAddressForBilling, setReuseAddressForBilling] = useState(true);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingInputSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  });

  const accountType = useWatch({ control, name: "account.type" });
  const selectedTier = useWatch({ control, name: "subscription.tier" });
  const selectedInterval = useWatch({ control, name: "subscription.interval" });

  // Valida paso 1 antes de habilitar selección de plan.
  async function goToStep2() {
    if (reuseAddressForBilling) {
      const address = getValues("account.address");
      setValue("account.billing.billingAddress", address, {
        shouldValidate: false,
      });
    }
    const ok = await trigger("account");
    if (ok) {
      setSubmitError(null);
      setStep(2);
    }
  }

  // Envía onboarding completo y redirige según necesidad de checkout.
  function onSubmit(values: OnboardingInput) {
    startTransition(async () => {
      setSubmitError(null);
      const payload: OnboardingInput = reuseAddressForBilling
        ? {
            ...values,
            account: {
              ...values.account,
              billing: {
                ...values.account.billing,
                billingAddress: values.account.address,
              },
            },
          }
        : values;
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setSubmitError(t("genericError"));
        return;
      }
      const result = (await res.json()) as { requiresCheckout?: boolean };
      if (result.requiresCheckout) {
        router.replace("/billing");
      } else {
        router.replace("/");
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <ol className="flex items-center gap-4 font-label text-xs uppercase tracking-normal text-secondary">
        <li className={step === 1 ? "text-primary" : undefined}>
          1. {t("steps.account")}
        </li>
        <li aria-hidden="true">·</li>
        <li className={step === 2 ? "text-primary" : undefined}>
          2. {t("steps.subscription")}
        </li>
      </ol>

      {step === 1 ? (
        <div className="grid gap-4">
          <fieldset className="grid gap-2">
            <legend className="font-label text-xs uppercase tracking-normal text-secondary">
              {t("account.typeLegend")}
            </legend>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="individual" {...register("account.type")} />
                {t("account.typeIndividual")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="corporate" {...register("account.type")} />
                {t("account.typeCorporate")}
              </label>
            </div>
          </fieldset>

          <Field
            label={t("account.displayName")}
            error={errors.account?.displayName?.message}
          >
            <input
              {...register("account.displayName")}
              className={INPUT_CLASS}
              autoComplete="organization"
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label={t("account.country")}
              error={errors.account?.address?.countryCode?.message}
            >
              <input
                {...register("account.address.countryCode")}
                placeholder="US"
                maxLength={2}
                className={INPUT_CLASS_UPPER}
              />
            </Field>
            <Field
              label={t("account.city")}
              error={errors.account?.address?.city?.message}
            >
              <input {...register("account.address.city")} className={INPUT_CLASS} />
            </Field>
          </div>
          <Field
            label={t("account.line1")}
            error={errors.account?.address?.line1?.message}
          >
            <input {...register("account.address.line1")} className={INPUT_CLASS} />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label={t("account.line2")}>
              <input {...register("account.address.line2")} className={INPUT_CLASS} />
            </Field>
            <Field label={t("account.postalCode")}>
              <input {...register("account.address.postalCode")} className={INPUT_CLASS} />
            </Field>
            <Field label={t("account.region")}>
              <input {...register("account.address.region")} className={INPUT_CLASS} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label={t("account.contactEmail")}
              error={errors.account?.contact?.email?.message}
            >
              <input
                type="email"
                {...register("account.contact.email")}
                className={INPUT_CLASS}
                autoComplete="email"
              />
            </Field>
            <Field
              label={t("account.contactPhone")}
              error={errors.account?.contact?.phone?.message}
            >
              <input
                {...register("account.contact.phone")}
                className={INPUT_CLASS}
                autoComplete="tel"
                placeholder="+15551234567"
              />
            </Field>
          </div>

          <fieldset className="grid gap-3 rounded-md border border-outline-variant bg-surface-container-high p-3">
            <legend className="font-label text-xs uppercase tracking-normal text-secondary">
              {t("billing.legend")}
            </legend>
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label={
                  accountType === "corporate"
                    ? t("billing.legalNameRequired")
                    : t("billing.legalName")
                }
                error={errors.account?.billing?.legalName?.message}
              >
                <input {...register("account.billing.legalName")} className={INPUT_CLASS} />
              </Field>
              <Field
                label={
                  accountType === "corporate"
                    ? t("billing.taxIdRequired")
                    : t("billing.taxId")
                }
                error={errors.account?.billing?.taxId?.message}
              >
                <input {...register("account.billing.taxId")} className={INPUT_CLASS} />
              </Field>
            </div>
            <Field
              label={t("billing.email")}
              error={errors.account?.billing?.billingEmail?.message}
            >
              <input
                type="email"
                {...register("account.billing.billingEmail")}
                className={INPUT_CLASS}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={reuseAddressForBilling}
                onChange={(e) => setReuseAddressForBilling(e.target.checked)}
              />
              {t("billing.reuseAddress")}
            </label>
            {!reuseAddressForBilling ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label={t("account.country")}
                  error={
                    errors.account?.billing?.billingAddress?.countryCode?.message
                  }
                >
                  <input
                    {...register("account.billing.billingAddress.countryCode")}
                    maxLength={2}
                    className={INPUT_CLASS_UPPER}
                  />
                </Field>
                <Field
                  label={t("account.city")}
                  error={errors.account?.billing?.billingAddress?.city?.message}
                >
                  <input
                    {...register("account.billing.billingAddress.city")}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field
                  label={t("account.line1")}
                  error={errors.account?.billing?.billingAddress?.line1?.message}
                >
                  <input
                    {...register("account.billing.billingAddress.line1")}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label={t("account.postalCode")}>
                  <input
                    {...register("account.billing.billingAddress.postalCode")}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            ) : null}
          </fieldset>

          <div className="flex items-center justify-end gap-3">
            <div className="w-auto">
              <LogoutButton label={tShell("signOut")} />
            </div>
            <button
              type="button"
              onClick={goToStep2}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
            >
              {t("nextStep")}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            {planTiers.map((tier) => {
              const active = selectedTier === tier;
              return (
                <label
                  key={tier}
                  className={`flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition ${
                    active
                      ? "border-primary bg-surface-container-high"
                      : "border-outline-variant bg-surface-container hover:border-primary/60"
                  }`}
                >
                  <input
                    type="radio"
                    value={tier}
                    {...register("subscription.tier")}
                    className="sr-only"
                  />
                  <span className="font-heading text-lg">{t(`plans.${tier}.name`)}</span>
                  <span className="font-label text-xs uppercase tracking-normal text-secondary">
                    {t(`plans.${tier}.tagline`)}
                  </span>
                  <span className="text-sm text-foreground/70">
                    {t(`plans.${tier}.description`)}
                  </span>
                </label>
              );
            })}
          </div>

          <fieldset className="grid gap-2">
            <legend className="font-label text-xs uppercase tracking-normal text-secondary">
              {t("intervalLegend")}
            </legend>
            <div className="flex gap-3">
              {billingIntervals.map((interval) => (
                <label key={interval} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={interval}
                    {...register("subscription.interval")}
                  />
                  {t(`intervals.${interval}`)}
                </label>
              ))}
            </div>
            <p className="text-xs text-foreground/60">
              {selectedInterval === "yearly"
                ? t("intervals.yearlyHint")
                : t("intervals.monthlyHint")}
            </p>
          </fieldset>

          {selectedTier !== "basic" ? (
            <p className="rounded-md border border-outline-variant bg-surface-container-high p-3 text-xs text-foreground/70">
              {t("checkoutNotice")}
            </p>
          ) : null}

          {submitError ? (
            <p className="text-sm text-error">{submitError}</p>
          ) : null}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md border border-outline-variant px-4 py-2 text-sm"
              disabled={pending}
            >
              {t("back")}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-auto">
                <LogoutButton label={tShell("signOut")} />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-50"
              >
                {pending ? t("submitting") : t("submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

/** Campo reutilizable con label + error para formularios del wizard. */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-label uppercase tracking-normal text-secondary">
        {label}
      </span>
      {children}
      {error ? <span className="text-error">{error}</span> : null}
    </label>
  );
}
