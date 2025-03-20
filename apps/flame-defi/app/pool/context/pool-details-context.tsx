"use client";

import { Position, PoolTokenData } from "pool/types";
import { Positions } from "pool/types";
import { useParams } from "next/navigation";
import { PoolDetailsContextProps } from "pool/types";
import { createContext, PropsWithChildren, useState } from "react";
import { useIntl } from "react-intl";
import { getFromLocalStorage, setInLocalStorage } from "@repo/ui/utils";
import { TXN_STATUS } from "@repo/flame-types";

export const PoolDetailsContext = createContext<
  PoolDetailsContextProps | undefined
>(undefined);

const positionDetails: Positions = {
  0: {
    tokenData: [
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
    tokenData: [
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

export const PoolDetailsContextProvider = ({ children }: PropsWithChildren) => {
  const params = useParams();
  const { formatNumber } = useIntl();
  const currentPoolDetails = getFromLocalStorage("poolDetails") || {};
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
  const [collectAsWTIA, setCollectAsWTIA] = useState<boolean>(
    currentPoolDetails.collectAsWTIA || false,
  );
  const poolId = params["pool-id"];
  const position = positionDetails[Number(poolId)];
  const [positionData, setPositionData] = useState<Position | undefined>(
    position,
  );
  const symbols = positionData?.tokenData.map((token) => token.symbol) || [];
  const [poolTokenData, setPoolTokenData] = useState<PoolTokenData[]>(
    positionData?.tokenData || [],
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    poolTokenData[0]?.symbol || "",
  );

  const poolTokenOne = poolTokenData[0] || defaultPoolToken;
  const poolTokenTwo = poolTokenData[1] || defaultPoolToken;

  const handleReverseTokenData = (symbol: string) => {
    const reversedTokenData = [...poolTokenData].reverse();
    setPoolTokenData(reversedTokenData);
    setSelectedSymbol(symbol);
  };

  const handleCollectAsWTIA = (collectAsWTIA: boolean) => {
    setCollectAsWTIA(collectAsWTIA);
    setInLocalStorage("poolDetails", {
      collectAsWTIA: collectAsWTIA,
    });
    if (collectAsWTIA) {
      positionData?.tokenData.map((token) => {
        if (token.symbol === "TIA") {
          token.symbol = "WTIA";
        }
      });
    } else {
      positionData?.tokenData.map((token) => {
        if (token.symbol === "WTIA") {
          token.symbol = "TIA";
        }
      });
    }
    setPositionData(positionData);
    setSelectedSymbol(poolTokenOne.symbol || "");
  };

  const feeTier = formatNumber(position?.feeTier || 0, {
    style: "percent",
    maximumFractionDigits: 2,
  });

  return (
    <PoolDetailsContext.Provider
      value={{
        positionDetails: position,
        poolTokenData,
        feeTier,
        symbols,
        selectedSymbol,
        handleReverseTokenData,
        collectAsWTIA,
        handleCollectAsWTIA,
        txnStatus,
        setTxnStatus,
        modalOpen,
        setModalOpen,
        poolTokenOne,
        poolTokenTwo,
      }}
    >
      {children}
    </PoolDetailsContext.Provider>
  );
};
