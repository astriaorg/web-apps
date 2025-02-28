import { cn } from "@repo/ui/utils";
import { Card, CardProps } from "earn/components/card/card";

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
