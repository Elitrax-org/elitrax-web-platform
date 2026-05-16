import { getTranslations, setRequestLocale } from "next-intl/server";

import RecoverForm from "@/features/auth/recover-form";

export default async function RecoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Auth.recover" });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-foreground/70">{t("subtitle")}</p>
      </div>
      <RecoverForm />
    </div>
  );
}
