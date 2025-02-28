import { AnimatedCounter, Card } from "@repo/ui/components";
import { useAnimateCounter } from "@repo/ui/hooks";
import React from "react";

interface MarketSummaryCardProps {
  label: React.ReactNode;
  value: number;
  counter: number | null;
  setCounter: (value: number) => void;
  /**
   * Sync animation state between multiple cards.
   */
  isAnimating: boolean;
}

export const MarketSummaryCard = ({
  label,
  value,
  counter,
  setCounter,
  isAnimating,
}: MarketSummaryCardProps) => {
  useAnimateCounter({ value, setCounter });

  return (
    <Card padding="md">
      <span className="text-xs/3 text-text-light">{label}</span>

      <AnimatedCounter
        value={value}
        counter={counter}
        className="text-3xl/8 font-dot"
        isAnimating={isAnimating}
        options={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
      />
    </Card>
  );
};
