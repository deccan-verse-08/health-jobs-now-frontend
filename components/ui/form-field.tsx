"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldContextValue {
  id: string;
  errorId?: string;
  hintId?: string;
  hasError: boolean;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function useFormField() {
  const ctx = React.useContext(FormFieldContext);
  if (!ctx) {
    throw new Error("useFormField must be used within <FormField>");
  }
  return ctx;
}

interface FormFieldProps {
  /** Label text. Pass empty string for visually hidden labels (sr-only). */
  label: string;
  /** Required marker shown next to label. */
  required?: boolean;
  /** Optional hint shown below the input. */
  hint?: string;
  /** Error message. When present, input gets aria-invalid and aria-describedby. */
  error?: string | null;
  /** Control id (auto-generated if omitted). */
  id?: string;
  /** Optional override for the label column layout. */
  layout?: "stacked" | "inline";
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}

/**
 * Wraps a single form control with a label, optional hint, optional error,
 * and the correct aria attributes. Eliminates the dozens of unlabeled inputs
 * and inconsistent error patterns across the app.
 */
export function FormField({
  label,
  required,
  hint,
  error,
  id,
  className,
  layout = "stacked",
  children,
}: FormFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FormFieldContext.Provider
      value={{ id: inputId, errorId, hintId, hasError: !!error }}
    >
      <div
        className={cn(
          layout === "inline" ? "flex items-center gap-3" : "space-y-2",
          className
        )}
      >
        <Label htmlFor={inputId} className="flex items-center gap-1">
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </Label>
        {children({
          id: inputId,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
        })}
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}
