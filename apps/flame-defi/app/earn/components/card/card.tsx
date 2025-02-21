import { cn } from "@repo/ui/utils";

export const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("rounded-lg bg-surface-1", className)} {...props} />
  );
};
