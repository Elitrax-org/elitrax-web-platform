import { getTranslations, setRequestLocale } from "next-intl/server";
import { Dumbbell } from "lucide-react";

import { resolveTenantContext } from "@/lib/api/tenant-context";
import { getServices } from "@/infrastructure/service-container";
import { sessionUseCases } from "@/application/use-cases";
import { Link } from "@/i18n/routing";
import { buttonVariants, CollectionToolbar, EmptyState } from "@/components/ui";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; kind?: string }>;
};

function normalizeSearch(value?: string) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

export default async function SessionsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const translationsPromise = getTranslations({ locale, namespace: "App.sessions" });
  const queryPromise = searchParams;
  const tenant = await resolveTenantContext();
  if (!tenant) {
    const t = await translationsPromise;
    return <main className="p-6"><p>{t("noTenant")}</p></main>;
  }
  const [t, sessions, query] = await Promise.all([
    translationsPromise,
    sessionUseCases.listSessions(getServices().deps, tenant),
    queryPromise,
  ]);
  const search = normalizeSearch(query.q);
  const selectedKind = query.kind ?? "all";
  const sessionsWithFormattedDate = sessions.map((session) => {
    const formattedScheduledFor = new Date(session.scheduledFor).toLocaleString(locale);
    return {
      ...session,
      formattedScheduledFor,
      localizedSearchText: [
        t(`kindOptions.${session.kind}`),
        formattedScheduledFor,
        session.notes ?? "",
      ].join(" ").toLocaleLowerCase(),
    };
  });
  const filteredSessions = sessionsWithFormattedDate.filter((session) => {
    const matchesSearch = search.length === 0 || session.localizedSearchText.includes(search);
    const matchesKind = selectedKind === "all" || session.kind === selectedKind;
    return matchesSearch && matchesKind;
  });

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-foreground/70">{t("count", { count: filteredSessions.length })}</p>
      </header>

      <CollectionToolbar
        searchLabel={t("searchLabel")}
        searchPlaceholder={t("searchPlaceholder")}
        searchValue={query.q}
        filters={[
          {
            name: "kind",
            label: t("kind"),
            value: selectedKind,
            options: [
              { value: "all", label: t("all") },
              { value: "team_training", label: t("kindOptions.team_training") },
              { value: "gym", label: t("kindOptions.gym") },
              { value: "running", label: t("kindOptions.running") },
              { value: "match", label: t("kindOptions.match") },
              { value: "recovery", label: t("kindOptions.recovery") },
              { value: "other", label: t("kindOptions.other") },
            ],
          },
        ]}
        submitLabel={t("applyFilters")}
        clearLabel={t("clearFilters")}
        clearHref="/sessions"
        createHref="/sessions/new"
        createLabel={t("createNew")}
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={t("title")}
          description={t("empty")}
          action={(
            <Link href="/sessions/new" className={buttonVariants({ variant: "primary", size: "md" })}>
              {t("createNew")}
            </Link>
          )}
        />
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={t("noResultsTitle")}
          description={t("noResultsDescription")}
          action={(
            <Link href="/sessions" className={buttonVariants({ variant: "secondary", size: "md" })}>
              {t("clearFilters")}
            </Link>
          )}
        />
      ) : (
        <ul className="space-y-2">
          {filteredSessions.map((session) => (
            <li key={session.id} className="rounded-md border border-outline-variant bg-surface-container p-4">
              <Link href={`/sessions/${session.id}`} className="block hover:underline">
                <p className="font-label text-xs uppercase tracking-normal text-secondary">
                  {t(`kindOptions.${session.kind}`)}
                </p>
                <p className="mt-1 text-sm text-foreground/80">
                  {session.formattedScheduledFor}
                </p>
                {session.notes ? (
                  <p className="mt-2 text-sm text-foreground/70">{session.notes}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
