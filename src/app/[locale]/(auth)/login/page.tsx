import { getTranslations, setRequestLocale } from "next-intl/server";

import LoginForm from "@/features/auth/login-form";
import { getAppVersion } from "@/lib/config/app-version";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Auth.login" });
  const appVersion = getAppVersion();
  const sp = await searchParams;
  const redirectTo = sp.redirectTo && sp.redirectTo.startsWith("/")
    ? sp.redirectTo
    : "/";
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-foreground/70">{t("subtitle")}</p>
        <p className="mt-3 font-label text-xs uppercase tracking-[0.18em] text-foreground/45">
          v{appVersion}
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
