import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldAlert } from "lucide-react";

import { resolveTenantContext } from "@/lib/api/tenant-context";
import { getServices } from "@/infrastructure/service-container";
import { teamUseCases, playerUseCases } from "@/application/use-cases";
import { Link } from "@/i18n/routing";
import { buttonVariants, CollectionToolbar, EmptyState } from "@/components/ui";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; sportType?: string }>;
};

function normalizeSearch(value?: string) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

export default async function TeamsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const translationsPromise = getTranslations({ locale, namespace: "App.teams" });
  const queryPromise = searchParams;
  const tenant = await resolveTenantContext();
  if (!tenant) {
    const t = await translationsPromise;
    return (
      <main className="p-6">
        <p>{t("noTenant")}</p>
      </main>
    );
  }
  const services = getServices();
  const [t, teams, players, query] = await Promise.all([
    translationsPromise,
    teamUseCases.listTeams(services.deps, tenant),
    playerUseCases.listPlayers(services.deps, tenant),
    queryPromise,
  ]);
  const search = normalizeSearch(query.q);
  const selectedSportType = query.sportType ?? "all";
  const filteredTeams = teams.filter((team) => {
    const matchesSearch = search.length === 0 || [
      team.name,
      t(`sportTypes.${team.sportType}`),
    ].some((value) => value.toLocaleLowerCase().includes(search));
    const matchesSportType = selectedSportType === "all" || team.sportType === selectedSportType;
    return matchesSearch && matchesSportType;
  });

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-foreground/70">
          {t("summary", { teams: filteredTeams.length, players: players.length })}
        </p>
      </header>

      <CollectionToolbar
        searchLabel={t("searchLabel")}
        searchPlaceholder={t("searchPlaceholder")}
        searchValue={query.q}
        filters={[
          {
            name: "sportType",
            label: t("sportType"),
            value: selectedSportType,
            options: [
              { value: "all", label: t("all") },
              { value: "football", label: t("sportTypes.football") },
              { value: "hockey", label: t("sportTypes.hockey") },
              { value: "rugby", label: t("sportTypes.rugby") },
            ],
          },
        ]}
        submitLabel={t("applyFilters")}
        clearLabel={t("clearFilters")}
        clearHref="/teams"
        createHref="/teams/new"
        createLabel={t("createNew")}
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={t("title")}
          description={t("empty")}
          action={(
            <Link href="/teams/new" className={buttonVariants({ variant: "primary", size: "md" })}>
              {t("createNew")}
            </Link>
          )}
        />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={t("noResultsTitle")}
          description={t("noResultsDescription")}
          action={(
            <Link href="/teams" className={buttonVariants({ variant: "secondary", size: "md" })}>
              {t("clearFilters")}
            </Link>
          )}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map((team) => (
            <li
              key={team.id}
              className="rounded-md border border-outline-variant bg-surface-container p-4"
            >
              <Link href={`/teams/${team.id}`} className="block">
                <h2 className="font-heading text-lg hover:underline">{team.name}</h2>
              </Link>
              <p className="text-xs uppercase tracking-normal text-secondary">
                {t(`sportTypes.${team.sportType}`)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
