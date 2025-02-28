import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import React from "react";
import { useCardContext } from "./card.context";

export const CardFigureText = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  const { isLoading } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <span className={cn("text-5xl/12 font-dot", className)} {...props} />
    </Skeleton>
  );
};
