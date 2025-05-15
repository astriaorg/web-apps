import Big from "big.js";
import { useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { Card, CardContent, Slider } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import {
  MAX_PRICE_DEFAULT,
  MIN_PRICE_DEFAULT,
} from "pool/modules/create-position/types";
import { TICK_BOUNDARIES } from "pool/types";
import {
  calculatePriceToTick,
  calculateTickToPrice,
  calculateUserPriceToNearestTickAndPrice,
} from "pool/utils";

import { MinMaxInput } from "./min-max-input";

const SLIDER_MIN = 0;
const SLIDER_MAX = 100;
const SLIDER_EXPONENT = 10; // Control the curve steepness of the slider.

interface PriceRangeInputProps {
  rate: string | null;
}

export const PriceRangeInput = ({ rate }: PriceRangeInputProps) => {
  const {
    feeTier,
    token0,
    token1,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    isPriceRangeValid,
  } = usePageContext();
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
      // We want to exponentially center the range from MIN_TICK to MAX_TICK around the current tick, providing more granular control closer to the current price.
      const tickRange = TICK_BOUNDARIES.MAX - TICK_BOUNDARIES.MIN;
      const maxOffset = tickRange / 2;

      // Normalize slider value to [-1, 1]
      const normalizedValue = (value - SLIDER_MAX / 2) / (SLIDER_MAX / 2);

      // Apply exponential scaling.
      const scaledValue =
        Math.sign(normalizedValue) *
        Math.pow(Math.abs(normalizedValue), SLIDER_EXPONENT);

      // Scale to the tick offset range.
      const tickOffset = scaledValue * maxOffset;

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

      if (price <= MIN_PRICE_DEFAULT) {
        return SLIDER_MIN;
      }

      if (price >= MAX_PRICE_DEFAULT) {
        return SLIDER_MAX;
      }

      const tick = calculatePriceToTick({ price });
      const tickRange = TICK_BOUNDARIES.MAX - TICK_BOUNDARIES.MIN;
      const maxOffset = tickRange / 2;

      const tickOffset = tick - currentTick;

      // Normalize the tick offset to the [-1, 1] range.
      const normalizedOffset = tickOffset / maxOffset;

      // Invert the exponential scaling.
      const invertedScaledOffset =
        Math.sign(normalizedOffset) *
        Math.pow(Math.abs(normalizedOffset), 1 / SLIDER_EXPONENT);

      // Map the normalized offset to the slider range [0, SLIDER_MAX].
      const sliderValue =
        SLIDER_MAX / 2 + invertedScaledOffset * (SLIDER_MAX / 2);

      return Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, sliderValue));
    },
    [rate],
  );

  const sliderValue = useMemo(() => {
    const min = priceToSlider(Number(minPrice));
    const max = priceToSlider(Number(maxPrice));

    return [min, max];
  }, [priceToSlider, minPrice, maxPrice]);

  // TODO: Slider is sticky near current price.
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

  const getNearestPriceRange = useCallback(
    (params: { price: string }): string | void => {
      const price = Number(params.price);

      if (!token0 || !token1 || isNaN(price)) {
        return;
      }

      const { price: nearestPrice } = calculateUserPriceToNearestTickAndPrice({
        price,
        token0,
        token1,
        feeTier,
      });

      return nearestPrice;
    },
    [feeTier, token0, token1],
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

  return (
    <Card variant="secondary" className="w-full">
      <CardContent>
        <div className="flex items-center justify-between mb-4">
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
          disabled={!rate}
          className={cn("mt-2", !rate && "hidden mt-0")}
        />
        <div className="grid grid-cols-2 gap-2 mt-4">
          <MinMaxInput
            label="Min"
            value={displayMinPrice}
            onInput={(event) => setMinPrice(event.currentTarget.value)}
            onBlur={(event) => {
              const result = getNearestPriceRange({
                price: event.currentTarget.value,
              });
              if (result) {
                setMinPrice(result.toString());
              }
            }}
            aria-invalid={!isPriceRangeValid}
          />
          <MinMaxInput
            label="Max"
            value={displayMaxPrice}
            onInput={(event) => setMaxPrice(event.currentTarget.value)}
            onBlur={(event) => {
              const result = getNearestPriceRange({
                price: event.currentTarget.value,
              });
              if (result) {
                setMaxPrice(result.toString());
              }
            }}
            aria-invalid={!isPriceRangeValid}
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
