import { getTranslations, setRequestLocale } from "next-intl/server";

import SignUpForm from "@/features/auth/sign-up-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function SignUpPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Auth.signUp" });
  const sp = await searchParams;
  const redirectTo =
    sp.redirectTo && sp.redirectTo.startsWith("/") ? sp.redirectTo : "/";
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-foreground/70">{t("subtitle")}</p>
      </div>
      <SignUpForm redirectTo={redirectTo} />
    </div>
  );
}
