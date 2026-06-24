import Link from "next/link";
import { SearchX, ArrowLeft, Briefcase, Building2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for doesn't exist or has been moved.",
};

/**
 * 404 page. Next.js will automatically render this for any unmatched route.
 * Branded, helpful, and offers two useful exits: back to safety or jump into
 * the most-trafficked pages (jobs, companies).
 */
export default function NotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 sm:py-28">
      <div className="flex flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <SearchX className="h-10 w-10" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Error 404
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          We couldn&apos;t find the page you were looking for. It may have been moved,
          renamed, or it never existed.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link
            href="/jobs"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            Browse jobs
          </Link>
        </div>

        <div className="mt-14 grid w-full gap-4 sm:grid-cols-2">
          <Link
            href="/jobs"
            className="group rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Briefcase
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
            <p className="mt-3 font-semibold text-foreground group-hover:text-primary">
              Find your next role
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore open healthcare positions from hospitals, clinics, and
              home-care agencies.
            </p>
          </Link>
          <Link
            href="/login"
            className="group rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Building2
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
            <p className="mt-3 font-semibold text-foreground group-hover:text-primary">
              Hiring? Post a job
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reach qualified healthcare professionals across India.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}