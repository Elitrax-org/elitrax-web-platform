"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useMutationAction } from "@/components/forms/use-mutation-action";
import { Button, Field, Input, Select } from "@/components/ui";
import {
  createTeamInputSchema,
  teamSportTypeValues,
  type CreateTeamInput,
} from "@/application/schemas/team";

/**
 * Formulario para crear equipos dentro de la cuenta activa.
 */
export function TeamCreateForm({
  labels,
  redirectTo,
}: {
  labels: {
    name: string;
    sportType: string;
    sportTypes: Record<(typeof teamSportTypeValues)[number], string>;
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
  } = useForm<z.input<typeof createTeamInputSchema>, undefined, CreateTeamInput>({
    resolver: zodResolver(createTeamInputSchema),
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
            fetch("/api/v1/teams", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(data),
            }),
          onSuccess: () => {
            reset();
          },
          onError: (error) => {
            setError("name", { message: error.message || labels.error });
          },
        });
      })}
      className="flex flex-wrap items-end gap-3"
    >
      <Field label={labels.name} error={errors.name?.message} className="w-56">
        <Input
          {...register("name")}
          {...(errors.name ? { "aria-invalid": true } : {})}
          placeholder={labels.name}
        />
      </Field>
      <Field label={labels.sportType} className="w-40">
        <Select
          {...register("sportType")}
          defaultValue={teamSportTypeValues[0]}
        >
          {teamSportTypeValues.map((sportType) => (
            <option key={sportType} value={sportType}>
              {labels.sportTypes[sportType]}
            </option>
          ))}
        </Select>
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
