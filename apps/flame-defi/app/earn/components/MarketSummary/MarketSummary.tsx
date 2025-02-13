import { useEffect, useState } from "react";
import { MarketSummaryCard } from "./MarketSummaryCard";

// TODO: Use fetched values.
const VALUE_DEPOSIT = 1000000;
const VALUE_BORROW = 75000;

export const MarketSummary = () => {
  const [countDeposit, setCountDeposit] = useState<number | null>(null);
  const [countBorrow, setCountBorrow] = useState<number | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Prevent counter animation when number is too low.
    // May need to adjust based on the expected maximum value.
    const multiplier = 0.1;
    const countDepositMinimum = VALUE_DEPOSIT * multiplier;
    const countBorrowMinimum = VALUE_BORROW * multiplier;

    if (
      countDeposit !== null &&
      countBorrow !== null &&
      countDeposit > countDepositMinimum &&
      countBorrow > countBorrowMinimum
    ) {
      setIsAnimating(true);
    }
  }, [countDeposit, countBorrow]);

  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <MarketSummaryCard
        label="Total Deposits"
        value={VALUE_DEPOSIT}
        count={countDeposit}
        setCount={setCountDeposit}
        isAnimating={isAnimating}
      />
      <MarketSummaryCard
        label="Total Borrow"
        value={VALUE_BORROW}
        count={countBorrow}
        setCount={setCountBorrow}
        isAnimating={isAnimating}
      />
    </div>
  );
};
