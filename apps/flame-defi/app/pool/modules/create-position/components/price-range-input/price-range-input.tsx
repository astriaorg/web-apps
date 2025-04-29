import { Card, CardContent, Slider } from "@repo/ui/components";
import Big from "big.js";
import { TICK_BOUNDARIES } from "pool/constants";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import {
  MAX_PRICE_DEFAULT,
  MIN_PRICE_DEFAULT,
  type CreatePositionInputProps,
} from "pool/modules/create-position/types";
import {
  calculatePriceRange,
  calculatePriceToTick,
  calculateTickToPrice,
} from "pool/utils";
import { useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { MinMaxInput } from "./min-max-input";

const SLIDER_MIN = 0;
const SLIDER_MAX = 100;

interface PriceRangeInputProps extends CreatePositionInputProps {
  minPrice: string;
  maxPrice: string;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
}

export const PriceRangeInput = ({
  rate,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}: PriceRangeInputProps) => {
  const { selectedFeeTier, token0, token1 } = usePageContext();
  const { formatNumber } = useIntl();

  const handleReset = useCallback(() => {
    setMinPrice(MIN_PRICE_DEFAULT.toString());
    setMaxPrice(MAX_PRICE_DEFAULT.toString());
  }, [setMinPrice, setMaxPrice]);

  useEffect(() => {
    // When the rate changes, i.e. user swaps inputs or changes fee tier, reset the slider.
    handleReset();
  }, [rate, handleReset]);

  const sliderToPrice = useCallback(
    (value: number): number => {
      const currentTick = calculatePriceToTick({
        price: Number(rate),
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
    [rate],
  );

  const priceToSlider = useCallback(
    (price: number): number => {
      const currentTick = calculatePriceToTick({
        price: Number(rate),
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
    [rate],
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
    [sliderToPrice, setMinPrice, setMaxPrice],
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

  const displayMinPrice = useMemo(() => {
    if (!minPrice) {
      return minPrice;
    }

    return Number(minPrice) === MIN_PRICE_DEFAULT
      ? "0"
      : new Big(minPrice).toFixed();
  }, [minPrice]);

  const displayMaxPrice = useMemo(() => {
    if (!maxPrice) {
      return maxPrice;
    }

    return Number(maxPrice) === MAX_PRICE_DEFAULT
      ? "∞"
      : new Big(maxPrice).toFixed();
  }, [maxPrice]);

  const exchangeRate = useMemo(() => {
    if (!rate || !token0 || !token1) {
      return null;
    }

    return `1 ${token0.coinDenom} = ${formatNumber(Number(rate), { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ${token1.coinDenom}`;
  }, [token0, token1, rate, formatNumber]);

  const isValid = useMemo(() => {
    const min = Number(minPrice);
    const max = Number(maxPrice);

    return !!minPrice && !!maxPrice && !isNaN(min) && !isNaN(max) && min < max;
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
            value={displayMinPrice}
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
            aria-invalid={!isValid}
          />
          <MinMaxInput
            label="Max"
            value={displayMaxPrice}
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
            aria-invalid={!isValid}
          />
        </div>
        {exchangeRate && (
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="text-typography-subdued">Market Price:</span>
            <span>{exchangeRate}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
