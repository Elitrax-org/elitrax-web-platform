"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutationAction } from "@/components/forms/use-mutation-action";
import { Button, Field, Input } from "@/components/ui";
import {
  createPlayerInputSchema,
  type CreatePlayerInput,
} from "@/application/schemas/player";

/**
 * Formulario de alta de jugadores en la cuenta activa.
 */
export function PlayerCreateForm({
  labels,
  redirectTo,
}: {
  labels: {
    displayName: string;
    position: string;
    birthDate: string;
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
  } = useForm<CreatePlayerInput>({ resolver: zodResolver(createPlayerInputSchema) });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        void run({
          errorMessage: labels.error,
          successMessage: labels.success,
          successTitle: labels.submit,
          refresh: true,
          redirectTo,
          request: async () => {
            const payload: CreatePlayerInput = {
              ...data,
              birthDate: data.birthDate || undefined,
              position: data.position || undefined,
            };
            return fetch("/api/v1/players", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            });
          },
          onSuccess: () => {
            reset();
          },
          onError: (error) => {
            setError("displayName", { message: error.message || labels.error });
          },
        });
      })}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label={labels.displayName} error={errors.displayName?.message} className="w-56">
        <Input
          {...register("displayName")}
          {...(errors.displayName ? { "aria-invalid": true } : {})}
          placeholder={labels.displayName}
        />
      </Field>
      <Field label={labels.position} className="w-32">
        <Input
          {...register("position")}
          placeholder={labels.position}
        />
      </Field>
      <Field label={labels.birthDate}>
        <Input
          type="date"
          {...register("birthDate")}
        />
      </Field>
      <Button
        type="submit"
        disabled={pending}
        className="min-w-36"
      >
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
