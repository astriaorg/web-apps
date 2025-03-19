import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

const buttonStyles = {
  default: "shadow-[2px_2px_2px_0px_hsla(0,0%,100%,0.2)_inset]",
  hover: `hover:shadow-[-2px_-2px_2px_0px_hsla(0,0%,0%,0.2)_inset,2px_2px_2px_0px_hsla(0,0%,100%,0.2)_inset]`,
  active: "active:shadow-[2px_2px_2px_0px_hsla(0,0%,0%,0.2)_inset]",
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: `bg-brand text-typography-black ${buttonStyles.default} ${buttonStyles.hover} ${buttonStyles.active}`,
        destructive: "",
        outline: "",
        secondary: `bg-surface-3 text-typography-default ${buttonStyles.default} ${buttonStyles.hover} ${buttonStyles.active}`,
        ghost: "hover:text-typography-light",
        gradient: "rounded-xl bg-button-gradient text-white transition border border-orange-soft hover:border-white",
        link: "",
      },
      size: {
        default: "h-10 px-4 py-3 text-base/4 font-semibold",
        sm: "h-8 px-2 py-1.5 text-sm font-medium",
        lg: "",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={onClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
