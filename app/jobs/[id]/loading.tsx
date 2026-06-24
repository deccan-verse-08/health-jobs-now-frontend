import { Skeleton } from "@/components/ui/skeleton";

/**
 * Streaming loading skeleton for the /jobs/[id] detail page.
 */
export default function JobDetailLoading() {
  return (
    <div
      className="container mx-auto max-w-3xl px-4 py-10"
      aria-busy="true"
      aria-label="Loading job details"
    >
      <Skeleton className="mb-6 h-8 w-32" />

      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        {/* Title block */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 border-t border-border pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Apply button area */}
        <div className="border-t border-border pt-6">
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </div>
  );
}