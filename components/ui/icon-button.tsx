"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonVariantsProps } from "./button-variants";

interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">,
    ButtonVariantsProps {
  /** REQUIRED: icon-only buttons must announce their action to screen readers. */
  "aria-label": string;
}

/**
 * Icon-only button with a required aria-label. TypeScript enforces the label.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          buttonVariants({ variant: variant ?? "ghost", size: size ?? "icon" }),
          className
        )}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";
