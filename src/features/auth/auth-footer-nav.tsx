"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/routing";

type LinkKey = "login" | "signUp" | "recover";

const LINKS: { key: LinkKey; href: "/login" | "/sign-up" | "/recover" }[] = [
  { key: "login", href: "/login" },
  { key: "signUp", href: "/sign-up" },
  { key: "recover", href: "/recover" },
];

/**
 * Navegación contextual entre pantallas de autenticación.
 */
export default function AuthFooterNav() {
  const t = useTranslations("Auth.shell.links");
  const pathname = usePathname();

  const visible = LINKS.filter((link) => {
    if (link.href === "/login") {
      return pathname !== "/login";
    }
    if (link.href === "/sign-up") {
      return !pathname.startsWith("/sign-up");
    }
    if (link.href === "/recover") {
      return pathname !== "/recover";
    }
    return true;
  });

  if (visible.length === 0) {
    return null;
  }

  return (
    <nav className="mt-6 flex justify-between gap-2 text-xs text-foreground/70">
      {visible.map((link) => (
        <Link key={link.href} href={link.href} className="hover:text-primary">
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
