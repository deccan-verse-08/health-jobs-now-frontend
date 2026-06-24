"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

/**
 * Root error boundary. Catches any unhandled client/server error in this route
 * subtree and gives the user a recovery path instead of Next.js's default
 * error screen.
 *
 * - "Try again" calls reset() to re-render the segment.
 * - "Go home" sends them somewhere known-good.
 * - Surfaces the error reference so users can quote it when reporting.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app: hook into Sentry/PostHog/etc.
    // Keep this no-op so we don't introduce side effects in this skeleton.
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 sm:py-28">
      <div className="flex flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        >
          <AlertTriangle className="h-10 w-10" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-destructive">
          Something went wrong
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          We hit an unexpected error
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          The page failed to load. You can try again, or head back home. If the
          problem keeps happening, please reach out — we&apos;ll dig in.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} size="lg">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 rounded-md border border-border bg-surface px-4 py-2 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <a
          href="mailto:info.deccanverse.pune@gmail.com?subject=Error%20on%20HealthJobsNow"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Contact support
        </a>
      </div>
    </div>
  );
}