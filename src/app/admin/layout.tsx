import type { Metadata } from "next";
import "../globals.css";
import { display, sans } from "../fonts";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
