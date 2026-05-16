"use client";

import { useTransition } from "react";

import { useToast } from "@/components/ui/toast-provider";
import {
  getApiClientError,
  getNetworkClientError,
  type ApiClientError,
} from "@/lib/api/client-error";
import { useRouter } from "@/i18n/routing";

type MutationActionOptions<TData> = {
  request: () => Promise<Response>;
  successMessage?: string;
  errorMessage: string;
  successTitle?: string;
  errorTitle?: string;
  refresh?: boolean;
  redirectTo?: string;
  parseJson?: boolean;
  onSuccess?: (data: TData | undefined) => void | Promise<void>;
  onError?: (error: ApiClientError) => void | Promise<void>;
};

type MutationActionResult<TData> =
  | { ok: true; data: TData | undefined }
  | { ok: false; error: ApiClientError };

export function useMutationAction() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [pending, startTransition] = useTransition();

  function run<TData = undefined>(
    options: MutationActionOptions<TData>,
  ): Promise<MutationActionResult<TData>> {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const response = await options.request();

          if (!response.ok) {
            const error = await getApiClientError(response, options.errorMessage);
            pushToast({
              tone: "error",
              title: options.errorTitle,
              message: error.message || options.errorMessage,
            });
            await options.onError?.(error);
            resolve({ ok: false, error });
            return;
          }

          const data = options.parseJson
            ? ((await response.json()) as TData)
            : undefined;

          if (options.successMessage) {
            pushToast({
              tone: "success",
              title: options.successTitle,
              message: options.successMessage,
            });
          }

          await options.onSuccess?.(data);

          if (options.redirectTo) {
            router.replace(options.redirectTo);
          }

          if (options.refresh) {
            router.refresh();
          }

          resolve({ ok: true, data });
        } catch {
          const error = getNetworkClientError(options.errorMessage);
          pushToast({
            tone: "error",
            title: options.errorTitle,
            message: error.message,
          });
          await options.onError?.(error);
          resolve({ ok: false, error });
        }
      });
    });
  }

  return { pending, run };
}