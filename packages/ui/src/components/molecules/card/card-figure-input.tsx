import React from "react";

import { Skeleton, TokenAmountInput } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

import { useCardContext } from "./card.context";

export const CardFigureInput = ({
  className,
  placeholder = "0.00",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const { isLoading } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <TokenAmountInput
        placeholder={placeholder}
        className={cn(
          "bg-transparent border-none outline-hidden rounded-none shadow-none text-5xl/12 h-12 p-0 font-dot text-typography-default placeholder:text-typography-light",
          className,
        )}
        {...props}
      />
    </Skeleton>
  );
};
CardFigureInput.displayName = "CardFigureInput";
