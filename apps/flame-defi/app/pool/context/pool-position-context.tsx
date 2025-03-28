"use client";

import { Position, PoolToken } from "pool/types";
import { Positions } from "pool/types";
import { useParams } from "next/navigation";
import { PoolPositionContextProps } from "pool/types";
import { createContext, PropsWithChildren, useState } from "react";
import { useIntl } from "react-intl";
import { getFromLocalStorage, setInLocalStorage } from "@repo/ui/utils";

export const PoolPositionContext = createContext<
  PoolPositionContextProps | undefined
>(undefined);

const mockPosition: Positions = {
  0: {
    tokens: [
      {
        symbol: "TIA",
        unclaimedFees: 0.0078,
        liquidity: 1.13314,
        liquidityPercentage: 0.05,
      },
      {
        symbol: "milkTIA",
        unclaimedFees: 0.00123,
        liquidity: 0.8814,
        liquidityPercentage: 0.05,
      },
    ],
    feeTier: 0.0005,
    inRange: true,
    min: 0,
    max: "∞",
    positionStatus: "In range",
  },
  1: {
    tokens: [
      {
        symbol: "TIA",
        unclaimedFees: 0.0078,
        liquidity: 1.13314,
        liquidityPercentage: 0.05,
      },
      {
        symbol: "USDC",
        unclaimedFees: 0.00123,
        liquidity: 0.8814,
        liquidityPercentage: 0.05,
      },
    ],
    feeTier: 0.0005,
    inRange: false,
    min: 0,
    max: "∞",
    positionStatus: "Closed",
  },
};

const defaultPoolToken = {
  symbol: "",
  unclaimedFees: 0,
  liquidity: 0,
  liquidityPercentage: 0,
};

export const PoolPositionContextProvider = ({
  children,
}: PropsWithChildren) => {
  const params = useParams();
  const { formatNumber } = useIntl();
  const currentPoolSettings = getFromLocalStorage("poolSettings") || {};
  const [collectAsNative, setCollectAsNative] = useState<boolean>(
    currentPoolSettings.collectAsNative || false,
  );
  const poolId = params["pool-id"];
  const position = mockPosition[Number(poolId)];
  const [positionDetails, setPositionDetails] = useState<Position | undefined>(
    position,
  );
  const symbols = positionDetails?.tokens.map((token) => token.symbol) || [];
  const [poolTokens, setPoolTokens] = useState<PoolToken[]>(
    positionDetails?.tokens || [],
  );

  const poolTokenOne = poolTokens[0] || defaultPoolToken;
  const poolTokenTwo = poolTokens[1] || defaultPoolToken;

  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    poolTokenOne?.symbol || "",
  );

  const handleReverseTokenData = (symbol: string) => {
    const reversedTokenData = [...poolTokens].reverse();
    setPoolTokens(reversedTokenData);
    setSelectedSymbol(symbol);
  };

  const handleCollectAsNative = (collectAsNative: boolean) => {
    setCollectAsNative(collectAsNative);
    setInLocalStorage("poolSettings", {
      collectAsNative: collectAsNative,
    });
    if (collectAsNative) {
      positionDetails?.tokens.map((token) => {
        if (token.symbol === "TIA") {
          token.symbol = "WTIA";
        }
      });
    } else {
      positionDetails?.tokens.map((token) => {
        if (token.symbol === "WTIA") {
          token.symbol = "TIA";
        }
      });
    }
    setPositionDetails(positionDetails);
    setSelectedSymbol(poolTokenOne.symbol || "");
  };

  const feeTier = formatNumber(position?.feeTier || 0, {
    style: "percent",
    maximumFractionDigits: 2,
  });

  return (
    <PoolPositionContext.Provider
      value={{
        position,
        poolTokens,
        feeTier,
        symbols,
        selectedSymbol,
        handleReverseTokenData,
        collectAsNative,
        handleCollectAsNative,
        poolTokenOne,
        poolTokenTwo,
      }}
    >
      {children}
    </PoolPositionContext.Provider>
  );
};
