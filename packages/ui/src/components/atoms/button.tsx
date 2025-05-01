import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-orange text-white hover:bg-surface-inverted hover:text-typography-inverted active:bg-surface-inverted-subdued active:text-typography-inverted",
        destructive: "",
        outline: "",
        secondary:
          "bg-surface-3 text-typography-default border-none hover:bg-surface-1 active:bg-surface-3",
        ghost: "hover:text-typography-light",
        gradient:
          "bg-button-gradient text-white transition border border-orange-soft hover:border-white",
        link: "",
      },
      size: {
        default: "h-12 rounded-xl px-4 py-3 text-base/4 font-semibold",
        sm: "h-8 rounded-lg px-2 py-1.5 text-sm font-medium",
        lg: "",
        icon: "h-8 w-8 rounded-lg",
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
