import { MarketSummaryCard } from "./MarketSummaryCard";

export const MarketSummary = () => {
  return (
    <div className="flex flex-col gap-2 md:flex-row">
      {/* TODO: Use fetched values. */}
      <MarketSummaryCard label="Total Deposits" value={75000} />
      <MarketSummaryCard label="Total Borrow" value={1000000} />
    </div>
  );
};
