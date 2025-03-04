import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import React from "react";
import { useCardContext } from "./card.context";

export const CardFigureInput = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const { isLoading } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <input
        className={cn(
          "bg-transparent border-none outline-none text-5xl/12 h-12 font-dot text-text placeholder:text-text-light",
          className,
        )}
        {...props}
      />
    </Skeleton>
  );
};
