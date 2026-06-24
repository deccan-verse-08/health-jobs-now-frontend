"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonVariantsProps } from "./button-variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantsProps {
  asChild?: boolean;
}

// Tiny Slot: clones its single child and merges className/ref/event handlers
// onto it. Lets Button render as a Next.js <Link> while inheriting all styles.
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;
    const child = children as React.ReactElement<{
      className?: string;
      ref?: React.Ref<HTMLElement>;
    }>;
    return React.cloneElement(child, {
      ...mergeProps(props, child.props as React.HTMLAttributes<HTMLElement>),
      ref: mergeRefs(ref, (child as unknown as { ref?: React.Ref<HTMLElement> }).ref),
      className: cn(props.className, child.props.className),
    } as Record<string, unknown>);
  }
);
Slot.displayName = "Slot";

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    for (const r of refs) {
      if (!r) continue;
      if (typeof r === "function") r(node);
      else (r as React.MutableRefObject<T | null>).current = node;
    }
  };
}

function mergeProps<A, B>(a: A, b: B): A & B {
  return { ...a, ...b } as A & B;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", asChild = false, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={cn(buttonVariants({ variant, size, className }))}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </Slot>
      );
    }
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };

