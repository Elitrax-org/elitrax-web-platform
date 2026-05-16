import { getTranslations, setRequestLocale } from "next-intl/server";
import { Activity } from "lucide-react";

import { resolveTenantContext } from "@/lib/api/tenant-context";
import { getServices } from "@/infrastructure/service-container";
import { Link } from "@/i18n/routing";
import { buttonVariants, CollectionToolbar, EmptyState } from "@/components/ui";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; source?: string; status?: string }>;
};

function normalizeSearch(value?: string) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

export default async function TelemetryPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const translationsPromise = getTranslations({ locale, namespace: "App.telemetry" });
  const queryPromise = searchParams;
  const tenant = await resolveTenantContext();
  if (!tenant) {
    const t = await translationsPromise;
    return <main className="p-6"><p>{t("noTenant")}</p></main>;
  }
  const [t, uploads, query] = await Promise.all([
    translationsPromise,
    getServices().deps.telemetry.listUploads(tenant.accountId),
    queryPromise,
  ]);
  const search = normalizeSearch(query.q);
  const selectedSource = query.source ?? "all";
  const selectedStatus = query.status ?? "all";
  const filteredUploads = uploads.filter((upload) => {
    const statusLabel = upload.processedAt ? t("processed") : t("pending");
    const haystack = [
      t(`sources.${upload.source}`),
      upload.storagePath,
      statusLabel,
    ].join(" ").toLocaleLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search);
    const matchesSource = selectedSource === "all" || upload.source === selectedSource;
    const matchesStatus = selectedStatus === "all"
      || (selectedStatus === "processed" && Boolean(upload.processedAt))
      || (selectedStatus === "pending" && !upload.processedAt);
    return matchesSearch && matchesSource && matchesStatus;
  });

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-foreground/70">{t("count", { count: filteredUploads.length })}</p>
      </header>

      <CollectionToolbar
        searchLabel={t("searchLabel")}
        searchPlaceholder={t("searchPlaceholder")}
        searchValue={query.q}
        filters={[
          {
            name: "source",
            label: t("source"),
            value: selectedSource,
            options: [
              { value: "all", label: t("all") },
              { value: "garmin", label: t("sources.garmin") },
              { value: "polar", label: t("sources.polar") },
              { value: "apple_health", label: t("sources.apple_health") },
              { value: "manual", label: t("sources.manual") },
              { value: "other", label: t("sources.other") },
            ],
          },
          {
            name: "status",
            label: t("statusLabel"),
            value: selectedStatus,
            options: [
              { value: "all", label: t("all") },
              { value: "processed", label: t("processed") },
              { value: "pending", label: t("pending") },
            ],
          },
        ]}
        submitLabel={t("applyFilters")}
        clearLabel={t("clearFilters")}
        clearHref="/telemetry"
        createHref="/telemetry/new"
        createLabel={t("createNew")}
      />

      {uploads.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={t("title")}
          description={t("empty")}
          action={(
            <Link href="/telemetry/new" className={buttonVariants({ variant: "primary", size: "md" })}>
              {t("createNew")}
            </Link>
          )}
        />
      ) : filteredUploads.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={t("noResultsTitle")}
          description={t("noResultsDescription")}
          action={(
            <Link href="/telemetry" className={buttonVariants({ variant: "secondary", size: "md" })}>
              {t("clearFilters")}
            </Link>
          )}
        />
      ) : (
        <ul className="space-y-2">
          {filteredUploads.map((upload) => (
            <li key={upload.id} className="rounded-md border border-outline-variant bg-surface-container p-4 text-sm">
              <p className="font-label text-xs uppercase tracking-normal text-secondary">
                {t(`sources.${upload.source}`)}
              </p>
              <p className="mt-1 text-foreground/80">{upload.storagePath}</p>
              <p className="mt-1 text-foreground/60">
                {upload.processedAt ? t("processed") : t("pending")} · {upload.sampleCount}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
