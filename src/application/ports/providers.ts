import type { AccountSubscription } from "@/application/domain-types";
import type { BillingWebhookEvent } from "@/application/schemas/billing";

export type BillingProvider = {
  readonly name: string;
  verifyWebhookSignature(input: {
    rawBody: string;
    signature: string;
  }): Promise<BillingWebhookEvent>;
};

export type AiRecommendationRequest = {
  readonly accountId: string;
  readonly requestedBy: string;
  readonly candidates: ReadonlyArray<{
    readonly playerId: string;
    readonly score: number;
    readonly reasons: readonly string[];
    readonly excluded: boolean;
  }>;
  readonly prompt?: { context?: string; objective?: string };
};

export type AiRecommendationResult = {
  readonly model: string;
  readonly summary?: string;
  readonly ranking: ReadonlyArray<{
    readonly playerId: string;
    readonly rank: number;
    readonly score: number;
    readonly reasons: readonly string[];
  }>;
};

export type AiProvider = {
  readonly name: string;
  rankCandidates(
    request: AiRecommendationRequest,
  ): Promise<AiRecommendationResult>;
};

export type CurrentUser = {
  readonly userId: string;
  readonly email?: string;
  readonly fullName?: string;
};

export type AuthGateway = {
  getCurrentUser(): Promise<CurrentUser | null>;
  signInWithPassword(input: { email: string; password: string }): Promise<void>;
  signUpWithPassword(input: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<{ requiresEmailConfirmation: boolean }>;
  signOut(): Promise<void>;
  requestPasswordReset(input: {
    email: string;
    redirectTo?: string;
  }): Promise<void>;
  updatePassword(input: { password: string }): Promise<void>;
};

export type SubscriptionSyncResult = {
  readonly accountId: string;
  readonly tier: AccountSubscription["tier"];
  readonly status: AccountSubscription["status"];
};
