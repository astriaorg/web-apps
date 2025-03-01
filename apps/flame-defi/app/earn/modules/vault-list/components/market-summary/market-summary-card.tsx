import {
  AnimatedCounter,
  AnimatedCounterProps,
  Card,
  useAnimateCounter,
} from "@repo/ui/components";
import React from "react";

interface MarketSummaryCardProps extends AnimatedCounterProps {
  label: React.ReactNode;
  setCounter: (value: number) => void;
}

export const MarketSummaryCard = ({
  label,
  value,
  counter,
  setCounter,
  isSyncingAnimation,
}: MarketSummaryCardProps) => {
  useAnimateCounter({ value, setCounter });

  return (
    <Card padding="md" className="space-y-2">
      <span className="text-xs/3 text-text-light">{label}</span>

      <AnimatedCounter
        value={value}
        counter={counter}
        isSyncingAnimation={isSyncingAnimation}
        className="text-3xl/8 font-dot"
        options={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
      />
    </Card>
  );
};
