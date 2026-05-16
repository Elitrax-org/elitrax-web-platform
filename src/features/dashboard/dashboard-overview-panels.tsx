type DashboardStatCardData = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly hint: string;
};

type DashboardTrendBarData = {
  readonly label: string;
  readonly heightClass: string;
};

type DashboardTelemetryRowData = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly tone: string;
};

type DashboardAlertCardData = {
  readonly id: string;
  readonly toneClass: string;
  readonly tag: string;
  readonly copy: string;
};

type DashboardTeamCardData = {
  readonly id: string;
  readonly name: string;
  readonly meta: string;
  readonly delta: string;
  readonly stats: readonly string[];
};

export function DashboardStatGrid({
  cards,
}: {
  cards: readonly DashboardStatCardData[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.key} className="rounded-md border border-outline-variant bg-surface-container p-4">
          <p className="font-label text-xs uppercase tracking-normal text-foreground/55">{card.label}</p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <strong className="font-heading text-3xl font-semibold text-foreground">{card.value}</strong>
            <span className="rounded-sm bg-primary/15 px-2 py-1 font-label text-xs text-primary">{card.delta}</span>
          </div>
          <p className="mt-2 text-sm text-foreground/65">{card.hint}</p>
        </article>
      ))}
    </div>
  );
}

// Mantiene encapsulada la presentación del gráfico para que la página sólo arme datos.
export function DashboardTrendPanel({
  title,
  icon,
  bars,
  caption,
  distance,
}: {
  title: string;
  icon: React.ReactNode;
  bars: readonly DashboardTrendBarData[];
  caption: string;
  distance: string;
}) {
  return (
    <article className="rounded-md border border-outline-variant bg-surface-container p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {icon}
      </div>
      <div className="grid h-64 grid-cols-12 items-end gap-2 border-b border-l border-outline-variant px-2 pb-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex h-full flex-col justify-end gap-2">
            <div className={`rounded-t-sm bg-[linear-gradient(180deg,var(--secondary),var(--primary))] ${bar.heightClass}`} />
            <span className="font-label text-[11px] text-foreground/55">{bar.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground/70">
        <span>{caption}</span>
        <span>{distance}</span>
      </div>
    </article>
  );
}

export function DashboardTelemetryPanel({
  title,
  rows,
  summary,
}: {
  title: string;
  rows: readonly DashboardTelemetryRowData[];
  summary: string;
}) {
  return (
    <article className="rounded-md border border-outline-variant bg-surface-container p-4">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <div className="mt-4 divide-y divide-outline-variant">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className="text-foreground/72">{row.label}</span>
            <span className={`rounded-sm bg-secondary/12 px-2 py-1 font-label text-xs ${row.tone}`}>{row.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-foreground/65">{summary}</p>
    </article>
  );
}

export function DashboardAlertsPanel({
  title,
  empty,
  alerts,
}: {
  title: string;
  empty: string;
  alerts: readonly DashboardAlertCardData[];
}) {
  return (
    <article className="rounded-md border border-outline-variant bg-surface-container p-4">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {alerts.length === 0 ? (
          <p className="rounded-md bg-surface-container-high p-3 text-sm text-foreground/70">{empty}</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="rounded-md bg-surface-container-high p-3">
              <p className={`inline-flex rounded-sm px-2 py-1 font-label text-xs uppercase tracking-normal ${alert.toneClass}`}>{alert.tag}</p>
              <p className="mt-2 text-sm leading-6 text-foreground/78">{alert.copy}</p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

export function DashboardTeamsPanel({
  title,
  empty,
  teams,
}: {
  title: string;
  empty: string;
  teams: readonly DashboardTeamCardData[];
}) {
  return (
    <article className="rounded-md border border-outline-variant bg-surface-container p-4">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {teams.length === 0 ? (
          <p className="rounded-md border border-outline-variant bg-surface-container-high p-3 text-sm text-foreground/70">{empty}</p>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="rounded-md border border-outline-variant bg-surface-container-high p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">{team.name}</p>
                  <p className="mt-1 text-sm text-foreground/65">{team.meta}</p>
                </div>
                <span className="rounded-sm bg-primary/15 px-2 py-1 font-label text-xs text-primary">{team.delta}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-foreground/75">
                {team.stats.map((stat) => (
                  <span key={stat}>{stat}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}