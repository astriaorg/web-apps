import { Card, type CardProps } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

export const StatusCard = ({ className, ...props }: CardProps) => {
  return (
    <Card
      className={cn(
        "h-[250px] text-lg text-text-subdued flex items-center justify-center",
        className,
      )}
      {...props}
    />
  );
};
