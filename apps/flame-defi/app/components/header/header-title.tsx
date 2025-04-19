import { cn } from "@repo/ui/utils";

export const HeaderTitle = ({
  children,
  className,
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 className={cn("text-3xl/8 font-medium", className)}>{children}</h1>
  );
};
