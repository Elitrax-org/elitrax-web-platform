import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getServices } from "@/infrastructure/service-container";
import { resolveTenantContext } from "@/lib/api/tenant-context";
import { Link } from "@/i18n/routing";
import { teamUseCases, injuryUseCases, playerUseCases } from "@/application/use-cases";
import { TeamRosterManager } from "@/features/teams/team-roster-manager";
import { TeamFieldSettingsForm } from "@/features/teams/team-field-settings-form";
import { PlayerDetailPanels } from "@/features/players/player-detail-panels";

export default async function TeamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; teamId: string }>;
  searchParams: Promise<{ playerId?: string }>;
}) {
  const { locale, teamId } = await params;
  setRequestLocale(locale);

  const teamTranslationsPromise = getTranslations({ locale, namespace: "App.teams" });
  const playerTranslationsPromise = getTranslations({ locale, namespace: "App.playerDetail" });
  const selectedPlayerPromise = searchParams;
  const tenant = await resolveTenantContext();
  if (!tenant) {
    const tTeam = await teamTranslationsPromise;
    return (
      <main className="p-6">
        <p>{tTeam("noTenant")}</p>
      </main>
    );
  }

  const services = getServices();
  const [tTeam, tPlayer, team, roster, { playerId }] = await Promise.all([
    teamTranslationsPromise,
    playerTranslationsPromise,
    teamUseCases.getTeamOrThrow(services.deps, tenant, teamId).catch(() => null),
    teamUseCases.listTeamPlayers(services.deps, tenant, teamId),
    selectedPlayerPromise,
  ]);

  if (!team) notFound();

  const selectedRosterEntry = roster.find((entry) => entry.playerId === playerId)
    ?? roster[0]
    ?? null;

  const details = selectedRosterEntry
    ? await Promise.all([
      injuryUseCases.listInjuries(services.deps, tenant, selectedRosterEntry.playerId),
      injuryUseCases.listComments(services.deps, tenant, selectedRosterEntry.playerId),
      playerUseCases.listMeasurements(services.deps, tenant, selectedRosterEntry.playerId),
    ])
    : [[], [], []] as const;

  const [injuries, comments, measurements] = details;

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-2">
        <Link href="/teams" className="text-sm text-primary hover:underline">
          {tTeam("backToTeams")}
        </Link>
        <h1 className="font-heading text-2xl font-semibold">{team.name}</h1>
        <p className="text-xs uppercase tracking-normal text-secondary">
          {tTeam(`sportTypes.${team.sportType}`)}
        </p>
      </header>

      <TeamRosterManager
        teamId={team.id}
        roster={roster}
        selectedPlayerId={selectedRosterEntry?.playerId}
        labels={{
          rosterTitle: tTeam("rosterTitle"),
          rosterCount: tTeam("rosterCount", { count: roster.length }),
          emptyRoster: tTeam("emptyRoster"),
          addPlayers: tTeam("addPlayers"),
          jerseyNumber: tTeam("jerseyNumber"),
          addError: tTeam("addPlayerError"),
          remove: tTeam("removeFromTeam"),
          removing: tTeam("removingFromTeam"),
          openDetails: tTeam("openPlayerPanel"),
          openProfile: tTeam("openPlayerProfile"),
          selected: tTeam("selectedPlayer"),
          editJersey: tTeam("editJersey"),
          saveJersey: tTeam("saveJersey"),
          cancelJersey: tTeam("cancelJersey"),
          updatingJersey: tTeam("updatingJersey"),
          assignSuccess: tTeam("assignSuccess"),
          createAssignSuccess: tTeam("createAssignSuccess"),
          removeSuccess: tTeam("removeSuccess"),
          jerseyUpdateSuccess: tTeam("jerseyUpdateSuccess"),
          removeTitle: tTeam("removeTitle"),
          removeDescription: tTeam("removeDescription"),
          confirmRemove: tTeam("confirmRemove"),
        }}
      />

      <TeamFieldSettingsForm
        team={team}
        labels={{
          title: tTeam("fieldSettingsTitle"),
          description: tTeam("fieldSettingsDescription"),
          length: tTeam("fieldLength"),
          width: tTeam("fieldWidth"),
          hint: tTeam("fieldSettingsHint"),
          submit: tTeam("fieldSettingsSave"),
          submitting: tTeam("fieldSettingsSaving"),
          error: tTeam("fieldSettingsError"),
        }}
      />

      {selectedRosterEntry ? (
        <section className="space-y-3">
          <header className="rounded-md border border-outline-variant bg-surface-container p-3">
            <p className="text-xs uppercase tracking-normal text-secondary">
              {tTeam("selectedPlayerHeader")}
            </p>
            <h2 className="font-heading text-xl">{selectedRosterEntry.player.displayName}</h2>
            <p className="text-xs text-foreground/70">
              {tTeam("jerseyNumber")}: {selectedRosterEntry.jerseyNumber ?? "-"}
            </p>
          </header>

          <PlayerDetailPanels
            player={selectedRosterEntry.player}
            actorUserId={tenant.actor.userId}
            injuries={injuries}
            comments={comments}
            measurements={measurements}
            locale={locale}
            labels={{
              generalInfo: tPlayer("generalInfo"),
              bornOn: tPlayer("bornOn"),
              createdAt: tPlayer("createdAt"),
              position: tPlayer("position"),
              openComments: tPlayer("openComments"),
              openInjuries: tPlayer("openInjuries"),
              openMeasurements: tPlayer("openMeasurements"),
              openStats: tPlayer("openStats"),
              injuries: tPlayer("injuries"),
              noInjuries: tPlayer("noInjuries"),
              bodyRegion: tPlayer("injuryBodyRegion"),
              bodyZone: tPlayer("injuryBodyZone"),
              injuryDiagnosedAt: tPlayer("injuryDiagnosedAt"),
              injuryStatus: tPlayer("injuryStatus"),
              injuryEstimatedRecoveryAt: tPlayer("injuryEstimatedRecoveryAt"),
              injurySeverity: tPlayer("injurySeverity"),
              injuryDescription: tPlayer("injuryDescription"),
              injuryComment: tPlayer("injuryComment"),
              injurySubmit: tPlayer("injurySubmit"),
              injurySubmitting: tPlayer("injurySubmitting"),
              injuryError: tPlayer("injuryError"),
              injurySave: tPlayer("injurySave"),
              injuryDelete: tPlayer("injuryDelete"),
              injuryDeleting: tPlayer("injuryDeleting"),
              injuryUpdating: tPlayer("injuryUpdating"),
              injuryUpdateSuccess: tPlayer("injuryUpdateSuccess"),
              injuryDeleteSuccess: tPlayer("injuryDeleteSuccess"),
              injuryDeleteTitle: tPlayer("injuryDeleteTitle"),
              injuryDeleteDescription: tPlayer("injuryDeleteDescription"),
              injuryConfirmDelete: tPlayer("injuryConfirmDelete"),
              bodyFigureTitle: tPlayer("bodyFigureTitle"),
              front: tPlayer("front"),
              back: tPlayer("backFigure"),
              selectedRegion: tPlayer("selectedRegion"),
              zonesTitle: tPlayer("zonesTitle"),
              statusOption: {
                injured: tPlayer("injuryStatusOptions.injured"),
                recovering: tPlayer("injuryStatusOptions.recovering"),
                recovered: tPlayer("injuryStatusOptions.recovered"),
              },
              commentsTitle: tPlayer("feed"),
              noComments: tPlayer("noComments"),
              commentPlaceholder: tPlayer("commentPlaceholder"),
              post: tPlayer("post"),
              posting: tPlayer("posting"),
              commentError: tPlayer("commentError"),
              commentPostSuccess: tPlayer("commentPostSuccess"),
              commentUpdateSuccess: tPlayer("commentUpdateSuccess"),
              commentRemoveSuccess: tPlayer("commentRemoveSuccess"),
              commentRemoveTitle: tPlayer("commentRemoveTitle"),
              commentRemoveDescription: tPlayer("commentRemoveDescription"),
              commentConfirmRemove: tPlayer("commentConfirmRemove"),
              edit: tPlayer("edit"),
              save: tPlayer("save"),
              cancel: tPlayer("cancel"),
              remove: tPlayer("remove"),
              removing: tPlayer("removing"),
              updating: tPlayer("updating"),
              measurementsTitle: tPlayer("measurementsTitle"),
              measurementsNoData: tPlayer("measurementsNoData"),
              measurementsTakenAt: tPlayer("measurementsTakenAt"),
              measurementsHeight: tPlayer("measurementsHeight"),
              measurementsWeight: tPlayer("measurementsWeight"),
              measurementsSubmit: tPlayer("measurementsSubmit"),
              measurementsSubmitting: tPlayer("measurementsSubmitting"),
              measurementsError: tPlayer("measurementsError"),
              measurementsChartTitle: tPlayer("measurementsChartTitle"),
              measurementsBmi: tPlayer("measurementsBmi"),
              measurementsBmiRange: tPlayer("measurementsBmiRange"),
              measurementsBmiRangeLower: tPlayer("measurementsBmiRangeLower"),
              measurementsBmiRangeUpper: tPlayer("measurementsBmiRangeUpper"),
              measurementsNoNumericValues: tPlayer("measurementsNoNumericValues"),
              region: {
                head: tPlayer("regions.head"),
                torso: tPlayer("regions.torso"),
                upperBack: tPlayer("regions.upperBack"),
                lowerBack: tPlayer("regions.lowerBack"),
                leftArm: tPlayer("regions.leftArm"),
                rightArm: tPlayer("regions.rightArm"),
                leftLeg: tPlayer("regions.leftLeg"),
                rightLeg: tPlayer("regions.rightLeg"),
              },
              zone: {
                skull: tPlayer("zones.skull"),
                face: tPlayer("zones.face"),
                jaw: tPlayer("zones.jaw"),
                neck: tPlayer("zones.neck"),
                chest: tPlayer("zones.chest"),
                abdomen: tPlayer("zones.abdomen"),
                ribs: tPlayer("zones.ribs"),
                upperBack: tPlayer("zones.upperBack"),
                shoulderBlade: tPlayer("zones.shoulderBlade"),
                lowerBack: tPlayer("zones.lowerBack"),
                spine: tPlayer("zones.spine"),
                shoulder: tPlayer("zones.shoulder"),
                bicep: tPlayer("zones.bicep"),
                elbow: tPlayer("zones.elbow"),
                forearm: tPlayer("zones.forearm"),
                wrist: tPlayer("zones.wrist"),
                hand: tPlayer("zones.hand"),
                hip: tPlayer("zones.hip"),
                thigh: tPlayer("zones.thigh"),
                knee: tPlayer("zones.knee"),
                shin: tPlayer("zones.shin"),
                calf: tPlayer("zones.calf"),
                ankle: tPlayer("zones.ankle"),
                foot: tPlayer("zones.foot"),
              },
            }}
          />
        </section>
      ) : null}
    </main>
  );
}
