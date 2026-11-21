import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/meta";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageJsonLd } from "@/lib/structured-data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta("/privacy");

/** Date this notice takes effect (update with every substantive change). */
const EFFECTIVE = "November 21, 2026";

/**
 * Privacy notice. Describes only what the site actually does (src/lib/analytics.ts, the contact
 * form, private assessments, hosting). Keep it in step with docs/ANALYTICS.md.
 */
export default function PrivacyPage() {
  return (
    <main id="main">
      <JsonLd data={pageJsonLd("/privacy", "Privacy notice")} />
      <article className="mx-auto max-w-[44rem] px-5 pb-24 pt-32 sm:px-8 lg:pt-40">
        <p className="type-label text-haze">Legal</p>
        <h1 className="type-headline mt-6 text-ink">Privacy notice</h1>
        <p className="mt-6 text-sm text-haze">Effective {EFFECTIVE}</p>

        <p className="type-lede mt-10 text-mist">
          This notice explains what information {SITE.name} (&ldquo;ADEN-CHASE&rdquo;, &ldquo;we&rdquo;) collects through adenchase.com, why, and the choices you have.
        </p>

        <div className="insight-prose mt-4">

          <h2>Website analytics (Google Analytics)</h2>
          <p>
            We use Google Analytics 4, provided by Google, to understand how the website and our editorial publication, The Opportunity Perspective, are used: which pages
            and articles are read, how far articles are read, which links and downloads are used, how visitors arrive (for example from a search engine, a social network or a
            campaign link), and the general type of device, browser and approximate location (country and city).
          </p>
          <p>
            Google Analytics uses cookies (named <code>_ga</code> and <code>_ga_…</code>, which can last up to two years) to recognise a returning browser. We do not send
            names, email addresses, the contents of forms or any other information that identifies you to Google Analytics. Google Analytics does not store IP addresses. We
            have turned off Google&rsquo;s advertising features and Google signals, and we do not use this data for advertising.
          </p>
          <p>
            For visitors in the European Economic Area, the United Kingdom and Switzerland, analytics cookies are not set; only limited, cookieless measurements are sent. Analytics
            data is kept for up to 14 months and then deleted by Google.
          </p>
          <p>
            You can block or delete cookies in your browser settings, or install Google&rsquo;s opt-out browser add-on (
            <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener" target="_blank">
              tools.google.com/dlpage/gaoptout
            </a>
            ). Google&rsquo;s own privacy policy is at{" "}
            <a href="https://policies.google.com/privacy" rel="noopener" target="_blank">
              policies.google.com/privacy
            </a>
            .
          </p>

          <h2>Contact and inquiry forms</h2>
          <p>
            When you contact us, we receive the details you choose to provide, such as your name, email address, organisation, area of interest and message. We use them only to
            respond to you and to consider a possible engagement. The form is delivered to us by email through our email delivery provider (Resend). We do not sell this
            information or add it to marketing lists.
          </p>

          <h2>Private assessments</h2>
          <p>
            Some clients are invited to complete a private assessment. Those pages are available only with an access code, use no analytics, and the answers are stored in a
            private, access-restricted Google workspace controlled by ADEN-CHASE, used only to prepare the assessment and follow up.
          </p>

          <h2>Hosting and security</h2>
          <p>
            The website is hosted by Vercel. Like any web host, it processes technical information such as IP addresses and request logs to deliver pages and protect the
            service.
          </p>

          <h2>International processing</h2>
          <p>Google, Resend and Vercel may process information in the United States and other countries, under their own data-protection commitments.</p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live, including under Jamaica&rsquo;s Data Protection Act, 2020 and, where it applies, the EU and UK GDPR, you may ask to access, correct or
            delete personal information we hold about you, or object to its use. To make a request or ask a question, contact us through the{" "}
            <Link href="/contact">contact page</Link>.
          </p>

          <h2>Changes</h2>
          <p>We will update this notice if our practices change, and show the new effective date above.</p>
        </div>
      </article>
    </main>
  );
}
