"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  User as UserIcon,
  MapPin,
  Building2,
  ChevronDown,
  FileText,
  ScrollText,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { jobsApi, applicationsApi, companyApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusBadge } from "@/components/ui/status-badge";
import { formatDate, cn } from "@/lib/utils";
import type { Job, JobApplication, Company } from "@/types/api";

/* ---------- Expandable detail section component ---------- */
function ExpandableSection({
  label,
  icon: Icon,
  content,
}: {
  label: string;
  icon: React.ElementType;
  content?: string | null;
}) {
  const [open, setOpen] = React.useState(false);

  if (!content) return null;

  return (
    <div className="rounded-md border border-border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors rounded-md"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary/70" />
          {label}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0 text-sm text-foreground/90 whitespace-pre-line leading-relaxed border-t border-border">
          {content}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const [myJobs, setMyJobs] = React.useState<Job[]>([]);
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [myCompany, setMyCompany] = React.useState<Company | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showToast, setShowToast] = React.useState(false);
  const [selectedJobId, setSelectedJobId] = React.useState<number | null>(null);
  const [editingStatuses, setEditingStatuses] = React.useState<Record<number, string>>({});
  const [editingMessages, setEditingMessages] = React.useState<Record<number, string>>({});
  const [updatingStatusId, setUpdatingStatusId] = React.useState<number | null>(null);

  const handleUpdateStatus = async (appId: number, currentStatus: string) => {
    const targetStatus = editingStatuses[appId] ?? currentStatus;
    const message = editingMessages[appId] ?? "";
    
    setUpdatingStatusId(appId);
    try {
      const updatedApp = await applicationsApi.updateStatus(appId, targetStatus, message);
      setApplications(prev => prev.map(app => app.id === appId ? updatedApp : app));
      alert("Application status updated and notification email sent!");
      setEditingMessages(prev => ({ ...prev, [appId]: "" }));
    } catch (err: any) {
      alert(err.message || "Failed to update application status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  React.useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push("/login?next=/dashboard");
      return;
    }

    if (user.roles.includes("JOB_SEEKER")) {
      router.replace("/my-jobs");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user.roles.includes("JOB_SEEKER")) {
          // Seeker fetches their applications
          const data = await applicationsApi.myApplications();
          setApplications(data);
        } else if (user.roles.includes("EMPLOYER") || user.roles.includes("ADMIN")) {
          // Employer fetches posted jobs AND received applications
          const jobsResponse = await jobsApi.my();
          setMyJobs(jobsResponse.content ?? []);

          const appsResponse = await applicationsApi.employerApplications();
          setApplications(appsResponse);

          // Fetch employer's company
          if (user.roles.includes("EMPLOYER")) {
            try {
              const company = await companyApi.getMyCompany();
              setMyCompany(company);
            } catch {
              setMyCompany(null);
            }
          }
        }
      } catch (err: any) {
        if (err && typeof err === "object" && "status" in err) {
          if (err.status === 401 || err.status === 403) {
            logout();
            router.push("/login?next=/dashboard");
            return;
          }
          setError(err.message || "An error occurred.");
        } else {
          setError("Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ready, user, router]);

  if (!ready || loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse motion-reduce:animate-none space-y-6">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 rounded bg-muted" />
            <div className="h-48 rounded bg-muted" />
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

  const filteredApplications = selectedJobId
    ? applications.filter((app) => app.job.id === selectedJobId)
    : applications;

  return (
    <>
    <div className="container mx-auto max-w-6xl px-4 py-10">
        {/* ================= EMPLOYER VIEW ================= */}
        <div className="space-y-10 font-sans">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
              <p className="mt-1 text-muted-foreground">
                Manage your postings and view applicant details.
              </p>
            </div>
            {myCompany && myCompany.status === "APPROVED" ? (
               <Link href="/post-job" className={cn(buttonVariants())}>
                 <PlusCircle className="h-4 w-4" />
                 Post a Job
               </Link>
             ) : (
              <Button
                variant="secondary"
                onClick={() => setShowToast(true)}
                className="opacity-60"
              >
                <PlusCircle className="h-4 w-4" />
                Post a Job
              </Button>
            )}
          </div>

          {/* No company registered */}
          {user?.roles.includes("EMPLOYER") && !myCompany && (
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-4 text-sm text-violet-700 dark:text-violet-400 flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">No Company Registered</p>
                <p className="mt-0.5 text-violet-600/80 dark:text-violet-400/80">
                  You need to register your company before you can post jobs.
                </p>
                 <Link
                   href="/company/register"
                   className={cn(buttonVariants({ size: "sm" }), "mt-2")}
                 >
                   <Building2 className="h-4 w-4" />
                   Register Company
                 </Link>
              </div>
            </div>
          )}

          {/* Company pending approval */}
          {user?.roles.includes("EMPLOYER") && myCompany && myCompany.status !== "APPROVED" && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-3">
              <span className="mt-0.5 text-lg">⏳</span>
              <div>
                <p className="font-semibold">Company pending approval</p>
                <p className="mt-0.5 text-amber-600/80 dark:text-amber-400/80">
                  Your company &quot;{myCompany.name}&quot; is awaiting administrator approval. You will be able to post jobs once your company is approved.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Posted Jobs Section */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">My Active Jobs</h2>
              {myJobs.length === 0 ? (
                <Card className="py-8 text-center border-dashed">
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
                     {user?.status === "APPROVED" ? (
                       <Link
                         href="/post-job"
                         className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                       >
                         Post your first job
                       </Link>
                     ) : (
                      <Button size="sm" variant="outline" className="opacity-60" onClick={() => setShowToast(true)}>
                        Post your first job
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myJobs.map((job) => (
                    <Card 
                      key={job.id} 
                      onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                      className={`cursor-pointer hover:shadow-md transition border-2 ${selectedJobId === job.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="font-semibold text-foreground flex justify-between items-start">
                          <span>{job.title}</span>
                          <Link 
                            href={`/jobs/${job.id}`} 
                            onClick={(e) => e.stopPropagation()} 
                            className="text-xs text-primary hover:underline shrink-0"
                          >
                            Details
                          </Link>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {job.location}
                          </span>
                          <span>{formatDate(job.postedDate ?? job.createdDate)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Received Applications Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">
                  {selectedJobId 
                    ? `Applications for "${myJobs.find(j => j.id === selectedJobId)?.title}"`
                    : "All Received Applications"
                  }
                  <span className="ml-2 text-sm text-muted-foreground font-normal">
                    ({filteredApplications.length})
                  </span>
                </h2>
                {selectedJobId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedJobId(null)}
                    className="text-xs h-8 text-primary hover:text-primary/80"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>

              {filteredApplications.length === 0 ? (
                <Card className="py-12 text-center border-dashed">
                  <CardContent className="space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mx-auto">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-muted-foreground">
                      {selectedJobId 
                        ? "No applications for this job yet" 
                        : "No applications received yet"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedJobId 
                        ? "Click another job or clear the filter to see other applications."
                        : "Applicants' details will appear here once they apply."
                      }
                    </p>
                    {selectedJobId && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedJobId(null)} className="mt-2">
                        Show All Applications
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((app) => {
                    return (
                      <Card key={app.id} className="overflow-hidden border-l-4 border-l-primary">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">
                                  {app.seeker.firstName} {app.seeker.lastName}
                                </h3>
                                <ApplicationStatusBadge status={app.status} />
                              </div>
                            <p className="text-sm text-primary font-medium mt-1">
                              Applied to: <Link href={`/jobs/${app.job.id}`} className="hover:underline">{app.job.title}</Link>
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0">
                            Applied {formatDate(app.appliedDate)}
                          </div>
                        </div>

                        {/* Contact details */}
                        <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-border text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4 text-primary/70 shrink-0" />
                            <a href={`mailto:${app.seeker.email}`} className="hover:underline text-foreground">
                              {app.seeker.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                            <span className="text-foreground">
                              {app.seeker.mobileNumber || "No phone number listed"}
                            </span>
                          </div>
                        </div>

                        {app.resumeUrl && (
                           <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm mt-3">
                             <FileText className="h-4 w-4 text-primary shrink-0" />
                             <span className="font-semibold text-foreground">
                               Uploaded Resume Document
                             </span>
                             <a
                               href={app.resumeUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className={cn(
                                 buttonVariants({ variant: "outline", size: "sm" }),
                                 "ml-auto"
                               )}
                             >
                               View Resume
                             </a>
                           </div>
                        )}

                        {/* Cover Letter & Resume Details — expandable sections */}
                        {(app.coverLetter || app.resumeDetails) && (
                          <div className="space-y-2 pt-1">
                            <ExpandableSection
                              label="Cover Letter"
                              icon={FileText}
                              content={app.coverLetter}
                            />
                            <ExpandableSection
                              label="Resume / Experience Summary"
                              icon={ScrollText}
                              content={app.resumeDetails}
                            />
                          </div>
                        )}

                        {/* Status update section */}
                        <div className="space-y-3 pt-3 border-t border-border mt-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Update Application Status
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="w-full sm:w-48">
                              <label htmlFor={`status-${app.id}`} className="text-[10px] text-muted-foreground block mb-1">
                                Select Status
                              </label>
                              <select
                                id={`status-${app.id}`}
                                value={editingStatuses[app.id] ?? app.status}
                                onChange={(e) => setEditingStatuses(prev => ({ ...prev, [app.id]: e.target.value }))}
                                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <option value="APPLIED">Applied</option>
                                <option value="INTERVIEW_STAGE">Interview Stage</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </div>
                            <div className="flex-grow">
                              <label htmlFor={`message-${app.id}`} className="text-[10px] text-muted-foreground block mb-1">
                                Email Message to Applicant (Optional)
                              </label>
                              <textarea
                                id={`message-${app.id}`}
                                rows={2}
                                value={editingMessages[app.id] ?? ""}
                                onChange={(e) => setEditingMessages(prev => ({ ...prev, [app.id]: e.target.value }))}
                                placeholder="Write a message to include in the email update..."
                                className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[40px]"
                              />
                            </div>
                            <div className="flex items-end shrink-0 pt-2 sm:pt-0">
                              <Button
                                size="sm"
                                disabled={updatingStatusId === app.id}
                                onClick={() => handleUpdateStatus(app.id, app.status)}
                                className="w-full sm:w-auto"
                              >
                                {updatingStatusId === app.id ? "Updating..." : "Update Status"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>

      {/* Warning toast — rendered via portal for true centering */}
      {showToast && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/80 px-5 py-4 shadow-xl max-w-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              {!myCompany ? "No company registered" : "Company not approved"}
            </p>
            <p className="mt-0.5 text-amber-700/80 dark:text-amber-400/80">
              {!myCompany
                ? "You need to register a company before posting jobs. Go to My Company to get started."
                : "Your company is awaiting admin approval. You'll be able to post jobs once approved."}
              <br />Or reach out to us at <a href="mailto:info.deccanverse.pune@gmail.com" className="text-primary">info.deccanverse.pune@gmail.com</a>
            </p>
          </div>
          <button onClick={() => setShowToast(false)} aria-label="Dismiss notification" className="shrink-0 text-amber-600/60 hover:text-amber-800 dark:text-amber-400/60">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
