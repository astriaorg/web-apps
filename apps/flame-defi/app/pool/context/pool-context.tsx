"use client";

import { useConfig, useAccount } from "wagmi";
import { useAstriaChainData } from "config/hooks/use-config";
import {
  createNonfungiblePositionManagerService,
  createPoolFactoryService,
} from "features/evm-wallet";
import { PoolContextProps, PoolPosition } from "pool/types";
import {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
  useCallback,
} from "react";
import { TXN_STATUS } from "@repo/flame-types";
import { FEE_TIER, FeeTier } from "pool/constants/pool-constants";
import {
  getTokenDataFromCurrencies,
  getMinMaxTick,
  tickToPrice,
} from "./pool-position-helpers";

export const PoolContext = createContext<PoolContextProps | undefined>(
  undefined,
);

const feeData = [
  {
    id: 0,
    feeTier: FEE_TIER.LOWEST,
    text: "Best for very stable pairs",
    tvl: "100M",
    selectPercent: "0.01%",
  },
  {
    id: 1,
    feeTier: FEE_TIER.LOW,
    text: "Best for stable pairs.",
    tvl: "100M",
    selectPercent: "0.05%",
  },
  {
    id: 2,
    feeTier: FEE_TIER.MEDIUM,
    text: "Best for most pairs.",
    tvl: "100M",
    selectPercent: "0.3%",
  },
  {
    id: 3,
    feeTier: FEE_TIER.HIGH,
    text: "Best for exotic pairs.",
    tvl: "100M",
    selectPercent: "1%",
  },
];

export const PoolContextProvider = ({ children }: PropsWithChildren) => {
  const wagmiConfig = useConfig();
  const { selectedChain } = useAstriaChainData();
  const { currencies } = selectedChain;
  const { address } = useAccount();
  const [poolPositions, setPoolPositions] = useState<PoolPosition[]>([]);
  const [poolPositionsLoading, setPoolPositionsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);

  // Simplified state - only keep what's needed
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Simplified function to update max price when fee tier changes
  const updateMaxPrice = useCallback(
    (feeTier: number, token0Decimals: number, token1Decimals: number) => {
      const { MAX_TICK } = getMinMaxTick(feeTier);

      // Calculate the max price based on MAX_TICK
      const maxPriceValue = tickToPrice(
        MAX_TICK,
        token0Decimals,
        token1Decimals,
      );
      setMaxPrice(maxPriceValue.toString());
    },
    [],
  );

  useEffect(() => {
    const getPoolPositions = async () => {
      if (!address) {
        return;
      }
      const factoryService = createPoolFactoryService(
        wagmiConfig,
        selectedChain.contracts.poolFactory.address,
      );

      setPoolPositionsLoading(true);

      try {
        const NonfungiblePositionManagerService =
          createNonfungiblePositionManagerService(
            wagmiConfig,
            selectedChain.contracts.nonfungiblePositionManager.address,
          );

        const positions =
          await NonfungiblePositionManagerService.getAllPositions(
            selectedChain.chainId,
            address,
          );

        const positionsWithCurrencyData = positions.map(async (position) => {
          const isClosed = position.liquidity === 0n;
          const feePercent = (position.fee / 1_000_000) as FeeTier;

          const tokenOne = getTokenDataFromCurrencies(
            currencies,
            position.tokenAddress0,
            selectedChain.contracts.wrappedNativeToken.address,
          );

          const tokenTwo = getTokenDataFromCurrencies(
            currencies,
            position.tokenAddress1,
            selectedChain.contracts.wrappedNativeToken.address,
          );

          const poolAddress = await factoryService.getPool(
            selectedChain.chainId,
            position.tokenAddress0,
            position.tokenAddress1,
            position.fee,
          );

          return {
            symbolOne: tokenOne?.coinDenom ?? "",
            symbolTwo: tokenTwo?.coinDenom ?? "",
            feePercent,
            inRange: !isClosed,
            positionStatus: isClosed ? "Closed" : "In range",
            poolAddress,
            ...position,
          };
        });

        const resolvedPositions = await Promise.all(positionsWithCurrencyData);
        setPoolPositions(resolvedPositions);
      } catch (error) {
        console.warn("Error fetching pool positions:", error);
      } finally {
        setPoolPositionsLoading(false);
      }
    };

    getPoolPositions();
  }, [address, currencies, wagmiConfig, selectedChain]);

  return (
    <PoolContext.Provider
      value={{
        feeData,
        poolPositions,
        poolPositionsLoading,
        modalOpen,
        setModalOpen,
        txnStatus,
        setTxnStatus,
        maxPrice,
        updateMaxPrice,
      }}
    >
      {children}
    </PoolContext.Provider>
  );
};
