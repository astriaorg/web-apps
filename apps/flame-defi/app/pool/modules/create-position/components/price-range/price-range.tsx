import { Card, CardContent, Slider } from "@repo/ui/components";
import Big from "big.js";
import { TICK_BOUNDARIES } from "pool/constants";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import type { PoolWithSlot0Data } from "pool/types";
import {
  calculatePriceRange,
  calculatePriceToTick,
  calculateTickToPrice,
} from "pool/utils";
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { MinMaxInput } from "./min-max-input";

const SLIDER_MIN = 0;
const SLIDER_MAX = 100;

const MIN_PRICE_DEFAULT = 0;
const MAX_PRICE_DEFAULT = Infinity;

export const PriceRange = ({ pool }: { pool: PoolWithSlot0Data }) => {
  const { token0, token1, selectedFeeTier } = usePageContext();
  const { formatNumber } = useIntl();

  const [minPrice, setMinPrice] = useState<string>(
    MIN_PRICE_DEFAULT.toString(),
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    MAX_PRICE_DEFAULT.toString(),
  );

  const handleReset = useCallback(() => {
    setMinPrice("0");
    setMaxPrice(Infinity.toString());
  }, []);

  const sliderToPrice = useCallback(
    (value: number): number => {
      const currentTick = calculatePriceToTick({
        price: +pool.rateToken1ToToken0,
      });

      if (value === SLIDER_MIN) {
        return MIN_PRICE_DEFAULT;
      }

      if (value === SLIDER_MAX) {
        return MAX_PRICE_DEFAULT;
      }

      // Calculate the range of ticks based on the current tick.
      // We want to go from MIN_TICK to MAX_TICK, but centered around the current tick.
      const tickRange = TICK_BOUNDARIES.MAX - TICK_BOUNDARIES.MIN;

      // Normalize the slider value to a range of [-0.5, 0.5].
      const normalizedValue = (value - 50) / 100;

      // Calculate the tick offset from the current tick.
      const tickOffset = normalizedValue * tickRange;

      // Calculate the new tick, ensuring it stays within the bounds.
      const newTick = Math.max(
        TICK_BOUNDARIES.MIN,
        Math.min(TICK_BOUNDARIES.MAX, currentTick + tickOffset),
      );

      return calculateTickToPrice({
        tick: newTick,
      });
    },
    [pool.rateToken1ToToken0],
  );

  const priceToSlider = useCallback(
    (price: number): number => {
      const currentTick = calculatePriceToTick({
        price: +pool.rateToken1ToToken0,
      });

      if (price <= 0) {
        return SLIDER_MIN;
      }

      if (price >= Infinity) {
        return SLIDER_MAX;
      }

      const tick = calculatePriceToTick({ price });
      const tickRange = TICK_BOUNDARIES.MAX - TICK_BOUNDARIES.MIN;

      // Calculate the tick offset from the current tick.
      const tickOffset = tick - currentTick;

      // Normalize the tick offset to a range of [-0.5, 0.5].
      const normalizedOffset = tickOffset / tickRange;

      // Map the normalized offset to the slider range [0, 100].
      const sliderValue = 50 + normalizedOffset * 100;

      return Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, sliderValue));
    },
    [pool.rateToken1ToToken0],
  );

  const sliderValue = useMemo(() => {
    const min = priceToSlider(Number(minPrice));
    const max = priceToSlider(Number(maxPrice));

    return [min, max];
  }, [priceToSlider, minPrice, maxPrice]);

  const handleSliderValueChange = useCallback(
    (values: number[]) => {
      if (values.length !== 2) {
        return;
      }

      const minPrice = sliderToPrice(values[0] as number);
      const maxPrice = sliderToPrice(values[1] as number);

      setMinPrice(minPrice.toString());
      setMaxPrice(maxPrice.toString());
    },
    [sliderToPrice],
  );

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
    // Don't show exponential notation for large numbers.
    return {
      minPrice: Number(minPrice) === 0 ? "0" : new Big(minPrice).toFixed(),
      maxPrice:
        Number(maxPrice) === Infinity ? "∞" : new Big(maxPrice).toFixed(),
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
          value={sliderValue}
          onValueChange={handleSliderValueChange}
          min={SLIDER_MIN}
          max={SLIDER_MAX}
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
        <div className="flex items-center gap-2 text-sm mt-2">
          <span className="text-typography-subdued">Market Price:</span>
          <span>
            {`1 ${token0?.coinDenom} = ${formatNumber(Number(pool.rateToken1ToToken0), { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ${token1?.coinDenom}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
