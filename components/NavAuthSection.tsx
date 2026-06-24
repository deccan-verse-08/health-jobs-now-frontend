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
import { cn } from "@/lib/utils";
import type { Company } from "@/types/api";

interface NavAuthSectionProps {
  mobile?: boolean;
}

export function NavAuthSection({ mobile = false }: NavAuthSectionProps) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [showToast, setShowToast] = React.useState(false);
  const [myCompany, setMyCompany] = React.useState<Company | null>(null);
  const [companyLoaded, setCompanyLoaded] = React.useState(false);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Fetch employer's company
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

  // Avoid hydration mismatch: render a stable shell until we know auth state.
  if (!ready) {
    return <div className="h-10 w-32" aria-hidden />;
  }

  if (!user) {
    return (
      <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-2"}>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            mobile ? "w-full justify-start" : ""
          )}
        >
          Log in
        </Link>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "sm" }),
            mobile ? "w-full justify-center" : ""
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

  const wrapperClass = mobile
    ? "flex flex-col gap-2"
    : "flex items-center gap-2";

  const buttonFullWidth = mobile ? "w-full justify-start" : "";

  return (
    <div className={wrapperClass}>
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-primary hover:text-primary",
            buttonFullWidth
          )}
        >
          <Shield className="h-4 w-4" />
          Admin Panel
        </Link>
      )}
      {isEmployer && !canPost && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowToast(true)}
          className={`opacity-60 ${mobile ? "w-full justify-center" : ""}`}
        >
          <PlusCircle className="h-4 w-4" />
          Post a Job
        </Button>
      )}
      {canPost && (
        <Link
          href="/post-job"
          className={cn(
            buttonVariants({ size: "sm" }),
            mobile ? "w-full justify-center" : ""
          )}
        >
          <PlusCircle className="h-4 w-4" />
          Post a Job
        </Link>
      )}
      {isEmployer && (
        <Link
          href="/company"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            buttonFullWidth
          )}
        >
          <Building2 className="h-4 w-4" />
          My Company
        </Link>
      )}
      {!isSeeker && (
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            buttonFullWidth
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      )}
      {isSeeker && (
        <Link
          href="/my-jobs"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            buttonFullWidth
          )}
        >
          <Briefcase className="h-4 w-4" />
          My Jobs
        </Link>
      )}
      <Link
        href="/profile"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          buttonFullWidth
        )}
      >
        <UserIcon className="h-4 w-4" />
        {user.firstName}
      </Link>
      <Button
        variant="outline"
        size="sm"
        className={mobile ? "w-full justify-center" : ""}
        onClick={() => {
          if (window.confirm("Confirm logout?")) {
            logout();
            router.push("/");
          }
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>

      {/* Warning toast — rendered via portal to escape navbar stacking context */}
      {showToast && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/80 px-5 py-4 shadow-xl max-w-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                {!myCompany ? "No company registered" : "Company not approved"}
              </p>
              <p className="mt-0.5 text-amber-700/80 dark:text-amber-400/80">
                {!myCompany
                  ? "You need to register a company before posting jobs. Go to My Company to get started."
                  : "Your company is awaiting admin approval. You'll be able to post jobs once approved. Or reach out to us at info.deccanverse.pune@gmail.com."}
              </p>
            </div>
            <button onClick={() => setShowToast(false)} className="shrink-0 text-amber-600/60 hover:text-amber-800 dark:text-amber-400/60">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
