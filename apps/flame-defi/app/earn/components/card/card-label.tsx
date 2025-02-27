import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { cva } from "class-variance-authority";
import React from "react";
import { useCardContext } from "./card.context";

const cardLabelVariants = cva("", {
  variants: {
    variant: {
      default: "text-text-subdued",
      accent: "text-text",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const CardLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isLoading, variant } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <div
        className={cn(
          "flex items-center space-x-2 text-sm/5",
          cardLabelVariants({ variant }),
          className,
        )}
        {...props}
      />
    </Skeleton>
  );
};
