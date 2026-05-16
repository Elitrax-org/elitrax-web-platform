import { describe, expect, it } from "vitest";

import {
  computePhaseFromClock,
  nextMatchPhase,
  standardFootballClock,
  totalRegulationSeconds,
  totalWithExtraTimeSeconds,
} from "./match-clock-policy";

describe("MatchClockPolicy", () => {
  it("advances phases in the expected order", () => {
    expect(nextMatchPhase("not_started")).toBe("first_half");
    expect(nextMatchPhase("first_half")).toBe("halftime");
    expect(nextMatchPhase("halftime")).toBe("second_half");
    expect(nextMatchPhase("second_half")).toBe("extra_time_first");
    expect(nextMatchPhase("extra_time_second")).toBe("finished");
    expect(nextMatchPhase("finished")).toBe("finished");
  });

  it("computes regulation totals", () => {
    expect(totalRegulationSeconds(standardFootballClock)).toBe(5400);
    expect(totalWithExtraTimeSeconds(standardFootballClock)).toBe(7200);
  });

  it("maps elapsed seconds to phases without extra time", () => {
    expect(computePhaseFromClock(standardFootballClock, 0).phase).toBe(
      "first_half",
    );
    expect(computePhaseFromClock(standardFootballClock, 60 * 30).phase).toBe(
      "first_half",
    );
    expect(
      computePhaseFromClock(standardFootballClock, 60 * 60).phase,
    ).toBe("second_half");
    expect(
      computePhaseFromClock(standardFootballClock, 60 * 90).phase,
    ).toBe("finished");
  });

  it("maps elapsed seconds to extra-time phases when enabled", () => {
    const firstExtra = computePhaseFromClock(
      standardFootballClock,
      60 * 95,
      true,
    );
    expect(firstExtra.phase).toBe("extra_time_first");
    expect(firstExtra.elapsed.seconds).toBe(60 * 5);

    const secondExtra = computePhaseFromClock(
      standardFootballClock,
      60 * 110,
      true,
    );
    expect(secondExtra.phase).toBe("extra_time_second");
    expect(secondExtra.elapsed.seconds).toBe(60 * 5);

    expect(
      computePhaseFromClock(standardFootballClock, 60 * 130, true).phase,
    ).toBe("finished");
  });

  it("rejects invalid elapsed seconds", () => {
    expect(() => computePhaseFromClock(standardFootballClock, -1)).toThrow();
    expect(() =>
      computePhaseFromClock(standardFootballClock, 1.5),
    ).toThrow();
  });
});
