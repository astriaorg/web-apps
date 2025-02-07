import { cn } from "@repo/ui/lib";

export const TableCard = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-semi-white overflow-x-auto gradient-background",
        className,
      )}
      {...props}
    />
  );
};
