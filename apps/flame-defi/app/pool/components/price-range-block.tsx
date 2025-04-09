import { Skeleton, ToggleSwitch } from "@repo/ui/components";
import { usePoolPositionContext } from "pool/hooks";
import { PositionRangeBadge } from "./position-range-badge";
import { PriceRangeCard } from "./price-range-card";

export const PriceRangeBlock = ({
  symbols,
  selectedSymbol,
  handleReverseTokenData,
}: {
  symbols: string[];
  selectedSymbol: string;
  handleReverseTokenData: (symbol: string) => void;
}) => {
  const { currentPrice, minPrice, maxPrice, isPositionClosed } =
    usePoolPositionContext();

  return (
    <>
      <div className="flex gap-4 mb-2 w-full justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">Price Range</h2>
          <PositionRangeBadge isPositionClosed={isPositionClosed} />
        </div>
        <Skeleton
          className="w-[200px] h-[40px]"
          isLoading={symbols.length === 0}
        >
          <ToggleSwitch
            toggleOptions={symbols}
            className="text-sm w-[200px] h-[40px]"
            selectedOption={selectedSymbol}
            setSelectedOption={handleReverseTokenData}
          />
        </Skeleton>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <PriceRangeCard leftLabel="Current price" value={currentPrice} />
        <PriceRangeCard
          leftLabel="Min price"
          tooltipText={`Your position will be 100% ${selectedSymbol} at this price.`}
          value={minPrice}
        />
        <PriceRangeCard
          leftLabel="Max price"
          tooltipText={`Your position will be 100% ${symbols.filter((symbol) => symbol !== selectedSymbol)[0]} at this price.`}
          value={maxPrice}
        />
      </div>
    </>
  );
};
