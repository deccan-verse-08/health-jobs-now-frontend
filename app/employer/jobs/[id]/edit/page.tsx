"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { jobsApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { JobForm } from "@/components/JobForm";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/api";

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [job, setJob] = React.useState<Job | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const id = React.use(params).id;

  React.useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/login?next=/employer/jobs/${id}/edit`);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const j = await jobsApi.get(Number(id));
        if (!cancelled) setJob(j);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) setError(err.message);
          else setError("Failed to load job.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, ready, user, router]);

  if (!ready || loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/employer/jobs"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Edit job</h1>

      {error ? (
        <div className="mt-8">
          <Card>
            <CardContent className="p-8 text-sm text-destructive">{error}</CardContent>
          </Card>
        </div>
      ) : job ? (
        <div className="mt-8">
          <JobForm mode="edit" initial={job} />
        </div>
      ) : null}
    </div>
  );
}
