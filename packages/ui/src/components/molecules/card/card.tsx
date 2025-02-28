import { cn } from "@repo/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { CardContext } from "./card.context";

export const cardVariants = cva("", {
  variants: {
    variant: {
      default: "rounded-xl bg-surface-1",
      accent: "rounded-xl bg-orange",
    },
    padding: {
      default: "",
      md: "space-y-2 p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  isLoading?: boolean;
}

export const Card = ({
  className,
  isLoading = false,
  padding,
  variant,
  ...props
}: CardProps) => {
  return (
    <CardContext.Provider value={{ isLoading, variant }}>
      <div
        className={cn(
          "flex flex-col",
          cardVariants({ padding, variant }),
          className,
        )}
        {...props}
      />
    </CardContext.Provider>
  );
};
