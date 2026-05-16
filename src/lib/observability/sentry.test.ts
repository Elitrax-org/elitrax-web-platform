import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loggerMocks = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
}));

vi.mock("@/lib/logging", () => ({
  logger: loggerMocks,
}));

const envMock = vi.hoisted(() => ({ SENTRY_DSN: undefined as string | undefined }));

vi.mock("@/lib/config/environment", () => ({
  serverEnvironment: envMock,
}));

const sentryMocks = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => sentryMocks);

describe("sentry observability", () => {
  beforeEach(() => {
    vi.resetModules();
    loggerMocks.info.mockReset();
    loggerMocks.error.mockReset();
    sentryMocks.init.mockReset();
    sentryMocks.captureException.mockReset();
    envMock.SENTRY_DSN = undefined;
  });

  afterEach(() => {
    envMock.SENTRY_DSN = undefined;
  });

  it("is disabled when SENTRY_DSN is missing", async () => {
    const mod = await import("./sentry");
    expect(mod.isSentryEnabled()).toBe(false);
    mod.captureException(new Error("boom"));
    expect(sentryMocks.captureException).not.toHaveBeenCalled();
    expect(loggerMocks.error).not.toHaveBeenCalled();
  });

  it("captures exceptions when SENTRY_DSN is present", async () => {
    envMock.SENTRY_DSN = "https://example@sentry.io/1";
    const mod = await import("./sentry");
    expect(mod.isSentryEnabled()).toBe(true);
    mod.initSentry();
    await vi.waitFor(() => {
      expect(sentryMocks.init).toHaveBeenCalledWith(
        expect.objectContaining({ dsn: "https://example@sentry.io/1" }),
      );
    });
    expect(loggerMocks.info).toHaveBeenCalledWith(
      "sentry.initialized",
      expect.any(Object),
    );
    mod.captureException(new Error("boom"), { source: "test" });
    await vi.waitFor(() => {
      expect(sentryMocks.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        { extra: { source: "test" } },
      );
    });
    expect(loggerMocks.error).toHaveBeenCalledWith(
      "sentry.capture",
      expect.objectContaining({ context: { source: "test" } }),
    );
  });
});
