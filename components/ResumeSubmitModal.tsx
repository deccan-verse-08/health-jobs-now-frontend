"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { applicationsApi, profilesApi, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ResumeSubmitModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: string;
  location: string;
}

type SubmitState = "idle" | "uploading" | "success" | "error";

const EXPERIENCE_OPTIONS = [
  "Fresher",
  "1–2 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
] as const;

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ResumeSubmitModal({ open, onClose }: ResumeSubmitModalProps) {
  const { user, ready } = useAuth();
  const isLoggedIn = !!user;

  /* ---- form state ---- */
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    qualification: "",
    specialization: "",
    experience: "",
    location: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  /* ---- Pre-fill from profile ---- */
  useEffect(() => {
    if (!open || !isLoggedIn) return;

    setForm((prev) => ({
      ...prev,
      fullName:
        prev.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" "),
      email: prev.email || user.email || "",
      phone: prev.phone || user.mobileNumber || "",
    }));

    // Also try to pull profile data (specialization, qualifications, etc.)
    profilesApi
      .getMyProfile()
      .then((profile) => {
        if (!profile) return;
        setForm((prev) => ({
          ...prev,
          qualification: prev.qualification || profile.qualifications || "",
          specialization: prev.specialization || profile.specialization || "",
          experience:
            prev.experience ||
            (profile.experienceYears !== undefined &&
            profile.experienceYears !== null
              ? experienceYearsToLabel(profile.experienceYears)
              : ""),
        }));
      })
      .catch(() => {
        /* profile may not exist yet — that's fine */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLoggedIn]);

  /* ---- Reset on close ---- */
  useEffect(() => {
    if (!open) {
      // Small delay so the exit animation finishes before resetting
      const t = setTimeout(() => {
        setForm({
          fullName: "",
          email: "",
          phone: "",
          qualification: "",
          specialization: "",
          experience: "",
          location: "",
        });
        setFile(null);
        setFileError(null);
        setSubmitState("idle");
        setErrorMessage("");
        setFieldErrors({});
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ---- Trap focus & close on Escape ---- */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  /* ---- Helpers ---- */
  const update = useCallback(
    (field: keyof FormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [fieldErrors]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFileError("Only PDF, DOC, or DOCX files are accepted.");
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("File size must be under 5 MB.");
      setFile(null);
      return;
    }
    setFile(selected);
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Enter a valid email address.";
    if (!form.phone.trim()) errors.phone = "Phone number is required.";
    if (!file) {
      setFileError("Please upload your resume.");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0 && !!file;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!file) return;

    setSubmitState("uploading");
    setErrorMessage("");

    try {
      // 1. Upload resume to Supabase via backend
      const { url: resumeUrl } = await applicationsApi.uploadResume(file);

      // 2. Update user profile with form data
      try {
        await profilesApi.updateMyProfile({
          qualifications: form.qualification,
          specialization: form.specialization,
          experienceYears: experienceLabelToYears(form.experience),
          summary: `Location: ${form.location}`,
          generatedResumeUrl: resumeUrl,
        });
      } catch {
        // Profile update is non-critical — resume was uploaded successfully
      }

      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Upload failed. Please try again.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  }

  /* ---- Don't render at all if not open ---- */
  if (!open) return null;

  /* ---- Not logged in state ---- */
  if (ready && !isLoggedIn) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Submit Resume"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Card */}
        <div
          ref={modalRef}
          className="relative z-10 w-full max-w-md rounded-3xl border border-border/60 bg-card shadow-2xl p-8 animate-in zoom-in-95 fade-in duration-200"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex flex-col items-center text-center space-y-5 py-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <LogIn className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Sign in to Submit Your Resume
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Create a free account or sign in to upload your resume and get
                discovered by top healthcare recruiters.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full font-semibold rounded-2xl"
                )}
              >
                <LogIn className="h-4 w-4 mr-1.5" /> Sign In
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full font-semibold rounded-2xl"
                )}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Success state ---- */
  if (submitState === "success") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Resume submitted"
      >
        <div
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/60 bg-card shadow-2xl p-8 animate-in zoom-in-95 fade-in duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex flex-col items-center text-center space-y-5 py-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Resume Submitted Successfully!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Your resume has been uploaded. Our recruitment specialists will
                review your profile and match you with relevant opportunities.
              </p>
            </div>
            <Button
              size="lg"
              className="rounded-2xl font-semibold mt-2"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Main form ---- */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Submit Resume"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border/60 bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-card/95 backdrop-blur-sm px-6 py-4 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Submit Your Resume
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in your details and upload your resume
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error banner */}
          {submitState === "error" && (
            <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{errorMessage}</div>
            </div>
          )}

          {/* Row: Full Name + Email */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Full Name"
              required
              error={fieldErrors.fullName}
            >
              {(props) => (
                <Input
                  {...props}
                  placeholder="e.g. Dr. Priya Sharma"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
              )}
            </FormField>

            <FormField label="Email" required error={fieldErrors.email}>
              {(props) => (
                <Input
                  {...props}
                  type="email"
                  placeholder="priya@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              )}
            </FormField>
          </div>

          {/* Row: Phone + Location */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Phone Number"
              required
              error={fieldErrors.phone}
            >
              {(props) => (
                <Input
                  {...props}
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              )}
            </FormField>

            <FormField label="Current Location" error={fieldErrors.location}>
              {(props) => (
                <Input
                  {...props}
                  placeholder="e.g. Pune, Maharashtra"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              )}
            </FormField>
          </div>

          {/* Row: Qualification + Specialization */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Qualification" error={fieldErrors.qualification}>
              {(props) => (
                <Input
                  {...props}
                  placeholder="e.g. MBBS, B.Sc Nursing"
                  value={form.qualification}
                  onChange={(e) => update("qualification", e.target.value)}
                />
              )}
            </FormField>

            <FormField
              label="Specialization"
              error={fieldErrors.specialization}
            >
              {(props) => (
                <Input
                  {...props}
                  placeholder="e.g. Cardiology, ICU"
                  value={form.specialization}
                  onChange={(e) => update("specialization", e.target.value)}
                />
              )}
            </FormField>
          </div>

          {/* Experience */}
          <FormField label="Experience" error={fieldErrors.experience}>
            {(props) => (
              <Select
                {...props}
                value={form.experience}
                onChange={(e) => update("experience", e.target.value)}
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          {/* Resume Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium">
              Resume Upload
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) {
                  // Simulate an input change
                  const dt = new DataTransfer();
                  dt.items.add(droppedFile);
                  if (fileInputRef.current) {
                    fileInputRef.current.files = dt.files;
                    fileInputRef.current.dispatchEvent(
                      new Event("change", { bubbles: true })
                    );
                  }
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-colors duration-200",
                file
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/80 bg-muted/20 hover:border-primary/30 hover:bg-primary/5",
                fileError && "border-destructive/40 bg-destructive/5"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={handleFileChange}
              />

              {file ? (
                <>
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground truncate max-w-[260px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        Change file
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-11 w-11 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag &amp; drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PDF, DOC, or DOCX — Max 5 MB
                    </p>
                  </div>
                </>
              )}
            </div>

            {fileError && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {fileError}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl font-semibold shadow-md"
              disabled={submitState === "uploading"}
            >
              {submitState === "uploading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Submit Resume
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility: map experience years ↔ label                              */
/* ------------------------------------------------------------------ */

function experienceYearsToLabel(years: number): string {
  if (years <= 0) return "Fresher";
  if (years <= 2) return "1–2 years";
  if (years <= 5) return "3–5 years";
  if (years <= 10) return "5–10 years";
  return "10+ years";
}

function experienceLabelToYears(label: string): number {
  switch (label) {
    case "Fresher":
      return 0;
    case "1–2 years":
      return 2;
    case "3–5 years":
      return 4;
    case "5–10 years":
      return 7;
    case "10+ years":
      return 12;
    default:
      return 0;
  }
}
