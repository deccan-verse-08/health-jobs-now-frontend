"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi, jobsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Job, Company } from "@/types/api";
import { Shield, Users, Briefcase, Building2, Plus, Edit, Trash2, Search, ArrowLeft, Check, X, Ban, UserCheck } from "lucide-react";

type Tab = "users" | "jobs" | "companies";

export default function AdminDashboardPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState<Tab>("users");
  const [users, setUsers] = React.useState<User[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search/Filters
  const [userSearch, setUserSearch] = React.useState("");
  const [jobSearch, setJobSearch] = React.useState("");
  const [companySearch, setCompanySearch] = React.useState("");

  // Check auth
  React.useEffect(() => {
    if (ready) {
      if (!user || !user.roles.includes("ADMIN")) {
        router.replace("/");
      } else {
        loadData();
      }
    }
  }, [user, ready, router]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [fetchedUsers, fetchedJobsResponse, fetchedCompanies] = await Promise.all([
        adminApi.listUsers(),
        jobsApi.list({ page: 0, size: 100, sortBy: "createdDate", direction: "desc" }),
        adminApi.listCompanies(),
      ]);
      setUsers(fetchedUsers || []);
      setJobs(fetchedJobsResponse?.content || []);
      setCompanies(fetchedCompanies || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(id: number, username: string) {
    if (username === user?.username) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete user");
    }
  }

  async function handleDeleteJob(id: number, title: string) {
    if (!confirm(`Are you sure you want to delete job posting "${title}"?`)) return;

    try {
      await jobsApi.delete(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete job");
    }
  }

  async function handleUpdateStatus(id: number, u: User, newStatus: string) {
    const actionName =
      newStatus === "APPROVED"
        ? "approve"
        : newStatus === "DENIED"
        ? "deny"
        : newStatus === "BANNED"
        ? "ban"
        : "unban";

    if (u.username === user?.username) {
      alert("You cannot perform status updates on your own account.");
      return;
    }

    if (!confirm(`Are you sure you want to ${actionName} user "${u.username}"?`)) return;

    try {
      await adminApi.updateUser(id, {
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        roles: u.roles,
        status: newStatus,
      });
      // Refresh local list status
      setUsers((prev) =>
        prev.map((userObj) =>
          userObj.id === id ? { ...userObj, status: newStatus } : userObj
        )
      );
    } catch (err: any) {
      alert(err?.message || `Failed to ${actionName} user`);
    }
  }

  const filteredUsers = React.useMemo(() => {
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const filteredJobs = React.useMemo(() => {
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.location.toLowerCase().includes(jobSearch.toLowerCase())
    );
  }, [jobs, jobSearch]);

  const filteredCompanies = React.useMemo(() => {
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        (c.industry || "").toLowerCase().includes(companySearch.toLowerCase()) ||
        (c.location || "").toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companies, companySearch]);

  async function handleUpdateCompanyStatus(id: number, name: string, newStatus: string) {
    const action = newStatus === "APPROVED" ? "approve" : "deny";
    if (!confirm(`Are you sure you want to ${action} company "${name}"?`)) return;
    try {
      await adminApi.updateCompanyStatus(id, newStatus);
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err: any) {
      alert(err?.message || `Failed to ${action} company`);
    }
  }

  if (!ready || !user || !user.roles.includes("ADMIN")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Authenticating admin session...</p>
        </div>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.roles.includes("ADMIN")).length;
  const pendingApprovalsCount = users.filter((u) => u.status === "PENDING_APPROVAL").length;
  const pendingCompaniesCount = companies.filter((c) => c.status === "PENDING_APPROVAL").length;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Superuser Access</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts, privileges, and active job postings across HealthJobsNow.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/jobs" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> View Jobs Board
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">{users.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-amber-500/10 p-3 text-amber-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-amber-500">{pendingApprovalsCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Job Posts</p>
              <h3 className="text-2xl font-bold">{jobs.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Admins</p>
              <h3 className="text-2xl font-bold">{adminCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-card/50 backdrop-blur ${pendingCompaniesCount > 0 ? 'border-violet-500/20 bg-violet-500/5' : ''}`}>
          <CardContent className="flex items-center gap-4 py-6">
            <div className={`rounded-lg p-3 ${pendingCompaniesCount > 0 ? 'bg-violet-500/10 text-violet-500' : 'bg-primary/10 text-primary'}`}>
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{pendingCompaniesCount > 0 ? 'Pending Companies' : 'Total Companies'}</p>
              <h3 className={`text-2xl font-bold ${pendingCompaniesCount > 0 ? 'text-violet-500' : ''}`}>{pendingCompaniesCount > 0 ? pendingCompaniesCount : companies.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 flex border-b border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Users Manager
        </button>
        <button
          onClick={() => setActiveTab("companies")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "companies"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Companies
          {pendingCompaniesCount > 0 && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
              {pendingCompaniesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "jobs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Jobs Manager
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading dashboard resources...</p>
          </div>
        </div>
      ) : activeTab === "users" ? (
        /* Users Tab */
        <Card className="border-border/60 bg-card/40 backdrop-blur">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage user profiles and system permissions.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/admin/users/new">
                  <Plus className="h-4 w-4" /> Create User
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Roles</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/10">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{u.id}</td>
                      <td className="px-6 py-4 font-medium">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{u.username}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((role) => (
                            <Badge
                              key={role}
                              variant={
                                role === "ADMIN"
                                  ? "warning"
                                  : role === "EMPLOYER"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-[10px]"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.status === "PENDING_APPROVAL" && (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                            PENDING
                          </Badge>
                        )}
                        {(u.status === "APPROVED" || !u.status) && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                            APPROVED
                          </Badge>
                        )}
                        {u.status === "DENIED" && (
                          <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 text-[10px]">
                            DENIED
                          </Badge>
                        )}
                        {u.status === "BANNED" && (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">
                            BANNED
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {u.status === "PENDING_APPROVAL" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1 border-emerald-500/20"
                                onClick={() => handleUpdateStatus(u.id, u, "APPROVED")}
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-rose-500 hover:bg-rose-500/10 gap-1 border-rose-500/20"
                                onClick={() => handleUpdateStatus(u.id, u, "DENIED")}
                              >
                                <X className="h-3.5 w-3.5" /> Deny
                              </Button>
                            </>
                          )}
                          {u.status === "APPROVED" && u.username !== user?.username && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-red-500 hover:bg-red-500/10 gap-1 border-red-500/20"
                              onClick={() => handleUpdateStatus(u.id, u, "BANNED")}
                            >
                              <Ban className="h-3.5 w-3.5" /> Ban
                            </Button>
                          )}
                          {u.status === "DENIED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1 border-emerald-500/20"
                              onClick={() => handleUpdateStatus(u.id, u, "APPROVED")}
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                          {u.status === "BANNED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1 border-emerald-500/20"
                              onClick={() => handleUpdateStatus(u.id, u, "APPROVED")}
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Unban
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" asChild>
                            <Link href={`/admin/users/${u.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit User</span>
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteUser(u.id, u.username)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete User</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : activeTab === "companies" ? (
        /* Companies Tab */
        <Card className="border-border/60 bg-card/40 backdrop-blur">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Registered Companies</CardTitle>
              <CardDescription>Approve or deny employer company registrations.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Industry</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No matching companies found.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/10">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.id}</td>
                      <td className="px-6 py-4 font-medium">{c.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.industry || "—"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.location || "—"}</td>
                      <td className="px-6 py-4">
                        {c.status === "PENDING_APPROVAL" && (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">PENDING</Badge>
                        )}
                        {c.status === "APPROVED" && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">APPROVED</Badge>
                        )}
                        {c.status === "DENIED" && (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">DENIED</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {c.createdDate ? new Date(c.createdDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {c.status === "PENDING_APPROVAL" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1 border-emerald-500/20"
                                onClick={() => handleUpdateCompanyStatus(c.id, c.name, "APPROVED")}
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-rose-500 hover:bg-rose-500/10 gap-1 border-rose-500/20"
                                onClick={() => handleUpdateCompanyStatus(c.id, c.name, "DENIED")}
                              >
                                <X className="h-3.5 w-3.5" /> Deny
                              </Button>
                            </>
                          )}
                          {c.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-red-500 hover:bg-red-500/10 gap-1 border-red-500/20"
                              onClick={() => handleUpdateCompanyStatus(c.id, c.name, "DENIED")}
                            >
                              <Ban className="h-3.5 w-3.5" /> Revoke
                            </Button>
                          )}
                          {c.status === "DENIED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1 border-emerald-500/20"
                              onClick={() => handleUpdateCompanyStatus(c.id, c.name, "APPROVED")}
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        /* Jobs Tab */
        <Card className="border-border/60 bg-card/40 backdrop-blur">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Job Listings</CardTitle>
              <CardDescription>Moderate and delete active job postings.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No matching job listings found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((j) => (
                    <tr key={j.id} className="hover:bg-muted/10">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{j.id}</td>
                      <td className="px-6 py-4 font-medium">
                        <Link href={`/jobs/${j.id}`} className="hover:underline text-primary">
                          {j.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{j.company}</td>
                      <td className="px-6 py-4 text-muted-foreground">{j.location}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {j.postedDate ? new Date(j.postedDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" asChild>
                            <Link href={`/employer/jobs/${j.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit Job</span>
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteJob(j.id, j.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Job</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
