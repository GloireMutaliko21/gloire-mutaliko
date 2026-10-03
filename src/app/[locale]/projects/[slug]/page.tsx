import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { getProjectBySlug, getProjects, getSimilarProjects } from "@/lib/content";
import { tr, type Locale } from "@/lib/i18n";
import { Gallery } from "@/components/site/gallery";
import { ProjectCard } from "@/components/site/project-card";
import { Container, Tag, buttonStyles } from "@/components/site/ui";

type Props = PageProps<"/[locale]/projects/[slug]">;

export async function generateStaticParams() {
  const projects = await getProjects().catch(() => []);
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const l = locale as Locale;
  return {
    title: tr(project.title, l),
    description: tr(project.summary, l),
    openGraph: project.images[0] ? { images: [{ url: project.images[0].url }] } : undefined,
    alternates: { languages: { en: `/en/projects/${slug}`, fr: `/fr/projects/${slug}` } },
  };
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectDetail params={params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: Pick<Props, "params">) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const similar = await getSimilarProjects(project);
  const title = tr(project.title, locale);
  const description = tr(project.description, locale);

  return (
    <article className="pb-28 pt-28 md:pt-32">
      <Container>
        <Link href={`/${locale}/projects`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
          <ArrowLeft size={15} aria-hidden />
          {dict.projects.back}
        </Link>

        <header className="mt-10 grid gap-8 md:grid-cols-12">
          <h1 className="font-display text-[clamp(2.8rem,7vw,5.6rem)] font-bold leading-[0.92] tracking-[-0.045em] md:col-span-8">
            {title}
          </h1>
          <div className="flex flex-col justify-end gap-6 md:col-span-4">
            <p className="text-[1.1rem] leading-relaxed text-muted">{tr(project.summary, locale)}</p>
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className={buttonStyles.primary}>
                  {dict.projects.live}
                  <ArrowUpRight size={16} aria-hidden />
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noreferrer" className={buttonStyles.secondary}>
                  {dict.projects.repo}
                </a>
              )}
            </div>
          </div>
        </header>

        {project.images.length > 0 && (
          <div className="mt-14">
            <Gallery images={project.images} title={title} locale={locale} dict={dict.projects} />
          </div>
        )}

        <div className="mt-16 grid gap-12 border-t border-line pt-12 md:grid-cols-12">
          <div className="prose-copy max-w-[40rem] text-[1.1rem] leading-[1.75] md:col-span-8">
            {description.split(/\n{2,}/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="md:col-span-4">
            <dl className="space-y-6">
              <div>
                <dt className="text-sm text-muted">{dict.projects.year}</dt>
                <dd className="mt-1 tabular-nums">{project.year}</dd>
              </div>
              {project.tags.length > 0 && (
                <div>
                  <dt className="text-sm text-muted">{dict.projects.stack}</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </div>
      </Container>

      {similar.length > 0 && (
        <section className="mt-24 border-t border-line pt-16" aria-labelledby="similar-title">
          <Container>
            <h2 id="similar-title" className="font-display text-[1.75rem] font-semibold tracking-tight">
              {dict.projects.similar}
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-3">
              {similar.map((p) => (
                <ProjectCard key={p.id} project={p} locale={locale} viewLabel={dict.projects.view} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </article>
  );
}

function ProjectSkeleton() {
  return (
    <div className="pb-28 pt-28 md:pt-32" aria-busy="true">
      <Container>
        <div className="h-4 w-24 rounded-[3px] bg-line" />
        <div className="mt-10 h-24 w-2/3 rounded-[4px] bg-line/70" />
        <div className="mt-14 aspect-[16/10] w-full rounded-[6px] bg-line/50" />
      </Container>
    </div>
  );
}
