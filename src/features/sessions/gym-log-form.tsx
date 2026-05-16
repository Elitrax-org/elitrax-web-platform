"use client";

import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  logGymExerciseInputSchema,
  type LogGymExerciseInput,
} from "@/application/schemas/session";
import { useRouter } from "@/i18n/routing";
import type { Player } from "@/application/domain-types";

type Labels = {
  player: string;
  exercise: string;
  performedAt: string;
  weight: string;
  reps: string;
  rpe: string;
  addSet: string;
  removeSet: string;
  submit: string;
  submitting: string;
  error: string;
  noPlayers: string;
};

/**
 * Formulario dinámico para cargar sets de ejercicio de gimnasio.
 */
export function GymLogForm({
  sessionId,
  players,
  labels,
}: {
  sessionId: string;
  players: readonly Player[];
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setError,
  } = useForm<LogGymExerciseInput>({
    resolver: zodResolver(logGymExerciseInputSchema),
    defaultValues: {
      playerId: players[0]?.id ?? "",
      exerciseId: "",
      sets: [{ weightKilograms: 0, repetitions: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sets",
  });

  if (players.length === 0) {
    // La UI corta temprano porque un log de gimnasio sin jugador asignado no tiene sentido de negocio.
    return <p className="text-sm text-foreground/70">{labels.noPlayers}</p>;
  }

  return (
    <form
      onSubmit={handleSubmit((raw) => {
        // Normaliza campos numéricos para garantizar payload válido.
        const payload: LogGymExerciseInput = {
          playerId: raw.playerId,
          exerciseId: raw.exerciseId.trim(),
          ...(raw.performedAt ? { performedAt: raw.performedAt } : {}),
          sets: raw.sets.map((s) => ({
            weightKilograms: Number(s.weightKilograms) || 0,
            repetitions: Number(s.repetitions) || 1,
            ...(s.rpe != null && !Number.isNaN(Number(s.rpe))
              ? { rpe: Number(s.rpe) }
              : {}),
          })),
        };
        startTransition(async () => {
          // Cada submit persiste una ejecución completa del ejercicio con todos sus sets asociados.
          const res = await fetch(
            `/api/v1/sessions/${sessionId}/gym-logs`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
          if (!res.ok) {
            setError("exerciseId", { message: labels.error });
            return;
          }
          reset({
            playerId: payload.playerId,
            exerciseId: "",
            sets: [{ weightKilograms: 0, repetitions: 1 }],
          });
          router.refresh();
        });
      })}
      className="space-y-3 rounded-md border border-outline-variant bg-surface-container p-3"
    >
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex flex-col text-xs">
          {labels.player}
          <select
            {...register("playerId")}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs">
          {labels.exercise}
          <input
            type="text"
            {...register("exerciseId")}
            placeholder="back_squat"
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          />
          {errors.exerciseId ? (
            <span className="text-xs text-error">
              {errors.exerciseId.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col text-xs">
          {labels.performedAt}
          <input
            type="datetime-local"
            {...register("performedAt", {
              setValueAs: (value: string) =>
                !value
                  ? undefined
                  : value.length === 16
                    ? `${value}:00.000Z`
                    : value,
            })}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          />
        </label>
      </div>

      <div className="space-y-2">
        {fields.map((field, idx) => (
          <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <label className="flex flex-col text-xs">
              {labels.weight}
              <input
                type="number"
                step="0.5"
                min={0}
                {...register(`sets.${idx}.weightKilograms` as const, {
                  valueAsNumber: true,
                })}
                className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
              />
            </label>
            <label className="flex flex-col text-xs">
              {labels.reps}
              <input
                type="number"
                min={1}
                {...register(`sets.${idx}.repetitions` as const, {
                  valueAsNumber: true,
                })}
                className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
              />
            </label>
            <label className="flex flex-col text-xs">
              {labels.rpe}
              <input
                type="number"
                min={1}
                max={10}
                step="0.5"
                {...register(`sets.${idx}.rpe` as const, {
                  setValueAs: (value: string | number | undefined) => {
                    if (value === "" || value === undefined || value === null) {
                      return undefined;
                    }
                    const n = Number(value);
                    return Number.isNaN(n) ? undefined : n;
                  },
                })}
                className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
              />
            </label>
            {fields.length > 1 ? (
              <button
                type="button"
                onClick={() => remove(idx)}
                className="self-end rounded-md border border-outline-variant px-2 py-1 text-xs text-foreground/70 hover:text-error"
              >
                {labels.removeSet}
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ weightKilograms: 0, repetitions: 1 })}
          // El formulario modela sets variables, por eso usa useFieldArray en vez de inputs fijos.
          className="rounded-md border border-outline-variant px-2 py-1 text-xs text-foreground/70 hover:text-primary"
        >
          {labels.addSet}
        </button>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary disabled:opacity-50"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
