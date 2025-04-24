"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "../../utils";

const styles =
  "block h-4 w-4 rounded-full border border-orange/50 bg-orange outline-none shadow transition-colors disabled:pointer-events-none disabled:opacity-50";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[4px] w-full grow overflow-hidden rounded-full bg-orange/40">
      <SliderPrimitive.Range className="absolute h-full bg-orange" />
    </SliderPrimitive.Track>
    {Array.isArray(props.value) ? (
      props.value.map((_, index) => (
        <SliderPrimitive.Thumb
          key={`slider_thumb_${index}`}
          className={styles}
        />
      ))
    ) : (
      <SliderPrimitive.Thumb className={styles} />
    )}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
