import { getTranslations, setRequestLocale } from "next-intl/server";

import { resolveTenantContext } from "@/lib/api/tenant-context";
import { getServices } from "@/infrastructure/service-container";
import { sessionUseCases } from "@/application/use-cases";
import { planAllowsFeature } from "@/domain/billing/feature-entitlement-policy";

export default async function MatchModePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "App.matchMode" });
  const tenant = await resolveTenantContext();
  if (!tenant) return <main className="p-6"><p>{t("noTenant")}</p></main>;
  const services = getServices();
  const subscription = await services.deps.subscriptions.getSubscription(tenant.accountId);
  const allowed = subscription
    ? planAllowsFeature(subscription.entitlements, "match_mode_realtime")
    : false;

  if (!allowed) {
    return (
      <main className="p-6 space-y-3">
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="rounded-md border border-outline-variant bg-surface-container p-4 text-sm text-foreground/80">
          {t("locked")}
        </p>
      </main>
    );
  }

  const sessions = await sessionUseCases.listSessions(services.deps, tenant);
  const upcomingMatch = sessions.find((s) => s.kind === "match");

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-foreground/70">
          {upcomingMatch ? t("liveCopy") : t("idleCopy")}
        </p>
      </header>
      {upcomingMatch ? (
        <p className="rounded-md border border-outline-variant bg-surface-container p-4 text-sm">
          {upcomingMatch.notes ?? t("liveNoNotes")}
        </p>
      ) : null}
    </main>
  );
}
