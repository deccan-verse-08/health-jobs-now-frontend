import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for application / job / user status labels and colors.
 * Consolidates three previously-duplicated status maps (my-jobs, jobs/[id], dashboard).
 */

export type ApplicationStatus =
  | "PENDING"
  | "SUBMITTED"
  | "APPLICATION_SENT"
  | "APPLIED"
  | "REVIEWING"
  | "INTERVIEW"
  | "INTERVIEW_STAGE"
  | "APPROVED"
  | "ACCEPTED"
  | "REJECTED"
  | "DENIED";

export type CompanyStatus = "PENDING_APPROVAL" | "APPROVED" | "DENIED";

export type UserStatus = "PENDING_APPROVAL" | "APPROVED" | "DENIED" | "BANNED";

const APPLICATION_STATUS_MAP: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Application Sent",
    className: "bg-info/10 text-info border-info/20",
  },
  SUBMITTED: {
    label: "Application Sent",
    className: "bg-info/10 text-info border-info/20",
  },
  APPLICATION_SENT: {
    label: "Application Sent",
    className: "bg-info/10 text-info border-info/20",
  },
  APPLIED: {
    label: "Application Sent",
    className: "bg-info/10 text-info border-info/20",
  },
  REVIEWING: {
    label: "Under Review",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  INTERVIEW: {
    label: "Interview Stage",
    className: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  },
  INTERVIEW_STAGE: {
    label: "Interview Stage",
    className: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  },
  APPROVED: {
    label: "Accepted",
    className: "bg-success/10 text-success border-success/20",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-success/10 text-success border-success/20",
  },
  REJECTED: {
    label: "Application Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  DENIED: {
    label: "Application Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const COMPANY_STATUS_MAP: Record<CompanyStatus, { label: string; className: string }> = {
  PENDING_APPROVAL: {
    label: "Pending Approval",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-success/10 text-success border-success/20",
  },
  DENIED: {
    label: "Denied",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const USER_STATUS_MAP: Record<UserStatus, { label: string; className: string }> = {
  PENDING_APPROVAL: {
    label: "PENDING",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  APPROVED: {
    label: "APPROVED",
    className: "bg-success/10 text-success border-success/20",
  },
  DENIED: {
    label: "DENIED",
    className: "bg-muted text-muted-foreground border-border",
  },
  BANNED: {
    label: "BANNED",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

interface ApplicationStatusBadgeProps {
  status: string;
  className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const config =
    APPLICATION_STATUS_MAP[status as ApplicationStatus] ?? {
      label: status,
      className: "bg-muted text-muted-foreground border-border",
    };
  return (
    <Badge className={cn("text-xs font-semibold", config.className, className)}>
      {config.label}
    </Badge>
  );
}

interface CompanyStatusBadgeProps {
  status: string;
  className?: string;
}

export function CompanyStatusBadge({ status, className }: CompanyStatusBadgeProps) {
  const config =
    COMPANY_STATUS_MAP[status as CompanyStatus] ?? {
      label: status,
      className: "bg-muted text-muted-foreground border-border",
    };
  return (
    <Badge className={cn("text-xs font-semibold", config.className, className)}>
      {config.label}
    </Badge>
  );
}

interface UserStatusBadgeProps {
  status: string;
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const config =
    USER_STATUS_MAP[status as UserStatus] ?? {
      label: status,
      className: "bg-muted text-muted-foreground border-border",
    };
  return (
    <Badge className={cn("text-[10px] font-semibold", config.className, className)}>
      {config.label}
    </Badge>
  );
}
