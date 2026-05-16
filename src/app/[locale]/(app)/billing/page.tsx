import { getTranslations, setRequestLocale } from "next-intl/server";

import { resolveTenantContext } from "@/lib/api/tenant-context";
import { getServices } from "@/infrastructure/service-container";
import { isStripeConfigured } from "@/lib/config/environment";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "App.billing" });
  const tenant = await resolveTenantContext();
  if (!tenant) return <main className="p-6"><p>{t("noTenant")}</p></main>;
  const services = getServices();
  const subscription = await services.deps.subscriptions.getSubscription(tenant.accountId);

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-foreground/70">
          {isStripeConfigured() ? t("stripeReady") : t("stripeStub")}
        </p>
      </header>
      <article className="rounded-md border border-outline-variant bg-surface-container p-4 space-y-2">
        <p className="font-label text-xs uppercase tracking-normal text-secondary">
          {t("currentTier")}
        </p>
        <p className="font-heading text-xl">{subscription?.tier ?? "basic"}</p>
        <p className="text-xs text-foreground/60">
          {t("status", { status: subscription?.status ?? "trialing" })}
        </p>
        <ul className="mt-3 grid gap-1 text-xs text-foreground/70 md:grid-cols-3">
          <li>{t("limitTeams", { value: subscription?.entitlements.teamLimit ?? 0 })}</li>
          <li>{t("limitPlayers", { value: subscription?.entitlements.playerLimit ?? 0 })}</li>
          <li>
            {t("matchMode", {
              value: subscription?.entitlements.features.has("match_mode_realtime")
                ? t("yes")
                : t("no"),
            })}
          </li>
        </ul>
      </article>
    </main>
  );
}
