import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { playerUseCases, injuryUseCases, performanceStatsUseCases } from "@/application/use-cases";
import { PlayerDetailPanels } from "@/features/players/player-detail-panels";
import { PlayerSessionStatsViewPanel } from "@/features/performance/player-session-stats-view";
import { getServices } from "@/infrastructure/service-container";
import { Link } from "@/i18n/routing";
import { resolveTenantContext } from "@/lib/api/tenant-context";

export default async function PlayerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; playerId: string }>;
  searchParams: Promise<{
    sessionId?: string;
    compareSessionId?: string;
    sportType?: "football" | "hockey" | "rugby";
    compareSportType?: "football" | "hockey" | "rugby";
  }>;
}) {
  const { locale, playerId } = await params;
  setRequestLocale(locale);
  const translationsPromise = getTranslations({ locale, namespace: "App.playerDetail" });
  const queryPromise = searchParams;
  const tenant = await resolveTenantContext();
  if (!tenant) {
    const t = await translationsPromise;
    return <main className="p-6"><p>{t("noTenant")}</p></main>;
  }

  const services = getServices();
  const player = await playerUseCases
    .getPlayerOrThrow(services.deps, tenant, playerId)
    .catch(() => null);
  if (!player) notFound();

  const [t, injuries, comments, measurements, playerSessions, query] = await Promise.all([
    translationsPromise,
    injuryUseCases.listInjuries(services.deps, tenant, playerId),
    injuryUseCases.listComments(services.deps, tenant, playerId),
    playerUseCases.listMeasurements(services.deps, tenant, playerId),
    performanceStatsUseCases.listSessionsForPlayerStats(
      services.deps,
      tenant,
      playerId,
    ),
    queryPromise,
  ]);

  const selectedSessionId = query.sessionId ?? playerSessions[0]?.id;
  const selectedSession = selectedSessionId
    ? playerSessions.find((session) => session.id === selectedSessionId)
    : undefined;
  const statsView = selectedSession
    ? await performanceStatsUseCases
        .getPlayerSessionStats(services.deps, tenant, {
          playerId,
          sessionId: selectedSession.id,
          sportType: query.sportType,
          compareSessionId: query.compareSessionId,
          compareSportType: query.compareSportType,
        })
        .catch(() => null)
    : null;
  const comparisonOptions = playerSessions.reduce<Array<{ id: string; label: string }>>(
    (options, session) => {
      if (session.id !== selectedSessionId) {
        options.push({
          id: session.id,
          label: `${session.kind} · ${session.scheduledFor}`,
        });
      }
      return options;
    },
    [],
  );

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{player.displayName}</h1>
          {player.position ? (
            <p className="text-xs uppercase tracking-normal text-secondary">{player.position}</p>
          ) : null}
        </div>
        <Link href="/players" className="text-sm text-primary hover:underline">
          {t("back")}
        </Link>
      </header>

      <PlayerDetailPanels
        player={player}
        actorUserId={tenant.actor.userId}
        injuries={injuries}
        comments={comments}
        measurements={measurements}
        locale={locale}
        statsPanel={(
          <PlayerSessionStatsViewPanel
            title={t("statsTitle")}
            pathname={`/players/${playerId}`}
            view={statsView}
            primaryOptions={playerSessions.map((session) => ({
              id: session.id,
              label: `${session.kind} · ${session.scheduledFor}`,
            }))}
            comparisonOptions={comparisonOptions}
            sportOptions={(["football", "hockey", "rugby"] as const).map((sport) => ({
              value: sport,
              label: t(`sportTypes.${sport}`),
            }))}
            primarySelectionName="sessionId"
            selectedPrimaryId={selectedSessionId}
            selectedComparisonId={query.compareSessionId}
            selectedSport={query.sportType}
            selectedComparisonSport={query.compareSportType}
            labels={{
              selectPrimary: t("statsSelectSession"),
              compareSession: t("statsCompareSession"),
              choosePrimarySport: t("statsChooseSport"),
              chooseComparisonSport: t("statsChooseComparisonSport"),
              clearComparison: t("statsClearComparison"),
              none: t("statsNone"),
              noSessions: t("statsNoSessions"),
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
        )}
        labels={{
          generalInfo: t("generalInfo"),
          bornOn: t("bornOn"),
          createdAt: t("createdAt"),
          position: t("position"),
          openComments: t("openComments"),
          openInjuries: t("openInjuries"),
          openMeasurements: t("openMeasurements"),
          openStats: t("openStats"),
          injuries: t("injuries"),
          noInjuries: t("noInjuries"),
          bodyRegion: t("injuryBodyRegion"),
          bodyZone: t("injuryBodyZone"),
          injuryDiagnosedAt: t("injuryDiagnosedAt"),
          injuryStatus: t("injuryStatus"),
          injuryEstimatedRecoveryAt: t("injuryEstimatedRecoveryAt"),
          injurySeverity: t("injurySeverity"),
          injuryDescription: t("injuryDescription"),
          injuryComment: t("injuryComment"),
          injurySubmit: t("injurySubmit"),
          injurySubmitting: t("injurySubmitting"),
          injuryError: t("injuryError"),
          injurySave: t("injurySave"),
          injuryDelete: t("injuryDelete"),
          injuryDeleting: t("injuryDeleting"),
          injuryUpdating: t("injuryUpdating"),
          injuryUpdateSuccess: t("injuryUpdateSuccess"),
          injuryDeleteSuccess: t("injuryDeleteSuccess"),
          injuryDeleteTitle: t("injuryDeleteTitle"),
          injuryDeleteDescription: t("injuryDeleteDescription"),
          injuryConfirmDelete: t("injuryConfirmDelete"),
          bodyFigureTitle: t("bodyFigureTitle"),
          front: t("front"),
          back: t("backFigure"),
          selectedRegion: t("selectedRegion"),
          zonesTitle: t("zonesTitle"),
          statusOption: {
            injured: t("injuryStatusOptions.injured"),
            recovering: t("injuryStatusOptions.recovering"),
            recovered: t("injuryStatusOptions.recovered"),
          },
          commentsTitle: t("feed"),
          noComments: t("noComments"),
          commentPlaceholder: t("commentPlaceholder"),
          post: t("post"),
          posting: t("posting"),
          commentError: t("commentError"),
          commentPostSuccess: t("commentPostSuccess"),
          commentUpdateSuccess: t("commentUpdateSuccess"),
          commentRemoveSuccess: t("commentRemoveSuccess"),
          commentRemoveTitle: t("commentRemoveTitle"),
          commentRemoveDescription: t("commentRemoveDescription"),
          commentConfirmRemove: t("commentConfirmRemove"),
          edit: t("edit"),
          save: t("save"),
          cancel: t("cancel"),
          remove: t("remove"),
          removing: t("removing"),
          updating: t("updating"),
          measurementsTitle: t("measurementsTitle"),
          measurementsNoData: t("measurementsNoData"),
          measurementsTakenAt: t("measurementsTakenAt"),
          measurementsHeight: t("measurementsHeight"),
          measurementsWeight: t("measurementsWeight"),
          measurementsSubmit: t("measurementsSubmit"),
          measurementsSubmitting: t("measurementsSubmitting"),
          measurementsError: t("measurementsError"),
          measurementsChartTitle: t("measurementsChartTitle"),
          measurementsBmi: t("measurementsBmi"),
          measurementsBmiRange: t("measurementsBmiRange"),
          measurementsBmiRangeLower: t("measurementsBmiRangeLower"),
          measurementsBmiRangeUpper: t("measurementsBmiRangeUpper"),
          measurementsNoNumericValues: t("measurementsNoNumericValues"),
          region: {
            head: t("regions.head"),
            torso: t("regions.torso"),
            upperBack: t("regions.upperBack"),
            lowerBack: t("regions.lowerBack"),
            leftArm: t("regions.leftArm"),
            rightArm: t("regions.rightArm"),
            leftLeg: t("regions.leftLeg"),
            rightLeg: t("regions.rightLeg"),
          },
          zone: {
            skull: t("zones.skull"),
            face: t("zones.face"),
            jaw: t("zones.jaw"),
            neck: t("zones.neck"),
            chest: t("zones.chest"),
            abdomen: t("zones.abdomen"),
            ribs: t("zones.ribs"),
            upperBack: t("zones.upperBack"),
            shoulderBlade: t("zones.shoulderBlade"),
            lowerBack: t("zones.lowerBack"),
            spine: t("zones.spine"),
            shoulder: t("zones.shoulder"),
            bicep: t("zones.bicep"),
            elbow: t("zones.elbow"),
            forearm: t("zones.forearm"),
            wrist: t("zones.wrist"),
            hand: t("zones.hand"),
            hip: t("zones.hip"),
            thigh: t("zones.thigh"),
            knee: t("zones.knee"),
            shin: t("zones.shin"),
            calf: t("zones.calf"),
            ankle: t("zones.ankle"),
            foot: t("zones.foot"),
          },
        }}
      />
    </main>
  );
}
