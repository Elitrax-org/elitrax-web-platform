"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  appendMatchEventInputSchema,
  type AppendMatchEventInput,
} from "@/application/schemas/session";
import { useRouter } from "@/i18n/routing";

/**
 * Formulario para registrar eventos de partido en una sesión.
 */
export function MatchEventForm({
  sessionId,
  labels,
}: {
  sessionId: string;
  labels: {
    kind: string;
    minute: string;
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
    reset,
    formState: { errors },
    setError,
  } = useForm<AppendMatchEventInput>({
    resolver: zodResolver(appendMatchEventInputSchema),
    defaultValues: { kind: "note" },
  });

  return (
    <form
      onSubmit={handleSubmit((raw) => {
        // Convierte minuto a número cuando llega como string del input.
        const data = {
          ...raw,
          matchMinute:
            typeof raw.matchMinute === "string"
              ? Number(raw.matchMinute) || undefined
              : raw.matchMinute,
        };
        startTransition(async () => {
          // El form sólo cubre el caso mínimo de evento; otros campos opcionales pueden crecer sin tocar la ruta base.
          const res = await fetch(`/api/v1/sessions/${sessionId}/events`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            setError("kind", { message: labels.error });
            return;
          }
          reset({ kind: "note" });
          router.refresh();
        });
      })}
      className="flex flex-wrap items-end gap-2"
    >
      <label className="flex flex-col text-xs">
        {labels.kind}
        <select
          {...register("kind")}
          className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
        >
          {[
            "goal",
            "assist",
            "shot",
            "foul",
            "yellow_card",
            "red_card",
            "substitution",
            "injury",
            "note",
          ].map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col text-xs">
        {labels.minute}
        <input
          type="number"
          min={0}
          max={180}
          {...register("matchMinute", { valueAsNumber: true })}
          className="mt-1 w-24 rounded-md border border-outline-variant bg-surface p-1 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-on-primary disabled:opacity-50"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
      {errors.kind ? <p className="w-full text-xs text-error">{errors.kind.message}</p> : null}
    </form>
  );
}
