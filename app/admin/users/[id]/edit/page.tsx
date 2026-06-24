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
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { RoleName } from "@/types/api";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = React.use(params);
  const id = Number(resolvedParams.id);

  const { user: currentUser, ready } = useAuth();
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [role, setRole] = React.useState<RoleName>("JOB_SEEKER");

  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Check auth
  React.useEffect(() => {
    if (ready) {
      if (!currentUser || !currentUser.roles.includes("ADMIN")) {
        router.replace("/");
      } else {
        loadUser();
      }
    }
  }, [currentUser, ready, router, id]);

  async function loadUser() {
    setFetching(true);
    setError(null);
    try {
      const data = await adminApi.getUser(id);
      if (data) {
        setUsername(data.username);
        setEmail(data.email);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        // Map backend roles (e.g. ROLE_ADMIN, ADMIN) to RoleName string
        const userRole = data.roles[0];
        setRole(userRole || "JOB_SEEKER");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch user details");
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminApi.updateUser(id, {
        username,
        email,
        firstName,
        lastName,
        roles: [role],
      });
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !currentUser || !currentUser.roles.includes("ADMIN")) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild size="sm" className="gap-1.5">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 bg-card/40 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Administration</span>
          </div>
          <CardTitle className="text-2xl mt-1">Edit User Profile</CardTitle>
          <CardDescription>
            Update credentials, details, and permissions for User ID: <span className="font-mono text-foreground font-bold">{id}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {fetching ? (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-xs text-muted-foreground">Fetching profile details...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role">User Role</Label>
                <Select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleName)}
                >
                  <option value="JOB_SEEKER">JOB_SEEKER</option>
                  <option value="EMPLOYER">EMPLOYER</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Saving changes...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 justify-center">
                    <Save className="h-4 w-4" /> Save User Details
                  </span>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
