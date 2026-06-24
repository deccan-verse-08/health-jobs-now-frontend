"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ArrowLeft, UserPlus, Shield } from "lucide-react";
import { Role } from "@/types/api";

export default function CreateUserPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [role, setRole] = React.useState<Role>("ROLE_JOB_SEEKER");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check auth
  React.useEffect(() => {
    if (ready && (!user || !user.roles.includes("ADMIN"))) {
      router.replace("/");
    }
  }, [user, ready, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminApi.createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        roles: [role],
      });
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !user || !user.roles.includes("ADMIN")) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild size="sm" className="gap-1.5">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Admin Dashboard
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 bg-card/40 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-wider">Administration</span>
          </div>
          <CardTitle className="text-2xl mt-1">Create Platform User</CardTitle>
          <CardDescription>
            Register a new user account with specific system roles and privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div role="alert" aria-live="polite" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john.doe@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. john_doe"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Temporary Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password123!"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">User Role</Label>
              <Select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="ROLE_JOB_SEEKER">Job Seeker (Candidate)</option>
                <option value="ROLE_EMPLOYER">Employer (Poster)</option>
                <option value="ROLE_ADMIN">Administrator (Superuser)</option>
              </Select>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Creating Account...
                </span>
              ) : (
                "Create User Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
