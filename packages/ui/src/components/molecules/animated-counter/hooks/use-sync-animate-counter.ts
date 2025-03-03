"use client";

import { useEffect } from "react";

interface Params {
  values: {
    value: number;
    counter: number | null;
  }[];
  /**
   * Multiply the value to count to to prevent counter animation when value is too low.
   * May need to adjust based on the expected maximum value.
   */
  multiplier?: number;
  setIsAnimating: (value: boolean) => void;
}

export function useSyncAnimateCounter({
  values,
  multiplier = 0.1,
  setIsAnimating,
}: Params): void {
  useEffect(() => {
    // Not grammatically correct but use `is` prefix for consistency.
    const isAllCountersAboveThreshold = values.every(({ value, counter }) => {
      const counterMinimum = value * multiplier;
      return counter !== null && counter > counterMinimum;
    });

    if (isAllCountersAboveThreshold) {
      setIsAnimating(true);
    }
  }, [values, multiplier, setIsAnimating]);
}
