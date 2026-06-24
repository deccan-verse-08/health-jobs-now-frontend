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

  // Fetch the employer's company and auto-select it
  React.useEffect(() => {
    if (user?.roles.includes("EMPLOYER")) {
      companyApi.getMyCompany().then((c) => {
        if (c) {
          setMyCompany(c);
          // Auto-fill company name on create mode
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
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Job title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
                placeholder="e.g. Registered Nurse"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              {isEmployer && myCompany ? (
                <Select
                  id="company"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  disabled
                >
                  <option value={myCompany.name}>{myCompany.name}</option>
                </Select>
              ) : (
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  required
                />
              )}
              {isEmployer && myCompany && (
                <p className="text-xs text-muted-foreground">
                  Auto-selected from your registered company.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                required
                placeholder="City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary range</Label>
              <Input
                id="salary"
                value={form.salary}
                onChange={(e) => update("salary", e.target.value)}
                placeholder="$50,000 - $60,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment type</Label>
              <Select
                id="employmentType"
                value={form.employmentType}
                onChange={(e) => update("employmentType", e.target.value)}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience level</Label>
              <Select
                id="experienceLevel"
                value={form.experienceLevel}
                onChange={(e) => update("experienceLevel", e.target.value)}
              >
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
                rows={6}
                placeholder="Describe the role, responsibilities, and qualifications..."
              />
            </div>
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
