"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { authApi, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

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

      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Account recovery
            </span>
          </div>
          <CardTitle className="text-2xl mt-1">Forgot your password?</CardTitle>
          <CardDescription>
            Enter the email address on your account and we&apos;ll send you a
            link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-6 text-center"
            >
              <CheckCircle2
                className="h-10 w-10 text-success"
                aria-hidden="true"
              />
              <p className="font-semibold text-foreground">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                If an account exists for{" "}
                <span className="font-mono text-foreground">{email}</span>,
                you&apos;ll receive a password reset link shortly. Follow the
                instructions in the email to finish resetting your password.
              </p>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Return to sign in
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
                id="email"
                label="Email address"
                hint="We'll send a reset link to this address."
                required
              >
                {(props) => (
                  <Input
                    {...props}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                )}
              </FormField>

              <Button type="submit" className="w-full" disabled={submitting}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                {submitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}