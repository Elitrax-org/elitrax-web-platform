import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

import { InjuryLogForm } from "./injury-log-form";

const labels = {
  diagnosedAt: "Diagnosed at",
  status: "Status",
  estimatedRecoveryAt: "Estimated recovery at",
  severity: "Severity",
  description: "Description",
  injuryComment: "Injury comment",
  bodyZone: "Body zone",
  bodyRegion: "Body region",
  submit: "Submit",
  submitting: "Submitting",
  error: "Error",
  bodyFigureTitle: "Body figure",
  front: "Front",
  back: "Back",
  selectedRegion: "Selected region",
  zonesTitle: "Detailed zones",
  statusOption: {
    injured: "Injured",
    recovering: "Recovering",
    recovered: "Recovered",
  },
  region: {
    head: "Head",
    torso: "Torso",
    upperBack: "Upper back",
    lowerBack: "Lower back",
    leftArm: "Left arm",
    rightArm: "Right arm",
    leftLeg: "Left leg",
    rightLeg: "Right leg",
  },
  zone: {
    skull: "Skull",
    face: "Face",
    jaw: "Jaw",
    neck: "Neck",
    chest: "Chest",
    abdomen: "Abdomen",
    ribs: "Ribs",
    upperBack: "Upper back",
    shoulderBlade: "Shoulder blade",
    lowerBack: "Lower back",
    spine: "Spine",
    shoulder: "Shoulder",
    bicep: "Bicep",
    elbow: "Elbow",
    forearm: "Forearm",
    wrist: "Wrist",
    hand: "Hand",
    hip: "Hip",
    thigh: "Thigh",
    knee: "Knee",
    shin: "Shin",
    calf: "Calf",
    ankle: "Ankle",
    foot: "Foot",
  },
};

describe("InjuryLogForm body-zone bitmask", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders zones for the selected region", () => {
    render(<InjuryLogForm playerId="p-1" labels={labels} />);
    for (const zone of ["Chest", "Abdomen", "Ribs"]) {
      expect(screen.getByRole("button", { name: zone })).toBeInTheDocument();
    }
  });

  it("toggles zone buttons independently", () => {
    render(<InjuryLogForm playerId="p-1" labels={labels} />);
    const chest = screen.getByRole("button", { name: "Chest" });
    const ribs = screen.getByRole("button", { name: "Ribs" });

    fireEvent.click(chest);
    fireEvent.click(ribs);

    expect(chest).toHaveAttribute("aria-pressed", "true");
    expect(ribs).toHaveAttribute("aria-pressed", "true");
  });
});
