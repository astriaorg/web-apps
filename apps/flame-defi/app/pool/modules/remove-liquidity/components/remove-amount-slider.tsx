"use client";

import * as React from "react";
import { Badge, Slider } from "@repo/ui/components";

export const RemoveAmountSlider = () => {
  const [sliderValue, setSliderValue] = React.useState([25]);

  const handleChange = (value: number[]) => {
    setSliderValue(value);
  };

  return (
    <div className="flex gap-4 items-center justify-between w-full">
      <div className="flex flex-col gap-4 w-1/2">
        <div className="flex flex-col gap-4">
          <span className="text-base font-medium">Current Amount:</span>
          <span className="text-5xl/12 font-dot">{sliderValue[0]}%</span>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="default"
            className="cursor-pointer"
            onClick={() => setSliderValue([25])}
          >
            25%
          </Badge>
          <Badge
            variant="default"
            className="cursor-pointer"
            onClick={() => setSliderValue([50])}
          >
            50%
          </Badge>
          <Badge
            variant="default"
            className="cursor-pointer"
            onClick={() => setSliderValue([75])}
          >
            75%
          </Badge>
          <Badge
            variant="default"
            className="cursor-pointer"
            onClick={() => setSliderValue([100])}
          >
            Max
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-1/2">
        <Slider
          value={sliderValue}
          onValueChange={handleChange}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between pt-2 text-xs">
          <div className="mr-2">0%</div>
          <div className="">25%</div>
          <div className="">50%</div>
          <div className="">75%</div>
          <div className="">100%</div>
        </div>
      </div>
    </div>
  );
};
