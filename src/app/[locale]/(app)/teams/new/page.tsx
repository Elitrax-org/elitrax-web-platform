import { getTranslations, setRequestLocale } from "next-intl/server";

import { TeamCreateForm } from "@/features/teams/team-create-form";
import { Link } from "@/i18n/routing";
import { resolveTenantContext } from "@/lib/api/tenant-context";

export default async function NewTeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const translationsPromise = getTranslations({ locale, namespace: "App.teams" });
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
        <Link href="/teams" className="text-sm text-primary hover:underline">
          {t("backToTeams")}
        </Link>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">{t("newTitle")}</h1>
          <p className="text-sm text-foreground/70">{t("newDescription")}</p>
        </div>
      </header>

      <section className="max-w-3xl rounded-xl border border-outline-variant bg-surface-container p-5">
        <TeamCreateForm
          redirectTo="/teams"
          labels={{
            name: t("name"),
            sportType: t("sportType"),
            sportTypes: {
              football: t("sportTypes.football"),
              hockey: t("sportTypes.hockey"),
              rugby: t("sportTypes.rugby"),
            },
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