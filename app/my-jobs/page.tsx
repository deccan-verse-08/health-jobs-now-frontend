"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  MapPin,
  Building2,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { applicationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, cn } from "@/lib/utils";
import type { JobApplication } from "@/types/api";

export default function MyJobsPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push("/login?next=/my-jobs");
      return;
    }

    // Redirect employers and admins to the dashboard
    if (user.roles.includes("EMPLOYER") || user.roles.includes("ADMIN")) {
      router.replace("/dashboard");
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await applicationsApi.myApplications();
        setApplications(data);
      } catch (err: any) {
        if (err && typeof err === "object" && "status" in err) {
          if (err.status === 401 || err.status === 403) {
            logout();
            router.push("/login?next=/my-jobs");
            return;
          }
          setError(err.message || "An error occurred.");
        } else {
          setError("Failed to load applied jobs.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [ready, user, router, logout]);

  if (!ready || loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10" aria-busy="true" aria-label="Loading applications">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="mt-1 text-muted-foreground">
            Track the status of roles you have applied for.
          </p>
        </div>

        {applications.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="bg-card/50">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-xs text-muted-foreground">Total Applied</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {
                    applications.filter(
                      (a) =>
                        a.status === "PENDING" ||
                        a.status === "SUBMITTED" ||
                        a.status === "APPLICATION_SENT" ||
                        a.status === "APPLIED"
                    ).length
                  }
                </p>
                <p className="text-xs text-muted-foreground">Application Sent</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {
                    applications.filter(
                      (a) =>
                        a.status === "INTERVIEW" ||
                        a.status === "INTERVIEW_STAGE" ||
                        a.status === "REVIEWING"
                    ).length
                  }
                </p>
                <p className="text-xs text-muted-foreground">Interview Stage</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {
                    applications.filter(
                      (a) => a.status === "APPROVED" || a.status === "ACCEPTED"
                    ).length
                  }
                </p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </CardContent>
            </Card>
          </div>
        )}

        {applications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-6 w-6" aria-hidden="true" />}
            title="No applications yet"
            description="Start applying to healthcare opportunities today."
            action={{ label: "Browse Jobs", href: "/jobs" }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((app) => {
              return (
                <Card
                  key={app.id}
                  className="overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/jobs/${app.job.id}`}
                          className="hover:underline"
                        >
                          <CardTitle className="text-xl font-semibold">
                            {app.job.title}
                          </CardTitle>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> {app.job.company}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {app.job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> Applied on{" "}
                          {formatDate(app.appliedDate)}
                        </span>
                      </div>

                      {app.resumeUrl && (
                        <div className="flex items-center gap-2 rounded-md border border-border bg-surface p-2 text-xs">
                          <FileText className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                          <span className="truncate font-medium text-foreground max-w-[150px] sm:max-w-xs">
                            Uploaded Resume
                          </span>
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-primary hover:underline font-semibold inline-flex items-center gap-0.5 shrink-0"
                          >
                            Open <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          </a>
                        </div>
                      )}

                      {app.employerMessage && (
                        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs mt-3 text-foreground">
                          <p className="font-semibold text-[10px] text-primary uppercase tracking-wider mb-1">
                            Message from Employer
                          </p>
                          <p className="whitespace-pre-line leading-relaxed font-sans">{app.employerMessage}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-3 border-t border-border mt-3">
                      <Link
                        href={`/jobs/${app.job.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        View Job Details
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
