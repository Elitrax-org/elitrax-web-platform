import Image from "next/image";
import {
  Activity,
  Brain,
  CreditCard,
  Dumbbell,
  FileText,
  Flame,
  Gauge,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  UserRoundSearch,
  UserSquare2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { redirect } from "@/i18n/routing";
import { accountUseCases } from "@/application/use-cases";
import { getAuthGateway } from "@/infrastructure/auth/gateway";
import { getServices } from "@/infrastructure/service-container";
import { getUserOnboardingState } from "@/lib/api/tenant-context";
import { getAppVersion } from "@/lib/config/app-version";
import { LogoutButton } from "@/features/auth/logout-button";
import { AccountSwitcher } from "@/features/account/account-switcher";
import { ToastProvider } from "@/components/ui";

const navItems: ReadonlyArray<{ href: string; key: string; icon: LucideIcon }> = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/teams", key: "teams", icon: Users },
  { href: "/players", key: "players", icon: UserSquare2 },
  { href: "/sessions", key: "sessions", icon: Dumbbell },
  { href: "/telemetry", key: "telemetry", icon: Activity },
  { href: "/match-mode", key: "matchMode", icon: Map },
  { href: "/optimizacion", key: "optimizacion", icon: Brain },
  { href: "/vitrina", key: "vitrina", icon: UserRoundSearch },
  { href: "/heatmaps", key: "heatmaps", icon: Flame },
  { href: "/workload", key: "workload", icon: Gauge },
  { href: "/reports", key: "reports", icon: FileText },
  { href: "/billing", key: "billing", icon: CreditCard },
  { href: "/config", key: "config", icon: Settings },
];

export default async function AppShellLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const shellTranslationsPromise = getTranslations({ locale, namespace: "App.shell" });
  const dashboardTranslationsPromise = getTranslations({ locale, namespace: "Dashboard" });
  const appVersion = getAppVersion();
  const state = await getUserOnboardingState();
  if (state.status === "unauthenticated") {
    redirect({ href: "/login", locale });
    return null;
  }
  if (state.status === "needs_onboarding") {
    redirect({ href: "/onboarding", locale });
    return null;
  }
  const tenant = state.tenant;
  const [t, tDashboard, currentUser, memberships] = await Promise.all([
    shellTranslationsPromise,
    dashboardTranslationsPromise,
    getAuthGateway().getCurrentUser(),
    accountUseCases.listMyAccounts(
      getServices().deps,
      { userId: tenant.actor.userId },
    ),
  ]);
  const activeAccountLabel =
    currentUser?.fullName?.trim() ||
    currentUser?.email?.split("@")[0] ||
    tenant.accountId.slice(0, 8);

  return (
    <div className="min-h-screen grid grid-cols-[16rem_1fr] bg-surface text-foreground">
      <aside className="flex flex-col border-r border-outline-variant bg-surface/95 px-4 py-5">
        <div className="mb-7 flex items-center gap-3 px-2">
          <div>
            <Image
              src="/logo/elitrax-orange-h.svg"
              alt={t("brand")}
              width={142}
              height={36}
              className="h-auto w-auto"
              priority
            />
            <p className="mt-2 font-label text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              v{appVersion}
            </p>
          </div>
        </div>

        <div className="mb-5 px-2">
          <p className="font-label text-xs uppercase tracking-normal text-secondary">
            {t("account")}: {activeAccountLabel}
          </p>
          <AccountSwitcher
            accounts={memberships.map((m) => ({ accountId: m.accountId, role: m.role }))}
            activeAccountId={tenant.accountId}
          />
        </div>

        <nav
          className="flex flex-1 flex-col gap-1"
          aria-label={tDashboard("navigationLabel")}
        >
          {navItems.map(({ icon: Icon, key, href }) => (
            <Link
              key={key}
              href={href}
              className="flex h-10 items-center gap-3 rounded-md px-3 font-label text-sm text-foreground/78 transition hover:bg-surface-container-high hover:text-foreground focus-visible:outline focus-visible:outline-2"
            >
              <Icon aria-hidden="true" className="size-4 text-secondary" />
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="mt-4">
          <LogoutButton label={t("signOut")} />
        </div>
      </aside>
      <div className="min-w-0">
        <ToastProvider>{children}</ToastProvider>
      </div>
    </div>
  );
}
