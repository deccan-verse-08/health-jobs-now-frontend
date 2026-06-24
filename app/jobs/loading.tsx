import { JobListSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Streaming loading skeleton for the /jobs listing page. Rendered by Next.js
 * while the page's server component is fetching. Keeps the layout stable so
 * the user doesn't see a jump when the real content arrives.
 */
export default function JobsLoading() {
  return (
    <div
      className="container mx-auto max-w-6xl px-4 py-10"
      aria-busy="true"
      aria-label="Loading jobs"
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Search console skeleton */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <JobListSkeleton count={6} />
      </div>
    </div>
  );
}