import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Privacy Policy",
  description: "How HealthJobsNow collects, uses, and protects your information.",
};

type Section = { heading: string; body: ReactNode };

const SECTIONS: Section[] = [
  {
    heading: "1. What we collect",
    body: (
      <>
        <p>
          We collect information you provide when creating an account and
          using HealthJobsNow: name, email, mobile number, professional
          profile details (specialization, experience, education, skills),
          and any resume or document you upload. Employers additionally
          provide company information when registering a company profile.
        </p>
        <p>
          We automatically log basic technical information (IP address,
          browser type, pages visited) to keep the service secure and
          improve it over time.
        </p>
      </>
    ),
  },
  {
    heading: "2. How we use it",
    body: (
      <>
        <p>
          Your data is used to operate the platform: show your profile to
          employers, deliver applications, send transactional emails (account
          verification, application status updates), and prevent abuse.
        </p>
        <p>
          We do not sell your personal data. We do not use your data for
          advertising.
        </p>
      </>
    ),
  },
  {
    heading: "3. Where it is stored",
    body: (
      <p>
        Application data is stored on our backend infrastructure hosted with
        industry-standard providers. Resume PDFs and other uploads are
        stored on Supabase object storage under signed access controls.
        Authentication uses JWT tokens; passwords are never stored in
        plaintext.
      </p>
    ),
  },
  {
    heading: "4. Your rights",
    body: (
      <>
        <p>You can at any time:</p>
        <ul>
          <li>View and edit your profile information.</li>
          <li>Download your data on request.</li>
          <li>Delete your account by emailing us.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "5. Cookies",
    body: (
      <p>
        We use a small number of essential cookies to keep you signed in and
        remember your preferences. We do not use third-party tracking
        cookies.
      </p>
    ),
  },
  {
    heading: "6. Contact",
    body: (
      <p>
        Privacy questions can be sent to{" "}
        <a
          href="mailto:info.deccanverse.pune@gmail.com"
          className="text-primary hover:underline"
        >
          info.deccanverse.pune@gmail.com
        </a>
        . We aim to respond within five business days.
      </p>
    ),
  },
];

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: 1 January 2026
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert mt-8 max-w-none space-y-8 text-foreground">
        <p className="text-base text-muted-foreground">
          This is a placeholder policy. The full legal text will be reviewed
          and finalised before public launch. The summary below is intended to
          give you a clear picture of our approach in the meantime.
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