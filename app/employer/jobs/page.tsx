import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { cookies } from "next/headers";
import { API_BASE, TOKEN_COOKIE } from "@/lib/constants";
import { JobList } from "@/components/JobList";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { Job, PageResponse } from "@/types/api";

export const metadata = { title: "Dashboard — HealthJobsNow" };

async function fetchJobs(): Promise<{ jobs: Job[]; error: string | null }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${API_BASE}/api/jobs/my?page=0&size=50&sortBy=createdDate&direction=desc`,
      { 
        cache: "no-store",
        headers
      }
    );
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { jobs: [], error: "Unauthorized. Please log in as an Employer." };
      }
      return { jobs: [], error: `Backend returned ${res.status}` };
    }
    const data = (await res.json()) as PageResponse<Job>;
    return { jobs: data.content ?? [], error: null };
  } catch {
    return { jobs: [], error: "Could not reach the backend." };
  }
}

export default async function EmployerDashboardPage() {
  const { jobs, error } = await fetchJobs();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employer dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your job postings.
          </p>
        </div>
        <Link href="/post-job" className={cn(buttonVariants())}>
          <PlusCircle className="h-4 w-4" />
          Post a job
        </Link>
      </div>



      <div className="mt-8">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <JobList jobs={jobs} emptyMessage="No jobs have been posted yet." />
        )}
      </div>
    </div>
  );
}
