"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { authApi, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing. Please request a new password reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      // Wait briefly before redirecting to login to show the success message
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to reset password. The link may have expired or is invalid.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Lock className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Invalid Link
            </span>
          </div>
          <CardTitle className="text-2xl mt-1">Invalid Reset Request</CardTitle>
          <CardDescription>
            The reset token is missing. Please go back to the forgot password page to request a new link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link
            href="/forgot-password"
            className={cn(buttonVariants({ variant: "default", size: "default" }), "w-full")}
          >
            Go to Forgot Password
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Reset Password
          </span>
        </div>
        <CardTitle className="text-2xl mt-1">Create new password</CardTitle>
        <CardDescription>
          Your new password must be different from previously used passwords and at least 8 characters long.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-6 text-center"
          >
            <CheckCircle2
              className="h-10 w-10 text-success"
              aria-hidden="true"
            />
            <p className="font-semibold text-foreground">Password Reset Successfully</p>
            <p className="text-sm text-muted-foreground">
              Your password has been changed. We are redirecting you to the sign in page.
            </p>
            <Link
              href="/login?reset=true"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
            >
              Go to sign in now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <FormField
              id="password"
              label="New Password"
              hint="Must be at least 8 characters."
              required
            >
              {(props) => (
                <Input
                  {...props}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              )}
            </FormField>

            <FormField
              id="confirmPassword"
              label="Confirm New Password"
              required
            >
              {(props) => (
                <Input
                  {...props}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              )}
            </FormField>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Updating..." : "Reset password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-12 sm:py-20">
      <div className="mb-6">
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to sign in
        </Link>
      </div>
      <React.Suspense fallback={
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <ResetPasswordForm />
      </React.Suspense>
    </div>
  );
}
