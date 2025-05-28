"use client";

import { useCallback } from "react";

import { Badge, Slider } from "@repo/ui/components";

export const RemoveAmountSlider = ({
  value,
  onChange,
  breakpoints,
}: {
  value: number;
  onChange: (value: number) => void;
  breakpoints: number[];
}) => {
  const handleChange = useCallback(
    (value: number[]) => {
      if (value.length) {
        onChange(value[0] as number);
      }
    },
    [onChange],
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
      <div className="flex flex-col gap-4 w-full mb-4 md:mb-0 md:w-1/2">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium tracking-wider uppercase">
            Current Price
          </span>
          {/* TODO: Add animation. */}
          <span className="text-5xl/12 font-dot">{value}%</span>
        </div>
        <div className="flex gap-2">
          {breakpoints.map((value) => (
            <Badge
              key={`remove-amount-slider_badge_${value}`}
              onClick={() => handleChange([value])}
              variant="secondary"
              className="cursor-pointer"
            >
              {value === breakpoints[breakpoints.length - 1]
                ? "Max"
                : `${value}%`}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full md:w-1/2 md:mt-6">
        <Slider
          value={[value]}
          onValueChange={handleChange}
          min={breakpoints[0]}
          max={breakpoints[breakpoints.length - 1]}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between">
          {breakpoints.map((value) => (
            <span
              key={`remove-amount-slider_label_${value}`}
              className="text-typography-subdued text-xs"
            >
              {value}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
