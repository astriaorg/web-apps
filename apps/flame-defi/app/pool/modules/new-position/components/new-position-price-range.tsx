import { Button, Input, Slider } from "@repo/ui/components";
import { useState } from "react";
import { AreaChartWithRange } from "./area-chart-with-range";

export const NewPositionPriceRange = () => {
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("∞");

  const getPriceRangeArray = (): number[] => {
    const min = Number(minValue) || 0;
    const max = Number(maxValue) || 30;
    return [min, max];
  };

  const handleSliderChange = (newValues: number[]) => {
    setMinValue(String(newValues[0] ?? 0));
    setMaxValue(String(newValues[1] ?? 30));
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinValue(e.target.value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxValue(e.target.value);
  };

  const handleReset = () => {
    setMinValue("");
    setMaxValue("∞");
  };

  return (
    <div className="bg-surface-1 rounded-xl p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Price Range</h2>
        <Button
          variant="link"
          onClick={handleReset}
          className="text-grey-light hover:text-white font-normal"
        >
          Reset
        </Button>
      </div>

      <div className="mb-6">
        <Slider
          value={getPriceRangeArray()}
          onValueChange={handleSliderChange}
          min={0}
          max={30}
          step={1}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="mb-2 text-grey-light">Min</div>
          <Input
            type="number"
            placeholder="0.00"
            value={minValue}
            onChange={handleMinChange}
            className="w-full normalize-input"
          />
        </div>
        <div>
          <div className="mb-2 text-grey-light">Max</div>
          <Input
            type="number"
            placeholder="∞"
            value={maxValue}
            onChange={handleMaxChange}
            className="w-full normalize-input"
          />
        </div>
      </div>

      <div className="h-40 rounded bg-orange-100/20">
        <AreaChartWithRange priceRange={getPriceRangeArray()} />
      </div>
    </div>
  );
};
