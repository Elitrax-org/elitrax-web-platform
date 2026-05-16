import { getTranslations, setRequestLocale } from "next-intl/server";

import { PlayerCreateForm } from "@/features/players/player-create-form";
import { Link } from "@/i18n/routing";
import { resolveTenantContext } from "@/lib/api/tenant-context";

export default async function NewPlayerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const translationsPromise = getTranslations({ locale, namespace: "App.players" });
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
        <Link href="/players" className="text-sm text-primary hover:underline">
          {t("backToPlayers")}
        </Link>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">{t("newTitle")}</h1>
          <p className="text-sm text-foreground/70">{t("newDescription")}</p>
        </div>
      </header>

      <section className="max-w-3xl rounded-xl border border-outline-variant bg-surface-container p-5">
        <PlayerCreateForm
          redirectTo="/players"
          labels={{
            displayName: t("displayName"),
            position: t("position"),
            birthDate: t("birthDate"),
            submit: t("create"),
            submitting: t("creating"),
            error: t("createError"),
            success: t("createSuccess"),
          }}
        />
      </section>
    </main>
  );
}