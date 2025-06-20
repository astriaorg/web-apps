import { cva, VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

export const inputVariants = cva("", {
  variants: {
    variant: {
      default:
        "border border-stroke-default bg-surface-1 text-typography focus-visible:border-stroke-active focus-visible:bg-background-default",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, startAdornment, endAdornment, variant, ...props },
    ref,
  ) => {
    return (
      <div className="relative w-full">
        {startAdornment && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {startAdornment}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl px-4 py-2 text-sm font-medium transition-colors placeholder:text-typography-light outline-hidden",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "focus-visible:outline-hidden",
            "aria-invalid:border-danger aria-invalid:bg-danger/10",
            props.readOnly && "pointer-events-none",
            startAdornment && "pl-11",
            endAdornment && "pr-11",
            inputVariants({ variant }),
            className,
          )}
          ref={ref}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
