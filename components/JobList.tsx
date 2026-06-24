import { JobCard } from "./JobCard";
import type { Job } from "@/types/api";

export function JobList({ jobs, emptyMessage }: { jobs: Job[]; emptyMessage?: string }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          {emptyMessage ?? "No jobs found. Try adjusting your filters."}
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
