"use client";

import { useTransition } from "react";

import { useRouter } from "@/i18n/routing";

import type { SportOption, StatsEntityOption } from "./player-session-stats-view";

type QueryValue = string | undefined;

function pickQueryValue(
  partial: Partial<Record<string, QueryValue>>,
  key: string,
  fallback: QueryValue,
) {
  return Object.prototype.hasOwnProperty.call(partial, key)
    ? partial[key]
    : fallback;
}

function nextUrl(pathname: string, query: Record<string, QueryValue>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs.length > 0 ? `${pathname}?${qs}` : pathname;
}

export function PlayerSessionStatsControls({
  pathname,
  primaryOptions,
  comparisonOptions,
  sportOptions,
  primaryLabel,
  comparisonLabel,
  primarySportLabel,
  comparisonSportLabel,
  clearComparisonLabel,
  noneLabel,
  selectedPrimaryId,
  selectedComparisonId,
  selectedSport,
  selectedComparisonSport,
  primaryParamName,
}: {
  pathname: string;
  primaryOptions: readonly StatsEntityOption[];
  comparisonOptions: readonly StatsEntityOption[];
  sportOptions: readonly SportOption[];
  primaryLabel: string;
  comparisonLabel: string;
  primarySportLabel: string;
  comparisonSportLabel: string;
  clearComparisonLabel: string;
  noneLabel: string;
  selectedPrimaryId?: string;
  selectedComparisonId?: string;
  selectedSport?: SportOption["value"];
  selectedComparisonSport?: SportOption["value"];
  primaryParamName: "sessionId" | "playerId";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function replaceQuery(partial: Partial<Record<string, QueryValue>>) {
    startTransition(() => {
      const url = nextUrl(pathname, {
        [primaryParamName]: pickQueryValue(partial, primaryParamName, selectedPrimaryId),
        compareSessionId: pickQueryValue(partial, "compareSessionId", selectedComparisonId),
        sportType: pickQueryValue(partial, "sportType", selectedSport),
        compareSportType: pickQueryValue(
          partial,
          "compareSportType",
          selectedComparisonSport,
        ),
      });
      router.replace(url as never);
    });
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="mb-2 block font-heading text-sm uppercase tracking-[0.2em] text-foreground/60">
          {primaryLabel}
        </span>
        <select
          aria-label={primaryLabel}
          value={selectedPrimaryId ?? ""}
          disabled={pending || primaryOptions.length === 0}
          onChange={(event) =>
            replaceQuery({ [primaryParamName]: event.target.value || undefined })
          }
          className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2"
        >
          {primaryOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-2 block font-heading text-sm uppercase tracking-[0.2em] text-foreground/60">
          {comparisonLabel}
        </span>
        <select
          aria-label={comparisonLabel}
          value={selectedComparisonId ?? ""}
          disabled={pending}
          onChange={(event) =>
            replaceQuery({
              compareSessionId: event.target.value || undefined,
              compareSportType: event.target.value ? selectedComparisonSport : undefined,
            })
          }
          className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2"
        >
          <option value="">{noneLabel}</option>
          {comparisonOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-2 block font-heading text-sm uppercase tracking-[0.2em] text-foreground/60">
          {primarySportLabel}
        </span>
        <select
          aria-label={primarySportLabel}
          value={selectedSport ?? ""}
          disabled={pending}
          onChange={(event) =>
            replaceQuery({ sportType: event.target.value || undefined })
          }
          className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2"
        >
          <option value="">{noneLabel}</option>
          {sportOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-2 block font-heading text-sm uppercase tracking-[0.2em] text-foreground/60">
          {comparisonSportLabel}
        </span>
        <select
          aria-label={comparisonSportLabel}
          value={selectedComparisonSport ?? ""}
          disabled={pending || !selectedComparisonId}
          onChange={(event) =>
            replaceQuery({ compareSportType: event.target.value || undefined })
          }
          className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2"
        >
          <option value="">{noneLabel}</option>
          {sportOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        disabled={pending || !selectedComparisonId}
        onClick={() => replaceQuery({ compareSessionId: undefined, compareSportType: undefined })}
        className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm disabled:opacity-50"
      >
        {clearComparisonLabel}
      </button>
    </div>
  );
}
