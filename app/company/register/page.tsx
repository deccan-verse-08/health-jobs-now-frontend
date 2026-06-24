"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { companyApi, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Building2, Globe, MapPin, Factory } from "lucide-react";

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
      await refresh();
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
        <div className="animate-pulse motion-reduce:animate-none space-y-4" aria-busy="true" aria-label="Loading">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card className="border-success/30 bg-success/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15"
            >
              <Building2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-success">Company Registered!</h2>
            <p className="text-center text-sm text-foreground">
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
            <Building2 className="h-5 w-5" aria-hidden="true" />
            Company Details
          </CardTitle>
          <CardDescription>
            Provide information about your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <FormField label="Company Name" required>
              {(props) => (
                <Input
                  {...props}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Apollo Hospitals"
                  required
                />
              )}
            </FormField>

            <FormField label="Description" hint="Briefly describe your organization (optional)">
              {(props) => (
                <Textarea
                  {...props}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. A 200-bed multi-specialty hospital serving..."
                  rows={3}
                />
              )}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Industry" hint="Optional">
                {(props) => (
                  <Input
                    {...props}
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="e.g., Healthcare, Pharma"
                  />
                )}
              </FormField>

              <FormField label="Location" hint="Optional">
                {(props) => (
                  <Input
                    {...props}
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g., Pune, Maharashtra"
                  />
                )}
              </FormField>
            </div>

            <FormField
              label="Website"
              hint="Optional. Include https://"
            >
              {(props) => (
                <Input
                  {...props}
                  name="website"
                  type="url"
                  inputMode="url"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                />
              )}
            </FormField>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Registering..." : "Register Company"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}