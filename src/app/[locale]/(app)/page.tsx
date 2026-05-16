import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Bell,
  CalendarClock,
  Gauge,
  Search,
} from "lucide-react";

import { dashboardStatsUseCases } from "@/application/use-cases";
import {
  DashboardAlertsPanel,
  DashboardStatGrid,
  DashboardTeamsPanel,
  DashboardTelemetryPanel,
  DashboardTrendPanel,
} from "@/features/dashboard/dashboard-overview-panels";
import { getServices } from "@/infrastructure/service-container";
import { resolveTenantContext } from "@/lib/api/tenant-context";

// Los deltas del dashboard se muestran siempre con signo para que el cambio sea inmediato de leer.
function formatSigned(value: number) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

// Formatea cada KPI según su semántica; por ahora sólo disponibilidad usa porcentaje.
function formatMetricValue(key: "readiness" | "activePlayers" | "trainingLoad" | "riskAlerts", value: number, locale: string) {
  if (key === "readiness") {
    return `${new Intl.NumberFormat(locale).format(value)}%`;
  }
  return new Intl.NumberFormat(locale).format(value);
}

// El backend entrega distancia en metros, pero el panel ejecutivo la resume en kilómetros.
function formatDistance(meters: number, locale: string) {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(meters / 1000)} km`;
}

// Traduce la severidad lógica de una alerta a tokens visuales reutilizables de la UI.
function formatAlertTone(level: "high" | "medium" | "info") {
  if (level === "high") return "bg-primary/15 text-primary";
  if (level === "medium") return "bg-secondary/12 text-secondary";
  return "bg-surface-container-high text-foreground/75";
}

// El gráfico evita estilos inline; por eso la altura se discretiza en clases predefinidas.
function getTrendHeightClass(value: number, maxValue: number) {
  const ratio = maxValue === 0 ? 0 : value / maxValue;
  if (ratio >= 0.92) return "h-full";
  if (ratio >= 0.84) return "h-[92%]";
  if (ratio >= 0.76) return "h-[84%]";
  if (ratio >= 0.68) return "h-[76%]";
  if (ratio >= 0.6) return "h-[68%]";
  if (ratio >= 0.52) return "h-[60%]";
  if (ratio >= 0.44) return "h-[52%]";
  if (ratio >= 0.36) return "h-[44%]";
  if (ratio >= 0.28) return "h-[36%]";
  if (ratio >= 0.2) return "h-[28%]";
  if (ratio >= 0.12) return "h-[20%]";
  return "h-[12%]";
}

// La capa de aplicación devuelve alertas estructuradas y la página decide el copy localizado.
function formatAlertCopy(
  t: Awaited<ReturnType<typeof getTranslations>>,
  alert: {
    kind: "injury" | "recovery" | "load-spike" | "telemetry-gap";
    playerName?: string;
    teamName?: string;
    value?: number;
  },
) {
  if (alert.kind === "injury") {
    return {
      tag: t("alerts.kinds.injury.tag"),
      copy: t("alerts.kinds.injury.copy", { player: alert.playerName ?? t("alerts.unknownPlayer") }),
    };
  }
  if (alert.kind === "recovery") {
    return {
      tag: t("alerts.kinds.recovery.tag"),
      copy: t("alerts.kinds.recovery.copy", { player: alert.playerName ?? t("alerts.unknownPlayer") }),
    };
  }
  if (alert.kind === "load-spike") {
    return {
      tag: t("alerts.kinds.loadSpike.tag"),
      copy: t("alerts.kinds.loadSpike.copy", {
        player: alert.playerName ?? t("alerts.unknownPlayer"),
        value: alert.value ?? 0,
      }),
    };
  }
  return {
    tag: t("alerts.kinds.telemetryGap.tag"),
    copy: t("alerts.kinds.telemetryGap.copy", { team: alert.teamName ?? t("alerts.unknownTeam") }),
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const tenant = await resolveTenantContext();

  if (!tenant) {
    return <main className="p-6"><p>{t("noTenant")}</p></main>;
  }

  // El server component resuelve todo el resumen antes de renderizar para evitar estados cliente intermedios.
  const overview = await dashboardStatsUseCases.getDashboardOverview(getServices().deps, tenant);
  const statCards = [
    {
      key: "readiness",
      value: formatMetricValue("readiness", overview.readiness.current, locale),
      delta: formatSigned(overview.readiness.delta),
      hint: t("stats.readiness.hint"),
    },
    {
      key: "activePlayers",
      value: formatMetricValue("activePlayers", overview.activePlayers.current, locale),
      delta: formatSigned(overview.activePlayers.delta),
      hint: t("stats.activePlayers.hint", { total: overview.totalPlayers }),
    },
    {
      key: "trainingLoad",
      value: formatMetricValue("trainingLoad", overview.trainingLoad.current, locale),
      delta: formatSigned(overview.trainingLoad.delta),
      hint: t("stats.trainingLoad.hint", { distance: formatDistance(overview.totalDistance.current, locale) }),
    },
    {
      key: "riskAlerts",
      value: formatMetricValue("riskAlerts", overview.riskAlerts.current, locale),
      delta: formatSigned(overview.riskAlerts.delta),
      hint: t("stats.riskAlerts.hint"),
    },
  ] as const;
  const maxTrendValue = Math.max(1, ...overview.trend.map((point) => point.loadIndex));
  const trendBars = overview.trend.map((point) => ({
    label: point.label,
    heightClass: getTrendHeightClass(point.loadIndex, maxTrendValue),
  }));

  // La tarjeta de telemetría mezcla estado de pipeline y cobertura real sobre las sesiones del periodo.
  const telemetryRows = [
    {
      key: "processed",
      label: t("telemetry.rows.processed"),
      value: new Intl.NumberFormat(locale).format(overview.telemetry.processedUploads),
      tone: "text-secondary",
    },
    {
      key: "pending",
      label: t("telemetry.rows.pending"),
      value: new Intl.NumberFormat(locale).format(overview.telemetry.pendingUploads),
      tone: overview.telemetry.pendingUploads > 0 ? "text-primary" : "text-secondary",
    },
    {
      key: "coverage",
      label: t("telemetry.rows.coverage"),
      value: `${new Intl.NumberFormat(locale).format(overview.telemetryCoverage.current)}%`,
      tone: "text-secondary",
    },
    {
      key: "samples",
      label: t("telemetry.rows.samples"),
      value: new Intl.NumberFormat(locale).format(overview.telemetry.sampleCount),
      tone: "text-secondary",
    },
  ] as const;
  const alertCards = overview.alerts.map((alert) => {
    const copy = formatAlertCopy(t, alert);
    return {
      id: alert.id,
      toneClass: formatAlertTone(alert.level),
      tag: copy.tag,
      copy: copy.copy,
    };
  });
  const teamCards = overview.teamSummaries.slice(0, 4).map((summary) => ({
    id: summary.team.id,
    name: summary.team.name,
    meta: t("teams.meta", { players: summary.playerCount, sessions: summary.sessionCount }),
    delta: formatSigned(summary.deltaLoadIndex),
    stats: [
      t("teams.load", { value: summary.averageLoadIndex }),
      t("teams.active", { value: summary.activePlayers }),
      t("teams.telemetry", { value: summary.telemetrySessionCount }),
      t("teams.injuries", { value: summary.activeInjuries + summary.recoveringPlayers }),
    ],
  }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 border-b border-outline-variant bg-background/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <Image src="/logo/elitrax-orange-i.svg" alt="Elitrax" width={34} height={34} priority />
              <span className="font-heading text-lg font-semibold">Elitrax</span>
            </div>
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-outline-variant bg-surface-container px-3 md:max-w-xl">
              <Search aria-hidden="true" className="size-4 text-outline" />
              <span className="sr-only">{t("searchLabel")}</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/45 focus:outline-none"
                placeholder={t("searchPlaceholder")}
              />
            </label>
            <button className="grid size-10 place-items-center rounded-md border border-outline-variant bg-surface-container text-foreground transition hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2" aria-label={t("alertsLabel")}>
              <Bell aria-hidden="true" className="size-4" />
            </button>
          </div>
        </header>

        <div className="grid gap-5 px-4 py-5 md:px-6 xl:grid-cols-[1fr_22rem]">
          <section className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-label text-xs uppercase tracking-normal text-secondary">{t("eyebrow")}</p>
                <h1 className="mt-1 font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl">{t("title")}</h1>
                <p className="mt-2 text-sm text-foreground/65">
                  {t("summary", {
                    teams: overview.totalTeams,
                    players: overview.totalPlayers,
                    sessions: overview.sessions.current,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container px-3 py-2 font-label text-sm text-foreground/80">
                <CalendarClock aria-hidden="true" className="size-4 text-primary" />
                {t("window", { days: overview.range.days })}
              </div>
            </div>

            {/* KPIs ejecutivos principales para administrador y cuerpo técnico. */}
            <DashboardStatGrid
              cards={statCards.map((card) => ({
                ...card,
                label: t(`stats.${card.key}.label`),
              }))}
            />

            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <DashboardTrendPanel
                title={t("load.title")}
                icon={<Gauge aria-hidden="true" className="size-5 text-secondary" />}
                bars={trendBars}
                caption={t("load.caption", { sessions: overview.sessions.current })}
                distance={t("load.distance", { distance: formatDistance(overview.totalDistance.current, locale) })}
              />

              <DashboardTelemetryPanel
                title={t("telemetry.title")}
                rows={telemetryRows}
                summary={t("telemetry.summary", {
                  withTelemetry: overview.telemetry.sessionsWithTelemetry,
                  withoutTelemetry: overview.telemetry.sessionsWithoutTelemetry,
                })}
              />
            </section>
          </section>

          <aside className="space-y-5">
            {/* Se muestran pocas alertas para priorizar lectura rápida; el detalle fino vive en módulos específicos. */}
            <DashboardAlertsPanel
              title={t("alerts.title")}
              empty={t("alerts.empty")}
              alerts={alertCards}
            />

            {/* Ranking corto de equipos para detectar rápido quién necesita atención operativa. */}
            <DashboardTeamsPanel
              title={t("teams.title")}
              empty={t("teams.empty")}
              teams={teamCards}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}