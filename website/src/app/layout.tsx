import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RevealController } from "@/components/editorial/RevealController";
import { SITE } from "@/lib/site";
import "./globals.css";

// Inter Tight — neo-grotesque, SIL Open Font License 1.1 (see src/fonts/OFL-InterTight.txt). Self-hosted.
const interTight = localFont({
  src: "../fonts/InterTight-Variable-latin.woff2",
  variable: "--font-inter-tight",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.statement}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — The Future Doesn't Build Itself.`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#00103D",
  colorScheme: "dark",
};

// Arms the editorial reveal only when JS runs; a failsafe reveals everything if the controller never starts.
const bootScript = `document.documentElement.classList.add('js');setTimeout(function(){if(!window.__acReveal)document.documentElement.classList.add('reveal-all')},3500);`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={interTight.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-jade focus:px-5 focus:py-3 focus:text-navy"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <RevealController />
      </body>
    </html>
  );
}
