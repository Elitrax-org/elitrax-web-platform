import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { gymUseCases, playerUseCases, performanceStatsUseCases, sessionUseCases } from "@/application/use-cases";
import { PlayerSessionStatsViewPanel } from "@/features/performance/player-session-stats-view";
import { GymLogForm } from "@/features/sessions/gym-log-form";
import { MatchEventForm } from "@/features/sessions/match-event-form";
import { Link } from "@/i18n/routing";
import { getServices } from "@/infrastructure/service-container";
import { resolveTenantContext } from "@/lib/api/tenant-context";

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; sessionId: string }>;
  searchParams: Promise<{
    playerId?: string;
    compareSessionId?: string;
    sportType?: "football" | "hockey" | "rugby";
    compareSportType?: "football" | "hockey" | "rugby";
  }>;
}) {
  const { locale, sessionId } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "App.sessionDetail" });
  const tenant = await resolveTenantContext();
  if (!tenant) return <main className="p-6"><p>{t("noTenant")}</p></main>;

  const services = getServices();
  const sessions = await sessionUseCases.listSessions(services.deps, tenant);
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) notFound();

  const events = await sessionUseCases.listMatchEvents(services.deps, tenant, sessionId);
  const showEventForm = session.kind === "match";
  const showGymForm = session.kind === "gym";
  const gymLogs = showGymForm
    ? await gymUseCases.listGymLogs(services.deps, tenant, sessionId)
    : [];
  const allPlayers = await playerUseCases.listPlayers(services.deps, tenant);
  const statsPlayers = await performanceStatsUseCases.listPlayersForSessionStats(
    services.deps,
    tenant,
    sessionId,
  );
  const selectedPlayerId = query.playerId ?? statsPlayers[0]?.id;
  const statsView = selectedPlayerId
    ? await performanceStatsUseCases
        .getPlayerSessionStats(services.deps, tenant, {
          playerId: selectedPlayerId,
          sessionId,
          sportType: query.sportType,
          compareSessionId: query.compareSessionId,
          compareSportType: query.compareSportType,
        })
        .catch(() => null)
    : null;

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{session.kind}</h1>
          <p className="text-xs uppercase tracking-normal text-secondary">
            {session.scheduledFor}
          </p>
        </div>
        <Link href="/sessions" className="text-sm text-primary hover:underline">
          {t("back")}
        </Link>
      </header>

      {session.notes ? (
        <p className="rounded-md border border-outline-variant bg-surface-container p-3 text-sm">
          {session.notes}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-heading text-lg">{t("events")}</h2>
        {showEventForm ? (
          <MatchEventForm
            sessionId={session.id}
            labels={{
              kind: t("eventKind"),
              minute: t("eventMinute"),
              submit: t("addEvent"),
              submitting: t("adding"),
              error: t("eventError"),
            }}
          />
        ) : null}
        {events.length === 0 ? (
          <p className="text-sm text-foreground/70">{t("noEvents")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-baseline justify-between rounded-md border border-outline-variant bg-surface-container px-3 py-2"
              >
                <span className="font-heading">{event.kind}</span>
                <span className="text-xs text-foreground/60">
                  {event.matchMinute != null ? `${event.matchMinute}'` : event.occurredAt}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showGymForm ? (
        <section className="space-y-3">
          <h2 className="font-heading text-lg">{t("gymLogs")}</h2>
          <GymLogForm
            sessionId={session.id}
            players={allPlayers}
            labels={{
              player: t("gymPlayer"),
              exercise: t("gymExercise"),
              performedAt: t("gymPerformedAt"),
              weight: t("gymWeight"),
              reps: t("gymReps"),
              rpe: t("gymRpe"),
              addSet: t("gymAddSet"),
              removeSet: t("gymRemoveSet"),
              submit: t("gymSubmit"),
              submitting: t("gymSubmitting"),
              error: t("gymError"),
              noPlayers: t("gymNoPlayers"),
            }}
          />
          {gymLogs.length === 0 ? (
            <p className="text-sm text-foreground/70">{t("gymNoLogs")}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {gymLogs.map((log) => {
                const totalVolume = log.sets.reduce(
                  (acc, s) => acc + s.weightKilograms * s.repetitions,
                  0,
                );
                const player = allPlayers.find((p) => p.id === log.playerId);
                return (
                  <li
                    key={log.id}
                    className="rounded-md border border-outline-variant bg-surface-container px-3 py-2"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-heading">
                        {log.exerciseId}
                        {player ? ` · ${player.displayName}` : ""}
                      </span>
                      <span className="text-xs text-foreground/60">
                        {log.sets.length} × · {totalVolume} kg
                      </span>
                    </div>
                    <ol className="mt-1 flex flex-wrap gap-2 text-xs text-foreground/70">
                      {log.sets.map((s, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-outline-variant px-2 py-0.5"
                        >
                          {s.weightKilograms}kg × {s.repetitions}
                          {s.rpe != null ? ` @${s.rpe}` : ""}
                        </li>
                      ))}
                    </ol>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      <PlayerSessionStatsViewPanel
        title={t("statsTitle")}
        pathname={`/sessions/${sessionId}`}
        view={statsView}
        primaryOptions={statsPlayers.map((player) => ({
          id: player.id,
          label: player.displayName,
        }))}
        comparisonOptions={sessions
          .filter((candidate) => candidate.id !== session.id)
          .map((candidate) => ({
            id: candidate.id,
            label: `${candidate.kind} · ${candidate.scheduledFor}`,
          }))}
        sportOptions={(["football", "hockey", "rugby"] as const).map((sport) => ({
          value: sport,
          label: t(`sportTypes.${sport}`),
        }))}
        primarySelectionName="playerId"
        selectedPrimaryId={selectedPlayerId}
        selectedComparisonId={query.compareSessionId}
        selectedSport={query.sportType}
        selectedComparisonSport={query.compareSportType}
        labels={{
          selectPrimary: t("statsSelectPlayer"),
          compareSession: t("statsCompareSession"),
          choosePrimarySport: t("statsChooseSport"),
          chooseComparisonSport: t("statsChooseComparisonSport"),
          clearComparison: t("statsClearComparison"),
          none: t("statsNone"),
          noSessions: t("statsNoPlayers"),
          noData: t("statsNoData"),
          statusReady: t("statsStatusReady"),
          statusEventsOnly: t("statsStatusEventsOnly"),
          statusEmpty: t("statsStatusEmpty"),
          distance: t("statsDistance"),
          averageSpeed: t("statsAverageSpeed"),
          maxSpeed: t("statsMaxSpeed"),
          loadIndex: t("statsLoadIndex"),
          zones: t("statsZones"),
          events: t("statsEvents"),
          telemetry: t("statsTelemetry"),
          heatmapLegendPrimary: t("statsHeatmapPrimary"),
          heatmapLegendComparison: t("statsHeatmapComparison"),
          heatmapScaleLow: t("statsHeatmapScaleLow"),
          heatmapScaleHigh: t("statsHeatmapScaleHigh"),
        }}
      />
    </main>
  );
}
