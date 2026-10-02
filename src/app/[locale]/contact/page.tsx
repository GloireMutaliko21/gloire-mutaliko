import type { Metadata } from "next";
import { getDictionary } from "@/dictionaries";
import { getProfile } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { ContactForm } from "@/components/site/contact-form";
import { FloatingShape } from "@/components/three/lazy";
import { Container } from "@/components/site/ui";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const dict = getDictionary((await params).locale as Locale);
  return { title: dict.contact.title, description: dict.contact.intro };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const locale = (await params).locale as Locale;
  const dict = getDictionary(locale);
  const profile = await getProfile();

  return (
    <Container className="pb-28 pt-28 md:pt-36">
      <header className="relative grid items-end gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="font-display text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.9] tracking-[-0.045em]">
            {dict.contact.title}
          </h1>
          <p className="mt-6 max-w-[36rem] text-[1.15rem] leading-relaxed text-muted">{dict.contact.intro}</p>
        </div>
        <div className="hidden h-[300px] md:col-span-5 md:block">
          <FloatingShape />
        </div>
      </header>

      <div className="mt-16 grid gap-16 border-t border-line pt-14 lg:grid-cols-12 lg:gap-12">
        <section id="book" aria-labelledby="book-title" className="scroll-mt-24 lg:col-span-7">
          <h2 id="book-title" className="font-display text-[1.6rem] font-semibold tracking-tight">
            {dict.contact.bookTitle}
          </h2>
          {profile.calLink ? (
            <div className="mt-6 overflow-hidden rounded-[6px] border border-line bg-surface">
              <iframe
                title={dict.contact.bookTitle}
                src={`https://cal.com/${profile.calLink}?embed=true&theme=light&layout=month_view`}
                className="h-[680px] w-full"
                loading="lazy"
              />
            </div>
          ) : (
            <p className="mt-4 text-muted">{dict.contact.bookFallback}</p>
          )}
        </section>

        <section id="message" aria-labelledby="message-title" className="relative scroll-mt-24 lg:col-span-5">
          <h2 id="message-title" className="font-display text-[1.6rem] font-semibold tracking-tight">
            {dict.contact.formTitle}
          </h2>
          <div className="mt-6">
            <ContactForm locale={locale} dict={dict.contact} />
          </div>
          {profile.email && (
            <p className="mt-10 text-sm text-muted">
              {dict.contact.direct}{" "}
              <a href={`mailto:${profile.email}`} className="text-ink underline decoration-line-strong underline-offset-4 hover:text-accent">
                {profile.email}
              </a>
            </p>
          )}
        </section>
      </div>
    </Container>
  );
}
