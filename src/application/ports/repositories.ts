import type { AccountRole, AccountType } from "@/domain/account/roles";
import type {
  AccountMembership,
  AccountSubscription,
  AccountSummary,
  GymExerciseLogRecord,
  Injury,
  Invitation,
  MatchEvent,
  Player,
  PlayerComment,
  HeatmapTileRecord,
  PlayerMeasurement,
  RecommendationRun,
  SessionPlayerMetric,
  TeamRosterPlayer,
  TelemetryUpload,
  Team,
  TrainingSession,
} from "@/application/domain-types";
import type {
  CreatePlayerInput,
  CreateSessionInput,
  CreateTeamInput,
  IngestTelemetryBatchInput,
  LogGymExerciseInput,
  LogInjuryInput,
  PostCommentInput,
  PlayerMeasurementInput,
  RegisterTelemetryUploadInput,
  AddTeamPlayerInput,
  UpdateTeamInput,
  UpdateInjuryInput,
  UpdateCommentInput,
  UpdateTeamPlayerInput,
} from "@/application/schemas";
import type { TenantContext } from "@/application/context";

export type AccountRepository = {
  createAccount(input: {
    type: AccountType;
    displayName: string;
    ownerUserId: string;
    address: AccountSummary["address"];
    contact: AccountSummary["contact"];
    billing: AccountSummary["billing"];
  }): Promise<AccountSummary>;
  getAccount(accountId: string): Promise<AccountSummary | null>;
  listMemberships(userId: string): Promise<readonly AccountMembership[]>;
  getMembership(
    accountId: string,
    userId: string,
  ): Promise<AccountMembership | null>;
  countMembers(accountId: string): Promise<number>;
  addMember(input: {
    accountId: string;
    userId: string;
    role: AccountRole;
  }): Promise<AccountMembership>;
  createInvitation(input: {
    accountId: string;
    email: string;
    role: AccountRole;
    expiresAt: string;
  }): Promise<Invitation>;
};

export type SubscriptionRepository = {
  getSubscription(accountId: string): Promise<AccountSubscription | null>;
  upsertSubscription(input: AccountSubscription): Promise<AccountSubscription>;
  countTeams(accountId: string): Promise<number>;
  countPlayers(accountId: string): Promise<number>;
};

export type TeamRepository = {
  createTeam(
    accountId: string,
    input: CreateTeamInput,
  ): Promise<Team>;
  listTeams(accountId: string): Promise<readonly Team[]>;
  getTeam(accountId: string, teamId: string): Promise<Team | null>;
  updateTeam(
    accountId: string,
    teamId: string,
    input: UpdateTeamInput,
  ): Promise<Team>;
};

export type PlayerRepository = {
  createPlayer(
    accountId: string,
    input: CreatePlayerInput,
  ): Promise<Player>;
  deletePlayer(accountId: string, playerId: string): Promise<void>;
  listPlayers(accountId: string): Promise<readonly Player[]>;
  getPlayer(accountId: string, playerId: string): Promise<Player | null>;
};

export type TeamPlayerRepository = {
  addPlayerToTeam(input: {
    accountId: string;
    teamId: string;
    playerId: string;
    data: AddTeamPlayerInput;
  }): Promise<TeamRosterPlayer>;
  listTeamPlayers(
    accountId: string,
    teamId: string,
  ): Promise<readonly TeamRosterPlayer[]>;
  updateTeamPlayer(input: {
    accountId: string;
    teamId: string;
    playerId: string;
    data: UpdateTeamPlayerInput;
  }): Promise<TeamRosterPlayer>;
  removeTeamPlayer(
    accountId: string,
    teamId: string,
    playerId: string,
  ): Promise<void>;
};

export type InjuryRepository = {
  logInjury(input: {
    accountId: string;
    playerId: string;
    authorUserId: string;
    data: LogInjuryInput;
  }): Promise<Injury>;
  updateInjury(input: {
    accountId: string;
    playerId: string;
    injuryId: string;
    authorUserId: string;
    data: UpdateInjuryInput;
  }): Promise<Injury>;
  listInjuriesForPlayer(
    accountId: string,
    playerId: string,
  ): Promise<readonly Injury[]>;
  deleteInjury(input: {
    accountId: string;
    playerId: string;
    injuryId: string;
  }): Promise<void>;
};

export type CommentRepository = {
  postComment(input: {
    accountId: string;
    playerId: string;
    authorUserId: string;
    injuryId?: string;
    data: PostCommentInput;
  }): Promise<PlayerComment>;
  listComments(
    accountId: string,
    playerId: string,
  ): Promise<readonly PlayerComment[]>;
  getComment(
    accountId: string,
    playerId: string,
    commentId: string,
  ): Promise<PlayerComment | null>;
  updateComment(input: {
    accountId: string;
    playerId: string;
    commentId: string;
    data: UpdateCommentInput;
  }): Promise<PlayerComment>;
  deleteComment(
    accountId: string,
    playerId: string,
    commentId: string,
  ): Promise<void>;
};

