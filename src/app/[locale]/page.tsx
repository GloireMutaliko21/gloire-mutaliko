import { getDictionary } from "@/dictionaries";
import { getExperiences, getProfile, getProjects, getSkills } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { Hero } from "@/components/site/hero";
import { About, CallToAction, FeaturedProjects, Skills } from "@/components/site/home-sections";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { Section } from "@/components/site/ui";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const dict = getDictionary(locale);
  const [profile, skills, experiences, projects] = await Promise.all([
    getProfile(),
    getSkills(),
    getExperiences(),
    getProjects(),
  ]);
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      <Hero locale={locale} profile={profile} skills={skills} dict={dict} />
      <About locale={locale} profile={profile} dict={dict} />
      <Skills skills={skills} dict={dict} />
      {experiences.length > 0 && (
        <Section id="experience" title={dict.sections.experience}>
          <ExperienceTimeline items={experiences} locale={locale} dict={dict.experience} />
        </Section>
      )}
      <FeaturedProjects locale={locale} projects={(featured.length ? featured : projects).slice(0, 4)} dict={dict} />
      <CallToAction locale={locale} profile={profile} dict={dict} />
    </>
  );
}
