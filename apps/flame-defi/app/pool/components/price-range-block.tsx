import { Skeleton, ToggleSwitch } from "@repo/ui/components";
import { PriceCard } from "./price-range-card";
import { usePoolPositionContext } from "pool/hooks";

export const PriceRangeBlock = ({
  symbols,
  selectedSymbol,
  handleReverseTokenData,
}: {
  symbols: string[];
  selectedSymbol: string;
  handleReverseTokenData: (symbol: string) => void;
}) => {
  const { currentPrice, minPrice, maxPrice } = usePoolPositionContext();

  return (
    <>
      <div className="flex gap-4 mb-2 w-full justify-between items-center">
        <h2 className="text-lg font-medium">Price Range</h2>
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
        <PriceCard leftLabel="Current price" value={currentPrice} />
        <PriceCard
          leftLabel="Min price"
          tooltipText="Your position will be 100% milkTIA at this price."
          value={minPrice}
        />
        <PriceCard
          leftLabel="Max price"
          tooltipText="Your position will be 100% TIA at this price."
          value={maxPrice}
        />
      </div>
    </>
  );
};
