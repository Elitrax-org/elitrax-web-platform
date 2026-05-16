import type { AiProvider } from "../../application/ports/providers";

/**
 * Stub AI provider used when no AI credentials are configured. Echoes the
 * deterministic ranking computed by the domain policy and labels the run
 * as `stub`. Replace with the real Vercel AI SDK adapter in Phase 12.
 */
export const stubAiProvider: AiProvider = {
  name: "stub",
  async rankCandidates(request) {
    const ranking = request.candidates
      .filter((candidate) => !candidate.excluded)
      .sort((a, b) => b.score - a.score)
      .map((candidate, index) => ({
        playerId: candidate.playerId,
        rank: index + 1,
        score: candidate.score,
        reasons: candidate.reasons,
      }));

    return {
      model: "stub-1",
      summary: request.prompt?.objective ?? "Deterministic stub ranking",
      ranking,
    };
  },
};
