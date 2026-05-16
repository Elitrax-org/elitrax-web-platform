import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import AuthFooterNav from "@/features/auth/auth-footer-nav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Auth.shell" });
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-md border border-outline-variant bg-surface-container p-6 shadow">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Image
            src="/logo/elitrax-orange-h.svg"
            alt="Elitrax"
            width={142}
            height={36}
            className="h-auto w-auto"
            priority
          />
          <p className="font-label text-xs uppercase tracking-normal text-secondary">
            {t("eyebrow")}
          </p>
        </div>
        {children}
        <AuthFooterNav />
      </div>
    </main>
  );
}
