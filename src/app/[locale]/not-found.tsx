"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { Container, buttonStyles } from "@/components/site/ui";

export default function NotFound() {
  const segment = usePathname()?.split("/")[1];
  const locale = isLocale(segment) ? segment : "en";
  const dict = getDictionary(locale).notFound;
  return (
    <Container className="grid min-h-[70svh] content-center pb-20 pt-36">
      <p className="font-display text-[clamp(5rem,18vw,12rem)] font-bold leading-none tracking-[-0.06em] text-accent">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">{dict.title}</h1>
      <p className="mt-3 max-w-[30rem] text-muted">{dict.body}</p>
      <div className="mt-8">
        <Link href={`/${locale}`} className={buttonStyles.primary}>
          {dict.home}
        </Link>
      </div>
    </Container>
  );
}
