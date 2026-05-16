export type ApiClientError = {
  code: string;
  message: string;
  status?: number;
};

function isApiErrorPayload(value: unknown): value is { error: ApiClientError } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "object" &&
    (value as { error?: { code?: unknown; message?: unknown } }).error?.code !== undefined &&
    (value as { error?: { code?: unknown; message?: unknown } }).error?.message !== undefined
  );
}

export async function getApiClientError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiClientError> {
  try {
    const body = (await response.json()) as unknown;
    if (isApiErrorPayload(body)) {
      return {
        code: body.error.code,
        message: body.error.message,
        status: response.status,
      };
    }
  } catch {
    // Ignore malformed payloads and fall back to the UI message.
  }

  return {
    code: "request_failed",
    message: fallbackMessage,
    status: response.status,
  };
}

export function getNetworkClientError(fallbackMessage: string): ApiClientError {
  return {
    code: "network_error",
    message: fallbackMessage,
  };
}