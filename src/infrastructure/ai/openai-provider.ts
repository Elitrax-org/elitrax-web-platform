import "server-only";

import type {
  AiProvider,
  AiRecommendationRequest,
  AiRecommendationResult,
} from "@/application/ports/providers";
import { serverEnvironment } from "@/lib/config/environment";
import { ValidationError } from "@/lib/errors";

/**
 * OpenAI-backed AI provider skeleton for Pro+ recommendation runs. The real
 * implementation should call the chat-completions or responses endpoint with
 * the candidates serialised as structured input and parse the model output
 * into `AiRecommendationResult`.
 *
 * Until an API key is provisioned this provider throws so callers fall back
 * to the deterministic stub provider.
 */
class OpenAiProvider implements AiProvider {
  readonly name = "openai";

  async rankCandidates(
    request: AiRecommendationRequest,
  ): Promise<AiRecommendationResult> {
    if (!serverEnvironment.AI_API_KEY) {
      throw new ValidationError(
        "AI_API_KEY is not configured; falling back to stub provider",
      );
    }
    // TODO: build prompt with request.candidates + request.prompt, call OpenAI,
    // and map structured output into the AiRecommendationResult shape.
    void request;
    throw new ValidationError("openai provider not implemented yet");
  }
}

export const openAiProvider = new OpenAiProvider();
