import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "../utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

interface TooltipContentProps
  extends TooltipPrimitive.TooltipContentProps,
    React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, children, ...props }, ref) => {
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          {...props}
          className={cn(
            "z-50 overflow-hidden rounded-md bg-surface-inverted p-1.5 text-xs/4 text-text-inverted font-medium animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-w-[180px]",
            className,
          )}
        >
          {children}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  },
);

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
