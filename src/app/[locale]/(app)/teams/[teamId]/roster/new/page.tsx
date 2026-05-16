import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { playerUseCases, teamUseCases } from "@/application/use-cases";
import { TeamRosterAddPlayersForm } from "@/features/teams/team-roster-add-players-form";
import { getServices } from "@/infrastructure/service-container";
import { Link } from "@/i18n/routing";
import { resolveTenantContext } from "@/lib/api/tenant-context";

export default async function TeamRosterNewPage({
  params,
}: {
  params: Promise<{ locale: string; teamId: string }>;
}) {
  const { locale, teamId } = await params;
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

  const services = getServices();
  const [t, team, roster, players] = await Promise.all([
    translationsPromise,
    teamUseCases.getTeamOrThrow(services.deps, tenant, teamId).catch(() => null),
    teamUseCases.listTeamPlayers(services.deps, tenant, teamId),
    playerUseCases.listPlayers(services.deps, tenant),
  ]);

  if (!team) notFound();

  const rosterPlayerIds = new Set(roster.map((entry) => entry.playerId));
  const availablePlayers = players.filter((player) => !rosterPlayerIds.has(player.id));

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-2">
        <Link href={`/teams/${team.id}`} className="text-sm text-primary hover:underline">
          {t("backToTeam")}
        </Link>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-normal text-secondary">{team.name}</p>
          <h1 className="font-heading text-2xl font-semibold">{t("addPlayersTitle")}</h1>
          <p className="text-sm text-foreground/70">{t("addPlayersDescription")}</p>
          <p className="text-xs text-foreground/60">{t("rosterCount", { count: roster.length })}</p>
        </div>
      </header>

      <section className="rounded-xl border border-outline-variant bg-surface-container p-5">
        <TeamRosterAddPlayersForm
          teamId={team.id}
          availablePlayers={availablePlayers}
          labels={{
            assignExisting: t("assignExisting"),
            assigningExisting: t("assigningExisting"),
            createAndAssign: t("createAndAssign"),
            creatingAndAssigning: t("creatingAndAssigning"),
            displayName: t("displayName"),
            position: t("position"),
            birthDate: t("birthDate"),
            jerseyNumber: t("jerseyNumber"),
            player: t("player"),
            noAvailablePlayers: t("noAvailablePlayers"),
            addError: t("addPlayerError"),
            assignSuccess: t("assignSuccess"),
            createAssignSuccess: t("createAssignSuccess"),
          }}
        />
      </section>
    </main>
  );
}