export type PlayerMeasurementRepository = {
  recordMeasurement(input: {
    accountId: string;
    playerId: string;
    data: PlayerMeasurementInput;
  }): Promise<PlayerMeasurement>;
  listMeasurements(
    accountId: string,
    playerId: string,
  ): Promise<readonly PlayerMeasurement[]>;
};

export type SessionRepository = {
  createSession(
    accountId: string,
    input: CreateSessionInput,
  ): Promise<TrainingSession>;
  listSessions(accountId: string): Promise<readonly TrainingSession[]>;
  getSession(
    accountId: string,
    sessionId: string,
  ): Promise<TrainingSession | null>;
  appendMatchEvent(input: {
    accountId: string;
    sessionId: string;
    occurredAt: string;
    matchMinute?: number;
    kind: MatchEvent["kind"];
    playerId?: string;
    payload?: Readonly<Record<string, unknown>>;
  }): Promise<MatchEvent>;
  listMatchEvents(
    accountId: string,
    sessionId: string,
  ): Promise<readonly MatchEvent[]>;
};

export type GymExerciseLogRepository = {
  logExercise(input: {
    accountId: string;
    sessionId: string;
    data: LogGymExerciseInput;
  }): Promise<GymExerciseLogRecord>;
  listForSession(
    accountId: string,
    sessionId: string,
  ): Promise<readonly GymExerciseLogRecord[]>;
};

export type TelemetryRepository = {
  registerUpload(
    accountId: string,
    input: RegisterTelemetryUploadInput,
  ): Promise<TelemetryUpload>;
  ingestBatch(input: {
    accountId: string;
    data: IngestTelemetryBatchInput;
  }): Promise<TelemetryUpload>;
  listUploads(accountId: string): Promise<readonly TelemetryUpload[]>;
  getRawSamples(
    accountId: string,
    uploadId: string,
  ): Promise<
    ReadonlyArray<{
      capturedAt: string;
      latitude?: number;
      longitude?: number;
      speedMps?: number;
      heartRate?: number;
    }>
  >;
  listUploadsForSessionPlayer(input: {
    accountId: string;
    sessionId: string;
    playerId?: string;
  }): Promise<readonly TelemetryUpload[]>;
};

export type SessionPlayerMetricRepository = {
  getMetric(input: {
    accountId: string;
    sessionId: string;
    playerId: string;
  }): Promise<SessionPlayerMetric | null>;
  listMetrics(input: {
    accountId: string;
    sessionIds?: readonly string[];
    playerIds?: readonly string[];
  }): Promise<readonly SessionPlayerMetric[]>;
  upsertMetric(input: {
    accountId: string;
    sessionId: string;
    playerId: string;
    totalDistanceMeters?: number;
    totalDurationSeconds?: number;
    averageSpeedMps?: number;
    maxSpeedMps?: number;
    zones?: Readonly<Record<string, number>>;
  }): Promise<SessionPlayerMetric>;
};

export type HeatmapTileRepository = {
  listTiles(input: {
    accountId: string;
    sessionId: string;
    playerId?: string;
  }): Promise<readonly HeatmapTileRecord[]>;
  replaceTiles(input: {
    accountId: string;
    sessionId: string;
    playerId?: string;
    tiles: ReadonlyArray<{
      tileX: number;
      tileY: number;
      intensity: number;
    }>;
  }): Promise<readonly HeatmapTileRecord[]>;
};

export type RecommendationRepository = {
  recordRun(input: {
    accountId: string;
    requestedBy: string;
    model?: string;
    candidates: RecommendationRun["candidates"];
  }): Promise<RecommendationRun>;
  listRuns(accountId: string): Promise<readonly RecommendationRun[]>;
};

export type ApplicationDependencies = {
  readonly accounts: AccountRepository;
  readonly subscriptions: SubscriptionRepository;
  readonly teams: TeamRepository;
  readonly players: PlayerRepository;
  readonly teamPlayers: TeamPlayerRepository;
  readonly injuries: InjuryRepository;
  readonly comments: CommentRepository;
  readonly measurements: PlayerMeasurementRepository;
  readonly sessions: SessionRepository;
  readonly gymLogs: GymExerciseLogRepository;
  readonly telemetry: TelemetryRepository;
  readonly sessionMetrics: SessionPlayerMetricRepository;
  readonly heatmaps: HeatmapTileRepository;
  readonly recommendations: RecommendationRepository;
};

export type ContextualOperation<TInput, TOutput> = (
  context: TenantContext,
  input: TInput,
) => Promise<TOutput>;

export type {
  AccountMembership,
  AccountSubscription,
  AccountSummary,
  GymExerciseLogRecord,
  Injury,
  Invitation,
  MatchEvent,
  Player,
  PlayerComment,
  HeatmapTileRecord,
  PlayerMeasurement,
  RecommendationRun,
  SessionPlayerMetric,
  TeamRosterPlayer,
  TelemetryUpload,
  Team,
  TrainingSession,
} from "@/application/domain-types";
