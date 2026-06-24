"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  User as UserIcon,
  Shield,
  Phone,
  Link2,
  CheckCircle2,
  Printer,
  Plus,
  Trash2,
  Loader2,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profilesApi, authApi } from "@/lib/api";
import { API_BASE } from "@/lib/constants";
import type { UserProfile } from "@/types/api";

interface EduRecord {
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

interface WorkRecord {
  hospital: string;
  role: string;
  department: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready, refresh, logout } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"account" | "medical">("account");

  // Phone number completion prompt (for OAuth users)
  const showPhonePrompt = !user?.mobileNumber;
  const isPhoneComplete = searchParams.get("complete") === "phone";
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [savingPhone, setSavingPhone] = React.useState(false);
  const [phoneSuccess, setPhoneSuccess] = React.useState(false);

  async function handleSavePhone(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setSavingPhone(true);
    try {
      await authApi.updateProfile({ mobileNumber: phoneNumber.trim() });
      await refresh();
      setPhoneSuccess(true);
      // Clear the ?complete=phone param
      const url = new URL(window.location.href);
      url.searchParams.delete("complete");
      window.history.replaceState({}, "", url.toString());
    } catch (err: any) {
      alert(err.message || "Failed to save phone number.");
    } finally {
      setSavingPhone(false);
    }
  }

  function handleSkipPhone() {
    const url = new URL(window.location.href);
    url.searchParams.delete("complete");
    window.history.replaceState({}, "", url.toString());
    router.replace("/jobs");
  }

  // Profile Form States
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [generatingPdf, setGeneratingPdf] = React.useState(false);

  // Dynamic Array States
  const [education, setEducation] = React.useState<EduRecord[]>([]);
  const [workHistory, setWorkHistory] = React.useState<WorkRecord[]>([]);
  const [skillsList, setSkillsList] = React.useState<string[]>([]);
  const [newSkill, setNewSkill] = React.useState("");

