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

const envMock = vi.hoisted(() => ({
  NEXT_PUBLIC_POSTHOG_KEY: undefined as string | undefined,
  NEXT_PUBLIC_POSTHOG_HOST: undefined as string | undefined,
}));

vi.mock("@/lib/config/environment", () => ({
  publicEnvironment: envMock,
}));

const posthogMocks = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
}));

vi.mock("posthog-js", () => ({
  default: posthogMocks,
}));

describe("posthog observability", () => {
  beforeEach(() => {
    vi.resetModules();
    loggerMocks.info.mockReset();
    posthogMocks.init.mockReset();
    posthogMocks.capture.mockReset();
    posthogMocks.identify.mockReset();
    envMock.NEXT_PUBLIC_POSTHOG_KEY = undefined;
    envMock.NEXT_PUBLIC_POSTHOG_HOST = undefined;
  });

  afterEach(() => {
    envMock.NEXT_PUBLIC_POSTHOG_KEY = undefined;
    envMock.NEXT_PUBLIC_POSTHOG_HOST = undefined;
  });

  it("is disabled when NEXT_PUBLIC_POSTHOG_KEY is missing", async () => {
    const mod = await import("./posthog");
    expect(mod.isPostHogEnabled()).toBe(false);
    mod.captureEvent("page_view");
    mod.identifyUser("user-1");
    expect(posthogMocks.capture).not.toHaveBeenCalled();
    expect(posthogMocks.identify).not.toHaveBeenCalled();
    expect(loggerMocks.info).not.toHaveBeenCalled();
  });

  it("captures events and identify when key is present", async () => {
    envMock.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    envMock.NEXT_PUBLIC_POSTHOG_HOST = "https://us.posthog.com";
    const mod = await import("./posthog");
    expect(mod.isPostHogEnabled()).toBe(true);
    mod.initPostHog();
    expect(posthogMocks.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ api_host: "https://us.posthog.com" }),
    );
    expect(loggerMocks.info).toHaveBeenCalledWith(
      "posthog.initialized",
      expect.any(Object),
    );
    mod.captureEvent("page_view", { path: "/" });
    expect(posthogMocks.capture).toHaveBeenCalledWith("page_view", { path: "/" });
    expect(loggerMocks.info).toHaveBeenCalledWith(
      "posthog.capture",
      expect.objectContaining({ event: "page_view" }),
    );
    mod.identifyUser("user-1", { plan: "pro" });
    expect(posthogMocks.identify).toHaveBeenCalledWith("user-1", { plan: "pro" });
    expect(loggerMocks.info).toHaveBeenCalledWith(
      "posthog.identify",
      expect.objectContaining({ distinctId: "user-1" }),
    );
  });
});
