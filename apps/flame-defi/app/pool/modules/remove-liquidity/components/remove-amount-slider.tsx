"use client";

import { Badge, Slider } from "@repo/ui/components";
import { useState } from "react";

export const RemoveAmountSlider = ({
  handlePercentToRemove,
}: {
  handlePercentToRemove: (percent: number) => void;
}) => {
  const [sliderValue, setSliderValue] = useState([25]);

  const handleChange = (value: number[]) => {
    if (value[0]) {
      setSliderValue(value);
      handlePercentToRemove(value[0]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
      <div className="flex flex-col gap-4 w-full mb-6 md:mb-0 md:w-1/2">
        <div className="flex flex-col gap-4">
          <span className="text-base font-medium">Current Amount:</span>
          <span className="text-5xl/12 font-dot">{sliderValue[0]}%</span>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="default"
            className="cursor-pointer hover:bg-grey-medium hover:text-white transition"
            onClick={() => handleChange([25])}
          >
            25%
          </Badge>
          <Badge
            variant="default"
            className="cursor-pointer hover:bg-grey-medium hover:text-white transition"
            onClick={() => handleChange([50])}
          >
            50%
          </Badge>
          <Badge
            variant="default"
            className="cursor-pointer hover:bg-grey-medium hover:text-white transition"
            onClick={() => handleChange([75])}
          >
            75%
          </Badge>
          <Badge
            variant="default"
            className="cursor-pointer hover:bg-grey-medium hover:text-white transition"
            onClick={() => handleChange([100])}
          >
            Max
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full md:w-1/2">
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
