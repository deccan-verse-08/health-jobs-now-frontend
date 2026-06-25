"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, PlusCircle, User as UserIcon, LayoutDashboard, Shield, Building2, AlertTriangle, X, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { companyApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/api";

interface NavAuthSectionProps {
  mobile?: boolean;
}

export function NavAuthSection({ mobile = false }: NavAuthSectionProps) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [showToast, setShowToast] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [myCompany, setMyCompany] = React.useState<Company | null>(null);
  const [companyLoaded, setCompanyLoaded] = React.useState(false);

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  React.useEffect(() => {
    if (ready && user && user.roles.includes("EMPLOYER") && !companyLoaded) {
      companyApi.getMyCompany().then((c) => {
        setMyCompany(c);
        setCompanyLoaded(true);
      }).catch(() => {
        setMyCompany(null);
        setCompanyLoaded(true);
      });
    }
  }, [ready, user, companyLoaded]);

  if (!ready) {
    return <div className="h-10 w-32" aria-hidden />;
  }

  if (!user) {
    return (
      <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-2"}>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline" }),
            mobile ? "h-11 w-full justify-center text-sm" : "h-9 px-3 text-sm"
          )}
        >
          Log in
        </Link>
        <Link
          href="/register"
          className={cn(
            buttonVariants(),
            mobile ? "h-11 w-full justify-center text-sm" : "h-9 px-3 text-sm"
          )}
        >
          Sign up
        </Link>
      </div>
    );
  }

  const isAdmin = user.roles.includes("ADMIN");
  const isEmployer = user.roles.includes("EMPLOYER");
  const isSeeker = user.roles.includes("JOB_SEEKER");
  const canPost = isAdmin || (isEmployer && myCompany?.status === "APPROVED");

  const wrapperClass = mobile ? "flex flex-col gap-1.5" : "flex items-center gap-1";
  // On mobile use larger touch targets; on desktop use compact sm buttons.
  const linkClass = mobile
    ? "h-11 w-full justify-start rounded-lg px-3 text-sm"
    : "h-9 px-3 text-sm";
  const primaryClass = mobile
    ? "h-11 w-full justify-center rounded-lg text-sm"
    : "h-9 px-3 text-sm";

  return (
    <div className={wrapperClass}>
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            linkClass,
            "text-primary hover:text-primary"
          )}
        >
          <Shield className="h-4 w-4" aria-hidden="true" />
          Admin Panel
        </Link>
      )}
      {isEmployer && !canPost && (
        <Button
          variant="secondary"
          onClick={() => setShowToast(true)}
          className={primaryClass}
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Post a Job
        </Button>
      )}
      {canPost && (
        <Link
          href="/post-job"
          className={cn(buttonVariants(), primaryClass)}
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Post a Job
        </Link>
      )}
      {isEmployer && (
        <Link
          href="/company"
          className={cn(buttonVariants({ variant: "ghost" }), linkClass)}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          My Company
        </Link>
      )}
      {!isSeeker && (
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost" }), linkClass)}
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
      )}
      {isSeeker && (
        <Link
          href="/my-jobs"
          className={cn(buttonVariants({ variant: "ghost" }), linkClass)}
        >
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          My Jobs
        </Link>
      )}
      <Link
        href="/profile"
        className={cn(buttonVariants({ variant: "ghost" }), linkClass)}
      >
        <UserIcon className="h-4 w-4" aria-hidden="true" />
        {user.firstName}
      </Link>
      <Button
        variant="outline"
        onClick={() => setShowLogoutConfirm(true)}
        className={primaryClass}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Logout
      </Button>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out of HealthJobsNow?"
        description="You'll need to sign in again to apply for jobs or manage postings."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
          router.push("/");
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Warning toast — rendered via portal */}
      {showToast && typeof document !== "undefined" && createPortal(
        <div
          role="alertdialog"
          aria-labelledby="post-job-warning-title"
          aria-describedby="post-job-warning-desc"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowToast(false);
          }}
        >
          <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 px-5 py-4 shadow-xl max-w-sm">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm flex-1">
              <p id="post-job-warning-title" className="font-semibold text-foreground">
                {!myCompany ? "No company registered" : "Company not approved"}
              </p>
              <p id="post-job-warning-desc" className="mt-1 text-muted-foreground">
                {!myCompany
                  ? "You need to register a company before posting jobs. Go to My Company to get started."
                  : "Your company is awaiting admin approval. You'll be able to post jobs once approved. Or reach out to us at info.deccanverse.pune@gmail.com."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}