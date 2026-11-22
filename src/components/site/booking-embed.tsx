"use client";

import { useTheme } from "@/lib/theme";

/** Cal.com booking page, rendered in the site's current theme. */
export function BookingEmbed({ calLink, title }: { calLink: string; title: string }) {
  const theme = useTheme();
  return (
    <iframe
      key={theme}
      title={title}
      src={`https://cal.com/${calLink}?embed=true&theme=${theme}&layout=month_view`}
      className="h-[680px] w-full"
      loading="lazy"
    />
  );
}
