import Link from "next/link";
import { API_BASE } from "@/lib/constants";
import { JobList } from "@/components/JobList";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/SearchForm";
import { PostJobButton } from "@/components/PostJobButton";
import type { Job, PageResponse } from "@/types/api";

type SearchParams = {
  page?: string;
  size?: string;
  sortBy?: string;
  direction?: "asc" | "desc";
  q?: string;
};

const PAGE_SIZE = 10;

async function fetchJobs(params: SearchParams) {
  const page = Math.max(0, Number(params.page ?? 0));
  const size = Math.min(50, Math.max(1, Number(params.size ?? PAGE_SIZE)));
  const sortBy = params.sortBy ?? "createdDate";
  const direction = params.direction === "asc" ? "asc" : "desc";
  const url = new URL("/api/jobs", API_BASE);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  url.searchParams.set("sortBy", sortBy);
  url.searchParams.set("direction", direction);
  if (params.q) {
    url.searchParams.set("q", params.q);
  }

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return { page: null, error: `Failed to load jobs (${res.status})` };
    }
    const data = (await res.json()) as PageResponse<Job>;
    return { page: data, error: null };
  } catch {
    return { page: null, error: "Could not reach the backend. Is it running on " + API_BASE + "?" };
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, error } = await fetchJobs(sp);

  const currentPage = sp.page ? Math.max(0, Number(sp.page)) : 0;
  const currentSortBy = sp.sortBy ?? "createdDate";
  const currentDirection = sp.direction ?? "desc";
  const buildHref = (p: number) => {
    const u = new URLSearchParams();
    u.set("page", String(p));
    if (sp.q) u.set("q", sp.q);
    u.set("sortBy", currentSortBy);
    u.set("direction", currentDirection);
    return `/jobs?${u.toString()}`;
  };
  const buildSortHref = (sortBy: string) => {
    const direction =
      currentSortBy === sortBy && currentDirection === "desc" ? "asc" : "desc";
    const u = new URLSearchParams();
    if (sp.q) u.set("q", sp.q);
    u.set("sortBy", sortBy);
    u.set("direction", direction);
    return `/jobs?${u.toString()}`;
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse healthcare jobs</h1>
          <p className="mt-1 text-muted-foreground">
            {page ? `${page.totalElements} opening${page.totalElements === 1 ? "" : "s"} available` : " "}
          </p>
        </div>
        <PostJobButton />
      </div>

      <div className="mb-8">
        <SearchForm initialValue={sp.q || ""} />
      </div>

      {/* Sort controls */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Sort by:</span>
        {[
          { key: "createdDate", label: "Newest" },
          { key: "title", label: "Title" },
          { key: "company", label: "Company" },
          { key: "location", label: "Location" },
        ].map(({ key, label }) => {
          const active = currentSortBy === key;
          const arrow = active ? (currentDirection === "asc" ? "↑" : "↓") : "";
          return (
            <Button
              key={key}
              asChild
              size="sm"
              variant={active ? "default" : "outline"}
            >
              <Link href={buildSortHref(key)}>
                {label} {arrow}
              </Link>
            </Button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : page ? (
        <>
          <JobList jobs={page.content} emptyMessage="No jobs match your criteria." />
          <Pagination
            page={currentPage}
            totalPages={page.totalPages}
            totalElements={page.totalElements}
            buildHref={buildHref}
          />
        </>
      ) : null}
    </div>
  );
}
