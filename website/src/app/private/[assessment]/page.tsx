import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { assessmentById } from "@/lib/assessments";
import { accessConfigured, cookieName, sessionValid } from "@/lib/assessments/access";
import { AccessGate } from "./AccessGate";
import { Questionnaire } from "./Questionnaire";

/** Private, invitation-only assessments. Never listed, never indexed, never cached. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Generic on purpose: nothing about the recipient is visible before access is granted.
  title: { absolute: "Private Assessment | ADEN-CHASE Strategies" },
  description: "A private assessment prepared by ADEN-CHASE Strategies.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  openGraph: null,
  twitter: null,
};

export default async function PrivateAssessmentPage({ params }: PageProps<"/private/[assessment]">) {
  const a = assessmentById((await params).assessment);
  if (!a) notFound();
  const authorized = sessionValid(a, (await cookies()).get(cookieName(a))?.value);
  // The client receives the content only (not the name of the access-code variable).
  const definition = { id: a.id, title: a.title, subtitle: a.subtitle, recipientName: a.recipientName, introduction: a.introduction, questions: a.questions, completion: a.completion };

  return (
    <main id="main" className="relative min-h-dvh bg-navy">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(60rem_24rem_at_50%_-6rem,rgba(0,66,172,0.42),transparent_70%)]" />
      <header className="relative mx-auto flex max-w-[46rem] items-center justify-between px-5 pt-8 sm:px-8 sm:pt-10">
        <a href="https://adenchase.com" className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-jade focus-visible:ring-offset-4 focus-visible:ring-offset-navy">
          <Image src="/brand/aden-chase-logo-nav.png" alt="ADEN-CHASE Strategies (go to adenchase.com)" width={1320} height={320} priority sizes="160px" className="h-auto w-[132px] sm:w-[160px]" />
        </a>
        <p className="type-label text-haze">Private</p>
      </header>
      <div className="relative mx-auto max-w-[46rem] px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        {authorized ? <Questionnaire a={definition} /> : <AccessGate assessmentId={a.id} open={accessConfigured(a)} />}
      </div>
    </main>
  );
}
