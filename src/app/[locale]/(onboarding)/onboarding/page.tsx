import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import { getUserOnboardingState } from "@/lib/api/tenant-context";
import { OnboardingWizard } from "@/features/account/onboarding-wizard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const state = await getUserOnboardingState();
  if (state.status === "unauthenticated") {
    redirect({ href: "/login", locale });
    return null;
  }
  if (state.status === "ready") {
    redirect({ href: "/", locale });
    return null;
  }
  return <OnboardingWizard />;
}
