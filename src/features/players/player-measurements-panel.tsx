"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { PlayerMeasurement } from "@/application/domain-types";
import {
  playerMeasurementInputSchema,
  type PlayerMeasurementInput,
} from "@/application/schemas";
import { useRouter } from "@/i18n/routing";

/**
 * Panel para registrar y visualizar evolución antropométrica del jugador.
 */
export function PlayerMeasurementsPanel({
  playerId,
  playerBirthDate,
  measurements,
  labels,
}: {
  playerId: string;
  playerBirthDate?: string;
  measurements: readonly PlayerMeasurement[];
  labels: {
    title: string;
    noData: string;
    takenAt: string;
    height: string;
    weight: string;
    submit: string;
    submitting: string;
    error: string;
    chartTitle: string;
    bmi: string;
    bmiRange: string;
    bmiRangeLower: string;
    bmiRangeUpper: string;
    noNumericValues: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PlayerMeasurementInput>({
    resolver: zodResolver(playerMeasurementInputSchema),
  });

  // Normaliza fecha de formulario a ISO para backend.
  function toIsoDateTime(input: string | undefined) {
    if (!input) return undefined;
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? input : date.toISOString();
  }

  function getApiErrorMessage(payload: unknown) {
    if (!payload || typeof payload !== "object") return labels.error;
    const data = payload as { error?: { message?: string } };
    return data.error?.message ?? labels.error;
  }

  const onSubmit = handleSubmit((raw) => {
    startTransition(async () => {
      const payload: PlayerMeasurementInput = {
        takenAt: toIsoDateTime(raw.takenAt),
        heightCentimeters: raw.heightCentimeters,
        weightKilograms: raw.weightKilograms,
      };
      const res = await fetch(`/api/v1/players/${playerId}/measurements`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => undefined);
        setError("root.server", {
          message: getApiErrorMessage(errorBody),
        });
        return;
      }
      reset();
      router.refresh();
    });
  });

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg">{labels.title}</h2>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2 rounded-md border border-outline-variant p-3">
        <label className="flex flex-col text-xs">
          {labels.takenAt}
          <input
            type="datetime-local"
            {...register("takenAt", {
              setValueAs: (value: string) => toIsoDateTime(value),
            })}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          />
          {errors.takenAt ? (
            <span role="alert" className="mt-1 text-error">{errors.takenAt.message}</span>
          ) : null}
        </label>
        <label className="flex flex-col text-xs">
          {labels.height}
          <input
            type="number"
            step="0.1"
            {...register("heightCentimeters", { setValueAs: (v) => Number(v) || undefined })}
            className="mt-1 w-24 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          />
          {errors.heightCentimeters ? (
            <span role="alert" className="mt-1 text-error">{errors.heightCentimeters.message}</span>
          ) : null}
        </label>
        <label className="flex flex-col text-xs">
          {labels.weight}
          <input
            type="number"
            step="0.1"
            {...register("weightKilograms", { setValueAs: (v) => Number(v) || undefined })}
            className="mt-1 w-24 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          />
          {errors.weightKilograms ? (
            <span role="alert" className="mt-1 text-error">{errors.weightKilograms.message}</span>
          ) : null}
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-on-primary disabled:opacity-50"
        >
          {pending ? labels.submitting : labels.submit}
        </button>
        {errors.root?.server ? (
          <p role="alert" className="w-full text-xs text-error">{errors.root.server.message}</p>
        ) : null}
      </form>

      <div className="rounded-md border border-outline-variant bg-surface-container p-3">
        <p className="mb-2 text-xs text-foreground/70">{labels.chartTitle}</p>
        {measurements.length === 0 ? (
          <p className="text-sm text-foreground/70">{labels.noData}</p>
        ) : (
          <MeasurementChart measurements={measurements} playerBirthDate={playerBirthDate} labels={labels} />
        )}
      </div>
    </section>
  );
}

/**
 * Gráfico SVG de BMI y rango recomendado según edad estimada.
 */
