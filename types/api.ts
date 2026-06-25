// API DTOs matching the HealthJobsNow backend (Spring Boot)

export type Role = "ROLE_JOB_SEEKER" | "ROLE_EMPLOYER" | "ROLE_ADMIN";
export type RoleName = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  roles: RoleName[];
  status: string;
  oauth2Provider?: string | null;
  companyId?: number | null;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface RegisterPayload {
  username?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  roles?: Role[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  experienceLevel: string;
  postedDate?: string;
  createdDate: string;
  lastModifiedDate: string;
  employerId?: number;
  featured?: boolean;
  expiresAt?: string;
  applicationDeadline?: string;
}

export interface JobPayload {
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  experienceLevel: string;
  featured?: boolean;
  applicationDeadline?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface JobApplication {
  id: number;
  job: Job;
  seeker: User;
  appliedDate: string;
  status: string;
  coverLetter?: string;
  resumeDetails?: string;
  resumeUrl?: string;
  employerMessage?: string;
}

export interface JobApplicationPayload {
  coverLetter: string;
  resumeDetails: string;
  resumeUrl?: string;
}

export interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  location?: string;
  status: string;
  creatorId: number;
  createdDate?: string;
  lastModifiedDate?: string;
  tier?: "BASIC" | "PRO";
  tierUpdatedDate?: string;
}

export interface CompanyPayload {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  location?: string;
}

export interface UserProfile {
  id?: number;
  userId?: number;
  registrationNumber?: string;
  specialization?: string;
  qualifications?: string;
  experienceYears?: number;
  keySkills?: string;
  summary?: string;
  educationHistory?: string; // Serialized JSON string of degrees
  workHistory?: string; // Serialized JSON string of jobs
  generatedResumeUrl?: string;
}

export interface TierInfo {
  tier: "BASIC" | "PRO";
  maxJobsPerMonth: number;
  jobsPostedThisMonth: number;
  maxVisibleApplicants: number;
  jobDurationDays: number;
  featuredPerMonth: number;
  featuredUsedThisMonth: number;
  fullApplicantProfile: boolean;
  dashboardAnalytics: boolean;
  resumeDbAccess: boolean;
}

export interface CandidateResume {
  user: User;
  profile: UserProfile | null;
}

