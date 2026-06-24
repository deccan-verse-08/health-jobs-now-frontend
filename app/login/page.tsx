import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { GoogleButton } from "@/components/GoogleButton";

export const metadata = { title: "Log in — HealthJobsNow" };

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>

      <div className="mt-4 flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
