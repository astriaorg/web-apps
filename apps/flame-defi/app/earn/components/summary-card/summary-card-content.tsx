import { cn } from "@repo/ui/lib";
import { Skeleton } from "@repo/ui/shadcn-primitives";
import { useSummaryCardContext } from "earn/components/summary-card";
import React from "react";

export const SummaryCardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  const { isLoading } = useSummaryCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <span className={cn("text-5xl/12 font-dot", className)} {...props} />
    </Skeleton>
  );
};
