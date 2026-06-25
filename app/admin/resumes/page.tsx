"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi, profilesApi, companyApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Search, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, Filter, Stethoscope, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, UserProfile, TierInfo } from "@/types/api";

type ResumeRow = {
  user: User;
  profile: UserProfile | null;
  profileError?: string;
};

const PAGE_SIZE = 10;

export default function AdminResumesPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [rows, setRows] = React.useState<ResumeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [resumeFilter, setResumeFilter] = React.useState<"all" | "with" | "without">("all");
  const [tierInfo, setTierInfo] = React.useState<TierInfo | null>(null);
  const [tierLoaded, setTierLoaded] = React.useState(false);

  // Auth gate
  React.useEffect(() => {
    if (ready) {
      if (!user) {
        router.replace("/");
        return;
      }
      
      const isAdmin = user.roles.includes("ADMIN");
      const isEmployer = user.roles.includes("EMPLOYER");
      
      if (!isAdmin && !isEmployer) {
        router.replace("/");
        return;
      }

      if (isEmployer) {
        companyApi.getMyTierInfo()
          .then((tInfo) => {
            setTierInfo(tInfo);
            setTierLoaded(true);
            if (!tInfo.resumeDbAccess) {
              router.replace("/not-authorized");
            } else {
              loadResumes();
            }
          })
          .catch(() => {
            router.replace("/");
          });
      } else {
        // Admin
        setTierLoaded(true);
        loadResumes();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready, router]);

  async function loadResumes() {
    setLoading(true);
    setError(null);
    try {
      const candidates = await profilesApi.listCandidates();
      const newRows: ResumeRow[] = candidates.map((c) => ({
        user: c.user,
        profile: c.profile,
      }));
      setRows(newRows);
      setPage(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load resumes";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (resumeFilter === "with" && !row.profile?.generatedResumeUrl) return false;
      if (resumeFilter === "without" && row.profile?.generatedResumeUrl) return false;
      if (!q) return true;
      const p = row.profile;
      const haystack = [
        row.user.firstName,
        row.user.lastName,
        row.user.username,
        row.user.email,
        row.user.mobileNumber ?? "",
        p?.specialization ?? "",
        p?.qualifications ?? "",
        p?.keySkills ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, search, resumeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const pageRows = filteredRows.slice(pageStart, pageStart + PAGE_SIZE);

  // Reset to first page when search/filter changes
  React.useEffect(() => {
    setPage(0);
  }, [search, resumeFilter]);

  const totalWithResume = rows.filter((r) => !!r.profile?.generatedResumeUrl).length;

  const isAdmin = user?.roles.includes("ADMIN");
  const isEmployer = user?.roles.includes("EMPLOYER");
  const hasAccess = isAdmin || (isEmployer && tierInfo?.resumeDbAccess === true);

  if (!ready || !user || !tierLoaded || !hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent motion-reduce:animate-none" />
          <p className="text-sm text-muted-foreground">Checking access credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-wider">Resume Database</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Candidate Resumes</h1>
          <p className="text-sm text-muted-foreground">
            Browse all job-seeker profiles and their generated resume PDFs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to {isAdmin ? "admin" : "dashboard"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Job Seekers</p>
              <h3 className="text-2xl font-bold">{rows.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-500">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resumes Available</p>
              <h3 className="text-2xl font-bold">{totalWithResume}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-amber-500/10 p-3 text-amber-500">
              <Filter className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Showing</p>
              <h3 className="text-2xl font-bold">{filteredRows.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-border/60 bg-card/40 backdrop-blur">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Candidates</CardTitle>
            <CardDescription>
              Click &ldquo;View Resume&rdquo; to open the generated PDF in a new tab.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search name, email, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-72"
                aria-label="Search candidates by name, email, specialization, or skills"
              />
            </div>
            <div className="flex items-center gap-1 rounded-md border border-input bg-background p-0.5 text-xs">
              {([
                { key: "all", label: "All" },
                { key: "with", label: "With resume" },
                { key: "without", label: "No resume" },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setResumeFilter(opt.key)}
                  aria-pressed={resumeFilter === opt.key}
                  className={cn(
                    "rounded px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    resumeFilter === opt.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadResumes}
              disabled={loading}
              aria-label="Refresh resume list"
              className="h-9 w-9"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error ? (
            <div role="alert" aria-live="polite" className="m-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none" />
                <p className="text-sm text-muted-foreground">Loading candidate resumes...</p>
              </div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<FileText className="h-6 w-6" aria-hidden="true" />}
                title={rows.length === 0 ? "No candidates yet" : "No candidates match your filters"}
                description={
                  rows.length === 0
                    ? "When job seekers sign up and generate resumes, they will appear here."
                    : "Try clearing the search or changing the resume filter."
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-4">Candidate</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Specialization</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Key Skills</th>
                      <th className="px-6 py-4 text-right">Resume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {pageRows.map((row) => {
                      const fullName = `${row.user.firstName} ${row.user.lastName}`.trim() || row.user.username;
                      const initials = (row.user.firstName?.[0] || row.user.username?.[0] || "?") + (row.user.lastName?.[0] || "");
                      const resumeUrl = row.profile?.generatedResumeUrl;
                      return (
                        <tr key={row.user.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                aria-hidden="true"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary"
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">{fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">@{row.user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5 text-xs">
                              <p className="flex items-center gap-1.5 text-foreground">
                                <Mail className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                                <span className="truncate max-w-[180px]">{row.user.email}</span>
                              </p>
                              {row.user.mobileNumber && (
                                <p className="flex items-center gap-1.5 text-muted-foreground">
                                  <Phone className="h-3 w-3" aria-hidden="true" />
                                  {row.user.mobileNumber}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {row.profile?.specialization || (
                              <span className="text-muted-foreground italic">Not set</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {row.profile?.experienceYears != null ? (
                              <span className="text-foreground">
                                {row.profile.experienceYears} {row.profile.experienceYears === 1 ? "year" : "years"}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 max-w-[220px]">
                            {row.profile?.keySkills ? (
                              <p className="truncate text-muted-foreground" title={row.profile.keySkills}>
                                {row.profile.keySkills}
                              </p>
                            ) : (
                              <span className="text-muted-foreground italic">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {resumeUrl ? (
                              <Button
                                asChild
                                size="sm"
                                variant="default"
                                className="h-8 gap-1.5"
                              >
                                <a
                                  href={resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`View resume for ${fullName} (opens in new tab)`}
                                >
                                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                  View
                                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                </a>
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                                No resume
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-start justify-between gap-3 border-t border-border/60 px-6 py-4 text-sm sm:flex-row sm:items-center">
                <p className="text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredRows.length)}
                  </span>{" "}
                  of <span className="font-medium text-foreground">{filteredRows.length}</span> candidate
                  {filteredRows.length === 1 ? "" : "s"}
                  {search || resumeFilter !== "all" ? (
                    <span className="text-muted-foreground"> (filtered from {rows.length})</span>
                  ) : null}
                </p>
                <nav aria-label="Pagination" className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </Button>
                  <span
                    className="rounded-md border border-input bg-background px-3 py-1 text-xs font-medium"
                    aria-current="page"
                  >
                    Page {safePage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage >= totalPages - 1}
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </nav>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subtle tip when only some candidates lack resumes */}
      {!loading && !error && rows.length > 0 && totalWithResume > 0 && totalWithResume < rows.length && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <ChevronRight className="inline h-3 w-3 -mt-0.5" aria-hidden="true" /> Tip: switch to the{" "}
          <em>&ldquo;No resume&rdquo;</em> filter to find candidates who haven&rsquo;t generated one yet.
        </p>
      )}
    </div>
  );
}
