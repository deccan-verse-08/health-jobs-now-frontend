import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions governing your use of HealthJobsNow.",
};

type Section = { heading: string; body: ReactNode };

const SECTIONS: Section[] = [
  {
    heading: "1. Acceptance",
    body: (
      <p>
        By creating an account or using HealthJobsNow, you agree to these
        terms. If you do not agree, please don&apos;t use the service.
      </p>
    ),
  },
  {
    heading: "2. Accounts",
    body: (
      <>
        <p>
          You are responsible for keeping your account credentials secure
          and for all activity that occurs under your account. Notify us
          immediately if you believe your account has been compromised.
        </p>
        <p>
          You must provide accurate information during registration.
          Impersonating another person or entity is grounds for immediate
          suspension.
        </p>
      </>
    ),
  },
  {
    heading: "3. Job postings and applications",
    body: (
      <p>
        Employers agree to post only legitimate, currently-open positions.
        Job seekers agree that the information in their profile and resume
        is accurate. HealthJobsNow may, at its discretion, remove listings
        or accounts that violate these terms.
      </p>
    ),
  },
  {
    heading: "4. Platform moderation",
    body: (
      <p>
        HealthJobsNow is moderated. New companies require administrator
        approval before they can post jobs. We may delay, edit, or remove
        content that we reasonably believe violates these terms or
        applicable law.
      </p>
    ),
  },
  {
    heading: "5. Intellectual property",
    body: (
      <p>
        The platform, including its design, code, and branding, is owned by
        Deccanverse Technologies LLP. You retain ownership of the content
        you upload (your resume, your company description) and grant us a
        limited licence to display that content on the platform.
      </p>
    ),
  },
  {
    heading: "6. Disclaimers",
    body: (
      <p>
        HealthJobsNow is provided as-is. We do our best to keep the service
        available and accurate, but we cannot guarantee the identity,
        qualifications, or conduct of any user. Use the platform at your
        own discretion and verify important details directly.
      </p>
    ),
  },
  {
    heading: "7. Changes",
    body: (
      <p>
        We may update these terms from time to time. The &quot;last
        updated&quot; date at the top of this page will reflect the most
        recent change. Continued use of HealthJobsNow after a change
        indicates acceptance of the new terms.
      </p>
    ),
  },
  {
    heading: "8. Contact",
    body: (
      <p>
        Questions about these terms can be sent to{" "}
        <a
          href="mailto:info.deccanverse.pune@gmail.com"
          className="text-primary hover:underline"
        >
          info.deccanverse.pune@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
      </Link>

      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: 1 January 2026
        </p>
      </header>

      <div className="mt-8 space-y-8 text-foreground">
        <p className="text-base text-muted-foreground">
          This is a placeholder terms document. The full legal text will be
          reviewed and finalised before public launch. The summary below
          describes our approach in the meantime.
        </p>

        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-semibold text-foreground">
              {s.heading}
            </h2>
            <div className="mt-3 space-y-3 text-sm text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}