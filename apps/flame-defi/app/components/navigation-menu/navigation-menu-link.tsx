import Link from "next/link";

import { cn } from "@repo/ui/utils";

export interface NavigationMenuLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  isActive: boolean;
}

export const NavigationMenuLink = ({
  children,
  className,
  isActive,
  ...props
}: NavigationMenuLinkProps) => {
  return (
    <div
      className={cn(
        "relative text-typography-light hover:text-typography-default",
        isActive &&
          `text-typography-default after:content-[''] after:absolute after:transform after:-bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[1px] after:bg-typography-default`,
      )}
    >
      <Link className={cn("flex items-center h-10", className)} {...props}>
        {children}
      </Link>
    </div>
  );
};
