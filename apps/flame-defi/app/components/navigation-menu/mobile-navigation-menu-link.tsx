import {
  NavigationMenuLink,
  type NavigationMenuLinkProps,
} from "./navigation-menu-link";

export const MobileNavigationMenuLink = ({
  children,
  ...props
}: NavigationMenuLinkProps) => {
  return (
    <NavigationMenuLink className="text-2xl h-11" {...props}>
      {children}
    </NavigationMenuLink>
  );
};
