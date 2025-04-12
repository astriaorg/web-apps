"use client";

import { useConfig, useAccount } from "wagmi";
import { useEvmChainData } from "config/hooks/use-config";
import {
  createNonfungiblePositionManagerService,
  createPoolFactoryService,
  createPoolService,
} from "features/evm-wallet";
import { PoolContextProps, PoolPosition } from "pool/types";
import {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
  useCallback,
} from "react";
import { FEE_TIER, FeeTier } from "pool/constants/pool-constants";
import {
  getTokenDataFromCurrencies,
  getMinMaxTick,
  tickToPrice,
  sqrtPriceX96ToPrice,
} from "./pool-position-helpers";
import { TokenInputState } from "@repo/flame-types";
import { needToReverseTokenOrder } from "features/evm-wallet/services/services.utils";

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
    tickLower: getMinMaxTick(FEE_TIER.LOWEST).MIN_TICK,
    tickUpper: getMinMaxTick(FEE_TIER.LOWEST).MAX_TICK,
  },
  {
    id: 1,
    feeTier: FEE_TIER.LOW,
    text: "Best for stable pairs.",
    tvl: "100M",
    selectPercent: "0.05%",
    tickLower: getMinMaxTick(FEE_TIER.LOW).MIN_TICK,
    tickUpper: getMinMaxTick(FEE_TIER.LOW).MAX_TICK,
  },
  {
    id: 2,
    feeTier: FEE_TIER.MEDIUM,
    text: "Best for most pairs.",
    tvl: "100M",
    selectPercent: "0.3%",
    tickLower: getMinMaxTick(FEE_TIER.MEDIUM).MIN_TICK,
    tickUpper: getMinMaxTick(FEE_TIER.MEDIUM).MAX_TICK,
  },
  {
    id: 3,
    feeTier: FEE_TIER.HIGH,
    text: "Best for exotic pairs.",
    tvl: "100M",
    selectPercent: "1%",
    tickLower: getMinMaxTick(FEE_TIER.HIGH).MIN_TICK,
    tickUpper: getMinMaxTick(FEE_TIER.HIGH).MAX_TICK,
  },
];

export const PoolContextProvider = ({ children }: PropsWithChildren) => {
  const wagmiConfig = useConfig();
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const { address } = useAccount();
  const [poolPositions, setPoolPositions] = useState<PoolPosition[]>([]);
  const [poolPositionsLoading, setPoolPositionsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Simplified state - only keep what's needed
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<string>("");

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

  // Calculate current price for new positions where pool doesn't exist yet
  const calculateCurrentPrice = useCallback(
    async (
      feeTier: number,
      input0: TokenInputState,
      input1: TokenInputState,
    ): Promise<string> => {
      try {
        if (!input0.token || !input1.token) {
          console.error("Token data not found");
          return "0";
        }

        const token0Address = input0.token.isNative
          ? selectedChain.contracts.wrappedNativeToken.address
          : input0.token.erc20ContractAddress;

        const token1Address = input1.token.isNative
          ? selectedChain.contracts.wrappedNativeToken.address
          : input1.token.erc20ContractAddress;

        if (!token0Address || !token1Address) {
          console.error("Token address not found");
          return "0";
        }

        // Check if pool exists
        const factoryService = createPoolFactoryService(
          wagmiConfig,
          selectedChain.contracts.poolFactory.address,
        );

        const poolAddress = await factoryService.getPool(
          selectedChain.chainId,
          token0Address,
          token1Address,
          feeTier,
        );

        const shouldReverseOrder = needToReverseTokenOrder(
          token0Address,
          token1Address,
        );

        // If pool exists, get the actual price
        if (
          poolAddress &&
          poolAddress !== "0x0000000000000000000000000000000000000000"
        ) {
          const poolService = createPoolService(wagmiConfig, poolAddress);
          const slot0 = await poolService.getSlot0(selectedChain.chainId);

          const pricePerToken = sqrtPriceX96ToPrice(
            slot0.sqrtPriceX96,
            shouldReverseOrder,
            input0.token.coinDecimals,
            input1.token.coinDecimals,
          );

          const formattedPrice = pricePerToken.toFixed(6);
          setCurrentPrice(formattedPrice); // Update the state as well
          return formattedPrice;
        }

        setCurrentPrice("");
        return "";
      } catch (error) {
        console.error("Error calculating current price:", error);
        return "0";
      }
    },
    [selectedChain, wagmiConfig],
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
        maxPrice,
        currentPrice,
        updateMaxPrice,
        calculateCurrentPrice,
      }}
    >
      {children}
    </PoolContext.Provider>
  );
};
