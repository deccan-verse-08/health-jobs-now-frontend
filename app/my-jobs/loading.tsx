import { Skeleton } from "@/components/ui/skeleton";

export default function MyJobsLoading() {
  return (
    <div
      className="container mx-auto max-w-6xl px-4 py-10"
      aria-busy="true"
      aria-label="Loading my applications"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
