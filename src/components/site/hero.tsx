import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { tr, type Locale } from "@/lib/i18n";
import type { ProfileDTO, SkillDTO } from "@/lib/types";
import { SkillGraph } from "@/components/three/lazy";
import { Container, buttonStyles, cn } from "./ui";

type Props = { locale: Locale; profile: ProfileDTO; skills: SkillDTO[]; dict: Dictionary };

export function Hero({ locale, profile, skills, dict }: Props) {
  const [first, ...rest] = profile.name.split(" ");
  const graphSkills = skills.map(({ name, category, level }) => ({ name, category, level }));
  const bookHref = profile.calLink ? `/${locale}/contact#book` : `/${locale}/contact`;

  return (
    <section className="relative overflow-hidden pt-16" aria-labelledby="hero-title">
      {/* The graph sits behind the text on small screens and beside it on large ones. */}
      <div className="pointer-events-none absolute inset-x-0 top-16 h-[58vh] opacity-30 max-lg:[&_span]:hidden lg:pointer-events-auto lg:left-[40%] lg:h-[calc(100%-4rem)] lg:opacity-100">
        {graphSkills.length > 0 && <SkillGraph skills={graphSkills} label={dict.hero.graphHint} />}
      </div>

      <Container className="pointer-events-none relative grid min-h-[calc(100svh-4rem)] content-end pb-14 lg:content-center lg:pb-0">
        <div className="pointer-events-auto max-w-[40rem] lg:max-w-[34rem]">
          <p className="flex items-center gap-2 text-sm text-muted">
            <span
              className={cn("inline-block size-2 rounded-full", profile.available ? "bg-success" : "bg-line-strong")}
              aria-hidden
            />
            {tr(profile.availability, locale) || (profile.available ? dict.hero.available : dict.hero.unavailable)}
          </p>

          <h1
            id="hero-title"
            className="font-display mt-6 text-[clamp(3.4rem,11vw,8.5rem)] font-bold leading-[0.88] tracking-[-0.045em]"
            style={{ fontVariationSettings: '"wdth" 85' }}
          >
            {first}
            {rest.length > 0 && (
              <>
                <br />
                {rest.join(" ")}
              </>
            )}
          </h1>

          <p className="mt-6 font-display text-[1.45rem] font-medium leading-tight tracking-tight md:text-[1.7rem]">
            {tr(profile.role, locale)}
          </p>
          {tr(profile.headline, locale) && (
            <p className="mt-4 max-w-[32rem] text-[1.05rem] leading-relaxed text-muted">{tr(profile.headline, locale)}</p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={bookHref} className={buttonStyles.primary}>
              {dict.hero.book}
            </Link>
            <Link href={`/${locale}/projects`} className={buttonStyles.secondary}>
              {dict.hero.work}
            </Link>
          </div>

          {graphSkills.length > 0 && <p className="mt-10 hidden text-xs text-muted lg:block">{dict.hero.graphHint}</p>}
        </div>
      </Container>
    </section>
  );
}
