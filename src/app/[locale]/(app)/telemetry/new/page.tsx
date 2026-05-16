import { getTranslations, setRequestLocale } from "next-intl/server";

import { TelemetryUploadForm } from "@/features/telemetry/upload-form";
import { Link } from "@/i18n/routing";
import { resolveTenantContext } from "@/lib/api/tenant-context";

export default async function NewTelemetryUploadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const translationsPromise = getTranslations({ locale, namespace: "App.telemetry" });
  const tenant = await resolveTenantContext();

  if (!tenant) {
    const t = await translationsPromise;
    return (
      <main className="p-6">
        <p>{t("noTenant")}</p>
      </main>
    );
  }

  const t = await translationsPromise;

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-2">
        <Link href="/telemetry" className="text-sm text-primary hover:underline">
          {t("backToTelemetry")}
        </Link>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">{t("newTitle")}</h1>
          <p className="text-sm text-foreground/70">{t("newDescription")}</p>
        </div>
      </header>

      <section className="max-w-3xl rounded-xl border border-outline-variant bg-surface-container p-5">
        <TelemetryUploadForm
          accountId={tenant.accountId}
          redirectTo="/telemetry"
          labels={{
            source: t("source"),
            sourceOptions: {
              garmin: t("sources.garmin"),
              polar: t("sources.polar"),
              apple_health: t("sources.apple_health"),
              manual: t("sources.manual"),
              other: t("sources.other"),
            },
            storagePath: t("storagePath"),
            submit: t("register"),
            submitting: t("registering"),
            error: t("registerError"),
            success: t("registerSuccess"),
          }}
        />
      </section>
    </main>
  );
}