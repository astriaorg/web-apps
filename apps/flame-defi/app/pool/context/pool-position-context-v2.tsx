"use client";

import { useAstriaChainData } from "config/hooks/use-config";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useState } from "react";
import { useIntl } from "react-intl";
import { useAccount, useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { Position } from "pool/types";

export interface PoolPositionContextProps {
  tokenId: string;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
  minPrice: string;
  maxPrice: string;
  position?: Position;
  feeTier: string;
}

export const PoolPositionContext = createContext<
  PoolPositionContextProps | undefined
>(undefined);

export const PoolPositionContextProvider = ({
  children,
}: PropsWithChildren) => {
  const params = useParams();
  const tokenId = params["token-id"] as string;

  const config = useConfig();
  const { address } = useAccount();
  const { formatNumber } = useIntl();
  const { chain, nativeToken, wrappedNativeToken } = useAstriaChainData();
  const { currencies } = chain;

  const [isCollectAsWrappedNative, setIsCollectAsWrappedNative] =
    useState<boolean>(false);
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [token0, setToken0] = useState<EvmCurrency | undefined>();
  const [token1, setToken1] = useState<EvmCurrency | undefined>();
  const [position, setPosition] = useState<Position | undefined>();
  const [feeTier, setFeeTier] = useState<string>("");
  const [isPositionClosed, setIsPositionClosed] = useState<boolean>(false);

  return (
    <PoolPositionContext.Provider
      value={{
        tokenId,
        token0,
        token1,
        minPrice,
        maxPrice,
        position,
        feeTier,
      }}
    >
      {children}
    </PoolPositionContext.Provider>
  );
};
