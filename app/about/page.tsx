import Link from "next/link";
import {
  Heart,
  Briefcase,
  Building2,
  Users,
  Mail,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "About",
  description:
    "HealthJobsNow is a healthcare-only job platform built by Deccanverse and Vivako Consults to connect medical talent with the institutions that need them.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Healthcare-only",
    description:
      "Unlike generalist boards, every job and every candidate is in healthcare. We speak the domain's language.",
  },
  {
    icon: Users,
    title: "Built for India",
    description:
      "We serve nurses, doctors, technicians, and home-care professionals across Indian cities and towns.",
  },
  {
    icon: Briefcase,
    title: "Real applications",
    description:
      "Applicants can attach platform-built resume PDFs or upload their own — and employers can update applicants by status in one place.",
  },
];

// const STATS = [
//   { value: "2 JV", label: "Founding partners" },
//   { value: "3 roles", label: "Job seeker, employer, admin" },
//   { value: "100%", label: "Healthcare focus" },
// ];

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="space-y-12">
        {/* Hero */}
        <section className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            Healthcare hiring, simplified
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About HealthJobsNow
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            A healthcare-only job platform built by{" "}
            <span className="font-semibold text-foreground">Deccanverse
            Technologies LLP</span>{" "}
            and{" "}
            <span className="font-semibold text-foreground">Vivako
            Consults</span>{" "}
            to make hiring in Indian healthcare faster, fairer, and more
            transparent.
          </p>
        </section>

        {/* Stats */}
        {/* <section
          aria-label="At a glance"
          className="grid grid-cols-3 gap-3 sm:gap-6"
        >
          {STATS.map((stat) => (
            <Card key={stat.label} className="bg-card/60 text-center">
              <CardContent className="py-6">
                <p className="text-2xl font-bold text-primary sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
        */}

        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Our mission</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Healthcare hiring is fragmented. Hospitals post on generic boards,
            candidates drown in irrelevant roles, and the actual work —
            verifying credentials, screening for fit, scheduling interviews —
            falls on already-stretched HR teams. HealthJobsNow is a focused
            alternative: every job on the platform is in healthcare, every
            candidate&apos;s profile is structured for clinical hiring, and
            every application lands in a single, trackable inbox.
          </p>
        </section>

        {/* Values */}
        <section aria-labelledby="values-heading">
          <h2 id="values-heading" className="text-2xl font-bold tracking-tight">
            What we focus on
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {VALUES.map((v) => (
              <Card key={v.title} className="bg-card/60">
                <CardContent className="space-y-2 p-5">
                  <div
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"
                  >
                    <v.icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-foreground">{v.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {v.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Founders */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Founding partners</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="space-y-2 p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Technology partner
                  </span>
                </div>
                <p className="text-lg font-semibold">Deccanverse Technologies LLP</p>
                <p className="text-sm text-muted-foreground">
                  Builds the platform, infrastructure, and product experience.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Domain partner
                  </span>
                </div>
                <p className="text-lg font-semibold">Vivako Consults</p>
                <p className="text-sm text-muted-foreground">
                  Brings deep healthcare-recruitment expertise and employer
                  network across India.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Browse open roles or sign up to post openings for your hospital,
            clinic, or agency.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/jobs"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Browse jobs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section
          aria-labelledby="contact-heading"
          className="rounded-lg border border-border bg-card/60 p-6"
        >
          <h2 id="contact-heading" className="text-lg font-semibold">
            Get in touch
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions, partnerships, or support — we&apos;d love to hear from
            you.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <a
              href="mailto:info.deccanverse.pune@gmail.com"
              className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              info.deccanverse.pune@gmail.com
            </a>
            <a
              href="https://www.deccanverse.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              www.deccanverse.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}