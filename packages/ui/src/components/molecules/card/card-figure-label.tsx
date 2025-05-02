import React, { forwardRef } from "react";

import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

import { useCardContext } from "./card.context";

export const CardFigureLabel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { isLoading } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <span
        ref={ref}
        className={cn("text-5xl/12 font-dot", className)}
        {...props}
      />
    </Skeleton>
  );
});
CardFigureLabel.displayName = "CardFigureLabel";
