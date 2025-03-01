import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils";
import { Card, type CardProps } from "../card";

export const statusCardVariants = cva("", {
  variants: {
    variant: {
      default: "text-text-secondary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface StatusCardProps
  extends Omit<CardProps, "variant">,
    VariantProps<typeof statusCardVariants> {}

export const StatusCard = ({
  className,
  variant,
  ...props
}: StatusCardProps) => {
  return (
    <Card
      className={cn(
        "min-h-52 flex items-center justify-center p-12",
        statusCardVariants({ variant }),
        className,
      )}
      {...props}
    />
  );
};
