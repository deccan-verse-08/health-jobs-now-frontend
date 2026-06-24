"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Building2, Clock, MapPin, Briefcase, Trash2, FileText } from "lucide-react";
import { jobsApi, ApiError, applicationsApi, profilesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { uploadResume } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, cn } from "@/lib/utils";
import type { Job } from "@/types/api";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [job, setJob] = React.useState<Job | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [coverLetter, setCoverLetter] = React.useState("");
  const [resumeDetails, setResumeDetails] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null);
  const [myApplication, setMyApplication] = React.useState<any | null>(null);
  const [profile, setProfile] = React.useState<any | null>(null);
  const [useProfileResume, setUseProfileResume] = React.useState(false);
  const [resumeOption, setResumeOption] = React.useState<"auto" | "upload" | "text">("auto");

  const id = React.use(params).id;

  React.useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/login?next=/jobs/${id}`);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const j = await jobsApi.get(Number(id));
        if (!cancelled) setJob(j);

        if (user.roles.includes("JOB_SEEKER") || (user.roles as string[]).includes("ROLE_JOB_SEEKER")) {
          const apps = await applicationsApi.myApplications();
          const alreadyApplied = apps.find((app) => app.job.id === Number(id));
          if (!cancelled) {
            setApplied(!!alreadyApplied);
            setMyApplication(alreadyApplied || null);
          }

          // Fetch profile to check for generatedResumeUrl
          try {
            const prof = await profilesApi.getMyProfile();
            if (!cancelled) {
              setProfile(prof);
              if (prof.generatedResumeUrl) {
                setUseProfileResume(true);
                setResumeOption("auto");
              } else {
                setUseProfileResume(false);
                setResumeOption("auto");
              }
            }
          } catch (pErr) {
            console.error("Failed to load profile", pErr);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err && typeof err === "object" && "status" in err) {
            setError(err.message || "Failed to load job.");
          } else {
            setError("Failed to load job.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, ready, user, router]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;
    if (!coverLetter.trim()) {
      alert("Please fill out the cover letter.");
      return;
    }
    if (useProfileResume && !profile?.generatedResumeUrl) {
      alert("You selected the Auto-Generated PDF option, but haven't generated a resume on your profile yet. Please build your profile resume first, or select another option.");
      return;
    }
    if (!useProfileResume && !resumeFile && !resumeDetails.trim()) {
      alert("Please write your resume summary or upload a resume file.");
      return;
    }
    setApplying(true);
    setUploadProgress(useProfileResume ? "Preparing resume..." : "Uploading resume to storage...");
    try {
      let uploadedUrl = "";
      if (useProfileResume && profile?.generatedResumeUrl) {
        uploadedUrl = profile.generatedResumeUrl;
      } else if (resumeFile) {
        uploadedUrl = await uploadResume(resumeFile);
      }
      setUploadProgress("Submitting application...");
      
      const newApp = await applicationsApi.apply(job.id, {
        coverLetter: coverLetter.trim(),
        resumeDetails: useProfileResume ? (profile.summary || "Attached Profile Resume") : resumeDetails.trim(),
        resumeUrl: uploadedUrl || undefined,
      });
      setApplied(true);
      setMyApplication(newApp);
      setShowForm(false);
      alert("Application submitted successfully!");
    } catch (err: any) {
      if (err && typeof err === "object" && "message" in err) {
        alert(err.message || "Failed to submit application.");
      } else {
        alert("Failed to submit application.");
      }
    } finally {
      setApplying(false);
      setUploadProgress(null);
    }
  }

  if (!ready || loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse motion-reduce:animate-none space-y-4" aria-busy="true" aria-label="Loading job details">
          <div className="h-8 w-2/3 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-48 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/jobs"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error ?? "Job not found."}
        </div>
      </div>
    );
  }

  const canManage =
    user?.roles.includes("ADMIN") ||
    (user?.roles.includes("EMPLOYER") && job.employerId === user.id);

  async function onDelete() {
    if (!job) return;
    setShowDeleteDialog(true);
  }

  async function confirmDelete() {
    if (!job) return;
    setShowDeleteDialog(false);
    setDeleting(true);
    try {
      await jobsApi.delete(job.id);
      router.push("/employer/jobs");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) alert(err.message);
      else alert("Failed to delete job.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/jobs"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to jobs
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-4 w-4" aria-hidden="true" /> {job.company}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> {job.location}
                </span>
                {job.salary && (
                  <span className="inline-flex items-center gap-1">
                    <Banknote className="h-4 w-4" aria-hidden="true" /> {job.salary}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {job.employmentType && <Badge variant="default">{job.employmentType}</Badge>}
                {job.experienceLevel && <Badge variant="secondary">{job.experienceLevel}</Badge>}
              </div>
            </div>
            {canManage && (
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/employer/jobs/${job.id}/edit`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Edit
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-base font-semibold">About this role</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">
            {job.description}
          </p>

          {(user?.roles.includes("JOB_SEEKER") || (user?.roles as string[] | undefined)?.includes("ROLE_JOB_SEEKER")) && (
            <div className="mt-6 border-t border-border pt-6">
              {applied && myApplication ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Application Status:</span>
                    <ApplicationStatusBadge status={myApplication.status} />
                  </div>

                  {myApplication.employerMessage && (
                    <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-foreground max-w-xl">
                      <p className="font-semibold text-[10px] text-primary uppercase tracking-wider mb-1">
                        Message from Employer
                      </p>
                      <p className="whitespace-pre-line leading-relaxed font-sans">{myApplication.employerMessage}</p>
                    </div>
                  )}
                </div>
              ) : showForm ? (
                <form onSubmit={handleApply} className="space-y-5 rounded-lg bg-surface p-4 border border-border" noValidate>
                  <h3 className="font-semibold text-base">Complete your application</h3>

                  <FormField
                    id="coverLetter"
                    label="Cover Letter"
                    hint="Briefly explain why you are a great fit for this position."
                    required
                  >
                    {(props) => (
                      <Textarea
                        {...props}
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Explain why you are a great fit for this position..."
                      />
                    )}
                  </FormField>

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      How would you like to submit your resume?
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Resume submission method">
                      {/* Option 1: Platform Resume */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={resumeOption === "auto"}
                        onClick={() => {
                          setResumeOption("auto");
                          setUseProfileResume(true);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          resumeOption === "auto"
                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                            : "border-border bg-card hover:bg-muted/50"
                        )}
                      >
                        <span className="font-bold text-xs">Auto-Generated PDF</span>
                        <span className="text-[10px] text-muted-foreground mt-1">Built by HealthJobsNow</span>
                      </button>

                      {/* Option 2: Upload File */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={resumeOption === "upload"}
                        onClick={() => {
                          setResumeOption("upload");
                          setUseProfileResume(false);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          resumeOption === "upload"
                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                            : "border-border bg-card hover:bg-muted/50"
                        )}
                      >
                        <span className="font-bold text-xs">Upload File</span>
                        <span className="text-[10px] text-muted-foreground mt-1">PDF, Word, etc.</span>
                      </button>

                      {/* Option 3: Paste Text */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={resumeOption === "text"}
                        onClick={() => {
                          setResumeOption("text");
                          setUseProfileResume(false);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          resumeOption === "text"
                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                            : "border-border bg-card hover:bg-muted/50"
                        )}
                      >
                        <span className="font-bold text-xs">Paste Resume Text</span>
                        <span className="text-[10px] text-muted-foreground mt-1">Plaintext summary</span>
                      </button>
                    </div>
                  </fieldset>

                  {resumeOption === "auto" && (
                    <>
                      {profile?.generatedResumeUrl ? (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-primary">✓ Auto-Generated PDF Linked</p>
                            <p className="text-muted-foreground mt-0.5">Your resume is built from your HealthJobsNow profile and will be attached automatically.</p>
                          </div>
                          <a
                            href={profile.generatedResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 bg-primary text-primary-foreground rounded-md px-3 py-1.5 font-bold hover:bg-primary/90 transition-colors text-center"
                          >
                            View PDF
                          </a>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs space-y-3">
                          <div>
                            <p className="font-semibold text-primary">No profile resume found</p>
                            <p className="text-muted-foreground mt-0.5">
                              You haven't generated an auto-resume yet. Our platform can build a professionally styled PDF resume dynamically from your profile details (experience, education, and skills).
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => window.open("/profile", "_blank")}
                            className="w-full inline-flex items-center justify-center gap-1 bg-primary text-primary-foreground rounded-md py-2 font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                          >
                            Build My Resume on Profile Page ↗
                          </button>
                          <p className="text-[10px] text-muted-foreground text-center">
                            This opens your profile in a new tab. After generating, return here to complete your application.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {resumeOption === "upload" && (
                    <FormField
                      id="resumeFile"
                      label="Upload Resume Document"
                      hint="PDF, DOC, or DOCX — maximum 5MB."
                    >
                      {() => (
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="resumeFile"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/30 border-border hover:border-primary/50 transition-colors focus-within:ring-2 focus-within:ring-ring"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                              <FileText className="w-8 h-8 mb-2 text-muted-foreground" aria-hidden="true" />
                              {resumeFile ? (
                                <div className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                                  {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                              ) : (
                                <>
                                  <p className="mb-1 text-sm text-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, DOC, or DOCX (Max 5MB)
                                  </p>
                                </>
                              )}
                            </div>
                            <input
                              id="resumeFile"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("File size must be less than 5MB");
                                    return;
                                  }
                                  setResumeFile(file);
                                }
                              }}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      )}
                    </FormField>
                  )}

                  {resumeOption === "text" && (
                    <FormField
                      id="resumeDetails"
                      label="Resume / Experience Summary"
                      hint="Paste your resume details, employment history, or key skills."
                    >
                      {(props) => (
                        <Textarea
                          {...props}
                          rows={5}
                          value={resumeDetails}
                          onChange={(e) => setResumeDetails(e.target.value)}
                          placeholder="Paste your resume details, employment history, or key skills..."
                        />
                      )}
                    </FormField>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowForm(false);
                        setResumeFile(null);
                      }}
                      disabled={applying}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={applying}
                    >
                      {applying ? (uploadProgress || "Submitting...") : "Submit Application"}
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto font-medium"
                >
                  Apply to Job
                </Button>
              )}
            </div>
          )}

          <div className="mt-8 grid gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
              <span>Posted {formatDate(job.postedDate ?? job.createdDate)}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Updated {formatDate(job.lastModifiedDate ?? job.postedDate ?? job.createdDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        title="Delete this job?"
        description={`You are about to permanently delete "${job.title}". This action cannot be undone and applicants will lose access immediately.`}
        confirmLabel={deleting ? "Deleting..." : "Delete job"}
        cancelLabel="Keep job"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
