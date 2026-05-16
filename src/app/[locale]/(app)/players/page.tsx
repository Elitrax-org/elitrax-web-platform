import { getTranslations, setRequestLocale } from "next-intl/server";
import { UserRound } from "lucide-react";

import { resolveTenantContext } from "@/lib/api/tenant-context";
import { getServices } from "@/infrastructure/service-container";
import { playerUseCases } from "@/application/use-cases";
import { Link } from "@/i18n/routing";
import { buttonVariants, CollectionToolbar, EmptyState } from "@/components/ui";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; position?: string }>;
};

function normalizeSearch(value?: string) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

export default async function PlayersPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const translationsPromise = getTranslations({ locale, namespace: "App.players" });
  const queryPromise = searchParams;
  const tenant = await resolveTenantContext();
  if (!tenant) {
    const t = await translationsPromise;
    return <main className="p-6"><p>{t("noTenant")}</p></main>;
  }
  const services = getServices();
  const [t, players, query] = await Promise.all([
    translationsPromise,
    playerUseCases.listPlayers(services.deps, tenant),
    queryPromise,
  ]);
  const search = normalizeSearch(query.q);
  const selectedPosition = query.position ?? "all";
  const positions = players.reduce<string[]>((list, player) => {
    const position = player.position?.trim();
    if (position && !list.includes(position)) {
      list.push(position);
    }
    return list;
  }, []);
  const positionOptions = positions.sort((left, right) => left.localeCompare(right, locale));
  const filteredPlayers = players.filter((player) => {
    const haystack = [player.displayName, player.position ?? "", player.birthDate ?? ""]
      .join(" ")
      .toLocaleLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search);
    const matchesPosition = selectedPosition === "all" || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-foreground/70">{t("count", { count: filteredPlayers.length })}</p>
      </header>

      <CollectionToolbar
        searchLabel={t("searchLabel")}
        searchPlaceholder={t("searchPlaceholder")}
        searchValue={query.q}
        filters={positionOptions.length > 0
          ? [{
            name: "position",
            label: t("position"),
            value: selectedPosition,
            options: [
              { value: "all", label: t("all") },
              ...positionOptions.map((position) => ({ value: position, label: position })),
            ],
          }]
          : []}
        submitLabel={t("applyFilters")}
        clearLabel={t("clearFilters")}
        clearHref="/players"
        createHref="/players/new"
        createLabel={t("createNew")}
      />

      {players.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title={t("title")}
          description={t("empty")}
          action={(
            <Link href="/players/new" className={buttonVariants({ variant: "primary", size: "md" })}>
              {t("createNew")}
            </Link>
          )}
        />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title={t("noResultsTitle")}
          description={t("noResultsDescription")}
          action={(
            <Link href="/players" className={buttonVariants({ variant: "secondary", size: "md" })}>
              {t("clearFilters")}
            </Link>
          )}
        />
      ) : (
        <ul className="space-y-2">
          {filteredPlayers.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container px-4 py-3"
            >
              <Link href={`/players/${player.id}`} className="flex-1">
                <p className="font-heading text-base hover:underline">{player.displayName}</p>
                {player.position ? (
                  <p className="text-xs uppercase tracking-normal text-secondary">
                    {player.position}
                  </p>
                ) : null}
              </Link>
              {player.birthDate ? (
                <span className="text-xs text-foreground/60">{player.birthDate}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
