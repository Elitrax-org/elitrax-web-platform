"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutationAction } from "@/components/forms/use-mutation-action";
import { Button, Field, Input, Select } from "@/components/ui";
import {
  createSessionInputSchema,
  type CreateSessionInput,
} from "@/application/schemas/session";

const kinds = ["team_training", "gym", "running", "match", "recovery", "other"] as const;

/**
 * Formulario de alta de sesión con normalización de fecha/hora.
 */
export function SessionCreateForm({
  labels,
  redirectTo,
}: {
  labels: {
    kind: string;
    kindOptions: Record<(typeof kinds)[number], string>;
    scheduledFor: string;
    notes: string;
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
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionInputSchema),
    defaultValues: { kind: "team_training" },
  });

  return (
    <form
      onSubmit={handleSubmit((raw) => {
        void run({
          errorMessage: labels.error,
          successMessage: labels.success,
          successTitle: labels.submit,
          refresh: true,
          redirectTo,
          request: async () => {
            const scheduledFor = raw.scheduledFor.length === 16
              ? `${raw.scheduledFor}:00.000Z`
              : raw.scheduledFor;
            const payload = { ...raw, scheduledFor, notes: raw.notes || undefined };
            return fetch("/api/v1/sessions", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            });
          },
          onSuccess: () => {
            reset({ kind: "team_training" });
          },
          onError: (error) => {
            setError("kind", { message: error.message || labels.error });
          },
        });
      })}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label={labels.kind} error={errors.kind?.message}>
        <Select
          {...register("kind")}
        >
          {kinds.map((k) => (
            <option key={k} value={k}>{labels.kindOptions[k]}</option>
          ))}
        </Select>
      </Field>
      <Field label={labels.scheduledFor} error={errors.scheduledFor?.message}>
        <Input
          type="datetime-local"
          {...register("scheduledFor", {
            setValueAs: (value: string) =>
              value && value.length === 16 ? `${value}:00.000Z` : value,
          })}
          {...(errors.scheduledFor ? { "aria-invalid": true } : {})}
        />
      </Field>
      <Field label={labels.notes} className="min-w-[220px] flex-1">
        <Input
          {...register("notes")}
          placeholder={labels.notes}
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
