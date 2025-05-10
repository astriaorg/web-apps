import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "../../utils";

interface SwitchProps
  extends SwitchPrimitives.SwitchProps,
    React.HTMLAttributes<HTMLButtonElement> {}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <SwitchPrimitives.Root
        ref={ref}
        {...props}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-orange data-[state=unchecked]:bg-surface-3",
          className,
        )}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
          )}
        />
      </SwitchPrimitives.Root>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
