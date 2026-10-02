"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries";

type Props = { locale: Locale; name: string; dict: Dictionary["nav"] };

export function SiteHeader({ locale, name, dict }: Props) {
  const pathname = usePathname() || `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const other: Locale = locale === "en" ? "fr" : "en";
  const switchHref = pathname.replace(/^\/(en|fr)(?=\/|$)/, `/${other}`);
  const links = [
    { href: `/${locale}/projects`, label: dict.projects },
    { href: `/${locale}/contact`, label: dict.contact },
  ];

  const rememberLocale = () => {
    document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        scrolled || open ? "border-line bg-paper/90 backdrop-blur-md" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-10">
        <Link href={`/${locale}`} className="font-display text-[1.05rem] font-semibold tracking-tight">
          {name}
        </Link>

        <nav className="hidden items-center gap-8 text-[0.95rem] md:flex" aria-label="Main">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 transition-colors hover:text-accent ${active ? "text-accent" : "text-ink"}`}
              >
                {link.label}
                {active && <span className="absolute inset-x-0 -bottom-0.5 h-px bg-accent" />}
              </Link>
            );
          })}
          <Link
            href={switchHref}
            onClick={rememberLocale}
            hrefLang={other}
            aria-label={dict.switchTo}
            title={dict.switchTo}
            className="rounded-sm border border-line-strong px-2 py-0.5 text-[0.8rem] font-medium uppercase tabular-nums hover:border-ink"
          >
            {other}
          </Link>
        </nav>

        <button
          type="button"
          className="-mr-2 rounded-sm p-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? dict.close : dict.menu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-paper px-5 pb-6 pt-2 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col">
            <li>
              <Link href={`/${locale}`} className="block py-3 font-display text-2xl">
                {dict.home}
              </Link>
            </li>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block py-3 font-display text-2xl">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={switchHref} onClick={rememberLocale} hrefLang={other} className="block py-3 text-muted">
                {dict.switchTo}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
