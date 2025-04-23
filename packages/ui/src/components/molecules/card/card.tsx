"use client";

import { cn } from "@repo/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { CardContext } from "./card.context";

export const cardVariants = cva("rounded-xl", {
  variants: {
    variant: {
      default: "bg-surface-1",
      secondary: "bg-surface-2",
      accent: "bg-brand",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  isLoading?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, isLoading = false, variant, ...props }, ref) => {
    return (
      <CardContext.Provider value={{ isLoading, variant }}>
        <div
          ref={ref}
          className={cn("flex flex-col", cardVariants({ variant }), className)}
          {...props}
        />
      </CardContext.Provider>
    );
  },
);
Card.displayName = "Card";