function MeasurementChart({
  measurements,
  playerBirthDate,
  labels,
}: {
  measurements: readonly PlayerMeasurement[];
  playerBirthDate?: string;
  labels: {
    bmi: string;
    bmiRange: string;
    bmiRangeLower: string;
    bmiRangeUpper: string;
    noNumericValues: string;
  };
}) {
  const points = measurements
    .slice()
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime())
    .slice(-12)
    .map((point) => {
      const weight = point.weightKilograms;
      const heightCm = point.heightCentimeters;
      if (typeof weight !== "number" || typeof heightCm !== "number" || heightCm <= 0) return null;

      const date = new Date(point.takenAt);
      const heightMeters = heightCm / 100;
      const bmi = weight / (heightMeters * heightMeters);
      const ageYears = getAgeAtDate(playerBirthDate, date);
      const range = getBmiRangeByAge(ageYears);

      return {
        id: point.id,
        date,
        bmi,
        weight,
        heightCm,
        lower: range.lower,
        upper: range.upper,
      };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);

  if (points.length === 0) {
    return <p className="text-sm text-foreground/70">{labels.noNumericValues}</p>;
  }

  const xStart = points[0]?.date.getTime() ?? 0;
  const xEnd = points[points.length - 1]?.date.getTime() ?? xStart + 1;
  const xSpan = Math.max(1, xEnd - xStart);

  const yValues = points.flatMap((point) => [point.bmi, point.lower, point.upper]);
  const yMin = Math.min(...yValues) - 0.8;
  const yMax = Math.max(...yValues) + 0.8;
  const ySpan = Math.max(1, yMax - yMin);

  const xOf = (date: Date) => ((date.getTime() - xStart) / xSpan) * 100;
  const yOf = (value: number) => 100 - ((value - yMin) / ySpan) * 100;

  const toPath = (values: readonly { x: number; y: number }[]) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"}${value.x},${value.y}`).join(" ");

  const bmiPath = toPath(points.map((point) => ({ x: xOf(point.date), y: yOf(point.bmi) })));
  const lowerPath = toPath(points.map((point) => ({ x: xOf(point.date), y: yOf(point.lower) })));
  const upperPath = toPath(points.map((point) => ({ x: xOf(point.date), y: yOf(point.upper) })));

  const axisTicks = [0, 25, 50, 75, 100];
  const tickLabels = [points[0], points[Math.floor((points.length - 1) / 2)], points[points.length - 1]];

  return (
    <div className="space-y-2">
      <svg viewBox="0 0 100 100" className="h-52 w-full overflow-visible">
        {axisTicks.map((tick) => (
          <line
            key={tick}
            x1={0}
            y1={tick}
            x2={100}
            y2={tick}
            className="stroke-outline-variant/40"
            strokeWidth="0.4"
          />
        ))}

        <path d={lowerPath} className="fill-none stroke-secondary/70 stroke-[1]" strokeDasharray="2 1.5" />
        <path d={upperPath} className="fill-none stroke-secondary/70 stroke-[1]" strokeDasharray="2 1.5" />
        <path d={bmiPath} className="fill-none stroke-primary stroke-[1.6]" />

        {points.map((point) => {
          const x = xOf(point.date);
          const y = yOf(point.bmi);
          return (
            <g key={point.id}>
              <circle cx={x} cy={y} r="1.5" className="fill-primary" />
              <title>
                {point.date.toLocaleDateString()} | {labels.bmi}: {point.bmi.toFixed(1)} | {point.weight.toFixed(1)} kg / {point.heightCm.toFixed(1)} cm
              </title>
              <text
                x={Math.min(98, x + 1.3)}
                y={Math.max(4, y - 1.8)}
                fontSize="2.2"
                className="fill-foreground/80"
              >
                {`${point.weight.toFixed(1)}kg · ${point.heightCm.toFixed(1)}cm`}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-foreground/75">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-4 rounded bg-primary" />
          {labels.bmi}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-secondary/70" />
          {labels.bmiRange}
        </span>
        <span>{labels.bmiRangeLower}</span>
        <span>{labels.bmiRangeUpper}</span>
      </div>

      <div className="flex justify-between text-[11px] text-foreground/65">
        {tickLabels.map((point, idx) => (
          <span key={`${point.id}-${idx}`}>{point.date.toLocaleDateString()}</span>
        ))}
      </div>
    </div>
  );
}

function getAgeAtDate(birthDate: string | undefined, at: Date) {
  if (!birthDate) return undefined;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return undefined;
  let age = at.getFullYear() - birth.getFullYear();
  const monthDelta = at.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && at.getDate() < birth.getDate())) age -= 1;
  return Math.max(0, age);
}

// Rango orientativo de BMI por tramo etario.
function getBmiRangeByAge(ageYears: number | undefined) {
  if (typeof ageYears !== "number") {
    return { lower: 18.5, upper: 24.9 };
  }
  if (ageYears < 6) return { lower: 14.0, upper: 17.0 };
  if (ageYears < 10) return { lower: 14.0, upper: 19.0 };
  if (ageYears < 14) return { lower: 15.0, upper: 22.0 };
  if (ageYears < 18) return { lower: 17.0, upper: 25.0 };
  return { lower: 18.5, upper: 24.9 };
}