  React.useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=/profile");
    }
  }, [ready, user, router]);

  // Load Profile from DB when tab changes to medical or on load
  React.useEffect(() => {
    if (!user) return;
    
    const isSeeker = user.roles.includes("JOB_SEEKER");
    if (!isSeeker) return;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const data = await profilesApi.getMyProfile();
        setProfile(data);
        
        // Parse arrays
        if (data.educationHistory) {
          try { setEducation(JSON.parse(data.educationHistory)); } catch { setEducation([]); }
        }
        if (data.workHistory) {
          try { setWorkHistory(JSON.parse(data.workHistory)); } catch { setWorkHistory([]); }
        }
        if (data.keySkills) {
          setSkillsList(data.keySkills.split(",").map(s => s.trim()).filter(Boolean));
        }
      } catch (err: any) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!ready || !user) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse motion-reduce:animate-none space-y-4">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="h-40 rounded bg-muted" />
        </div>
      </div>
    );
  }

  const isSeeker = user.roles.includes("JOB_SEEKER");
  const isGoogleLinked = !!user.oauth2Provider;

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  function handleConnectGoogle() {
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  }

  // Handle Profile Update
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);

    const payload: UserProfile = {
      ...profile,
      keySkills: skillsList.join(", "),
      educationHistory: JSON.stringify(education),
      workHistory: JSON.stringify(workHistory),
    };

    try {
      const updated = await profilesApi.updateMyProfile(payload);
      setProfile(updated);
      alert("Medical Profile saved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  // Add / Remove Education
  const addEdu = () => {
    setEducation([...education, { degree: "", institution: "", year: "", grade: "" }]);
  };
  const removeEdu = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const updateEdu = (index: number, field: keyof EduRecord, val: string) => {
    setEducation(education.map((rec, i) => i === index ? { ...rec, [field]: val } : rec));
  };

  // Add / Remove Work History
  const addWork = () => {
    setWorkHistory([...workHistory, { hospital: "", role: "", department: "", startDate: "", endDate: "", responsibilities: "" }]);
  };
  const removeWork = (index: number) => {
    setWorkHistory(workHistory.filter((_, i) => i !== index));
  };
  const updateWork = (index: number, field: keyof WorkRecord, val: string) => {
    setWorkHistory(workHistory.map((rec, i) => i === index ? { ...rec, [field]: val } : rec));
  };

  // Skills handlers
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault();
      if (!skillsList.includes(newSkill.trim())) {
        setSkillsList([...skillsList, newSkill.trim()]);
      }
      setNewSkill("");
    }
  };
  const removeSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  // Print trigger for PDF
  const handleExportPdf = () => {
    window.print();
  };

  async function handleGeneratePdf() {
    setGeneratingPdf(true);
    try {
      const updated = await profilesApi.generatePdfResume();
      setProfile(updated);
      alert("Successfully generated and saved your PDF resume to your profile!");
    } catch (err: any) {
      alert(err.message || "Failed to generate PDF resume. Please make sure your profile is saved first.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 print:p-0">
      {/* Hide general header on print */}
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="mt-1 text-muted-foreground">
          Information associated with your HealthJobsNow account.
        </p>

        {/* Tab Controls */}
        {isSeeker && (
          <div className="flex border-b border-border mt-8 gap-4">
            <button
              onClick={() => setActiveTab("account")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "account"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab("medical")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "medical"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Medical Profile & Resume Builder
            </button>
          </div>
        )}
      </div>

      {/* Account Settings Tab */}
      {(activeTab === "account" || !isSeeker) && (
        <div className="space-y-6 print:hidden">
          {/* Phone number completion prompt for OAuth users */}
          {showPhonePrompt && !phoneSuccess && (
            <div
              role="region"
              aria-labelledby="phone-prompt-title"
              className={`mt-4 rounded-lg border-2 p-5 ${
                isPhoneComplete
                  ? "border-primary bg-primary/5"
                  : "border-warning bg-warning/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <div className="flex-1">
                  <p id="phone-prompt-title" className="font-bold text-foreground">
                    {isPhoneComplete ? "Almost done! Add your phone number" : "Phone number missing"}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Add your mobile number so employers can reach you. You can skip this and add it later.
                  </p>
                  <form onSubmit={handleSavePhone} className="mt-3 flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1 max-w-xs">
                      <label htmlFor="phone-number-input" className="sr-only">
                        Mobile number
                      </label>
                      <Input
                        id="phone-number-input"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="e.g. +91 9999999999"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={savingPhone}>
                        {savingPhone ? "Saving..." : "Save"}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={handleSkipPhone}>
                        Skip
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {phoneSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 rounded-lg border-2 border-success bg-success/10 p-4"
            >
              <p className="text-sm font-semibold text-success">
                ✓ Phone number saved successfully!
              </p>
            </div>
          )}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription>@{user.username}</CardDescription>
                </div>
                <button
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-md border border-border p-4">
                  <UserIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Username</p>
                    <p className="mt-0.5 font-medium">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border border-border p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Email</p>
                    <p className="mt-0.5 font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-border p-4">
                  <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Mobile</p>
                    <p className={`mt-0.5 font-medium ${!user.mobileNumber ? "text-muted-foreground italic" : ""}`}>
                      {user.mobileNumber || "Not provided"}
                    </p>
                  </div>
                </div>

              <div className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <p className="text-xs uppercase text-muted-foreground">Roles</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.roles.map((r) => (
                    <Badge key={r} variant="default">
                      {r.replace("ROLE_", "")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <p className="text-xs uppercase text-muted-foreground">Account Status</p>
                </div>
                <div className="mt-2">
                  {user.status === "APPROVED" ? (
                    <Badge variant="success">APPROVED</Badge>
                  ) : user.status === "PENDING_APPROVAL" ? (
                    <Badge variant="warning">PENDING APPROVAL</Badge>
                  ) : user.status === "DENIED" ? (
                    <Badge variant="destructive">DENIED</Badge>
                  ) : user.status === "BANNED" ? (
                    <Badge variant="destructive">BANNED</Badge>
                  ) : (
                    <Badge variant="secondary">{user.status ?? "UNKNOWN"}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Connected Accounts
              </CardTitle>
              <CardDescription>
                Link your Google account for faster sign-in next time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-sm">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-muted-foreground">
                      {isGoogleLinked
                        ? "Connected — you can sign in with Google"
                        : "Not connected"}
                    </p>
                  </div>
                </div>

                {isGoogleLinked ? (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Connected
                  </Badge>
                ) : (
                  <Button size="sm" onClick={handleConnectGoogle}>
                    <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Connect Google
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Medical Profile Tab */}
      {activeTab === "medical" && isSeeker && (
        <div className="mt-6 space-y-6">
          {loadingProfile ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading medical profile...</p>
            </div>
          ) : !profile ? (
            <div className="text-center py-12">
              <p className="text-destructive font-semibold">Failed to initialize profile. Please refresh.</p>
            </div>
          ) : (
            <>
              {/* Form Block */}
              <form onSubmit={handleSaveProfile} className="space-y-6 print:hidden">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> Professional Credentials
                    </CardTitle>
                    <CardDescription>
                      Provide registrations and key clinical details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="regNumber">Council Registration ID</Label>
                        <Input
                          id="regNumber"
                          placeholder="e.g. MNC-123456"
                          value={profile.registrationNumber || ""}
                          onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Clinical Specialization</Label>
                        <Input
                          id="specialization"
                          placeholder="e.g. ICU, Pediatric, Cardiac"
                          value={profile.specialization || ""}
                          onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="qualifications">Highest Qualification</Label>
                        <Input
                          id="qualifications"
                          placeholder="e.g. B.Sc Nursing, MBBS"
                          value={profile.qualifications || ""}
                          onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienceYears">Years of Experience</Label>
                        <Input
                          id="experienceYears"
                          type="number"
                          step="0.5"
                          placeholder="e.g. 3.5"
                          value={profile.experienceYears ?? ""}
                          onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value ? Number(e.target.value) : undefined })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <textarea
                        id="summary"
                        rows={3}
                        placeholder="Write a brief professional summary focusing on your clinical experience..."
                        value={profile.summary || ""}
                        onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    {/* Skill Tags Area */}
                    <div className="space-y-2 pt-2">
                      <Label>Clinical Skills</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {skillsList.map((skill) => (
                          <Badge key={skill} variant="secondary" className="gap-1 px-2.5 py-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              aria-label={`Remove skill ${skill}`}
                              className="text-muted-foreground hover:text-foreground text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                            >
                              <span aria-hidden="true">×</span>
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Type a skill and press Enter..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleAddSkill}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Education History Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" /> Education History
                      </CardTitle>
                      <CardDescription>
                        List clinical degrees and certifications.
                      </CardDescription>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addEdu} className="gap-1 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {education.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No education records added yet.</p>
                    ) : (
                      education.map((edu, idx) => (
                        <div key={idx} className="grid gap-3 sm:grid-cols-4 items-end border border-border/60 rounded-xl p-4 bg-muted/20 relative">
                          <button
                            type="button"
                            onClick={() => removeEdu(idx)}
                            aria-label={`Remove education record ${idx + 1}`}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-xs">Degree / Diploma</Label>
                            <Input
                              placeholder="e.g. B.Sc Nursing"
                              value={edu.degree}
                              onChange={(e) => updateEdu(idx, "degree", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Year</Label>
                            <Input
                              placeholder="e.g. 2021"
                              value={edu.year}
                              onChange={(e) => updateEdu(idx, "year", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Grade / GPA</Label>
                            <Input
                              placeholder="e.g. 8.2 CGPA"
                              value={edu.grade}
                              onChange={(e) => updateEdu(idx, "grade", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-4">
                            <Label className="text-xs">Institution</Label>
                            <Input
                              placeholder="e.g. Armed Forces Medical College, Pune"
                              value={edu.institution}
                              onChange={(e) => updateEdu(idx, "institution", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Employment / Clinical Rotations */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" /> Employment & Clinical Rotations
                      </CardTitle>
                      <CardDescription>
                        Detail your previous hospital postings, departments, and responsibilities.
                      </CardDescription>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addWork} className="gap-1 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No professional history added yet.</p>
                    ) : (
                      workHistory.map((work, idx) => (
                        <div key={idx} className="grid gap-3 sm:grid-cols-2 border border-border/60 rounded-xl p-4 bg-muted/20 relative">
                          <button
                            type="button"
                            onClick={() => removeWork(idx)}
                            aria-label={`Remove work record ${idx + 1}`}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <div className="space-y-1">
                            <Label className="text-xs">Hospital / Clinic</Label>
                            <Input
                              placeholder="e.g. Ruby Hall Clinic"
                              value={work.hospital}
                              onChange={(e) => updateWork(idx, "hospital", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Role / Designation</Label>
                            <Input
                              placeholder="e.g. Staff Nurse"
                              value={work.role}
                              onChange={(e) => updateWork(idx, "role", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Department / Ward</Label>
                            <Input
                              placeholder="e.g. ICU, Cardiac Unit"
                              value={work.department}
                              onChange={(e) => updateWork(idx, "department", e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Start Date</Label>
                              <Input
                                placeholder="e.g. Jun 2022"
                                value={work.startDate}
                                onChange={(e) => updateWork(idx, "startDate", e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End Date</Label>
                              <Input
                                placeholder="e.g. Present"
                                value={work.endDate}
                                onChange={(e) => updateWork(idx, "endDate", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-xs">Key Responsibilities</Label>
                            <textarea
                              rows={2}
                              placeholder="e.g. Monitored post-op cardiac patients, administered IV drugs, assisted cardiologist in clinical procedures..."
                              value={work.responsibilities}
                              onChange={(e) => updateWork(idx, "responsibilities", e.target.value)}
                              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Form Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border mt-4">
                  {profile.generatedResumeUrl && (
                    <a
                      href={profile.generatedResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-auto inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      View Generated PDF
                    </a>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf || savingProfile}
                    className="gap-2 border-primary/40 text-primary hover:bg-primary/5 rounded-2xl"
                  >
                    {generatingPdf ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Generate PDF Resume
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportPdf}
                    className="gap-2 border-primary/40 text-primary hover:bg-primary/5 rounded-2xl"
                  >
                    <Printer className="h-4 w-4" /> Print Resume (Local)
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingProfile || generatingPdf}
                    className="gap-2 rounded-2xl font-semibold"
                  >
                    {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Profile
                  </Button>
                </div>
              </form>

              {/* Printable Medical CV Template */}
              <div className="hidden print:block font-sans max-w-[800px] mx-auto p-10 bg-white text-black text-sm leading-relaxed">
                <div className="space-y-6">
                  {/* CV Header */}
                  <div className="text-center space-y-2 border-b-2 border-black pb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight uppercase">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-base font-bold text-gray-700 tracking-wider">
                      {profile.specialization ? `${profile.specialization} Specialist` : profile.qualifications}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-600 pt-1 font-medium">
                      <span className="inline-flex items-center gap-1">✉ {user.email}</span>
                      {user.mobileNumber && <span className="inline-flex items-center gap-1">☎ {user.mobileNumber}</span>}
                      {profile.registrationNumber && (
                        <span className="inline-flex items-center gap-1 font-semibold text-black">
                          License ID: {profile.registrationNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {profile.summary && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-extrabold uppercase tracking-wider border-b border-gray-300 pb-1">
                        Professional Summary
                      </h2>
                      <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                        {profile.summary}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {workHistory.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-extrabold uppercase tracking-wider border-b border-gray-300 pb-1">
                        Clinical Experience & Rotations
                      </h2>
                      <div className="space-y-4">
                        {workHistory.map((work, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between font-bold text-xs text-black">
                              <span>
                                {work.role} - {work.hospital}
                                {work.department && ` (${work.department} Department)`}
                              </span>
                              <span className="text-gray-600 font-medium">{work.startDate} – {work.endDate}</span>
                            </div>
                            {work.responsibilities && (
                              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed pl-3 border-l-2 border-gray-200">
                                {work.responsibilities}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-extrabold uppercase tracking-wider border-b border-gray-300 pb-1">
                        Education & Qualifications
                      </h2>
                      <div className="space-y-2">
                        {education.map((edu, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <div className="font-medium text-black">
                              <span className="font-bold">{edu.degree}</span> – {edu.institution}
                              {edu.grade && <span className="text-gray-500 text-[10px] ml-1">({edu.grade})</span>}
                            </div>
                            <span className="text-gray-600">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {skillsList.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-extrabold uppercase tracking-wider border-b border-gray-300 pb-1">
                        Clinical & Technical Skills
                      </h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-black font-medium pl-3 list-disc">
                        {skillsList.map((skill) => (
                          <span key={skill} className="inline-flex items-center gap-1.5">
                            • {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
