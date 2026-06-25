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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserStatusBadge, CompanyStatusBadge } from "@/components/ui/status-badge";
import { User, Job, Company } from "@/types/api";
import { Shield, Users, Briefcase, Building2, Plus, Edit, Trash2, Search, ArrowLeft, Check, X, Ban, UserCheck, FileText } from "lucide-react";

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

  // Confirmation dialog state
  const [pendingDeleteUser, setPendingDeleteUser] = React.useState<{ id: number; username: string } | null>(null);
  const [pendingDeleteJob, setPendingDeleteJob] = React.useState<{ id: number; title: string } | null>(null);
  const [pendingUserStatus, setPendingUserStatus] = React.useState<{ id: number; user: User; newStatus: string } | null>(null);
  const [pendingCompanyStatus, setPendingCompanyStatus] = React.useState<{ id: number; name: string; newStatus: string } | null>(null);
  const [pendingCompanyTier, setPendingCompanyTier] = React.useState<{ id: number; tier: "BASIC" | "PRO" } | null>(null);

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
    setPendingDeleteUser({ id, username });
  }

  async function performDeleteUser() {
    if (!pendingDeleteUser) return;
    const { id, username } = pendingDeleteUser;
    setPendingDeleteUser(null);
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete user");
    }
  }

  async function handleDeleteJob(id: number, title: string) {
    setPendingDeleteJob({ id, title });
  }

  async function performDeleteJob() {
    if (!pendingDeleteJob) return;
    const { id, title } = pendingDeleteJob;
    setPendingDeleteJob(null);
    try {
      await jobsApi.delete(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete job");
    }
  }

  async function handleUpdateStatus(id: number, u: User, newStatus: string) {
    if (u.username === user?.username) {
      alert("You cannot perform status updates on your own account.");
      return;
    }
    setPendingUserStatus({ id, user: u, newStatus });
  }

  async function performUpdateStatus() {
    if (!pendingUserStatus) return;
    const { id, user: u, newStatus } = pendingUserStatus;
    setPendingUserStatus(null);
    const actionName =
      newStatus === "APPROVED" ? "approve" :
      newStatus === "DENIED" ? "deny" :
      newStatus === "BANNED" ? "ban" : "unban";
    try {
      await adminApi.updateUser(id, {
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        roles: u.roles,
        status: newStatus,
      });
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
    setPendingCompanyStatus({ id, name, newStatus });
  }

  async function performUpdateCompanyStatus() {
    if (!pendingCompanyStatus) return;
    const { id, name, newStatus } = pendingCompanyStatus;
    setPendingCompanyStatus(null);
    const action = newStatus === "APPROVED" ? "approve" : "deny";
    try {
      await adminApi.updateCompanyStatus(id, newStatus);
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err: any) {
      alert(err?.message || `Failed to ${action} company`);
    }
  }

  async function handleUpdateCompanyTier(id: number, newTier: "BASIC" | "PRO") {
    setPendingCompanyTier({ id, tier: newTier });
  }

  async function performUpdateCompanyTier() {
    if (!pendingCompanyTier) return;
    const { id, tier } = pendingCompanyTier;
    setPendingCompanyTier(null);
    const action = tier === "PRO" ? "upgrade" : "downgrade";
    try {
      await adminApi.updateCompanyTier(id, tier);
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, tier } : c))
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
            <Link href="/admin/resumes" className="gap-2">
              <FileText className="h-4 w-4" aria-hidden="true" /> Resumes Database
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/jobs" className="gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> View Jobs Board
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
        <div role="alert" aria-live="polite" className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 flex border-b border-border" role="tablist" aria-label="Admin sections">
        <button
          role="tab"
          aria-selected={activeTab === "users"}
          aria-controls="tabpanel-users"
          id="tab-users"
          onClick={() => setActiveTab("users")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              setActiveTab("companies");
              document.getElementById("tab-companies")?.focus();
            }
          }}
          tabIndex={activeTab === "users" ? 0 : -1}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          Users Manager
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "companies"}
          aria-controls="tabpanel-companies"
          id="tab-companies"
          onClick={() => setActiveTab("companies")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              setActiveTab("jobs");
              document.getElementById("tab-jobs")?.focus();
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              setActiveTab("users");
              document.getElementById("tab-users")?.focus();
            }
          }}
          tabIndex={activeTab === "companies" ? 0 : -1}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            activeTab === "companies"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Companies
          {pendingCompaniesCount > 0 && (
            <span
              aria-label={`${pendingCompaniesCount} pending`}
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white"
            >
              {pendingCompaniesCount}
            </span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "jobs"}
          aria-controls="tabpanel-jobs"
          id="tab-jobs"
          onClick={() => setActiveTab("jobs")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              setActiveTab("companies");
              document.getElementById("tab-companies")?.focus();
            }
          }}
          tabIndex={activeTab === "jobs" ? 0 : -1}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            activeTab === "jobs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4" aria-hidden="true" />
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
        <Card
          role="tabpanel"
          id="tabpanel-users"
          aria-labelledby="tab-users"
          className="border-border/60 bg-card/40 backdrop-blur"
        >
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage user profiles and system permissions.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                  aria-label="Search users by name, username, or email"
                />
              </div>
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/admin/users/new">
                  <Plus className="h-4 w-4" aria-hidden="true" /> Create User
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
                        <UserStatusBadge status={u.status} />
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
                                <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-rose-500 hover:bg-rose-500/10 gap-1 border-rose-500/20"
                                onClick={() => handleUpdateStatus(u.id, u, "DENIED")}
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" /> Deny
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
                              <Ban className="h-3.5 w-3.5" aria-hidden="true" /> Ban
                            </Button>
                          )}
                          {u.status === "DENIED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1 border-emerald-500/20"
                              onClick={() => handleUpdateStatus(u.id, u, "APPROVED")}
                            >
                              <UserCheck className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                            </Button>
                          )}
                          {u.status === "BANNED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1 border-emerald-500/20"
                              onClick={() => handleUpdateStatus(u.id, u, "APPROVED")}
                            >
                              <UserCheck className="h-3.5 w-3.5" aria-hidden="true" /> Unban
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" asChild>
                            <Link href={`/admin/users/${u.id}/edit`} aria-label={`Edit user ${u.username}`}>
                              <Edit className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Edit User</span>
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            aria-label={`Delete user ${u.username}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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
        <Card
          role="tabpanel"
          id="tabpanel-companies"
          aria-labelledby="tab-companies"
          className="border-border/60 bg-card/40 backdrop-blur"
        >
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Registered Companies</CardTitle>
              <CardDescription>Approve or deny employer company registrations.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search companies..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
                aria-label="Search companies by name, industry, or location"
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
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
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
                        <CompanyStatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={c.tier === "PRO" ? "success" : "secondary"}>
                          {c.tier || "BASIC"}
                        </Badge>
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
                                <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-rose-500 hover:bg-rose-500/10 gap-1 border-rose-500/20"
                                onClick={() => handleUpdateCompanyStatus(c.id, c.name, "DENIED")}
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" /> Deny
                              </Button>
                            </>
                          )}
                          {c.status === "APPROVED" && (
                            <>
                              {c.tier === "PRO" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs text-amber-500 hover:bg-amber-500/10 gap-1 border-amber-500/20 mr-1.5"
                                  onClick={() => handleUpdateCompanyTier(c.id, "BASIC")}
                                >
                                  Downgrade Basic
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs text-violet-500 hover:bg-violet-500/10 gap-1 border-violet-500/20 mr-1.5"
                                  onClick={() => handleUpdateCompanyTier(c.id, "PRO")}
                                >
                                  Upgrade Pro
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-red-500 hover:bg-red-500/10 gap-1 border-red-500/20"
                                onClick={() => handleUpdateCompanyStatus(c.id, c.name, "DENIED")}
                              >
                                <Ban className="h-3.5 w-3.5" aria-hidden="true" /> Revoke
                              </Button>
                            </>
                          )}
                          {c.status === "DENIED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-emerald-500 hover:bg-emerald-500/10 gap-1 border-emerald-500/20"
                              onClick={() => handleUpdateCompanyStatus(c.id, c.name, "APPROVED")}
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
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
        <Card
          role="tabpanel"
          id="tabpanel-jobs"
          aria-labelledby="tab-jobs"
          className="border-border/60 bg-card/40 backdrop-blur"
        >
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Job Listings</CardTitle>
              <CardDescription>Moderate and delete active job postings.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search jobs..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
                aria-label="Search jobs by title, company, or location"
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
                            <Link href={`/employer/jobs/${j.id}/edit`} aria-label={`Edit job ${j.title}`}>
                              <Edit className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Edit Job</span>
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteJob(j.id, j.title)}
                            aria-label={`Delete job ${j.title}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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

      <ConfirmDialog
        open={!!pendingDeleteUser}
        onCancel={() => setPendingDeleteUser(null)}
        title="Delete this user?"
        description={
          pendingDeleteUser
            ? `You are about to permanently delete user "${pendingDeleteUser.username}". This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete user"
        cancelLabel="Cancel"
        destructive
        onConfirm={performDeleteUser}
      />

      <ConfirmDialog
        open={!!pendingDeleteJob}
        onCancel={() => setPendingDeleteJob(null)}
        title="Delete this job posting?"
        description={
          pendingDeleteJob
            ? `You are about to permanently delete job "${pendingDeleteJob.title}". This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete job"
        cancelLabel="Cancel"
        destructive
        onConfirm={performDeleteJob}
      />

      <ConfirmDialog
        open={!!pendingUserStatus}
        onCancel={() => setPendingUserStatus(null)}
        title={
          pendingUserStatus
            ? pendingUserStatus.newStatus === "APPROVED"
              ? "Approve this user?"
              : pendingUserStatus.newStatus === "DENIED"
              ? "Deny this user?"
              : pendingUserStatus.newStatus === "BANNED"
              ? "Ban this user?"
              : "Unban this user?"
            : ""
        }
        description={
          pendingUserStatus
            ? `Confirm the status change for user "${pendingUserStatus.user.username}".`
            : ""
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        destructive={pendingUserStatus?.newStatus === "DENIED" || pendingUserStatus?.newStatus === "BANNED"}
        onConfirm={performUpdateStatus}
      />

      <ConfirmDialog
        open={!!pendingCompanyStatus}
        onCancel={() => setPendingCompanyStatus(null)}
        title={
          pendingCompanyStatus?.newStatus === "APPROVED"
            ? "Approve this company?"
            : "Deny this company?"
        }
        description={
          pendingCompanyStatus
            ? `Confirm the status change for company "${pendingCompanyStatus.name}".`
            : ""
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        destructive={pendingCompanyStatus?.newStatus === "DENIED"}
        onConfirm={performUpdateCompanyStatus}
      />

      <ConfirmDialog
        open={!!pendingCompanyTier}
        onCancel={() => setPendingCompanyTier(null)}
        title={pendingCompanyTier?.tier === "PRO" ? "Upgrade to Pro?" : "Downgrade to Basic?"}
        description={
          pendingCompanyTier
            ? `Are you sure you want to change this company's tier to ${pendingCompanyTier.tier}?`
            : ""
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={performUpdateCompanyTier}
      />
    </div>
  );
}
