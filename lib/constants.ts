export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export const TOKEN_KEY = "hjn_token";
export const USER_KEY = "hjn_user";
export const TOKEN_COOKIE = "hjn_token";

// Roles — match backend's Role enum values
export const ROLES = {
  JOB_SEEKER: "JOB_SEEKER",
  EMPLOYER: "EMPLOYER",
  ADMIN: "ADMIN",
} as const;

// Form enums — match backend's expected values for JobDto
export const EMPLOYMENT_TYPES = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Internship",
  "Temporary",
] as const;

export const EXPERIENCE_LEVELS = [
  "Entry-Level",
  "Mid-Level",
  "Senior-Level",
  "Director",
  "Executive",
] as const;
