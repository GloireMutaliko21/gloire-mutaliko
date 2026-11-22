import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { tr, type Locale } from "@/lib/i18n";
import type { ProfileDTO, ProjectDTO, SkillCategory, SkillDTO } from "@/lib/types";
import { categoryColor } from "@/components/three/colors";
import { OrbitRings } from "@/components/three/lazy";
import { ProjectCard } from "./project-card";
import { Container, Section, buttonStyles } from "./ui";

export function About({ locale, profile, dict }: { locale: Locale; profile: ProfileDTO; dict: Dictionary }) {
  const bio = tr(profile.bio, locale);
  if (!bio) return null;
  const location = tr(profile.location, locale);

  return (
    <Section id="about" title={dict.sections.about}>
      <div className="grid gap-12 lg:grid-cols-9">
        <div className="prose-copy max-w-[38rem] text-[1.15rem] leading-[1.7] lg:col-span-6">
          {bio.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="space-y-6 lg:col-span-3">
          {profile.yearsOfExperience > 0 && (
            <p>
              <span className="font-display block text-[3.2rem] font-semibold leading-none tracking-tight tabular-nums">
                {profile.yearsOfExperience}+
              </span>
              <span className="mt-2 block text-sm text-muted">{dict.hero.years}</span>
            </p>
          )}
          {location && <p className="border-t border-line pt-4 text-sm text-muted">{location}</p>}
        </div>
      </div>
    </Section>
  );
}

const CATEGORY_ORDER: SkillCategory[] = ["frontend", "backend", "devops", "data", "tools"];

export function Skills({ skills, dict }: { skills: SkillDTO[]; dict: Dictionary }) {
  if (skills.length === 0) return null;
  const groups = CATEGORY_ORDER.map((cat) => ({ cat, items: skills.filter((s) => s.category === cat) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <Section id="skills" title={dict.sections.skills}>
      <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map(({ cat, items }) => (
          <div key={cat}>
            <h3 className="flex items-center gap-2 border-b border-line pb-3 font-medium">
              <span className="size-2.5 rounded-full" style={{ background: categoryColor(cat) }} aria-hidden />
              {dict.skills.categories[cat]}
            </h3>
            <ul className="mt-2">
              {items.map((s) => (
                <li key={s._id} className="flex items-center justify-between gap-4 py-2">
                  <span>{s.name}</span>
                  <span className="flex gap-[3px]" role="img" aria-label={dict.skills.level[s.level]} title={dict.skills.level[s.level]}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="h-2.5 w-[5px] rounded-[1px]"
                        style={{ background: n <= s.level ? categoryColor(cat) : "var(--line-strong)" }}
                      />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function FeaturedProjects({ locale, projects, dict }: { locale: Locale; projects: ProjectDTO[]; dict: Dictionary }) {
  if (projects.length === 0) return null;
  return (
    <Section
      id="projects"
      title={dict.sections.projects}
      aside={
        <Link href={`/${locale}/projects`} className={buttonStyles.quiet}>
          {dict.sections.allProjects}
        </Link>
      }
    >
      <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p._id} project={p} locale={locale} viewLabel={dict.projects.view} priority={i < 2} />
        ))}
      </div>
    </Section>
  );
}

export function CallToAction({ locale, profile, dict }: { locale: Locale; profile: ProfileDTO; dict: Dictionary }) {
  return (
    <section className="border-t border-line bg-surface" aria-labelledby="cta-title">
      <Container className="grid items-center gap-8 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <h2 id="cta-title" className="font-display text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            {dict.cta.title}
          </h2>
          <p className="mt-6 max-w-[34rem] text-[1.1rem] leading-relaxed text-muted">{dict.cta.body}</p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href={`/${locale}/contact${profile.calLink ? "#book" : ""}`} className={buttonStyles.primary}>
              {profile.calLink ? dict.cta.book : dict.cta.write}
            </Link>
            {profile.calLink && (
              <Link href={`/${locale}/contact#message`} className={buttonStyles.secondary}>
                {dict.cta.write}
              </Link>
            )}
            {profile.cv && (
              <a href={`/api/cv?locale=${locale}`} className={`${buttonStyles.quiet} ml-2`}>
                {dict.cta.cv}
              </a>
            )}
          </div>
        </div>
        <div className="hidden h-[380px] md:col-span-5 md:block">
          <OrbitRings />
        </div>
      </Container>
    </section>
  );
}
