"use client";

// import { PriceRangeBlock } from "pool/components";
import { TokenLiquidityBlock, AddLiquidityInputsBlock } from "../components";

export const ContentSection = () => {
  // NOTE: Do we actually need the price range block in this component. Do people want this information here?
  return (
    <div className="flex flex-col flex-1 mt-12">
      {/* <PriceRangeBlock
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      /> */}
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock />
        {/* <h2 className="text-lg font-medium">Add More Liquidity</h2> */}
        <AddLiquidityInputsBlock />
      </div>
    </div>
  );
};
