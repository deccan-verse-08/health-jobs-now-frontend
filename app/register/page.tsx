import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { GoogleButton } from "@/components/GoogleButton";
import Link from "next/link";

export const metadata = { title: "Sign up — HealthJobsNow" };

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <Suspense fallback={null}>
        <AuthForm mode="register" />
      </Suspense>

      <div className="mt-4 flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
