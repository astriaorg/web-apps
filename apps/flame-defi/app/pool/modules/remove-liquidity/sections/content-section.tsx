"use client";

import { TokenLiquidityBlock } from "../components";
import { Button } from "@repo/ui/components";

export const ContentSection = () => {
  return (
    <div className="flex flex-col flex-1 mt-12">
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock />
        {/* <h2 className="text-lg font-medium">Add More Liquidity</h2> */}
        <div className="flex gap-4 w-full">
          REMOVE LIQUIDITY SLIDER THING HERE
        </div>
        <div className="flex gap-4 w-full">
          <div className="w-1/2"></div>
          <Button variant="default" size="default" className="w-1/2 self-end">
            Remove liquidity
          </Button>
        </div>
      </div>
    </div>
  );
};
