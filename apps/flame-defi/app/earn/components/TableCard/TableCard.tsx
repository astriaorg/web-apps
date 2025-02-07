import { cn } from "@repo/ui/lib";

export const TableCard = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-semi-white flex items-center justify-center overflow-x-auto",
        className,
      )}
      {...props}
    />
  );
};
