"use client";
import { TokenPriceData } from "pool/types";
import { Positions } from "pool/types";

import { useParams } from "next/navigation";
import { PoolDetailsContextProps } from "pool/types";
import { createContext, PropsWithChildren, useState } from "react";
import { useIntl } from "react-intl";

export const PoolDetailsContext = createContext<
  PoolDetailsContextProps | undefined
>(undefined);

const positionDetails: Positions = {
  0: {
    tokenData: [
      {
        symbol: "TIA",
        unclaimedFees: 0,
        liquidity: 1.13314,
        liquidityPercentage: 0.05,
      },
      {
        symbol: "milkTIA",
        unclaimedFees: 0,
        liquidity: 0.8814,
        liquidityPercentage: 0.05,
      },
    ],
    percent: 0.0005,
    inRange: true,
    min: 0,
    max: "∞",
    positionStatus: "In range",
  },
  1: {
    tokenData: [
      {
        symbol: "TIA",
        unclaimedFees: 0,
        liquidity: 1.13314,
        liquidityPercentage: 0.05,
      },
      {
        symbol: "USDC",
        unclaimedFees: 0,
        liquidity: 0.8814,
        liquidityPercentage: 0.05,
      },
    ],
    percent: 0.0005,
    inRange: false,
    min: 0,
    max: "∞",
    positionStatus: "Closed",
  },
};

export const PoolDetailsContextProvider = ({ children }: PropsWithChildren) => {
  const params = useParams();
  const { formatNumber } = useIntl();
  const poolId = params["pool-id"];
  const position = positionDetails[Number(poolId)];
  const symbols = position?.tokenData.map((token) => token.symbol) || [];
  const [tokenData, setTokenData] = useState<TokenPriceData[]>(
    position?.tokenData || [],
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    tokenData[0]?.symbol || "",
  );

  const handleReverseTokenData = (symbol: string) => {
    const reversedTokenData = [...tokenData].reverse();
    setTokenData(reversedTokenData);
    setSelectedSymbol(symbol);
  };

  const percent = formatNumber(position?.percent || 0, {
    style: "percent",
    maximumFractionDigits: 2,
  });

  return (
    <PoolDetailsContext.Provider
      value={{
        positionDetails: position,
        tokenData,
        percent,
        symbols,
        selectedSymbol,
        handleReverseTokenData,
      }}
    >
      {children}
    </PoolDetailsContext.Provider>
  );
};
