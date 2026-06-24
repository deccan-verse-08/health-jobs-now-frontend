"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { companyApi } from "@/lib/api";
import { JobForm } from "@/components/JobForm";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/api";

export default function PostJobPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [myCompany, setMyCompany] = React.useState<Company | null>(null);
  const [companyLoaded, setCompanyLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login?next=/post-job");
      return;
    }
    if (!user.roles.includes("EMPLOYER") && !user.roles.includes("ADMIN")) {
      router.replace("/jobs");
    }
  }, [ready, user, router]);

  React.useEffect(() => {
    if (ready && user && user.roles.includes("EMPLOYER")) {
      companyApi.getMyCompany().then((c) => {
        setMyCompany(c);
        setCompanyLoaded(true);
      }).catch(() => {
        setMyCompany(null);
        setCompanyLoaded(true);
      });
    } else if (ready && user && user.roles.includes("ADMIN")) {
      setCompanyLoaded(true);
    }
  }, [ready, user]);

  if (!ready || !user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    );
  }

  const isEmployer = user.roles.includes("EMPLOYER");
  const isAdmin = user.roles.includes("ADMIN");

  if (!isEmployer && !isAdmin) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold">Employer account required</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You need an employer or admin account to post jobs.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Create an employer account
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Employer without a company
  if (isEmployer && companyLoaded && !myCompany) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold">Register your company first</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              You must register a company and get it approved by an admin before you can post jobs.
            </p>
            <Link
              href="/company/register"
              className={cn(buttonVariants(), "mt-2")}
            >
              <Building2 className="h-4 w-4" />
              Register Company
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Employer with unapproved company
  if (isEmployer && companyLoaded && myCompany && myCompany.status !== "APPROVED") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card className="border-border/60 bg-card/40 backdrop-blur">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold">
              {myCompany.status === "PENDING_APPROVAL" && "Company pending approval"}
              {myCompany.status === "DENIED" && "Company approval denied"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {myCompany.status === "PENDING_APPROVAL" &&
                `Your company "${myCompany.name}" is pending admin approval. You'll be able to post jobs once it's approved.`}
              {myCompany.status === "DENIED" &&
                `Your company "${myCompany.name}" has been denied by the administrators.`}
            </p>
            <Link
              href="/company"
              className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
            >
              View Company Status
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading company state
  if (isEmployer && !companyLoaded) {
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
      <h1 className="text-3xl font-bold tracking-tight">Post a healthcare job</h1>
      <p className="mt-1 text-muted-foreground">
        Reach qualified candidates actively looking for roles like yours.
      </p>
      <div className="mt-8">
        <JobForm mode="create" />
      </div>
    </div>
  );
}
