import { cva } from "class-variance-authority";
import React, { forwardRef } from "react";

import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

import { useCardContext } from "./card.context";

const cardFigureLabelVariants = cva("text-5xl/12 font-dot", {
  variants: {
    variant: {
      default: "text-typography-default",
      secondary: "text-typography-default",
      accent: "text-typography-inverted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const CardFigureLabel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { isLoading, variant } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <span
        ref={ref}
        className={cn(cardFigureLabelVariants({ variant }), className)}
        {...props}
      />
    </Skeleton>
  );
});
CardFigureLabel.displayName = "CardFigureLabel";
