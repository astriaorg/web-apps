import { Skeleton } from "@repo/ui/shadcn-primitives";
import { cn } from "@repo/ui/utils";
import { useSummaryCardContext } from "earn/components/summary-card";
import React from "react";

export const SummaryCardLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isLoading } = useSummaryCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <div
        className={cn(
          "flex space-x-2 justify-between text-sm/5 text-text-subdued whitespace-nowrap",
          className,
        )}
        {...props}
      />
    </Skeleton>
  );
};
