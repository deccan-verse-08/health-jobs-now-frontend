"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { companyApi, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Globe, MapPin, Factory, FileText } from "lucide-react";

export default function RegisterCompanyPage() {
  const router = useRouter();
  const { user, ready, refresh } = useAuth();

  const [form, setForm] = React.useState({
    name: "",
    description: "",
    website: "",
    industry: "",
    location: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (ready && !user) router.replace("/login?next=/company/register");
    if (ready && user && !user.roles.includes("EMPLOYER")) router.replace("/dashboard");
    if (ready && user && user.companyId) router.replace("/company");
  }, [ready, user, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await companyApi.create(form);
      setSuccess(true);
      await refresh(); // Refresh user to get companyId
      setTimeout(() => router.push("/company"), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to register company. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

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

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <Building2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
              Company Registered!
            </h2>
            <p className="text-center text-sm text-emerald-700/80 dark:text-emerald-400/80">
              Your company has been submitted for admin approval. You&apos;ll receive an email once it&apos;s approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Register Your Company</h1>
      <p className="mt-1 text-muted-foreground">
        Register your company to start posting healthcare jobs. Admin approval is required before you can post.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Details
          </CardTitle>
          <CardDescription>
            Provide information about your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company Name *
              </label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Apollo Hospitals"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description of your organization..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium flex items-center gap-2">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  Industry
                </label>
                <Input
                  id="industry"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g., Healthcare, Pharma"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </label>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g., Pune, Maharashtra"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Website
              </label>
              <Input
                id="website"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://www.example.com"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Registering..." : "Register Company"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
