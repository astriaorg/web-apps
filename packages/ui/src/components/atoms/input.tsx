import { cva, VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

export const inputVariants = cva("", {
  variants: {
    variant: {
      default:
        "border border-stroke-default bg-surface-1 text-typography shadow-[2px_2px_4px_0px_#00000014_inset] focus-visible:border-stroke-active focus-visible:bg-transparent",
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
      <div className="relative">
        {startAdornment && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-light">
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
            startAdornment && "pl-10",
            endAdornment && "pr-10",
            inputVariants({ variant }),
            className,
          )}
          ref={ref}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-light">
            {endAdornment}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
