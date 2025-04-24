import { Card, CardContent, Slider } from "@repo/ui/components";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import { calculatePriceRange } from "pool/utils";
import { useCallback, useMemo, useState } from "react";
import { MinMaxInput } from "./min-max-input";

export const PriceRange = () => {
  const { token0, token1, selectedFeeTier } = usePageContext();

  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>(Infinity.toString());

  const priceRange = useMemo(() => {
    return [Number(minPrice), Number(maxPrice)];
  }, [minPrice, maxPrice]);

  const handleReset = useCallback(() => {
    setMinPrice("0");
    setMaxPrice(Infinity.toString());
  }, []);

  const handlePriceRangeChange = useCallback((values: number[]) => {
    if (values.length !== 2) {
      return;
    }

    setMinPrice((values[0] as number).toString());
    setMaxPrice((values[1] as number).toString());
  }, []);

  const getCalculatedPriceRange = useCallback(
    ({ minPrice, maxPrice }: { minPrice: string; maxPrice: string }) => {
      const min = Number(minPrice);
      const max = Number(maxPrice);

      if (!token0 || !token1 || isNaN(min) || isNaN(max)) {
        return;
      }

      return calculatePriceRange({
        feeTier: selectedFeeTier,
        decimal0: token0.coinDecimals,
        decimal1: token1.coinDecimals,
        minPrice: min,
        maxPrice: max,
      });
    },
    [selectedFeeTier, token0, token1],
  );

  const displayPrice = useMemo(() => {
    return {
      minPrice: Number(minPrice) < 0 ? "0" : minPrice,
      maxPrice: maxPrice === Infinity.toString() ? "∞" : maxPrice,
    };
  }, [minPrice, maxPrice]);

  return (
    <Card variant="secondary" className="w-full">
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <span>Price Range</span>
          <span
            className="text-xs text-typography-subdued hover:cursor-pointer"
            onClick={handleReset}
          >
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
            value={displayPrice.minPrice}
            onInput={(event) => setMinPrice(event.currentTarget.value)}
            onBlur={(event) => {
              const result = getCalculatedPriceRange({
                minPrice: event.currentTarget.value,
                maxPrice,
              });
              if (result) {
                setMinPrice(result.minPrice.toString());
              }
            }}
          />
          <MinMaxInput
            label="Max"
            value={displayPrice.maxPrice}
            onInput={(event) => setMaxPrice(event.currentTarget.value)}
            onBlur={(event) => {
              const result = getCalculatedPriceRange({
                minPrice,
                maxPrice: event.currentTarget.value,
              });
              if (result) {
                setMaxPrice(result.maxPrice.toString());
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
