import { JobListSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerJobsLoading() {
  return (
    <div
      className="container mx-auto max-w-6xl px-4 py-10"
      aria-busy="true"
      aria-label="Loading jobs"
    >
      <div className="space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        <JobListSkeleton count={3} />
      </div>
    </div>
  );
}
