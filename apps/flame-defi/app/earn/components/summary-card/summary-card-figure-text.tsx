import { Skeleton } from "@repo/ui/shadcn-primitives";
import { cn } from "@repo/ui/utils";
import { useSummaryCardContext } from "earn/components/summary-card";
import React from "react";

export const SummaryCardFigureText = ({
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
