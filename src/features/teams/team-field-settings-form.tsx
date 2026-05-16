"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Team } from "@/application/domain-types";
import { updateTeamInputSchema, type UpdateTeamInput } from "@/application/schemas";
import { useRouter } from "@/i18n/routing";

export function TeamFieldSettingsForm({
  team,
  labels,
}: {
  team: Pick<Team, "id" | "fieldLengthMeters" | "fieldWidthMeters">;
  labels: {
    title: string;
    description: string;
    length: string;
    width: string;
    hint: string;
    submit: string;
    submitting: string;
    error: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.input<typeof updateTeamInputSchema>, undefined, UpdateTeamInput>({
    resolver: zodResolver(updateTeamInputSchema),
    defaultValues: {
      fieldLengthMeters: team.fieldLengthMeters,
      fieldWidthMeters: team.fieldWidthMeters,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        startTransition(async () => {
          // Las dimensiones del campo viven a nivel equipo porque impactan análisis posteriores como heatmaps.
          const res = await fetch(`/api/v1/teams/${team.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            setError("root.server", { message: labels.error });
            return;
          }
          router.refresh();
        });
      })}
      className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container p-4"
    >
      <div>
        <h2 className="font-heading text-lg">{labels.title}</h2>
        <p className="text-sm text-foreground/70">{labels.description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col text-xs">
          {labels.length}
          <input
            type="number"
            {...register("fieldLengthMeters")}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-2 text-sm"
          />
        </label>
        <label className="flex flex-col text-xs">
          {labels.width}
          <input
            type="number"
            {...register("fieldWidthMeters")}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-2 text-sm"
          />
        </label>
      </div>
      <p className="text-xs text-foreground/65">{labels.hint}</p>
      {errors.root?.server ? <p className="text-xs text-error">{errors.root.server.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-on-primary disabled:opacity-50"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}