import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import { PlayerSessionStatsViewPanel } from "./player-session-stats-view";

const labels = {
  selectPrimary: "Choose session",
  compareSession: "Compare session",
  choosePrimarySport: "Choose sport",
  chooseComparisonSport: "Choose compare sport",
  clearComparison: "Clear comparison",
  none: "None",
  noSessions: "No sessions",
  noData: "No data",
  statusReady: "Ready",
  statusEventsOnly: "Events only",
  statusEmpty: "Empty",
  distance: "Distance",
  averageSpeed: "Average speed",
  maxSpeed: "Max speed",
  loadIndex: "Load index",
  zones: "Zones",
  events: "Events",
  telemetry: "Telemetry",
  heatmapLegendPrimary: "Primary",
  heatmapLegendComparison: "Comparison",
  heatmapScaleLow: "Low",
  heatmapScaleHigh: "High",
};

describe("PlayerSessionStatsViewPanel", () => {
  it("renders metric cards, zones and events", () => {
    render(
      <PlayerSessionStatsViewPanel
        title="Performance"
        pathname="/en/players/player-1"
        primarySelectionName="sessionId"
        selectedPrimaryId="session-1"
        selectedSport="football"
        labels={labels}
        primaryOptions={[{ id: "session-1", label: "match · 2026-01-01" }]}
        comparisonOptions={[]}
        sportOptions={[{ value: "football", label: "Football" }]}
        view={{
          player: {
            id: "player-1",
            accountId: "account-1",
            displayName: "Alex",
            createdAt: "2026-01-01T00:00:00Z",
            metadata: {},
          },
          primary: {
            session: {
              id: "session-1",
              accountId: "account-1",
              kind: "match",
              scheduledFor: "2026-01-01T10:00:00Z",
              createdAt: "2026-01-01T00:00:00Z",
              playerIds: ["player-1"],
            },
            sportType: "football",
            field: {
              sportType: "football",
              label: "Football",
              widthMeters: 105,
              heightMeters: 68,
              defaultGrid: { columns: 24, rows: 16 },
              markings: { centerCircleRadiusMeters: 9.15 },
            },
            metric: {
              id: "metric-1",
              accountId: "account-1",
              sessionId: "session-1",
              playerId: "player-1",
              totalDistanceMeters: 1234,
              totalDurationSeconds: 600,
              averageSpeedMps: 2.1,
              maxSpeedMps: 6.8,
              zones: { zone_1: 200, zone_4: 150 },
              computedAt: "2026-01-01T00:00:00Z",
            },
            heatmapTiles: [
              {
                id: "tile-1",
                accountId: "account-1",
                sessionId: "session-1",
                playerId: "player-1",
                tileX: 1,
                tileY: 2,
                intensity: 1,
                computedAt: "2026-01-01T00:00:00Z",
              },
            ],
            matchEvents: [
              {
                id: "event-1",
                accountId: "account-1",
                sessionId: "session-1",
                occurredAt: "2026-01-01T10:12:00Z",
                matchMinute: 12,
                kind: "goal",
                payload: {},
                playerId: "player-1",
              },
            ],
            telemetryUploadIds: ["upload-1"],
            dataStatus: "ready",
            loadIndex: 245,
          },
        }}
      />,
    );

    expect(screen.getByText("1234 m")).toBeInTheDocument();
    expect(screen.getByText("goal")).toBeInTheDocument();
    expect(screen.getByText("zone_4")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Choose session" })).toBeInTheDocument();
  });
});
