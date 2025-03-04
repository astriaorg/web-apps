import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-1.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-surface-3 text-text-subdued",
        secondary: "bg-surface-1 text-text-subdued",
        destructive: "",
        outline: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
