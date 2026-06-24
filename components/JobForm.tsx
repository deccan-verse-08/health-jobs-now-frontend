"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { jobsApi, companyApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/lib/constants";
import type { Job, JobPayload, Company } from "@/types/api";

const empty: JobPayload = {
  title: "",
  description: "",
  company: "",
  location: "",
  salary: "",
  employmentType: "Full-Time",
  experienceLevel: "Entry-Level",
};

export function JobForm({ initial, mode }: { initial?: Job; mode: "create" | "edit" }) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = React.useState<JobPayload>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          company: initial.company,
          location: initial.location,
          salary: initial.salary,
          employmentType: initial.employmentType,
          experienceLevel: initial.experienceLevel,
        }
      : empty
  );
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [myCompany, setMyCompany] = React.useState<Company | null>(null);

  React.useEffect(() => {
    if (user?.roles.includes("EMPLOYER")) {
      companyApi.getMyCompany().then((c) => {
        if (c) {
          setMyCompany(c);
          if (mode === "create") {
            setForm((f) => ({ ...f, company: c.name }));
          }
        }
      }).catch(() => {});
    }
  }, [user, mode]);

  function update<K extends keyof JobPayload>(key: K, value: JobPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await jobsApi.create(form);
        router.push("/employer/jobs");
        router.refresh();
      } else if (initial) {
        await jobsApi.update(initial.id, form);
        router.push("/employer/jobs");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isEmployer = user?.roles.includes("EMPLOYER");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Post a new job" : "Edit job"}</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Job title" required className="sm:col-span-2">
              {(props) => (
                <Input
                  {...props}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                  placeholder="e.g. Registered Nurse"
                />
              )}
            </FormField>

            <FormField
              label="Company"
              required
              hint={isEmployer && myCompany ? "Auto-selected from your registered company." : undefined}
            >
              {(props) =>
                isEmployer && myCompany ? (
                  <Select
                    {...props}
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    disabled
                  >
                    <option value={myCompany.name}>{myCompany.name}</option>
                  </Select>
                ) : (
                  <Input
                    {...props}
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    required
                  />
                )
              }
            </FormField>

            <FormField label="Location" required>
              {(props) => (
                <Input
                  {...props}
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  required
                  placeholder="City, State"
                />
              )}
            </FormField>

            <FormField label="Salary range" hint="Optional. Example: ₹50,000 - ₹60,000">
              {(props) => (
                <Input
                  {...props}
                  value={form.salary}
                  onChange={(e) => update("salary", e.target.value)}
                  placeholder="₹50,000 - ₹60,000"
                />
              )}
            </FormField>

            <FormField label="Employment type">
              {(props) => (
                <Select
                  {...props}
                  value={form.employmentType}
                  onChange={(e) => update("employmentType", e.target.value)}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            <FormField label="Experience level" className="sm:col-span-2">
              {(props) => (
                <Select
                  {...props}
                  value={form.experienceLevel}
                  onChange={(e) => update("experienceLevel", e.target.value)}
                >
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            <FormField label="Description" required className="sm:col-span-2">
              {(props) => (
                <Textarea
                  {...props}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  required
                  rows={6}
                  placeholder="Describe the role, responsibilities, and qualifications..."
                />
              )}
            </FormField>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : mode === "create" ? "Post job" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}