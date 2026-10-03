import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { themeScript } from "@/lib/theme-script";
import { display, sans } from "../fonts";
import { getDictionary } from "@/dictionaries";
import { getProfile } from "@/lib/content";
import { isLocale, locales, tr, type Locale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Tracker } from "@/components/site/tracker";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [profile, dict] = [await getProfile(), getDictionary(locale)];
  const role = tr(profile.role, locale) || dict.meta.title;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${profile.name} · ${role}`, template: `%s · ${profile.name}` },
    description: tr(profile.headline, locale) || dict.meta.description,
    alternates: { canonical: `/${locale}`, languages: { en: "/en", fr: "/fr" } },
    openGraph: { type: "website", locale, siteName: profile.name },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  const profile = await getProfile();

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          {dict.nav.skip}
        </a>
        <SiteHeader locale={locale as Locale} name={profile.name} dict={dict.nav} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale as Locale} profile={profile} dict={dict} />
        <Tracker />
      </body>
    </html>
  );
}
