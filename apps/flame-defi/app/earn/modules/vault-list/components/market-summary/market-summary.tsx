import { useSyncAnimateCounter } from "@repo/ui/components";
import { useState } from "react";
import { MarketSummaryCard } from "./market-summary-card";

// TODO: Use fetched values, handle error state.
const VALUE_DEPOSIT = 1000000;
const VALUE_BORROW = 75000;

export const MarketSummary = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  const [counterDeposit, setCounterDeposit] = useState<number | null>(null);
  const [counterBorrow, setCounterBorrow] = useState<number | null>(null);

  useSyncAnimateCounter({
    values: [
      {
        value: VALUE_DEPOSIT,
        counter: counterDeposit,
      },
      {
        value: VALUE_BORROW,
        counter: counterBorrow,
      },
    ],
    setIsAnimating,
  });

  return (
    <div className="grid gap-2 md:grid-cols-2">
      <MarketSummaryCard
        label="Total Deposits"
        value={VALUE_DEPOSIT}
        counter={counterDeposit}
        setCounter={setCounterDeposit}
        isSyncingAnimation={isAnimating}
      />
      <MarketSummaryCard
        label="Total Borrow"
        value={VALUE_BORROW}
        counter={counterBorrow}
        setCounter={setCounterBorrow}
        isSyncingAnimation={isAnimating}
      />
    </div>
  );
};
