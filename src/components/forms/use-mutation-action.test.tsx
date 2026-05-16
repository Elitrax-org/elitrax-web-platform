import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
const pushToast = vi.fn();

vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/components/ui/toast-provider", () => ({
  useToast: () => ({ pushToast }),
}));

import { useMutationAction } from "./use-mutation-action";

describe("useMutationAction", () => {
  beforeEach(() => {
    refresh.mockReset();
    pushToast.mockReset();
  });

  it("returns parsed data, shows success toast, and refreshes when configured", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useMutationAction());

    let mutationResult:
      | Awaited<ReturnType<typeof result.current.run<{ id: string }>>>
      | undefined;

    await act(async () => {
      mutationResult = await result.current.run<{ id: string }>({
        request: async () =>
          new Response(JSON.stringify({ id: "player-1" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        parseJson: true,
        refresh: true,
        successMessage: "Player created",
        errorMessage: "Request failed",
        onSuccess,
      });
    });

    expect(mutationResult).toEqual({
      ok: true,
      data: { id: "player-1" },
    });
    expect(pushToast).toHaveBeenCalledWith({
      tone: "success",
      title: undefined,
      message: "Player created",
    });
    expect(onSuccess).toHaveBeenCalledWith({ id: "player-1" });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("parses API errors, surfaces an error toast, and skips refresh", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useMutationAction());

    let mutationResult:
      | Awaited<ReturnType<typeof result.current.run>>
      | undefined;

    await act(async () => {
      mutationResult = await result.current.run({
        request: async () =>
          new Response(
            JSON.stringify({
              error: {
                code: "validation_error",
                message: "Team is required",
              },
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          ),
        errorTitle: "Could not save",
        errorMessage: "Save failed",
        onError,
      });
    });

    expect(mutationResult).toEqual({
      ok: false,
      error: {
        code: "validation_error",
        message: "Team is required",
        status: 400,
      },
    });
    expect(pushToast).toHaveBeenCalledWith({
      tone: "error",
      title: "Could not save",
      message: "Team is required",
    });
    expect(onError).toHaveBeenCalledWith({
      code: "validation_error",
      message: "Team is required",
      status: 400,
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("returns a network error when the request throws", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useMutationAction());

    let mutationResult:
      | Awaited<ReturnType<typeof result.current.run>>
      | undefined;

    await act(async () => {
      mutationResult = await result.current.run({
        request: async () => {
          throw new Error("offline");
        },
        errorMessage: "Network unavailable",
        onError,
      });
    });

    expect(mutationResult).toEqual({
      ok: false,
      error: {
        code: "network_error",
        message: "Network unavailable",
      },
    });
    expect(pushToast).toHaveBeenCalledWith({
      tone: "error",
      title: undefined,
      message: "Network unavailable",
    });
    expect(onError).toHaveBeenCalledWith({
      code: "network_error",
      message: "Network unavailable",
    });
  });
});