import { Card, CardContent, Slider } from "@repo/ui/components";
import { useCallback, useMemo, useState } from "react";
import { MinMaxInput } from "./min-max-input";

export const PriceRange = () => {
  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("100");

  const priceRange = useMemo(() => {
    return [Number(minPrice), Number(maxPrice)];
  }, [minPrice, maxPrice]);

  const handlePriceRangeChange = useCallback((values: number[]) => {
    if (values.length !== 2) {
      return;
    }

    setMinPrice((values[0] as number).toString());
    setMaxPrice((values[1] as number).toString());
  }, []);

  return (
    <Card variant="secondary" className="w-full">
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <span>Price Range</span>
          <span className="text-xs text-typography-subdued hover:cursor-pointer">
            Reset
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={handlePriceRangeChange}
          max={100}
          step={1}
        />
        <div className="grid grid-cols-2 gap-2 mt-4">
          <MinMaxInput
            label="Min"
            value={minPrice}
            onInput={(event) => setMinPrice(event.currentTarget.value)}
          />
          <MinMaxInput
            label="Max"
            value={maxPrice}
            onInput={(event) => setMaxPrice(event.currentTarget.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
