import { cn } from "@repo/ui/utils";
import Link from "next/link";

interface NavbarLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  isActive: boolean;
}

export const NavbarLink = ({
  children,
  isActive,
  ...props
}: NavbarLinkProps) => {
  return (
    <div
      className={cn(
        "relative text-typography-light",
        isActive &&
          `text-typography-default after:content-[''] after:absolute after:transform after:-bottom-0 after:left-1/2  after:-translate-x-1/2 after:w-full after:h-[1px] after:bg-typography-default`,
      )}
    >
      <Link className="flex items-center h-10" {...props}>
        {children}
      </Link>
    </div>
  );
};
