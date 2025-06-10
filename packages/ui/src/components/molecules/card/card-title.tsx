import { forwardRef } from "react";

import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

import { useCardContext } from "./card.context";

export const CardTitle = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isLoading } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <div ref={ref} className={cn("text-2xl", className)} {...props} />
    </Skeleton>
  );
});
CardTitle.displayName = "CardTitle";
