import { API_BASE } from "./constants";
import { readToken } from "./auth";
import type {
  AuthResponse,
  Job,
  JobPayload,
  LoginPayload,
  PageResponse,
  RegisterPayload,
  User,
  JobApplication,
  JobApplicationPayload,
  Company,
  CompanyPayload,
  UserProfile,
} from "@/types/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type Query = Record<string, string | number | undefined>;

function buildUrl(path: string, query?: Query) {
  const url = new URL(path, API_BASE);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function request<T>(path: string, init: RequestInit = {}, query?: Query): Promise<T> {
  const token = readToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (init.body && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;
  Object.assign(headers, (init.headers as Record<string, string>) ?? {});

  const res = await fetch(buildUrl(path, query), {
    ...init,
    headers,
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => "");

  if (!res.ok) {
    const message =
      (isJson && (body?.message || body?.error || body?.error_description)) ||
      (typeof body === "string" && body) ||
      res.statusText ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body);
  }
  return body as T;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<User>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: LoginPayload) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  profile: () => request<User>("/api/auth/profile"),
  updateProfile: (payload: Partial<User>) =>
    request<User>("/api/auth/profile", { method: "PUT", body: JSON.stringify(payload) }),
};

export const jobsApi = {
  list: (q?: { page?: number; size?: number; sortBy?: string; direction?: "asc" | "desc" }) =>
    request<PageResponse<Job>>("/api/jobs", { method: "GET" }, q),
  my: (q?: { page?: number; size?: number; sortBy?: string; direction?: "asc" | "desc" }) =>
    request<PageResponse<Job>>("/api/jobs/my", { method: "GET" }, q),
  get: (id: number) => request<Job>(`/api/jobs/${id}`, { method: "GET" }),
  create: (payload: JobPayload) =>
    request<Job>("/api/jobs", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: JobPayload) =>
    request<Job>(`/api/jobs/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id: number) => request<void>(`/api/jobs/${id}`, { method: "DELETE" }),
};

export const adminApi = {
  listUsers: () => request<User[]>("/api/admin/users"),
  getUser: (id: number) => request<User>(`/api/admin/users/${id}`),
  createUser: (payload: RegisterPayload) =>
    request<User>("/api/admin/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id: number, payload: Partial<User>) =>
    request<User>(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteUser: (id: number) => request<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
  listCompanies: () => request<Company[]>("/api/admin/companies"),
  getCompany: (id: number) => request<Company>(`/api/admin/companies/${id}`),
  updateCompanyStatus: (id: number, status: string) =>
    request<Company>(`/api/admin/companies/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

export const companyApi = {
  create: (payload: CompanyPayload) =>
    request<Company>("/api/companies", { method: "POST", body: JSON.stringify(payload) }),
  get: (id: number) => request<Company>(`/api/companies/${id}`),
  getMyCompany: () => request<Company | null>("/api/companies/my"),
  update: (id: number, payload: CompanyPayload) =>
    request<Company>(`/api/companies/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  list: () => request<Company[]>("/api/companies"),
};

export const applicationsApi = {
  apply: (jobId: number, payload: JobApplicationPayload) =>
    request<JobApplication>(`/api/applications/apply/${jobId}`, { method: "POST", body: JSON.stringify(payload) }),
  myApplications: () =>
    request<JobApplication[]>("/api/applications/my", { method: "GET" }),
  employerApplications: () =>
    request<JobApplication[]>("/api/applications/employer", { method: "GET" }),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string }>("/api/applications/upload-resume", {
      method: "POST",
      body: formData,
    });
  },
  updateStatus: (id: number, status: string, message?: string) =>
    request<JobApplication>(`/api/applications/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, message }),
    }),
};

export const profilesApi = {
  getMyProfile: () => request<UserProfile>("/api/profiles/my", { method: "GET" }),
  updateMyProfile: (payload: UserProfile) =>
    request<UserProfile>("/api/profiles/my", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  generatePdfResume: () =>
    request<UserProfile>("/api/profiles/my/generate-pdf", {
      method: "POST",
    }),
};


