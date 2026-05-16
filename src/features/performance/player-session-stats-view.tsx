import { PlayerSessionStatsControls } from "./player-session-stats-controls";

import type { PlayerSessionStatsView } from "@/application/use-cases/performance-stats";

export type StatsEntityOption = {
  readonly id: string;
  readonly label: string;
};

export type SportOption = {
  readonly value: "football" | "hockey" | "rugby";
  readonly label: string;
};

function formatMetric(value?: number, digits = 1) {
  return value == null ? "-" : value.toFixed(digits);
}

function fieldHeight(view: PlayerSessionStatsView["primary"]) {
  return view.field.heightMeters;
}

function fieldWidth(view: PlayerSessionStatsView["primary"]) {
  return view.field.widthMeters;
}

function renderFieldMarkings(view: PlayerSessionStatsView["primary"]) {
  const width = fieldWidth(view);
  const height = fieldHeight(view);

  if (view.sportType === "rugby") {
    return (
      <>
        <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="currentColor" strokeWidth="0.6" />
        <line x1={22} y1={0} x2={22} y2={height} stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2" />
        <line x1={width - 22} y1={0} x2={width - 22} y2={height} stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2" />
        <line x1={10} y1={0} x2={10} y2={height} stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2" />
        <line x1={width - 10} y1={0} x2={width - 10} y2={height} stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2" />
      </>
    );
  }

  if (view.sportType === "hockey") {
    const circleRadius = view.field.markings.shootingCircleRadiusMeters ?? 14.63;
    return (
      <>
        <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="currentColor" strokeWidth="0.6" />
        <path
          d={`M 0 ${height / 2 - circleRadius} A ${circleRadius} ${circleRadius} 0 0 1 0 ${height / 2 + circleRadius}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d={`M ${width} ${height / 2 - circleRadius} A ${circleRadius} ${circleRadius} 0 0 0 ${width} ${height / 2 + circleRadius}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </>
    );
  }

  const centerCircle = view.field.markings.centerCircleRadiusMeters ?? 9.15;
  const penaltyLength = view.field.markings.penaltyAreaLengthMeters ?? 16.5;
  const penaltyWidth = view.field.markings.penaltyAreaWidthMeters ?? 40.3;
  return (
    <>
      <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="currentColor" strokeWidth="0.6" />
      <circle
        cx={width / 2}
        cy={height / 2}
        r={centerCircle}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <rect
        x={0}
        y={(height - penaltyWidth) / 2}
        width={penaltyLength}
        height={penaltyWidth}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <rect
        x={width - penaltyLength}
        y={(height - penaltyWidth) / 2}
        width={penaltyLength}
        height={penaltyWidth}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </>
  );
}

function HeatmapField({
  primary,
  comparison,
  labels,
}: {
  primary: PlayerSessionStatsView["primary"];
  comparison?: PlayerSessionStatsView["comparison"];
  labels: {
    heatmapLegendPrimary: string;
    heatmapLegendComparison: string;
    heatmapScaleLow: string;
    heatmapScaleHigh: string;
  };
}) {
  const width = fieldWidth(primary);
  const height = fieldHeight(primary);
  const tileWidth = width / primary.field.defaultGrid.columns;
  const tileHeight = height / primary.field.defaultGrid.rows;
  const comparisonColumns = comparison?.field.defaultGrid.columns ?? primary.field.defaultGrid.columns;
  const comparisonRows = comparison?.field.defaultGrid.rows ?? primary.field.defaultGrid.rows;
  const comparisonTileWidth = width / comparisonColumns;
  const comparisonTileHeight = height / comparisonRows;

  function eventPoint(event: PlayerSessionStatsView["primary"]["matchEvents"][number]) {
    const payload = event.payload as Record<string, unknown>;
    const x = typeof payload.x === "number" ? payload.x : undefined;
    const y = typeof payload.y === "number" ? payload.y : undefined;
    if (typeof x === "number" && typeof y === "number") {
      return {
        x: Math.max(0, Math.min(1, x)) * width,
        y: Math.max(0, Math.min(1, y)) * height,
      };
    }
    const minute = event.matchMinute ?? 0;
    return {
      x: Math.max(4, Math.min(width - 4, (minute / 90) * width)),
      y: height - 4,
    };
  }

  return (
    <div className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container p-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-foreground/70">
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500/80" />{labels.heatmapLegendPrimary}</span>
          {comparison ? (
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-cyan-400/80" />{labels.heatmapLegendComparison}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span>{labels.heatmapScaleLow}</span>
          <span className="h-2 w-24 rounded-full bg-gradient-to-r from-orange-200 via-orange-400 to-orange-600" />
          <span>{labels.heatmapScaleHigh}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-xl bg-[#0f3d2f] text-white/80 shadow-inner">
        <rect x={0} y={0} width={width} height={height} fill="#0f3d2f" rx={2} />
        {primary.heatmapTiles.map((tile) => (
          <rect
            key={`p-${tile.tileX}-${tile.tileY}`}
            x={tile.tileX * tileWidth}
            y={tile.tileY * tileHeight}
            width={tileWidth}
            height={tileHeight}
            fill="#f97316"
            opacity={Math.max(0.2, tile.intensity * 0.9)}
          >
            <title>{`x:${tile.tileX} y:${tile.tileY} intensity:${tile.intensity.toFixed(2)}`}</title>
          </rect>
        ))}
        {comparison?.heatmapTiles.map((tile) => (
          <rect
            key={`c-${tile.tileX}-${tile.tileY}`}
            x={tile.tileX * comparisonTileWidth}
            y={tile.tileY * comparisonTileHeight}
            width={comparisonTileWidth}
            height={comparisonTileHeight}
            fill="#22d3ee"
            opacity={Math.max(0.18, tile.intensity * 0.65)}
          >
            <title>{`x:${tile.tileX} y:${tile.tileY} intensity:${tile.intensity.toFixed(2)}`}</title>
          </rect>
        ))}
        {primary.matchEvents.map((event) => {
          const point = eventPoint(event);
          return (
            <circle key={event.id} cx={point.x} cy={point.y} r={2.2} fill="#fff7ed" stroke="#fb923c" strokeWidth="0.6">
              <title>{`${event.kind}${event.matchMinute != null ? ` · ${event.matchMinute}'` : ""}`}</title>
            </circle>
          );
        })}
        <rect x={0} y={0} width={width} height={height} fill="none" stroke="currentColor" strokeWidth="0.8" />
        {renderFieldMarkings(primary)}
      </svg>
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface-container px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-foreground/55">{label}</p>
      <p className="mt-2 font-heading text-2xl">{value}</p>
      {helper ? <p className="mt-1 text-xs text-foreground/70">{helper}</p> : null}
    </article>
  );
}

export function PlayerSessionStatsViewPanel({
  title,
  pathname,
  view,
  labels,
  primaryOptions,
  comparisonOptions,
  sportOptions,
  primarySelectionName,
  selectedPrimaryId,
  selectedComparisonId,
  selectedSport,
  selectedComparisonSport,
}: {
  title: string;
  pathname: string;
  view: PlayerSessionStatsView | null;
  labels: {
    selectPrimary: string;
    compareSession: string;
    choosePrimarySport: string;
    chooseComparisonSport: string;
    clearComparison: string;
    none: string;
    noSessions: string;
    noData: string;
    statusReady: string;
    statusEventsOnly: string;
    statusEmpty: string;
    distance: string;
    averageSpeed: string;
    maxSpeed: string;
    loadIndex: string;
    zones: string;
    events: string;
    telemetry: string;
    heatmapLegendPrimary: string;
    heatmapLegendComparison: string;
    heatmapScaleLow: string;
    heatmapScaleHigh: string;
  };
  primaryOptions: readonly StatsEntityOption[];
  comparisonOptions: readonly StatsEntityOption[];
  sportOptions: readonly SportOption[];
  primarySelectionName: "sessionId" | "playerId";
  selectedPrimaryId?: string;
  selectedComparisonId?: string;
  selectedSport?: SportOption["value"];
  selectedComparisonSport?: SportOption["value"];
}) {
  return (
    <section className="space-y-4 rounded-[28px] border border-outline-variant bg-[linear-gradient(135deg,rgba(15,61,47,0.08),rgba(249,115,22,0.08))] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl">{title}</h2>
          {view ? (
            <p className="text-sm text-foreground/70">
              {view.player.displayName} · {view.primary.session.kind} · {view.primary.session.scheduledFor}
            </p>
          ) : (
            <p className="text-sm text-foreground/70">{labels.noSessions}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          {view ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label={labels.distance}
                  value={`${formatMetric(view.primary.metric?.totalDistanceMeters, 0)} m`}
                  helper={view.primary.dataStatus === "ready" ? labels.statusReady : view.primary.dataStatus === "events-only" ? labels.statusEventsOnly : labels.statusEmpty}
                />
                <MetricCard label={labels.averageSpeed} value={`${formatMetric(view.primary.metric?.averageSpeedMps)} m/s`} helper={labels.telemetry} />
                <MetricCard label={labels.maxSpeed} value={`${formatMetric(view.primary.metric?.maxSpeedMps)} m/s`} helper={labels.telemetry} />
                <MetricCard label={labels.loadIndex} value={view.primary.loadIndex == null ? "-" : String(view.primary.loadIndex)} helper={labels.zones} />
              </div>

              <HeatmapField primary={view.primary} comparison={view.comparison} labels={labels} />

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-outline-variant bg-surface-container p-4">
                  <h3 className="font-heading text-base">{labels.zones}</h3>
                  {view.primary.metric?.zones ? (
                    <ul className="mt-3 space-y-2 text-sm">
                      {Object.entries(view.primary.metric.zones).map(([zone, meters]) => (
                        <li key={zone} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
                          <span>{zone}</span>
                          <span>{formatMetric(meters, 0)} m</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-foreground/70">{labels.noData}</p>
                  )}
                </article>

                <article className="rounded-2xl border border-outline-variant bg-surface-container p-4">
                  <h3 className="font-heading text-base">{labels.events}</h3>
                  {view.primary.matchEvents.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm">
                      {view.primary.matchEvents.map((event) => (
                        <li key={event.id} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
                          <span>{event.kind}</span>
                          <span>{event.matchMinute != null ? `${event.matchMinute}'` : event.occurredAt}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-foreground/70">{labels.noData}</p>
                  )}
                </article>
              </div>
            </>
          ) : null}
        </div>

        <aside className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
          <PlayerSessionStatsControls
            pathname={pathname}
            primaryOptions={primaryOptions}
            comparisonOptions={comparisonOptions}
            sportOptions={sportOptions}
            primaryLabel={labels.selectPrimary}
            comparisonLabel={labels.compareSession}
            primarySportLabel={labels.choosePrimarySport}
            comparisonSportLabel={labels.chooseComparisonSport}
            clearComparisonLabel={labels.clearComparison}
            noneLabel={labels.none}
            selectedPrimaryId={selectedPrimaryId}
            selectedComparisonId={selectedComparisonId}
            selectedSport={selectedSport}
            selectedComparisonSport={selectedComparisonSport}
            primaryParamName={primarySelectionName}
          />
        </aside>
      </div>
    </section>
  );
}
