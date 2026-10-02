import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { ProfileDTO } from "@/lib/types";

type Props = { locale: Locale; profile: ProfileDTO; dict: Dictionary };

export function SiteFooter({ locale, profile, dict }: Props) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-5 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-10">
        <p>
          © <CopyrightYear /> {profile.name}. {dict.footer.rights}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {profile.socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-ink hover:text-accent">
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <Link href={`/${locale}/contact`} className="text-ink hover:text-accent">
              {dict.nav.contact}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
