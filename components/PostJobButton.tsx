"use client";
 
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
 
export function PostJobButton() {
  const { user, ready } = useAuth();
 
  // Defer rendering until client auth state is resolved to prevent hydration flash
  if (!ready || !user) {
    return null;
  }
 
  const canPost = user.roles.includes("EMPLOYER") || user.roles.includes("ADMIN");
  if (!canPost) {
    return null;
  }
 
  return (
    <Link href="/post-job" className={cn(buttonVariants())}>
      Post a job
    </Link>
  );
}
