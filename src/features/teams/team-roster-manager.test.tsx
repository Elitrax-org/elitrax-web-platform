import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Player, TeamRosterPlayer } from "@/application/domain-types";

const refresh = vi.fn();
const replace = vi.fn();
const pushToast = vi.fn();

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/teams/team-1",
  useRouter: () => ({ refresh, replace }),
}));

vi.mock("@/components/ui/toast-provider", async () => {
  const actual = await vi.importActual<typeof import("@/components/ui/toast-provider")>(
    "@/components/ui/toast-provider",
  );

  return {
    ...actual,
    useToast: () => ({ pushToast }),
  };
});

import { TeamRosterManager } from "./team-roster-manager";

const labels = {
  rosterTitle: "Roster",
  rosterCount: "1 player",
  emptyRoster: "No players yet",
  addPlayers: "Add players",
  jerseyNumber: "Jersey",
  addError: "Action failed",
  remove: "Remove",
  removing: "Removing",
  openDetails: "Open details",
  openProfile: "Open profile",
  selected: "Selected",
  editJersey: "Edit jersey",
  saveJersey: "Save jersey",
  cancelJersey: "Cancel",
  updatingJersey: "Updating jersey",
  assignSuccess: "Assigned",
  createAssignSuccess: "Created and assigned",
  removeSuccess: "Removed from team",
  jerseyUpdateSuccess: "Jersey updated",
  removeTitle: "Remove player",
  removeDescription: "This removes the player from the team roster.",
  confirmRemove: "Confirm remove",
};

const player: Player = {
  id: "player-1",
  accountId: "account-1",
  displayName: "Alex Doe",
  birthDate: "2000-01-01",
  position: "Forward",
  metadata: {},
  createdAt: "2026-05-11T10:00:00.000Z",
};

const rosterEntry: TeamRosterPlayer = {
  teamId: "team-1",
  playerId: "player-1",
  accountId: "account-1",
  jerseyNumber: "10",
  joinedAt: "2026-05-11T10:00:00.000Z",
  player,
};

describe("TeamRosterManager", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    refresh.mockReset();
    replace.mockReset();
    pushToast.mockReset();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens a confirmation dialog before removing a player", () => {
    render(
      <TeamRosterManager
        teamId="team-1"
        roster={[rosterEntry]}
        labels={labels}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: labels.remove }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(labels.removeDescription)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders a dedicated link to add players", () => {
    render(
      <TeamRosterManager
        teamId="team-1"
        roster={[rosterEntry]}
        labels={labels}
      />,
    );

    expect(screen.getByRole("link", { name: labels.addPlayers })).toHaveAttribute(
      "href",
      "/teams/team-1/roster/new",
    );
  });

  it("removes a player only after confirmation and refreshes the route", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    render(
      <TeamRosterManager
        teamId="team-1"
        roster={[rosterEntry]}
        labels={labels}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: labels.remove }));
    fireEvent.click(screen.getByRole("button", { name: labels.confirmRemove }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/teams/team-1/players/player-1",
        { method: "DELETE" },
      );
    });

    await waitFor(() => {
      expect(pushToast).toHaveBeenCalledWith({
        tone: "success",
        title: labels.remove,
        message: labels.removeSuccess,
      });
      expect(refresh).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});