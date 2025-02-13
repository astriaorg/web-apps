import { cn } from "@repo/ui/lib";

export const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("rounded-lg bg-semi-white", className)} {...props} />
  );
};
