import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

const buttonStyles = {
  default:
    "bg-orange text-text-black shadow-[2px_2px_2px_0px_hsla(0,0%,100%,0.2)_inset]",
  secondary:
    "bg-surface-2 text-text-secondary shadow-[2px_2px_2px_0px_hsla(0,0%,100%,0.2)_inset]",
  hover: `hover:bg-orange hover:text-text-black hover:shadow-[-2px_-2px_2px_0px_hsla(0,0%,0%,0.2)_inset,2px_2px_2px_0px_hsla(0,0%,100%,0.2)_inset]`,
  active:
    "active:bg-orange active:text-text-black active:shadow-[2px_2px_2px_0px_hsla(0,0%,0%,0.2)_inset]",
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: `${buttonStyles.default} ${buttonStyles.hover} ${buttonStyles.active}`,
        destructive: "",
        outline: `border border-stroke ${buttonStyles.hover} ${buttonStyles.active}`,
        secondary: `${buttonStyles.secondary} ${buttonStyles.hover} ${buttonStyles.active}`,
        ghost: "",
        link: "",
      },
      size: {
        default: "h-10 px-4 py-3",
        sm: "h-8 px-4 py-2 text-xs",
        lg: "h-12 px-6 py-4",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
