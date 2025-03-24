"use client";

import { usePoolContext } from "pool/hooks";
import { TokenInputState } from "@repo/flame-types";
import { useEvmChainData } from "config";
import { useState } from "react";
import {
  NewPositionInputs,
  NewPositionPriceRange,
  FeeRange,
} from "../components";
import { FeeData } from "pool/types";
import { Button } from "@repo/ui/components";

export const ContentSection = () => {
  const { feeData } = usePoolContext();
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const defaultFeeData = feeData[2] as FeeData;
  const [selectedFeeTier, setSelectedFeeTier] =
    useState<FeeData>(defaultFeeData);
  const [inputOne, setInputOne] = useState<TokenInputState>({
    token: currencies[0],
    value: "",
    isQuoteValue: false,
  });
  const [inputTwo, setInputTwo] = useState<TokenInputState>({
    token: null,
    value: "",
    isQuoteValue: true,
  });

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-0 md:mt-12 h-fit">
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <NewPositionInputs
          inputOne={inputOne}
          inputTwo={inputTwo}
          setInputOne={setInputOne}
          setInputTwo={setInputTwo}
          currencies={currencies}
        />
        <FeeRange
          selectedFeeTier={selectedFeeTier}
          setSelectedFeeTier={setSelectedFeeTier}
        />
      </div>
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <NewPositionPriceRange />
        <Button className="w-full" variant="default">
          Create Position
        </Button>
      </div>
    </div>
  );
};
