import type { Metadata } from "next";
import { getDictionary } from "@/dictionaries";
import { getProjects } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { ProjectsExplorer } from "@/components/site/projects-explorer";
import { Container } from "@/components/site/ui";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const dict = getDictionary((await params).locale as Locale);
  return { title: dict.projects.title, description: dict.projects.intro };
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const locale = (await params).locale as Locale;
  const dict = getDictionary(locale);
  const projects = await getProjects();

  return (
    <Container className="pb-28 pt-36 md:pt-44">
      <header className="max-w-[44rem]">
        <h1 className="font-display text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.9] tracking-[-0.045em]">
          {dict.projects.title}
        </h1>
        <p className="mt-6 text-[1.15rem] leading-relaxed text-muted">{dict.projects.intro}</p>
      </header>
      <div className="mt-14">
        <ProjectsExplorer projects={projects} locale={locale} dict={dict.projects} />
      </div>
    </Container>
  );
}
