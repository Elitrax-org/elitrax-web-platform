"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutationAction } from "@/components/forms/use-mutation-action";
import { Button, Field, Input, Select } from "@/components/ui";
import {
  registerTelemetryUploadInputSchema,
  type RegisterTelemetryUploadInput,
} from "@/application/schemas/telemetry";

const sources = ["garmin", "polar", "apple_health", "manual", "other"] as const;

/**
 * Formulario para registrar metadata de un upload de telemetría.
 */
export function TelemetryUploadForm({
  accountId,
  labels,
  redirectTo,
}: {
  accountId: string;
  labels: {
    source: string;
    sourceOptions: Record<(typeof sources)[number], string>;
    storagePath: string;
    submit: string;
    submitting: string;
    error: string;
    success: string;
  };
  redirectTo?: string;
}) {
  const { pending, run } = useMutationAction();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<RegisterTelemetryUploadInput>({
    resolver: zodResolver(registerTelemetryUploadInputSchema),
    // Se propone el prefijo de cuenta para empujar al usuario a un path ya scopeado correctamente.
    defaultValues: { source: "manual", storagePath: `${accountId}/` },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        void run({
          errorMessage: labels.error,
          successMessage: labels.success,
          successTitle: labels.submit,
          refresh: true,
          redirectTo,
          request: () =>
            fetch("/api/v1/telemetry/uploads", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(data),
            }),
          onSuccess: () => {
            reset({ source: "manual", storagePath: `${accountId}/` });
          },
          onError: (error) => {
            setError("storagePath", { message: error.message || labels.error });
          },
        });
      })}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label={labels.source}>
        <Select
          {...register("source")}
        >
          {sources.map((s) => (
            <option key={s} value={s}>
              {labels.sourceOptions[s]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={labels.storagePath} error={errors.storagePath?.message} className="min-w-[260px] flex-1">
        <Input
          {...register("storagePath")}
          {...(errors.storagePath ? { "aria-invalid": true } : {})}
          placeholder={`${accountId}/`}
        />
      </Field>
      <Button
        type="submit"
        disabled={pending}
        className="min-w-40"
      >
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
