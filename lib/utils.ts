import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDeadlineCountdown(deadlineIso?: string) {
  if (!deadlineIso) return null;
  const deadline = new Date(deadlineIso);
  const now = new Date();
  
  // Set times to midnight to calculate pure day differences
  const dDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dDate.getTime() - nDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: "Closed", urgent: false, closed: true };
  } else if (diffDays === 0) {
    return { text: "Closes today", urgent: true, closed: false };
  } else if (diffDays === 1) {
    return { text: "1 day left to apply", urgent: true, closed: false };
  } else if (diffDays <= 3) {
    return { text: `${diffDays} days left to apply`, urgent: true, closed: false };
  } else {
    return { text: `${diffDays} days left to apply`, urgent: false, closed: false };
  }
}
