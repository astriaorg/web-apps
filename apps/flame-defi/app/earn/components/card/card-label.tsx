import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { useCardContext } from "earn/components/card/card.context";
import React from "react";

export const CardLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isLoading } = useCardContext();

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
