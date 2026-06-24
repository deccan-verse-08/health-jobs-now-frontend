"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "loading" | "success" | "error";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = React.useState<Status>("loading");
  const [message, setMessage] = React.useState<string>("Completing sign-in...");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1) Try to extract the access token from common locations:
        //    - query string: ?token=... or ?access_token=...
        //    - hash: #access_token=...&token_type=Bearer
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );
        const token =
          params.get("token") ||
          params.get("access_token") ||
          hashParams.get("access_token") ||
          hashParams.get("token");

        if (!token) {
          // 2) Fall back to the success JSON the backend returns per the API doc.
          //    Hit /api/auth/profile with whatever cookie/session the backend set.
          const profile = await authApi.profile();
          if (cancelled) return;
          // We don't have a token to store — prompt the user to log in manually.
          setStatus("error");
          setMessage(
            "Signed in with Google, but no access token was returned. Please log in with your password to continue."
          );
          void profile;
          return;
        }

        // Persist token first, then fetch profile to get the user.
        window.localStorage.setItem("hjn_token", token);
        // Mirror to cookie for middleware presence check
        document.cookie = `hjn_token=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax`;

        const profile = await authApi.profile();
        if (cancelled) return;
        login(token, profile);
        setStatus("success");
        setTimeout(() => {
          // If mobile number is missing (e.g. Google OAuth user), prompt to complete profile
          if (!profile.mobileNumber) {
            router.replace("/profile?complete=phone");
          } else {
            router.replace("/jobs");
          }
          router.refresh();
        }, 600);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setMessage(err.message);
        } else {
          setMessage("Could not complete Google sign-in.");
        }
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [login, router]);

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>
            {status === "loading" && "Signing you in..."}
            {status === "success" && "Signed in"}
            {status === "error" && "Sign-in failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {message}
            </div>
          )}
          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              {message} Redirecting you to the job board...
            </p>
          )}
          {status === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-destructive">{message}</p>
              <a
                href="/login"
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                Back to log in
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
