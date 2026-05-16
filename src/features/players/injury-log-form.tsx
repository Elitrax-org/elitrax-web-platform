"use client";

import { useTransition } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  logInjuryInputSchema,
  type LogInjuryInput,
} from "@/application/schemas/injury";
import {
  bodyZoneDetail,
  type BodyRegion,
  type BodyZoneDefinition,
} from "@/domain/health/body-zone";
import { useRouter } from "@/i18n/routing";
import { BodyZonePicker } from "./body-zone-picker";

/**
 * Formulario de registro de lesión con selector anatómico por región/zona.
 */
export function InjuryLogForm({
  playerId,
  labels,
}: {
  playerId: string;
  labels: {
    diagnosedAt: string;
    status: string;
    estimatedRecoveryAt: string;
    severity: string;
    description: string;
    injuryComment: string;
    bodyZone: string;
    bodyRegion: string;
    submit: string;
    submitting: string;
    error: string;
    bodyFigureTitle: string;
    front: string;
    back: string;
    selectedRegion: string;
    zonesTitle: string;
    statusOption: {
      injured: string;
      recovering: string;
      recovered: string;
    };
    region: Record<BodyRegion, string>;
    zone: Record<BodyZoneDefinition["code"], string>;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    setError,
  } = useForm<LogInjuryInput>({
    resolver: zodResolver(logInjuryInputSchema),
    defaultValues: {
      status: "injured",
      bodyRegion: "torso",
      bodyZoneDetail: 0,
    },
  });

  const selectedRegion = useWatch({
    control,
    name: "bodyRegion",
    defaultValue: "torso",
  }) as BodyRegion;

  // Convierte datetime-local a ISO antes de enviar.
  function toIsoDateTime(input: string) {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? input : date.toISOString();
  }

  return (
    <form
      onSubmit={handleSubmit((raw) => {
        startTransition(async () => {
          // El payload limpia opcionales y normaliza fechas para ajustarse al schema del backend.
          const payload: LogInjuryInput = {
            ...raw,
            diagnosedAt: toIsoDateTime(raw.diagnosedAt),
            estimatedRecoveryAt: toIsoDateTime(raw.estimatedRecoveryAt),
            resolvedAt: raw.resolvedAt ? toIsoDateTime(raw.resolvedAt) : undefined,
            severity: raw.severity || undefined,
            description: raw.description || undefined,
          };
          const res = await fetch(`/api/v1/players/${playerId}/injuries`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            // Se usa un error visible único para no ensuciar una UI ya cargada de campos clínicos.
            setError("description", { message: labels.error });
            return;
          }
          reset({
            bodyRegion: raw.bodyRegion,
            bodyZoneDetail: bodyZoneDetail.none,
          });
          router.refresh();
        });
      })}
      className="flex flex-col gap-3 rounded-md border border-outline-variant p-3"
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-xs">
          {labels.diagnosedAt}
          <input
            type="datetime-local"
            {...register("diagnosedAt", {
              setValueAs: (value: string) => toIsoDateTime(value),
            })}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          />
          {errors.diagnosedAt ? (
            <span className="mt-1 text-error">{errors.diagnosedAt.message}</span>
          ) : null}
        </label>
        <label className="flex flex-col text-xs">
          {labels.bodyRegion}
          <select
            {...register("bodyRegion")}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          >
            {Object.entries(labels.region).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs">
          {labels.severity}
          <select
            {...register("severity", {
              setValueAs: (v) => (v === "" ? undefined : v),
            })}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          >
            <option value="">--</option>
            <option value="mild">mild</option>
            <option value="moderate">moderate</option>
            <option value="severe">severe</option>
          </select>
        </label>

        <label className="flex flex-col text-xs">
          {labels.status}
          <select
            {...register("status")}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          >
            <option value="injured">{labels.statusOption.injured}</option>
            <option value="recovering">{labels.statusOption.recovering}</option>
            <option value="recovered">{labels.statusOption.recovered}</option>
          </select>
          {errors.status ? (
            <span className="mt-1 text-error">{errors.status.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col text-xs">
          {labels.estimatedRecoveryAt}
          <input
            type="datetime-local"
            {...register("estimatedRecoveryAt", {
              setValueAs: (value: string) => toIsoDateTime(value),
            })}
            className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
          />
          {errors.estimatedRecoveryAt ? (
            <span className="mt-1 text-error">{errors.estimatedRecoveryAt.message}</span>
          ) : null}
        </label>
      </div>

      <Controller
        control={control}
        name="bodyZoneDetail"
        render={({ field }) => (
          // El picker anatómico mantiene sincronizadas región y máscara de zonas activas.
          <BodyZonePicker
            selectedRegion={selectedRegion}
            selectedZoneDetail={field.value}
            labels={{
              title: labels.bodyFigureTitle,
              front: labels.front,
              back: labels.back,
              regionPrefix: labels.selectedRegion,
              zonesTitle: labels.zonesTitle,
              region: labels.region,
              zone: labels.zone,
            }}
            onRegionChange={(region) => {
              setValue("bodyRegion", region, { shouldValidate: true });
              field.onChange(bodyZoneDetail.none);
            }}
            onToggleZone={(flag) => {
              if (flag === bodyZoneDetail.none) {
                field.onChange(bodyZoneDetail.none);
                return;
              }
              const checked = (field.value & flag) === flag;
              const next = checked ? field.value & ~flag : field.value | flag;
              field.onChange(next);
            }}
          />
        )}
      />

      <label className="flex flex-col text-xs">
        {labels.description}
        <textarea
          rows={2}
          {...register("description")}
          className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
        />
        {errors.description ? (
          <span className="mt-1 text-error">{errors.description.message}</span>
        ) : null}
      </label>

      <label className="flex flex-col text-xs">
        {labels.injuryComment}
        <textarea
          rows={2}
          {...register("injuryComment")}
          className="mt-1 rounded-md border border-outline-variant bg-surface p-1 text-sm"
        />
        {errors.injuryComment ? (
          <span className="mt-1 text-error">{errors.injuryComment.message}</span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-primary px-3 py-1.5 text-sm text-on-primary disabled:opacity-50"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
