"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/jobs";
  const { login } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (params.get("verified") === "true") {
      setSuccess("Email verified successfully! You can now log in.");
      const url = new URL(window.location.href);
      url.searchParams.delete("verified");
      window.history.replaceState({}, "", url.toString());
    }
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (mode === "login") {
        const username = String(fd.get("username") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        const res = await authApi.login({ username, password });
        login(res.accessToken, res.user);
        router.push(next);
        router.refresh();
      } else {
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        const firstName = String(fd.get("firstName") ?? "").trim();
        const lastName = String(fd.get("lastName") ?? "").trim();
        const mobileNumber = String(fd.get("mobileNumber") ?? "").trim();
        const role = String(fd.get("role") ?? "ROLE_JOB_SEEKER");
        await authApi.register({
          username: email,
          email,
          password,
          firstName,
          lastName,
          mobileNumber,
          roles: [role as "ROLE_JOB_SEEKER" | "ROLE_EMPLOYER" | "ROLE_ADMIN"],
        });
        setSuccess("Registration successful! A verification link has been sent to your email. Please verify your account before logging in.");
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{isLogin ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Log in to apply for jobs and manage your postings."
            : "Join HealthJobsNow to find or post healthcare jobs."}
        </CardDescription>
      </CardHeader>
      {/* After successful registration, show only the success message */}
      {!isLogin && success ? (
        <CardContent className="space-y-4">
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-black dark:text-emerald-400">
            {success}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Go to Log in
            </Link>
          </p>
        </CardContent>
      ) : (
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </div>
          )}
          {isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input id="username" name="username" required autoComplete="username" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" required autoComplete="given-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" required autoComplete="family-name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile number</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="e.g. +91 9999999999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <select
                  id="role"
                  name="role"
                  defaultValue="ROLE_JOB_SEEKER"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="ROLE_JOB_SEEKER">Job Seeker — looking for a job</option>
                  <option value="ROLE_EMPLOYER">Employer — hiring for my organization</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {isLogin && (
            <div className="text-right text-sm">
              <Link href="/register" className="text-primary hover:underline">
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Please wait..." : isLogin ? "Log in" : "Create account"}
          </Button>
          {!isLogin && (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          )}
        </CardFooter>
      </form>
      )}
    </Card>
  );
}
