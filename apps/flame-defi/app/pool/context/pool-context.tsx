"use client";

import { useConfig } from "wagmi";
import { useEvmChainData } from "config/hooks/use-config";
import { createNonFungiblePositionService } from "features/evm-wallet";
import { PoolContextProps, PoolPosition } from "pool/types";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { EvmCurrency } from "@repo/flame-types";
import { useAccount } from "wagmi";
import { useIntl } from "react-intl";

export const PoolContext = createContext<PoolContextProps | undefined>(
  undefined
);

const feeData = [
  {
    id: 0,
    feePercent: "0.01%",
    text: "Best for very stable pairs",
    tvl: "100M",
    selectPercent: "0.01%",
  },
  {
    id: 1,
    feePercent: "0.05%",
    text: "Best for stable pairs.",
    tvl: "100M",
    selectPercent: "0.05%",
  },
  {
    id: 2,
    feePercent: "0.3%",
    text: "Best for most pairs.",
    tvl: "100M",
    selectPercent: "0.3%",
  },
  {
    id: 3,
    feePercent: "1%",
    text: "Best for exotic pairs.",
    tvl: "100M",
    selectPercent: "1%",
  },
];

const getTokenDataFromCurrencies = (
  currencies: EvmCurrency[],
  tokenAddress: string
): EvmCurrency | null => {

  // TODO: replace this with a more elegant solution to return TIA when the tokenAddress returned from the contract is WTIA
  if(tokenAddress === "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071") {
    return currencies.find((currency) => currency.nativeTokenWithdrawerContractAddress) || null;
  }

  return (
    currencies.find(
      (currency) =>        
        currency.erc20ContractAddress === tokenAddress
    ) || null
  );
};

export const PoolContextProvider = ({ children }: PropsWithChildren) => {
  const wagmiConfig = useConfig();
  const { formatNumber } = useIntl();
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const { address } = useAccount();
  const [poolPositions, setPoolPositions] = useState<PoolPosition[]>([]);
  const [poolPositionsLoading, setPoolPositionsLoading] = useState(false);

  const getPoolPositions = async () => {
    if (!selectedChain.contracts.nonfungiblePositionManager || !address) {
      return;
    }

    setPoolPositionsLoading(true);

    try {
      const nonFungiblePositionService = createNonFungiblePositionService(
        wagmiConfig,
        selectedChain.contracts.nonfungiblePositionManager.address
      );

      const positions = await nonFungiblePositionService.getAllPositions(
        selectedChain.chainId,
        address
      );

      const positionsWithCurrencyData = positions.map((position) => {
        const isClosed = position.liquidity === 0n;
        const feePercent = formatNumber(position.fee / 1_000_000, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        });

        const tokenOne = getTokenDataFromCurrencies(
          currencies,
          position.tokenAddress0
        );

        const tokenTwo = getTokenDataFromCurrencies(
          currencies,
          position.tokenAddress1
        );

        return {
          symbolOne: tokenOne ? tokenOne.coinDenom : "",
          symbolTwo: tokenTwo ? tokenTwo.coinDenom : "",
          feePercent,
          inRange: isClosed ? false : true,
          positionStatus: isClosed ? "Closed" : "In range",
        };
      });

      setPoolPositions(positionsWithCurrencyData);
    } catch (error) {
      console.warn("Error fetching pool positions:", error);
    } finally {
      setPoolPositionsLoading(false);
    }
  };

  useEffect(() => {
    getPoolPositions();
  }, []);

  console.log("Pool Positions:", poolPositions);

  return (
    <PoolContext.Provider
      value={{
        feeData,
        poolPositions,
        poolPositionsLoading,
      }}
    >
      {children}
    </PoolContext.Provider>
  );
};
