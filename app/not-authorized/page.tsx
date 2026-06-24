import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Not Authorized",
  description: "You don't have permission to view this page.",
};

/**
 * Friendly landing page when a user hits a route that requires a role they
 * don't have, or when they're unauthenticated and need to sign in.
 * Route guards in the destination pages can `router.replace("/not-authorized")`
 * instead of rendering their own ad-hoc card.
 */
export default function NotAuthorizedPage() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-20 sm:py-28">
      <div className="flex flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning/15 text-warning"
        >
          <ShieldAlert className="h-10 w-10" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-warning">
          Access restricted
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          You can&apos;t access this page
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          This area is reserved for users with the right permissions. Sign in
          with an account that has the required role, or head back home and
          continue browsing.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Link>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>

        <div className="mt-10 rounded-lg border border-border bg-surface p-5 text-left text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Why am I seeing this?</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You&apos;re signed out — sign in first.</li>
            <li>Your account is missing the required role (job seeker, employer, or admin).</li>
            <li>Your account may still be pending admin approval.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}