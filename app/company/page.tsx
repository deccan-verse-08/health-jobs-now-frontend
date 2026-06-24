"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { companyApi, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Company } from "@/types/api";
import { Building2, Globe, MapPin, Factory, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MyCompanyPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [company, setCompany] = React.useState<Company | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (ready && !user) router.replace("/login?next=/company");
    if (ready && user && !user.roles.includes("EMPLOYER")) router.replace("/dashboard");
  }, [ready, user, router]);

  React.useEffect(() => {
    if (ready && user && user.roles.includes("EMPLOYER")) {
      loadCompany();
    }
  }, [ready, user]);

  async function loadCompany() {
    setLoading(true);
    try {
      const data = await companyApi.getMyCompany();
      setCompany(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 204) {
        setCompany(null); // No company
      } else {
        setCompany(null);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !user) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="h-40 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading company info...</p>
          </div>
        </div>
      </div>
    );
  }

  // No company registered yet — prompt to register
  if (!company) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-6 py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">No Company Registered</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Register your company to start posting healthcare job listings. Admin approval is required.
              </p>
            </div>
            <Link
              href="/company/register"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Register Your Company
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    PENDING_APPROVAL: {
      color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
      icon: <Clock className="h-4 w-4" />,
      label: "Pending Approval",
    },
    APPROVED: {
      color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: "Approved",
    },
    DENIED: {
      color: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Denied",
    },
  };

  const statusInfo = statusConfig[company.status as keyof typeof statusConfig] || statusConfig.PENDING_APPROVAL;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">My Company</h1>
      <p className="mt-1 text-muted-foreground">Your registered company on HealthJobsNow.</p>

      {company.status === "PENDING_APPROVAL" && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border-2 border-red-500 bg-red-400 dark:bg-red-900/40 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-black dark:text-black">Awaiting Admin Approval</p>
            <p className="mt-0.5 text-sm text-black dark:text-black">
              Your company is pending admin review. You&apos;ll receive an email once approved, and then you can start posting jobs.
            </p>
          </div>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {company.name}
              </CardTitle>
              <CardDescription className="mt-1">
                Registered on {company.createdDate ? new Date(company.createdDate).toLocaleDateString() : "N/A"}
              </CardDescription>
            </div>
            <Badge variant="secondary" className={statusInfo.color}>
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {company.description && (
            <div className="rounded-md border border-border p-4">
              <p className="text-xs uppercase text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{company.description}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {company.industry && (
              <div className="flex items-start gap-3 rounded-md border border-border p-4">
                <Factory className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Industry</p>
                  <p className="mt-0.5 font-medium">{company.industry}</p>
                </div>
              </div>
            )}
            {company.location && (
              <div className="flex items-start gap-3 rounded-md border border-border p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Location</p>
                  <p className="mt-0.5 font-medium">{company.location}</p>
                </div>
              </div>
            )}
          </div>

          {company.website && (
            <div className="flex items-start gap-3 rounded-md border border-border p-4">
              <Globe className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase text-muted-foreground">Website</p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 font-medium text-primary hover:underline"
                >
                  {company.website}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
