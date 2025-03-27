"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../utils";

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
    <SliderPrimitive.Track className="relative h-[4px] w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-orange" />
    </SliderPrimitive.Track>
    {/* Render thumbs based on the value array length */}
    {Array.isArray(props.value) &&
      props.value.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="cursor-pointer block h-4 w-4 rounded-full border border-orange/50 bg-orange shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    {/* Fallback for single value */}
    {!Array.isArray(props.value) && (
      <SliderPrimitive.Thumb className="cursor-pointer block h-4 w-4 rounded-full border border-orange/50 bg-orange shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    )}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
