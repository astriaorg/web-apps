import { cn } from "@repo/ui/utils";
import { Card } from "./card";

export const StatusCard = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
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
