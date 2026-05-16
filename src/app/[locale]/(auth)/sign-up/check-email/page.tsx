import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CheckEmailPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Auth.checkEmail" });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-foreground/70">{t("subtitle")}</p>
      </div>
      <p
        role="status"
        className="rounded-md bg-primary/10 px-3 py-3 text-sm text-foreground"
      >
        {t("message")}
      </p>
      <Link
        href="/login"
        className="flex h-10 w-full items-center justify-center rounded-md bg-primary font-label text-sm font-semibold text-on-primary transition hover:bg-primary/90"
      >
        {t("backToLogin")}
      </Link>
    </div>
  );
}
