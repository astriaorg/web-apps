import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startAdornment, endAdornment, ...props }, ref) => {
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
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground md:text-sm",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-orange-soft",
            startAdornment && "pl-10",
            endAdornment && "pr-10",
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
