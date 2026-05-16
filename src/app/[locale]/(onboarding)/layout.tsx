import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function OnboardingLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Onboarding" });
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <Image
            src="/logo/elitrax-orange-h.svg"
            alt="Elitrax"
            width={142}
            height={36}
            className="h-auto w-auto"
            priority
          />
        </header>
        <div className="rounded-md border border-outline-variant bg-surface-container p-6 shadow">
          <p className="font-label text-xs uppercase tracking-normal text-secondary">
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-foreground/70">{t("subtitle")}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
