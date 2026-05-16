import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({ replace }),
}));

import { PlayerSessionStatsControls } from "./player-session-stats-controls";

describe("PlayerSessionStatsControls", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("replaces the route when the primary selection changes", () => {
    render(
      <PlayerSessionStatsControls
        pathname="/players/player-1"
        primaryOptions={[
          { id: "session-a", label: "match · a" },
          { id: "session-b", label: "match · b" },
        ]}
        comparisonOptions={[{ id: "session-c", label: "match · c" }]}
        sportOptions={[
          { value: "football", label: "Football" },
          { value: "hockey", label: "Hockey" },
          { value: "rugby", label: "Rugby" },
        ]}
        primaryLabel="Choose session"
        comparisonLabel="Compare"
        primarySportLabel="Sport"
        comparisonSportLabel="Compare sport"
        clearComparisonLabel="Clear comparison"
        noneLabel="None"
        selectedPrimaryId="session-a"
        selectedComparisonId="session-c"
        selectedSport="football"
        selectedComparisonSport="hockey"
        primaryParamName="sessionId"
      />,
    );

    fireEvent.change(screen.getByLabelText("Choose session"), {
      target: { value: "session-b" },
    });

    expect(replace).toHaveBeenCalledWith(
      "/players/player-1?sessionId=session-b&compareSessionId=session-c&sportType=football&compareSportType=hockey",
    );
  });

  it("clears comparison and compare sport together", () => {
    render(
      <PlayerSessionStatsControls
        pathname="/sessions/session-1"
        primaryOptions={[{ id: "player-1", label: "Alex" }]}
        comparisonOptions={[{ id: "session-c", label: "match · c" }]}
        sportOptions={[
          { value: "football", label: "Football" },
          { value: "hockey", label: "Hockey" },
          { value: "rugby", label: "Rugby" },
        ]}
        primaryLabel="Choose player"
        comparisonLabel="Compare"
        primarySportLabel="Sport"
        comparisonSportLabel="Compare sport"
        clearComparisonLabel="Clear comparison"
        noneLabel="None"
        selectedPrimaryId="player-1"
        selectedComparisonId="session-c"
        selectedSport="rugby"
        selectedComparisonSport="football"
        primaryParamName="playerId"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear comparison" }));

    expect(replace).toHaveBeenCalledWith(
      "/sessions/session-1?playerId=player-1&sportType=rugby",
    );
  });
});
