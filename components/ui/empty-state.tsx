import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-4 rounded-2xl border border-dashed border-border bg-surface py-12 px-6",
        className
      )}
      role="status"
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-md">
        <p className="font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      {action && (
        <div>
          {action.href ? (
            <Link
              href={action.href}
              className={cn(
                buttonVariants({ variant: action.variant ?? "default" })
              )}
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                buttonVariants({ variant: action.variant ?? "default" })
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
