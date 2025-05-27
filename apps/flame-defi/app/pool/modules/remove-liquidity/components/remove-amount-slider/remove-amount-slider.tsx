"use client";

import { useCallback, useState } from "react";

import { Badge, Slider } from "@repo/ui/components";

const PERCENTAGES = [0, 25, 50, 75, 100] as const;

export const RemoveAmountSlider = ({
  onChange,
}: {
  onChange: (value: number) => void;
}) => {
  const [sliderValue, setSliderValue] = useState<number[]>([PERCENTAGES[1]]);

  const handleChange = useCallback(
    (value: number[]) => {
      console.log(value);
      if (value.length) {
        setSliderValue(value);
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
          <span className="text-5xl/12 font-dot">{sliderValue[0]}%</span>
        </div>
        <div className="flex gap-2">
          {PERCENTAGES.map((value) => (
            <Badge
              key={`remove-amount-slider_badge_${value}`}
              onClick={() => handleChange([value])}
              variant="secondary"
              className="cursor-pointer"
            >
              {value === PERCENTAGES[PERCENTAGES.length - 1]
                ? "Max"
                : `${value}%`}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full md:w-1/2 md:mt-6">
        <Slider
          value={sliderValue}
          onValueChange={handleChange}
          min={PERCENTAGES[0]}
          max={PERCENTAGES[PERCENTAGES.length - 1]}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between">
          {PERCENTAGES.map((value) => (
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
