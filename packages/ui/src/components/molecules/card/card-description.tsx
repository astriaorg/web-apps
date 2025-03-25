import { Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { useCardContext } from "./card.context";

const cardDescriptionVariants = cva("", {
  variants: {
    variant: {
      default: "text-typography-subdued",
      accent: "text-typography-default",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const CardDescription = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isLoading, variant } = useCardContext();

  return (
    <Skeleton isLoading={isLoading}>
      <div
        ref={ref}
        className={cn(
          "text-sm/5",
          cardDescriptionVariants({ variant }),
          className,
        )}
        {...props}
      />
    </Skeleton>
  );
});
CardDescription.displayName = "CardDescription";
