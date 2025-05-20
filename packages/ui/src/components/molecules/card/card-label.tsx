import { cva } from "class-variance-authority";
import React, { forwardRef } from "react";

import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

import { useCardContext } from "./card.context";

const cardLabelVariants = cva("flex items-center space-x-2 text-sm/5", {
  variants: {
    variant: {
      default: "text-typography-subdued",
      secondary: "text-typography-default",
      accent: "text-typography-inverted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const CardLabel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isLoading, variant } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <div
        ref={ref}
        className={cn(cardLabelVariants({ variant }), className)}
        {...props}
      />
    </Skeleton>
  );
});
CardLabel.displayName = "CardLabel";
